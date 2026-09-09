# Chance Drawer implementation plan

Goal: Publish one distinct probability workshop and reproduced recipe for September 9.
Architecture: Add one reviewed standalone demo, daily content payload and real previews through existing seed/recipe routes; no schema, auth, analytics or audience changes.
Stack: dependency-free demo; existing Vinext/React/Sites host.

- [x] Read previous memory, clean baseline 044f663, 17-entry ledger and all 17 live rows (offsets 0/6/14, final has_more=false); eight live gallery projects retained. No active repo process; exclusive run lock acquired.
- [x] Choose probability distribution and finite-bag sampling: unrelated to existing curve motion, pixel drawing, mirror puzzles, garden, runner, sequencer, notes and workspaces. User directs active checkout; preserve it instead of relocating to a worktree.
- [x] Build demo-assets/chance-drawer.html from recipe-step-1.txt and verify via recipe-step-2.txt.
- [x] Fresh-context reproduction research outside Site checkout, then read-only spec and quality reviews.
- [x] Extend lib/demo-bundles.ts and lib/daily-project-content.json, add public/previews/chance-drawer-*.png and honest proof. Preserve earlier JSON entries exactly as data.
- [x] Build, typecheck, lint, repository regression tests, opaque-frame behavior, responsive and local production host/analytics/download checks.
- [x] Commit exact validated source, push to credential-returned Sites repository, package helper, save, deploy to existing audience, verify terminal success/live project and exact recipe attachment.
- [x] Record source/deployment, ledger publication and memory; remove own lock and stop own servers.
