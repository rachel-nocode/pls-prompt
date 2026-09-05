# Phase 0 — Existing foundation and pivot gaps

Historical implementation report. The [recipe-gallery pivot plan](../pivot-plan.md) is the active roadmap; future phases described below are superseded. Preserve this report as evidence of completed work.

Completed September 4, 2026 Pacific / September 5 UTC. Source baseline: `8b97641a8ac6ec5933df47150fc29fdd3ee85ccf`.

Phase 0 delivers the live inventory, private logical backup, starter content map, three challenge drafts, access decisions, and a successful local migration/restore rehearsal. Phase 1 can begin with the private library. Application features, production migrations, and publication are later phases.

## Verified live baseline

- Site: https://plsprompt.com; active, custom access with one owner and no external viewers. Anonymous `/api/prompts` request returned HTTP 401. Public launch requires an intentional access-policy change later.
- Domain: `plsprompt.com` and SSL active. No `www` domain listed; existing domain task remains open.
- Database: `DB` contains `prompts`, `lessons`, and `prompt_saves`. Read every row with no pagination, omissions, or truncated values.
- Content: six published prompts, three published lessons, zero saves, zero review/draft prompt records. Five prompts contain text; one links to an external repository.
- Files: every prompt's attachment key is null. No linked attachment bytes need migration. Orphan R2 objects were not enumerated, so this is not a bucket backup.
- Purchases/accounts: no order or account tables exist. The app obtains identity from Sites headers; absence of an account table does not prove nobody has signed in. Sales outside this app remain unconfirmed.
- Versions: latest saved Sites version is 2, source `602198ff3ce6c0b95cd86883a405509ad2429f82`; GitHub main is `8b97641`. The Sites commit is unavailable from this GitHub remote. A saved version is not proof of the currently running version; production source parity is unverified.

Evidence came from Sites site metadata, domain list, complete table reads, a read-only anonymous HTTP request, and the source audit. No access policy, domain, live row, or deployment changed.

## Finished work

- [Content map](content-map.json): all six legacy prompts preserved, five text prompts selected, original slugs retained, variables recorded, and links to the three lessons defined.
- [Starter lessons](starter-lessons.json): original reading lessons adapted into short missions with objectives, teaching copy, progressive hints, reference prompts, nine cases, failure outputs, and completion rules.
- [Schema proposal](phase-1-schema-proposal.sql): additive library foundation covering visibility, free/earned-or-paid access, unique saves, owned collections, and prompt versions.
- [Migration rehearsal](../../scripts/rehearse-phase-0.py): restored live rows using repository migrations, applied proposed changes to a disposable copy, backfilled separately, exercised ownership constraints, and restored the baseline.
- [Content validation](../../scripts/validate-phase-0.mjs): verified prompt/lesson links, URL preservation, template variables, ordered prerequisites, and 52 output checks across nine cases.

Lesson drafts introduce observable outcomes, useful constraints, and evidence checking. Clear instructions, output requirements, and iterative testing are supported by [Google's prompting guidance](https://ai.google.dev/gemini-api/docs/prompting-strategies); explicit tasks, success criteria, and grading are supported by [Anthropic's evaluation guidance](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents). Missions and fixtures are original drafts.

The output fixtures validate the proposed checks, not actual model behavior or learning effectiveness. Phase 2 must run multiple differently worded correct prompts through the chosen model, assess false failures, and observe learners. These checked-in held-out cases are rehearsal fixtures; use fresh server-only variants for production mastery checks.

## Product decisions fixed for implementation

- Preserve all current published prompts as free; personal saving never requires lesson completion.
- Offer new premium content through either its published earn requirement or a purchase. Existing free text cannot become a meaningful locked reward merely by changing its label.
- Earned and purchased access are independent. Refunds remove only purchase-based access; personal edits and independently earned access survive.
- A locked bookmark contains metadata only. Copy, full-text access, and download require server-confirmed access.
- Buying content, revealing a solution, and repeating a completed task do not create mastery progress.
- Keep current Sites project, sign-in, D1/R2 bindings, scripts, dependencies, and existing URLs.
- Keep private drafts distinct from community submissions. Only the creator can approve or publish content.
- Preserve inherited verification and quality fields during migration, but do not treat them as measured learner grades or newly validated product claims.

