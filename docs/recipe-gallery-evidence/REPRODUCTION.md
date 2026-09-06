# Independent recipe reproduction

All five demos were independently rebuilt from the five `.prompt.txt` and five `.recipe.md` inputs, then passed 37 grouped Chromium checks. Original HTML, screenshots, manifests, source implementations, and original validation were not inspected. No Site checkout or deployment was touched.

## Outcomes and assets

- **Tempo Lab — pass, 9 checks.** `/tmp/pls-prompt-reproduction/tempo-lab/tempo-lab.html`. Verified 64 steps; seeded pattern counts; independent A/B editing and shifted keys; preset replacement and clear; keyboard movement/toggle; user-activated Web Audio voices and playhead; switching/editing during playback; Stop and hidden-document stop; mobile track/step controls.
- **Studio Desk — pass, 7 checks.** `/tmp/pls-prompt-reproduction/studio-desk/studio-desk.html`. Verified six seed projects and initial 33% completion; required validation and Enter save inside the sandbox; safe literal user text; note search and filters; status-select and native drag/drop movement; edit, cancel, Escape, delete, empty state, and reset.
- **Pixel Garden — pass, 6 checks.** `/tmp/pls-prompt-reproduction/pixel-garden/pixel-garden.html`. Verified 64 tiles, initial day/budget/selection and computed joy; planting costs; invalid-action budget preservation; once-per-day watering; growth/day budget; keyboard and text-map selection; clear; inverse canvas hit testing; reset.
- **Orbit Notes — pass, 8 checks.** `/tmp/pls-prompt-reproduction/orbit-notes/orbit-notes.html`. Verified six notes/three groups, 470px board and specified first angle; required validation and Enter save; new-note filter clearing and pagination; full-body text list and body search; central topic editor; CRUD/cancel/Escape; empty state/reset; automatic two-column mobile list.
- **Signal Drift — pass, 7 checks.** `/tmp/pls-prompt-reproduction/signal-drift/signal-drift.html`. Verified frozen silent idle; explicit start and increasing distance; jump interaction; pause/resume freeze; actual collision and best score; restart and keyboard pause; opt-in synthesized audio; reduced-motion checkbox; hidden-document pause.

Every demo additionally passed exact CSP matching, readiness handshake from an opaque origin (`event.origin === "null"`), storage denial in an `allow-scripts`-only iframe, absence of audio construction before activation, no script errors/CSP violations, no requests beyond its own HTML, and no horizontal overflow at 320px and 768px. Static checks found no external scripts/styles or storage/fetch/eval/import usage. Browser snapshots are saved per project as `desktop.png`, `320px.png`, and `768px.png`; they capture test-session states, not necessarily the initial state.

## Choices, repairs, and intervention

- Unspecified seed-note wording, spacing, decoration, exact illustration shapes, collision inset size, and audio envelope details were independently chosen. This is a functional reproduction, not an assertion of visually identical output.
- Garden joy was interpreted as 4 per fully grown flower and 8 per fully grown tree; the seed garden therefore has 28 joy. The recipe should explicitly say “fully grown” if that interpretation is intended.
- Runner obstacle gaps were measured from the previous obstacle's right edge; Orbit Notes reused the editor's 65-character title limit for the central topic.
- The recipes' documented sandbox-form and mobile-control repairs were incorporated during the initial rebuild. No additional implementation repair prompt or human intervention was needed.
- Two first-pass test failures were corrected in the test harness: selecting `{value:'15'}` avoided Playwright confusing step label 15 with zero-based option value 15; explicit card/header drag coordinates avoided nested controls. Neither required changing demo code. The first-run evidence is preserved as `validation-first-pass.json`.
- The five implementations were authored by one independent agent in a staged build script. This was not a controlled one-prompt/one-shot generation benchmark.

## Evidence and limits

- `/tmp/pls-prompt-reproduction/validate.cjs`: reproducible tests using bundled Playwright Chromium and a temporary local HTTP server.
- `/tmp/pls-prompt-reproduction/validation-results.json`: final per-check results, errors, requests, and screenshot paths.
- `/tmp/pls-prompt-reproduction/reproduction-manifest.json`: input/output SHA-256 hashes, sizes, and static checks.
- `/tmp/pls-prompt-reproduction/build.py`: independent source generator for all five standalone files.

Testing covers primary interactions in Chromium; it does not establish every edge case or cross-browser compatibility. Audio synthesis/scheduling was exercised and instrumented without human listening. Visibility handlers were tested through a synthetic `visibilitychange` and `document.hidden` override. Touch alternatives were exercised as UI controls at mobile widths, not on physical touch hardware. No human learner study, learning outcome, original-visual comparison, or identical-result claim is made.
