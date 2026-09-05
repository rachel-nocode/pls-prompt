import argparse
import hashlib
import json
from pathlib import Path
import sqlite3
import tempfile


ROOT = Path(__file__).resolve().parents[1]
TABLES = ('lessons', 'prompt_saves', 'prompts')


def quote(identifier):
    return '"' + identifier.replace('"', '""') + '"'


def original_rows(database, tables):
    result = {}
    for name in TABLES:
        columns = tables[name]['columns']
        rows = database.execute(
            'SELECT ' + ','.join(map(quote, columns)) + ' FROM ' + quote(name) + ' ORDER BY id'
        ).fetchall()
        result[name] = [dict(zip(columns, row)) for row in rows]
    return result


def assert_integrity(database):
    assert database.execute('PRAGMA integrity_check').fetchone() == ('ok',)
    assert database.execute('PRAGMA foreign_key_check').fetchall() == []


def assert_rejected(database, statement, parameters):
    try:
        database.execute(statement, parameters)
    except sqlite3.IntegrityError:
        return
    raise AssertionError('An invalid cross-owner or duplicate write was accepted')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--snapshot', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    snapshot_bytes = args.snapshot.read_bytes()
    snapshot = json.loads(snapshot_bytes)
    assert set(snapshot['tables']) == set(TABLES), 'Snapshot table set changed; review scope'
    tables = snapshot['tables']
    proposal = ROOT / 'docs/phase-0/phase-1-schema-proposal.sql'
    report = {
        'source_commit': snapshot['source_commit'],
        'snapshot_captured_at': snapshot['captured_at'],
        'snapshot_sha256': hashlib.sha256(snapshot_bytes).hexdigest(),
        'proposal_sha256': hashlib.sha256(proposal.read_bytes()).hexdigest(),
        'scope': 'Live logical row export restored into repository migration schema; local SQLite only',
        'production_modified': False,
        'checks': [],
    }
    args.output.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='pls-phase0-') as temporary:
        original = sqlite3.connect(Path(temporary) / 'before.sqlite')
        original.execute('PRAGMA foreign_keys=ON')
        for migration in sorted((ROOT / 'drizzle').glob('*.sql')):
            original.executescript(migration.read_text())
        for table in TABLES:
            live_columns = tables[table]['columns']
            schema_columns = [row[1] for row in original.execute('PRAGMA table_info(' + quote(table) + ')')]
            assert set(live_columns) == set(schema_columns), 'Live/repo columns differ: ' + table
            columns = ','.join(map(quote, live_columns))
            placeholders = ','.join('?' for _ in live_columns)
            for row in tables[table]['rows']:
                assert set(row) == set(live_columns), 'Incomplete snapshot row'
                original.execute(
                    'INSERT INTO ' + quote(table) + ' (' + columns + ') VALUES (' + placeholders + ')',
                    [row[column] for column in live_columns],
                )
        original.commit()
        assert_integrity(original)
        before = original_rows(original, tables)
        expected = {name: sorted(tables[name]['rows'], key=lambda row: row['id']) for name in TABLES}
        assert before == expected
        report['row_counts'] = {name: len(rows) for name, rows in before.items()}
        report['checks'].append('All exported rows restored exactly; live columns match repository migrations')

        duplicates = original.execute(
            'SELECT user_id,prompt_id,COUNT(*) FROM prompt_saves GROUP BY user_id,prompt_id HAVING COUNT(*)>1'
        ).fetchall()
        orphans = original.execute(
            'SELECT s.id FROM prompt_saves s LEFT JOIN prompts p ON p.id=s.prompt_id WHERE p.id IS NULL'
        ).fetchall()
        assert not duplicates, 'Duplicate saves require a reviewed merge preserving collection links'
        assert not orphans, 'Orphan saves require review before adding relations'
        report['checks'].append('Existing saves contain no duplicate user/prompt pairs or orphan prompt references')

        migrated = sqlite3.connect(Path(temporary) / 'after.sqlite')
        migrated.execute('PRAGMA foreign_keys=ON')
        original.backup(migrated)
        migrated.executescript(proposal.read_text())
        # Keep data backfill outside schema-only deployment migrations.
        with migrated:
            migrated.execute("UPDATE prompts SET visibility='public' WHERE status='published'")
            for prompt in tables['prompts']['rows']:
                migrated.execute(
                    'INSERT INTO prompt_versions VALUES (?,?,?,?,?,?,?)',
                    (prompt['id'] + ':v1', prompt['id'], 1, prompt['prompt_text'],
                     prompt['github_url'], prompt['asset_key'], prompt['created_at']),
                )
        assert_integrity(migrated)
        assert original_rows(migrated, tables) == before
        assert migrated.execute("SELECT COUNT(*) FROM prompts WHERE access_mode!='free'").fetchone()[0] == 0
        assert migrated.execute(
            "SELECT COUNT(*) FROM prompts WHERE (status='published' AND visibility!='public') "
            "OR (status!='published' AND visibility!='private')"
        ).fetchone()[0] == 0
        assert migrated.execute('SELECT COUNT(*) FROM prompt_versions').fetchone()[0] == len(before['prompts'])
        mismatches = migrated.execute(
            'SELECT p.id FROM prompts p JOIN prompt_versions v ON v.prompt_id=p.id AND v.version=1 '
            'WHERE p.prompt_text IS NOT v.prompt_text OR p.github_url IS NOT v.github_url '
            'OR p.asset_key IS NOT v.asset_key'
        ).fetchall()
        assert mismatches == []
        report['checks'].append('Proposed schema and separate backfill preserve every original field and row')
        report['checks'].append('Published prompts stay public and free; initial versions preserve exact content')

        prompt_id = before['prompts'][0]['id']
        with migrated:
            migrated.execute('INSERT INTO prompt_saves VALUES (?,?,?,?)', ('test-save-a', prompt_id, 'test-user-a', '2026-09-05'))
            migrated.execute('INSERT INTO prompt_saves VALUES (?,?,?,?)', ('test-save-b', prompt_id, 'test-user-b', '2026-09-05'))
            migrated.execute('INSERT INTO collections VALUES (?,?,?,?,?)', ('test-collection', 'test-user-a', 'Study', '2026-09-05', '2026-09-05'))
            assert_rejected(migrated, 'INSERT INTO prompt_saves VALUES (?,?,?,?)', ('test-duplicate', prompt_id, 'test-user-a', '2026-09-05'))
            assert_rejected(migrated, 'INSERT INTO collection_prompts VALUES (?,?,?,?)', ('test-collection', prompt_id, 'test-user-b', '2026-09-05'))
            migrated.execute('INSERT INTO collection_prompts VALUES (?,?,?,?)', ('test-collection', prompt_id, 'test-user-a', '2026-09-05'))
            migrated.execute("DELETE FROM prompt_saves WHERE id='test-save-a'")
            assert migrated.execute('SELECT COUNT(*) FROM collection_prompts').fetchone()[0] == 0
        report['checks'].append('Duplicate saves and cross-owner collection writes rejected; unsave removes collection entry')

        # Exercise nonpublished and attachment-backed records on a separate fixture copy.
        fixture = sqlite3.connect(':memory:')
        original.backup(fixture)
        with fixture:
            fixture.execute("UPDATE prompts SET status='draft',asset_key='fixture/private.md' WHERE id=?", (prompt_id,))
        fixture.executescript(proposal.read_text())
        fixture.execute("UPDATE prompts SET visibility='public' WHERE status='published'")
        assert fixture.execute('SELECT visibility,asset_key FROM prompts WHERE id=?', (prompt_id,)).fetchone() == ('private', 'fixture/private.md')
        report['checks'].append('Draft and attachment fixture remains private with asset key preserved')
        fixture.close()

        # Rehearse rollback by restoring the untouched backup, not destructive down-migrations.
        restored = sqlite3.connect(Path(temporary) / 'restored.sqlite')
        original.backup(restored)
        assert original_rows(restored, tables) == before
        assert_integrity(restored)
        assert restored.execute("SELECT name FROM sqlite_schema WHERE name='collections'").fetchall() == []
        report['checks'].append('Restore from original logical backup reproduces original data and schema locally')
        backup_path = args.output / 'baseline.sqlite'
        if backup_path.exists():
            raise FileExistsError('Use a new output directory; existing backup will not be overwritten')
        backup = sqlite3.connect(backup_path)
        original.backup(backup)
        backup.close()
        backup_path.chmod(0o600)
        report['backup_sha256'] = hashlib.sha256(backup_path.read_bytes()).hexdigest()
        restored.close()
        migrated.close()
        original.close()

    report['result'] = 'passed'
    report_path = args.output / 'rehearsal-result.json'
    report_path.write_text(json.dumps(report, indent=2) + '\n')
    report_path.chmod(0o600)
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main()
