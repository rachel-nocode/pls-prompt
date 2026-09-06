# Tempo Lab — complete build recipe

This is a generated demonstration asset and its complete implementation recipe. No separate reproduction run is claimed. The exact original assignment is preserved in `PACK_RECIPE.md`; the copyable prompt below consolidates the implemented specification and any repairs.

## Complete prompt

```text
Build one standalone, dependency-free HTML file with inline CSS and JavaScript. It must work offline, without fetch, remote scripts, external fonts/assets, eval, or storage; use only session memory. Use system sans-serif and Georgia where specified. The result is a real working product demonstration: no placeholders, fake action buttons, or fake AI. Make it responsive to 320px with keyboard and touch controls, clear focus indicators, meaningful accessible names, and reduced-motion CSS. Use the attractive palette specified below; surrounding site chrome may grayscale the iframe.

It must work inside iframe sandbox='allow-scripts', including opaque origin, with this CSP exactly:
default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'
Include that policy in a meta element. After all synchronous initialization, call window.parent.postMessage({type:'pls-demo-ready'}, '*'). Never assume allow-forms, allow-same-origin, persistent storage, or network access. Only perform audio after explicit user activation.

Create tempo-lab.html, a four-track, 16-step Web Audio sequencer with a deep forest-green background (#102723), lighter green rack (#17362e), and lime kick, peach snare, mint hat, and lavender keys. Use the lowercase wordmark “tempo lab”, a simple CSS meter icon, and the headline “Find your rhythm.” Lay out the 64 step buttons in four labeled rows, with step numbers, visible active states and a moving playhead.

Keep independent editable A and B patterns in memory. Default to 108 BPM; support 70–160 BPM and master level 0–100, initially 65. Provide Play/Stop, Clear current pattern, and three preset choices. Use these zero-based A step lists by track (kick, snare, hat, keys): Late-night pocket [[0,6,8,11],[4,12],[0,2,4,6,8,10,12,14],[0,7,10]]; Broken sunlight [[0,3,8,10],[4,11,12],[0,2,3,6,8,10,14,15],[0,6,12]]; Greenhouse house [[0,4,8,12],[4,12],[2,6,10,14],[0,4,10,14]]. Generate B from A with only the keys shifted by two steps. Preset selection replaces both patterns. Editing and pattern switching work during playback.

Create/resume AudioContext only after Play. Schedule with a 25ms lookahead timer and 100ms audio horizon; each step is a sixteenth note. Synthesize kick with falling sine pitch, snare/hat with filtered noise and short envelopes, keys with a triangle oscillator cycling C4/Eb4/G4/Bb4 by beat. Master gain silences Stop; cancel visual timers and stop when the document is hidden. Clearly report if Web Audio cannot start.

Step buttons expose aria-pressed; arrows navigate the 64-button grid and Enter/Space toggles normally. At 600px and below, add native track and step selectors plus a large Toggle step button as a precise touch alternative, keeping the compact full pattern visible. Hide only the level slider at that breakpoint. Announce edits and playback changes in a status region.
```

## Ordered implementation record

1. Initial implementation of the shared contract and sequencer specification.
2. Mobile review: add native Track and Step selectors with a Toggle step button below the sequencer at widths up to 600px so small step cells have a precise touch alternative.
3. Run the final sandbox, functional, responsive and touch checks recorded in `VALIDATION.md`; do not label this an independently reproduced or one-shot-verified result.

## Result

- Standalone file: `tempo-lab.html`.
- Validation evidence: `validation-results.json`, `validate.cjs`, and `VALIDATION.md`.
- State is in memory only. Reloading discards edits or progress.
