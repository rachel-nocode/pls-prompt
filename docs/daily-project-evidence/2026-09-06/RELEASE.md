# Light Relay v1 — daily release candidate

Date: 2026-09-06, America/Los_Angeles. Initial repository state was clean at ee9db97; live catalog and all 14 live prompt records were inspected before concept selection. No simultaneous Site task/build/deployment was found. A per-automation run.lock reserves this run. The ledger includes the five showcase demos, six text recipes and three retired lesson-reward concepts.

Light Relay adds a deterministic reflection puzzle, distinct from every prior recipe by purpose and mechanics. No source under synced sources/ was touched. The addition is one new demo, two-step recipe, three real preview captures, additive guarded content seeding, and focused preservation tests. Existing content, saved versions, creator identity, analytics routes, hosting metadata, migrations, and access policy remain intact.

## Evidence actually run

- Production build and 70 Node tests passed, including daily seed transaction rollback, concurrent completed seed, preservation of existing prompt/version/library rows, later creator edits, recipe export, and download aggregates.
- Type check passed; lint passed without warnings after converting the new evidence helper to ES imports.
- Original standalone browser suite: 11 grouped Chromium checks. See browser-checks.json and verify-original.mjs. The temporary local harness serves the demo in an allow-scripts-only iframe. Verified all three solutions, counter/hint/undo/best behavior, keyboard, emulated touch, six widths, root text 200%, source/receiver glyph fit, and no external requests/script errors. Actual desktop/solved/mobile screenshots are public/previews/light-relay-*.png. Zoom screenshot is zoom.png.
- Independent fresh-context reproduction from the final prompt pack: 18 Chromium groups plus exhaustive geometry across all 4/16/64 mirror configurations, unique solutions and minima 2/3/6. See reproduction-report.md and reproduction JSON evidence. The final input recipe hash is 61bed01f6a92d427bc5b73ea810a3edf92c56d56eeb3bd46ee83a07a065a3312. Feature reproduction, not pixel identity or one-shot output.
- Actual gallery integration: project visible, embedded demo solves, host Reset works, native browser Markdown pack download has both full ordered prompts/version/setup/limitations and no application source, project page fits six widths, anonymous Studio/library return 401, no browser script errors. See integration-checks.json. One harness selector was corrected for the existing gallery return query parameter and existing Reset label. Restarted Vite after production build invalidated its development optimization cache; no app workaround was introduced.
- Analytics HTTP check against local D1: HEAD +0, ordinary GET +1, preview-bot GET +0, invalid version 404 +0. Existing production migration 0004 was missing in the local QA database; backed it up and applied only that additive migration locally. Production already contains the analytics table. No production migration was added or changed.
- Recipe explicitly records actual repairs: equal grid rows, SVG stacking, enlarged control wrapping and board-symbol sizing. No external dependencies, account requirement or paid service was added.

## Limits

Chromium with emulated touch, not physical devices; no Safari, manual assistive-technology testing, human learner study, or persistent progress. Existing owner-only Sites audience is preserved. Browser handoff is skipped because this is a background automation; live verification uses scoped Sites authorization without changing access.

## Publication

Validated candidate; deployment receipt will be appended after successful publication and live checks. Keep any failed candidate under its existing slug and resume it rather than creating a replacement.