Five starter prompts are selected using existing editorial attribution. A request to confirm ownership and any external sales/files remains unanswered; prices remain unset. This does not block private library work. Resolve provenance and any outside obligations before selling or claiming an independently tested premium product.

## Migration and recovery evidence

Private, ignored local files:

- `work/phase0/live-table-export.json`: complete logical export of all three user tables, captured at `2026-09-05T05:59:56.618Z`.
- `work/phase0/site-inventory.json`: filtered site/version/domain metadata, with no credentials or visitor contact information.
- `work/phase0/rehearsal-1/baseline.sqlite`: restored baseline; owner-readable only.
- `work/phase0/rehearsal-1/rehearsal-result.json`: full local check result.

Export SHA-256: `fbc17ba775636e796c31b619a41fa363e2ceb22ff6a7943439f812e8bf722af0`.

Rehearsal passed seven checks: exact row restoration and column parity; no duplicate/orphan saves; original-field preservation; public/free legacy access and exact initial versions; save/collection constraints; private-draft attachment preservation; local baseline restoration.

This is a logical data backup reconstructed with repository schema, not a native D1 snapshot. Tools expose live table names, columns, and rows, but not full index/constraint definitions or the migration ledger. Native D1 restore and R2 recovery have not been exercised. Local SQLite passing does not establish D1 deployment success.

Reproduce locally; validation here used Python 3.9.6 and Node 26.0.0:

```sh
python3 scripts/rehearse-phase-0.py --snapshot work/phase0/live-table-export.json --output work/phase0/rehearsal-2
node scripts/validate-phase-0.mjs
```

Use a fresh output directory; the backup is deliberately not overwritten. Private exports are not committed, so another checkout needs a new complete Sites table export before rehearsing.

Before a production migration: refresh the export; verify production schema and applied migration ledger; generate a new Drizzle migration from the approved schema; rehearse that generated SQL and separate backfill; establish the platform restore point and rollback version. Existing applied migration files remain immutable.

If a migration or deployment fails, stop writes, inspect which migrations applied, and preserve the current data. Prefer a compatible previous application version or a forward fix. A destructive restore requires an explicit recovery decision and a plan to preserve writes after the snapshot. The local rehearsal restores a disposable copy only.

## Next implementation work, in order

1. P1-01 — Migration ownership. Remove duplicate runtime table creation in `lib/data.ts`; keep deployment migrations authoritative. Gate: both a fresh database and copied existing data start successfully; existing IDs and slugs remain stable.
2. P1-02 — Real personal library. Implement save/unsave, listing, collections, notes, private drafts, version history, and export. Reuse identity helpers. Gate: data persists after sign-out/in; duplicate saves are safe; another user cannot read or edit private content.
3. P1-03 — Creator workspace. Add explicit creator authorization, lesson editing, prompt review, and publishing. Preserve submissions. Gate: signed-in non-creators cannot publish or change another author's work.
4. P2-01 — Content access boundary. Replace full-record listing responses, client payloads, seed fallback leakage, and unrestricted attachment delivery with server checks. Gate: ungranted users cannot obtain locked text through any existing path.
5. P2-02 — First playable lesson. Add model execution, checked attempts, fair feedback, progress, and reward grants. Gate: useful independent completion on fresh inputs; retries and provider failures cannot duplicate rewards.
6. P3-01 — Commerce. Add hosted checkout, verified payment events, refund handling, and downloadable product versions. Gate: earned/purchased overlap and duplicate webhook delivery preserve correct access.

Phase 0 validation ran the focused content and migration checks. The application build and existing UI tests were not run because no application code, dependencies, or deployment migrations changed.
