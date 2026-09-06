# Studio Desk — complete build recipe

This is a generated demonstration asset and its complete implementation recipe. No separate reproduction run is claimed. The exact original assignment is preserved in `PACK_RECIPE.md`; the copyable prompt below consolidates the implemented specification and any repairs.

## Complete prompt

```text
Build one standalone, dependency-free HTML file with inline CSS and JavaScript. It must work offline, without fetch, remote scripts, external fonts/assets, eval, or storage; use only session memory. Use system sans-serif and Georgia where specified. The result is a real working product demonstration: no placeholders, fake action buttons, or fake AI. Make it responsive to 320px with keyboard and touch controls, clear focus indicators, meaningful accessible names, and reduced-motion CSS. Use the attractive palette specified below; surrounding site chrome may grayscale the iframe.

It must work inside iframe sandbox='allow-scripts', including opaque origin, with this CSP exactly:
default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'
Include that policy in a meta element. After all synchronous initialization, call window.parent.postMessage({type:'pls-demo-ready'}, '*'). Never assume allow-forms, allow-same-origin, persistent storage, or network access. Only perform audio after explicit user activation.

Create studio-desk.html, a calm client-project planner with warm ivory (#f2eee6), parchment cards (#fffdf6), muted olive text, and rust-orange primary actions (#bc5738). Use a Georgia “studio desk” wordmark with a rust square s. mark, the headline “Room to make.”, and a visible SAMPLE SESSION · CHANGES STAY HERE badge. On desktop use a narrow filter sidebar, three computed summary cards, search, and a three-column board. Collapse the sidebar to a filter row below 750px and the board to stacked status sections below 440px.

Seed exactly six projects: Fieldwork / The weekend collection / Art direction / Queued; Olive Press / Something worth opening / Packaging / Queued; Morrow Studio / A quieter kind of identity / Brand identity / In motion; Common Ground / Sounds like summer / Sound design / In motion; Still House / A digital place to land / Web design / Ready; Daybreak / Small gestures, big feeling / Campaign / Ready. Include short, concrete project notes for each. Show All projects, In motion, and Ready filters with real counts. Search title, client, notes, and focus. Compute total count, In motion count, and Ready/total completion percentage with an accessible progress bar; initial progress is 33%.

New project and clicking a project title open an accessible modal dialog. Edit required title (80 chars), required client (50), optional notes (300), focus (24), and status. Save, Cancel, Delete, Escape dismissal, and reset sample must work. Every card also has a native status select for keyboard/touch movement. Support desktop drag/drop between status columns as an additional interaction. Render user text with textContent. Empty search/columns must have honest empty states.

Because allow-forms is absent, Save must be an explicit type=button handler that calls reportValidity and updates in-memory state. Enter in single-line editor inputs must prevent the native form action and call the same save function. Never depend on a form submit event. Keep all actions local, with real status announcements and no account, sync, or AI claims.
```

## Ordered implementation record

1. Initial implementation of the shared contract and project-planner specification.
2. Opaque-sandbox testing found native form submission was blocked before the submit handler. Replace Save with type=button and an explicit save handler, use reportValidity, and handle Enter in single-line inputs without native submission.
3. Run the final sandbox, functional, responsive and touch checks recorded in `VALIDATION.md`; do not label this an independently reproduced or one-shot-verified result.

## Result

- Standalone file: `studio-desk.html`.
- Validation evidence: `validation-results.json`, `validate.cjs`, and `VALIDATION.md`.
- State is in memory only. Reloading discards edits or progress.
