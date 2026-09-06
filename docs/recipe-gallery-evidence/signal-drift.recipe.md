# Signal Drift — complete build recipe

This is a generated demonstration asset and its complete implementation recipe. No separate reproduction run is claimed. The exact original assignment is preserved in `PACK_RECIPE.md`; the copyable prompt below consolidates the implemented specification and any repairs.

## Complete prompt

```text
Build one standalone, dependency-free HTML file with inline CSS and JavaScript. It must work offline, without fetch, remote scripts, external fonts/assets, eval, or storage; use only session memory. Use system sans-serif and Georgia where specified. The result is a real working product demonstration: no placeholders, fake action buttons, or fake AI. Make it responsive to 320px with keyboard and touch controls, clear focus indicators, meaningful accessible names, and reduced-motion CSS. Use the attractive palette specified below; surrounding site chrome may grayscale the iframe.

It must work inside iframe sandbox='allow-scripts', including opaque origin, with this CSP exactly:
default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'
Include that policy in a meta element. After all synchronous initialization, call window.parent.postMessage({type:'pls-demo-ready'}, '*'). Never assume allow-forms, allow-same-origin, persistent storage, or network access. Only perform audio after explicit user activation.

Create signal-drift.html, a polished endless side-scrolling runner with the headline “Find your flow.” Use a dark navy shell (#1d2430), a dusk gradient sky, peach sun, layered mauve hills, a flat dark ground, tiny stars, and a small pixel astronaut with a trailing scarf. Canvas logical size is 900×390 with ground at y=303. Above the game show real distance and session best, zero-padded to four digits. Below it show Jump, Pause/Resume, Restart, Sound off/on, Reduced motion, keyboard instructions, and an honest session-memory note.

Initial state is idle and silent with a frozen attractive scene and an overlay reading “Chase the quiet.” Start drifting begins the real simulation; it must never autoplay. Player is x=115, 26×34px. Gravity is 1650px/s² and ground jumps use -610px/s velocity; no midair jumps. Start speed 250px/s grows by .23×distance, capped at 400. Distance grows by dt×speed×.065. Start obstacles at x=650 (28×39) and x=1080 (35×48); subsequent obstacles use a seeded generator (seed 42, LCG 1664525/1013904223) for 350–490px gaps, 25–40px widths and 32–55px heights. Use real inset AABB collision; end the run and update the session best on collision. Use requestAnimationFrame and cap dt at .035 seconds.

Pause freezes gameplay and shows “Take a breath.” with a working Resume action. Game-over overlay shows achieved distance and Drift again. Restart resets the run and starts immediately. Space or ArrowUp jumps, P pauses/resumes, R restarts, tapping the scene jumps, and all actions have visible keyboard/touch buttons. Avoid intercepting text inputs and avoid duplicate Space behavior on focused buttons. Automatically pause when the document becomes hidden. Announce state changes accessibly without live-announcing every animation frame.

Sound is off by default. If explicitly enabled, synthesize quiet short jump and collision tones with Web Audio; never load audio files. Reduced motion defaults to the user's media preference and has a real checkbox; remove parallax, scarf/dust animation and running gait while preserving necessary game movement. At 320px allow controls to wrap and keep all actions available. Best score and settings do not persist after reload.
```

## Ordered implementation record

1. Initial implementation of the shared contract and runner specification; no implementation repair was needed after the functional checks.
2. Run the final sandbox, functional, responsive and touch checks recorded in `VALIDATION.md`; do not label this an independently reproduced or one-shot-verified result.

## Result

- Standalone file: `signal-drift.html`.
- Validation evidence: `validation-results.json`, `validate.cjs`, and `VALIDATION.md`.
- State is in memory only. Reloading discards edits or progress.
