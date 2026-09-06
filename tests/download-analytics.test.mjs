import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { recordRecipeDownload, downloadReport } from '../lib/download-analytics.ts';

test('download report aggregates repeats and versions within the 30-day UTC window', async () => {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec('CREATE TABLE prompts(id TEXT,slug TEXT,title TEXT); CREATE TABLE recipe_projects(prompt_id TEXT);');
  sqlite.exec(readFileSync(new URL('../drizzle/0004_organic_ghost_rider.sql', import.meta.url), 'utf8'));
  sqlite.exec("INSERT INTO prompts VALUES ('a','alpha','Alpha'),('b','beta','Beta'); INSERT INTO recipe_projects VALUES ('a'),('b');");
  const db = { prepare(sql) { return { bind(...values) { return { async run() { sqlite.prepare(sql).run(...values); }, async all() { return { results: sqlite.prepare(sql).all(...values) }; } }; } }; } };
  await recordRecipeDownload(db, 'a', 'v1', new Date('2026-09-06T12:00:00Z'));
  await recordRecipeDownload(db, 'a', 'v1', new Date('2026-09-06T12:00:00Z'));
  await recordRecipeDownload(db, 'a', 'v2', new Date('2026-08-08T00:00:00Z'));
  await recordRecipeDownload(db, 'a', 'v1', new Date('2026-08-07T23:59:59Z'));
  const rows = await downloadReport(db, new Date('2026-09-06T12:00:00Z'));
  assert.equal(rows[0].downloads, 3);
  assert.equal(rows[1].downloads, 0);
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS count FROM recipe_download_counts').get().count, 3);
  sqlite.close();
});
