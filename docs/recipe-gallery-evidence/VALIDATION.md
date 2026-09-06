# Functional validation

## What ran

Google Chrome headless, driven through bundled Playwright on macOS. Every final HTML file loaded as `srcdoc` in `sandbox="allow-scripts"`; the frame origin was asserted to be `null`. The exact CSP was:

```text
default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'
```

Every demo sent `pls-demo-ready`. All five completed without console errors, uncaught page errors or observed network requests. Desktop checks used a 1080px viewport and narrow-screen checks 320px. None had horizontal document overflow. Desktop/mobile screenshots were inspected; the mobile screenshot harness was adjusted to capture long iframe documents fully.

## Functional results

- Tempo Lab: 64 steps, toggle, clear, A/B, presets, tempo, no AudioContext before Play, user-activated AudioContext running state, advancing playhead, Stop, arrow-key navigation and native mobile step-editor tap passed.
- Studio Desk: six sample projects/33% progress, add, edit, delete, status-select movement, search, filters, computed counts/progress and reset passed; an emulated mobile tap opened the editor and Enter saved without native form submission.
- Pixel Garden: 64 accessible text tiles, plant/water/two-day growth, seed accounting, erase, arrow selection, text-map activation and reset passed; emulated mobile taps planted a tree through Use tool and a flower through the canvas hit target. Day and joy derive from live state.
- Orbit Notes: add/edit/delete/search, grouping filters, pagination after a seventh note, topic editing, text-list toggle and reset passed; emulated mobile touch opened a note and Enter saved it.
- Signal Drift: idle/silent default, Start, jumping, Pause freezing score, Resume, Restart, obstacle collision/game over, distance/best, reduced-motion setting and keyboard R/Up/P passed; mobile emulated touch Restart/Jump/Pause passed.

## Repairs

Initial native form submission in Studio Desk was incompatible with the sandbox: Chrome blocked it before the submit listener. Studio Desk and Orbit Notes now use explicit Save buttons and intercept Enter. Sandbox permissions were not loosened. Tempo Lab gained a native-select mobile editing alternative, and Pixel Garden's mobile wordmark was refined. All final files passed after these changes.

## Not verified

- No second independent generation from the published recipes.
- No Safari, Firefox, real mobile hardware, screen-reader, long-session soak or final host-site integration tests.
- Emulated touch verifies browser touch events, not physical-device ergonomics.
- Web Audio initialization/scheduling was checked; audio was not listened to or measured, and Signal Drift's optional sound-on tones were not exercised.
- Studio Desk's status menus were tested; its additional drag/drop gesture path was not tested.
- Automatic pause on document hiding is implemented in Tempo Lab and Signal Drift but was not exercised in the final suite.

## Evidence and rerun

`validation-results.json` records final results, `validate.cjs` contains the checks, and `*-desktop.png`/`*-mobile.png` show captured validation states. Run locally with existing Chrome and bundled Playwright:

```sh
NODE_PATH=/Users/witchaudio/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules node /tmp/pls-prompt-demo-assets/validate.cjs
```

All state is session memory. Reloading resets it by design.
