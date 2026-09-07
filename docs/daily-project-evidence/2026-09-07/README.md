# Glyph Loom — September 7, 2026

Original: GPT-6 Astra High in Codex. Independent reproduction: fresh-context GPT-6 Astra High agent using only the two-prompt recipe, no original source or screenshots. No dependency, authentication, audience, analytics schema or library changes.

## Browser evidence

`original-checks.json`: 13 final Chromium groups. `reproduction-checks.json`: 19 independent groups. Real original desktop/mobile/200% captures retained; production gallery previews are crops captured directly from the working demo. Spec review caught clipped select labels at 320px/200% and approved the text-relative auto-fit repair. Code-quality review found no product/security blocker; corrected stale evidence harness and documented staging paths. No independent-human, physical-device, Safari or screen-reader study. Clipboard branches were injected; no claim of universal clipboard permissions.

## Rerun original

From repository root, copy `demo-assets/glyph-loom.html` to `/tmp/glyph-loom.html`. Run `node docs/daily-project-evidence/2026-09-07/server-original.mjs`, which serves the file and an opaque-origin iframe at `http://127.0.0.1:5177`. In another terminal run `node docs/daily-project-evidence/2026-09-07/verify-original.mjs`. It writes checks and real screenshots to `/tmp/glyph-*`. Playwright module path inside the script refers to this machine's installed runtime; change that path to your installed Playwright if needed. Final harness explicitly scrolls the editor into view before coordinate-based cancellation testing. Earlier harness failure was a scroll-position problem, not a product repair.

## Rerun independent reproduction

Create an empty temporary directory; copy `reproduction.html` there as `glyph-loom.html` and `verify-reproduction.cjs.txt` as `verify.cjs`, then run `node verify.cjs` there. The archived `.txt` suffix preserves the independently authored CommonJS test artifact without treating it as application ESM lint input. The harness starts its own local server; inspect its exact port and installed Playwright path before use. This retained implementation is evidence only; gallery downloads contain the prompt pack, never this source.

## Repository and publication checks

Production build and 72 repository tests passed. Typecheck passed. Initial lint flagged the archived CommonJS harness; stored as a text evidence artifact. Final lint, host integration, download analytics and deployment results recorded below after execution.


Final prepublication checks: production Worker served locally through `wrangler dev --config dist/server/wrangler.json --port 5178 --ip 127.0.0.1 --persist-to .wrangler/state`; eight host groups passed (`host-local-checks.json`): seven-project catalog, integrated readiness/drawing/reset, exact read-only Markdown, six page widths/mobile interaction, exact recipe attachment and response CSP, completed native browser download, HEAD +0 / normal GET +1 / bot and error +0 analytics, zero script errors. Production build, typecheck, lint and 72 repository tests passed. The Vite dev server had a virtual-module fetch failure and plain `vinext start` does not load Cloudflare bindings; production Worker runtime resolved local verification without application changes. Host harness fixes: allow return-link query parameters, await iframe navigation, and use the existing `downloads` aggregate column.

Host rerun: run the production Worker as above, then `node docs/daily-project-evidence/2026-09-07/verify-host.mjs`. Script's absolute repository/runtime paths are machine-specific. Live run uses GLYPH_HOST and an existing authorized GLYPH_TOKEN in process environment; never persist credentials. Live skips native browser download and local SQLite analytics checks; authenticated attachment bytes are checked instead. No production private-save claim.


Published Sites version 9 on 2026-09-07 at 10:33 America/Los_Angeles; exact deployed source `979046cf36bc26dd0fa4f636d6346caf345cfe73`. `publication.json` retains receipt and unchanged owner-only access (revision 1). Six live groups passed: all seven gallery entries, embedded mirrored drawing/undo/reset and ready handshake, exact read-only Markdown, six widths plus mobile interaction, exact authenticated recipe attachment and demo source/CSP, zero script errors. `host-live-checks.json` and real mobile capture retained. Hosting injected a second unrelated iframe; live harness now targets the demo's exact title and waits for hydration before clicking. Initial live harness timeouts were resolved without app edits. Production Worker error-log query returned no errors. Native browser download passed locally; live temporary-header access checked attachment bytes only. No production private-save claim. Existing Light Relay payload compared structurally against baseline and remained identical.
