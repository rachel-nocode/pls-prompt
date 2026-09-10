# Independent Revision Lens reproduction

Run time: 2026-09-10T16:53:03.572Z

Built only from recipe-step-1.txt and recipe-step-2.txt in a new isolated /tmp/pls-revision-reproduction directory. No original implementation, original screenshots, gallery source, Sites tools, commits, deployments or subagents were used. The test harness read only this independent HTML after construction.

## Results

Final run: 21 browser/check groups passed; 0 failed. Browser: installed Google Chrome via Playwright Chromium driver, headless; real iframe sandbox=allow-scripts and exact prompt CSP.

The independent prefix edit-distance oracle exhaustively checked all 961 ordered pairs of binary-alphabet sequences of length 0–4 against the in-browser suffix-LCS implementation, verifying minimal insertion/deletion count and reconstruction of both inputs. Other browser tests exercised visible controls and parsed committed report operations.

## Interventions and known differences

The first run passed 20 groups and failed the initial-count assertion because the recipe incorrectly required totals 8/8 with 6 unchanged. The actual Editorial strings each contain 7 words, with 5 unchanged and 2 removed/2 added. The parent independently reported the same arithmetic error and corrected the recipe. Only the test expectation was corrected; the reproduction algorithm and generated HTML needed no repair. The first-run evidence is retained in checks-first-run.json.

The reconstruction uses its own minimal layout and implementation. Visual/code equivalence with the original was intentionally not assessed; original artifacts were not inspected. Independent initial and Packing list screenshots were captured; initial screenshot was visually inspected.

## Passed coverage

- Initial committed counts and screenshot
- Null-origin ready and storage denied
- Packing counts and line screenshot
- Exhaustive independent edit-distance oracle: 961 sequence pairs
- Deletion-first deterministic tie
- Empty, identical, addition, removal, repeated, case and punctuation behavior
- Unicode Word whitespace normalization and equal status
- Line blank/whitespace/terminal, CRLF/lone-CR normalization and report JSON
- Literal HTML/script-like input is inert
- 200 units accepted; 201 rejected atomically without truncation
- 6000 UTF-16 units accepted; 6001 rejected atomically; both fields validated
- Edits and mode stay pending; Swap stages raw text; Compare commits
- Changes only keeps report/counts; persists Compare/Swap/Clear; empty message/context
- Presets and Reset replace pending edits and reset filter; button focus survives
- Select report selects all; injected clipboard success, fallback success/failure and focus
- Keyboard activation and navigation
- Six widths and 200% root font at 320: no horizontal overflow with 6000-char unbroken content
- Reduced motion has no animations
- Touch emulation presets and comparison
- All button/select/textarea targets at least 44px and labels at least 14px
- Zero external requests and no page script errors

## Limits of evidence

No cross-browser, physical-device, screen-reader or full accessibility audit is claimed. Clipboard paths were injected to deterministically exercise API success and fallback success/failure; this does not assert access to the real OS clipboard. Target geometry checks covered buttons/selects/textareas; checkbox has a wrapping label with a 44px minimum-height activation area. Viewport/root-font checks assert no document horizontal overflow; they are not a complete visual assessment of every viewport. The actual Chrome requests were four local host/iframe loads, zero external requests, and zero page script errors.

Owned HTTP server on 127.0.0.1:5181 was closed by the harness finally block, and browser was closed.

## Artifacts

- revision-lens.html: independent standalone output
- check.mjs: reproducible real-browser harness and independent oracle
- checks.json: latest detailed results
- checks-first-run.json: original arithmetic mismatch
- initial.png and line.png: independently captured browser previews
