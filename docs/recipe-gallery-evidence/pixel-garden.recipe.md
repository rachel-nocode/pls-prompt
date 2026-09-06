# Pixel Garden — complete build recipe

This is a generated demonstration asset and its complete implementation recipe. No separate reproduction run is claimed. The exact original assignment is preserved in `PACK_RECIPE.md`; the copyable prompt below consolidates the implemented specification and any repairs.

## Complete prompt

```text
Build one standalone, dependency-free HTML file with inline CSS and JavaScript. It must work offline, without fetch, remote scripts, external fonts/assets, eval, or storage; use only session memory. Use system sans-serif and Georgia where specified. The result is a real working product demonstration: no placeholders, fake action buttons, or fake AI. Make it responsive to 320px with keyboard and touch controls, clear focus indicators, meaningful accessible names, and reduced-motion CSS. Use the attractive palette specified below; surrounding site chrome may grayscale the iframe.

It must work inside iframe sandbox='allow-scripts', including opaque origin, with this CSP exactly:
default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'
Include that policy in a meta element. After all synchronous initialization, call window.parent.postMessage({type:'pls-demo-ready'}, '*'). Never assume allow-forms, allow-same-origin, persistent storage, or network access. Only perform audio after explicit user activation.

Create pixel-garden.html, an 8×8 isometric garden builder using a single canvas and hand-drawn pixel shapes. Use sage (#e7eddb), pale cream panels (#f7f7e9), olive controls, checkerboard green grass, a sandy path, aqua pond, yellow/pink/lavender flowers, and blocky green trees. Use the Georgia wordmark “pixel garden” and headline “A little care goes a long way.” The desktop layout has the world on the left and a compact tool panel on the right; below 650px place tools in four columns below the world. Keep the mobile wordmark on one line.

Canvas logical size is 760×445. Tiles have 66×32 diamond tops and 12px sides, with origin (380,76), depth sorting and an obvious selected tile outline. Seed a deterministic attractive garden on otherwise empty grass using zero-based coordinates: trees (1,1,stage3),(1,2,stage2),(6,1,stage3),(6,6,stage2); flowers (6,2,stage2),(2,5,stage2),(3,6,stage1),(1,5,stage2),(5,5,stage1); ponds (4,1),(5,1),(4,2),(5,2); paths (0,4),(1,4),(2,4),(3,4),(4,4),(4,5),(4,6),(4,7). Draw stems, petals, block canopies, water marks and a soft ground shadow with canvas primitives, never images.

Start on Day 1 with 24 seeds and selection (3,3). Tools: Flowers cost 3, Tree costs 6, Water costs 1, Clear is free. Plant only on grass, beginning at growth 0. Water only plants, once each day. Next day gives 6 seeds, grows each watered plant one stage, then clears watered flags. Flowers cap at stage 2 and yield 4 joy each; trees cap at 3 and yield 8 joy each. Joy is always computed from the live garden. Invalid actions explain the applicable rule without spending seeds. Clear returns any tile to grass. Reset restores the initial garden, day and budget.

Click/tap the isometric tile to apply the tool using inverse-coordinate hit testing. Canvas supports arrow selection and Enter/Space action. Include visible directional buttons plus Use tool, and a collapsible 64-button text map with tile coordinates, contents, growth and watering states. This text map is a complete keyboard/touch alternative to the canvas. Announce action results, and display selected tile, day, seeds and joy.
```

## Ordered implementation record

1. Initial implementation of the shared contract and garden specification.
2. Mobile visual review: keep the wordmark on one line and constrain the small tagline at widths below 650px.
3. Run the final sandbox, functional, responsive and touch checks recorded in `VALIDATION.md`; do not label this an independently reproduced or one-shot-verified result.

## Result

- Standalone file: `pixel-garden.html`.
- Validation evidence: `validation-results.json`, `validate.cjs`, and `VALIDATION.md`.
- State is in memory only. Reloading discards edits or progress.
