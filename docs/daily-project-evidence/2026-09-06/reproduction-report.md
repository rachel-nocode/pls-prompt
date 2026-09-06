# Independent Light Relay recipe reproduction

Run: 2026-09-06T16:35:47.757118+00:00

Input: /tmp/pls-light-relay-recipe.md only. No original implementation, screenshots, Site checkout, other task history, Sites tools, deployment, commits, or spawned agents were used. Implementation was authored independently from Step 1 and validated/repaired using Step 2.

## Deliverable

Standalone corrected light-relay.html (inline CSS/JavaScript; no runtime packages).
SHA-256: 547a2bdd6433d25226f6787f58bb087ddcd5d01300ccb581c8fcbc31c1a12187
Recipe SHA-256: 61bed01f6a92d427bc5b73ea810a3edf92c56d56eeb3bd46ee83a07a065a3312

## Actual verification

Commands: `node /tmp/pls-light-relay-reproduction/verify.cjs` and `node /tmp/pls-light-relay-reproduction/geometry.cjs`.

Chromium 151.0.7922.34, headless Playwright, temporary localhost HTTP server, allow-scripts-only iframe, exact recipe CSP. Ready message arrived from opaque origin `null`. Final browser run passed 18 check groups:

- Opaque sandbox, exact CSP, synchronous ready: PASS. Exact measured data recorded in test-evidence.json.
- Initial unsolved board and locked chambers: PASS. 49 cells; zero counters; no best; Next/Undo disabled; chambers 2/3 locked
- First solution, click/Enter, hint coordinates and no movement: PASS. 2 rotations and 2 hints; focus retained; best saved; chamber 2 unlocked
- Undo, Space, arrow focus and earned progress: PASS. Undo decrements once, retains hints/best/unlock; four arrows follow row-major order with wrapping
- Further moves may unsolve: PASS. Mirrors and Undo remain enabled; Next gates current solution; earned unlock retained
- Reset and best/hint tie handling: PASS. Reset clears attempt history/hints; equal rotations prefer fewer hints; worse hint tie preserves best
- DOGLEG initial state and authored solution: PASS. Starts unsolved; three rotations solve; third chamber unlocked; hint row 6 column 3
- LONG WAY HOME initial state and authored solution: PASS. Starts unsolved; six rotations solve; final completion exact; final Next disabled; hint row 6 column 2
- Non-color path, lit cells and overlay: PASS. Disclosure provides one-based coordinates; lit state reflected per cell; SVG aria-hidden and pointer-events none
- Unlocked chamber re-entry: PASS. Restores initial orientations/count/history and preserves session best
- Full reset: PASS. Returns chamber 1, clears all three bests, attempt hints/history and later unlocks
- Best rotations outrank hint count: PASS. Two rotations with one hint replace four rotations with no hints
- Responsive and root text scale: PASS. Exact measured data recorded in test-evidence.json.
- Revised Step 2 equal rows, beam centers and SVG stacking: PASS. All seven view configurations have seven explicit equal rows, beam/cell center deviation under 0.1px, and SVG above mirrors.
- Final Step 2 board glyph fit and scalable prose/controls: PASS. At 320px and 200% root text, every glyph text range fits its cell; body/control fonts scale to 32px/28px while mirror glyphs remain 28px.
- Visible keyboard focus: PASS. Exact measured data recorded in test-evidence.json.
- Reload loses session progress: PASS. Fresh board, no bests, only chamber 1 unlocked
- No external requests, script errors or storage accesses: PASS. Exact measured data recorded in test-evidence.json.

Exhaustive independent geometry verification tested all 4, 16, and 64 mirror configurations respectively: each chamber has one solving configuration; minimum rotations are exactly 2, 3, and 6. All initial configurations are unsolved and each authored solution reaches the receiver. Authored paths are recorded in geometry-evidence.json.

All requested widths (320, 375, 768, 1024, 1440, 1600px) were checked at 1000px viewport height. A further 320px run used a 32px root font (200%). Full-document widths and individual text overflow were checked, and enabled targets measured at least 44px. The board is wholly visible in the tested first viewport. Screenshots capture the iframe viewport; layout measurements inspect the full inner document.

Visual inspection of 320px, 1024px, and 320px/200% screenshots confirmed responsive arrangement and readable wrapping. Final connected beam confirmed visually at 1024px.

## Repairs and edits

- Authored HTML/CSS/JavaScript from the supplied recipe; no original source comparison.
- Re-read the revised prompt pack and applied explicit seven equal CSS grid rows. SVG stacking, narrow-button/header wrapping, and the final added board-symbol sizing instruction were already satisfied. Reran both full verification scripts against the revised recipe, retaining all rules and controls. Added measured grid/beam alignment and stacking assertions at every required width and at 200% root text.
- Visual inspection found the SVG beam beneath opaque mirror button backgrounds; moved SVG to z-index 3 while retaining pointer-events:none, then reran the full Chromium suite successfully.
- Corrected a test-harness focus probe: programmatic focus following mouse interaction does not request :focus-visible. The final check uses an actual ArrowRight key event and confirms a solid 3px outline. Original probe failure retained in initial-focus-probe-failure.txt; no application focus change was needed.
- An early shell-only syntax extraction included the closing HTML tag and failed as an invalid JavaScript extraction; real browser execution subsequently passed with no script errors.

## Interpretation and ambiguities

- “First mirror” for Hint means authored mirror-list order; arrow-key navigation uses row-major DOM order as explicitly specified.
- Hint is disabled on a solved board because no mirror differs from the solution.
- “First viewport” has no specified height; tested at 1000px height, with the primary board visible at every width and at 200% root text.
- Fixed board symbols use pixel sizes so the 7x7 board retains 44px action targets at 320px; prose and controls use rem sizing and scale with the root font.
- Final chamber connection shows the exact requested completion sentence; switching back to a chamber restarts that board and its current status.

## Limits

Chromium only; not cross-browser, pixel-identical, or one-shot reproduction. No screen-reader hardware or manual assistive-technology session. No arbitrary/procedural geometry or synthetic loop scenario was exercised in the browser; authored configurations were exhaustively checked independently. No physical mobile-device testing. Browser console and page errors were empty; request log contained only the local harness and local game; instrumented localStorage, sessionStorage, indexedDB, and caches access counters were empty. The standalone implementation has no storage calls, forms, audio, external assets, network calls, or eval.

Evidence: test-evidence.json, geometry-evidence.json, verify.cjs, geometry.cjs, seven viewport screenshots, and SHA256SUMS.txt.
