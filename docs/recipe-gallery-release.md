# Recipe gallery release

The ASCII Atelier redesign replaces the lesson-led home page with five playable projects and complete build recipes. Payments remain outside this release. Earlier prompts, private copies, lesson URLs, completions, and earned access remain available.

## Delivered

- Original animated ASCII portal, licensed local Barlow Condensed and IBM Plex Mono fonts, asymmetric bento gallery, monochrome chrome, and color reveal on hover/focus.
- Same-project preview carousels with immediate hover/focus pause, manual controls, saved global pause, offscreen suspension, and automatic motion disabled on narrow/coarse-pointer or reduced-motion devices.
- Tempo Lab, Studio Desk, Pixel Garden, Orbit Notes, and Signal Drift. Their images are real captures of the working demos, not generated mockups presented as outputs.
- Project workbench with Try, Reset, Close, Copy, native Download, Save, complete instructions, customization notes, limits, and build/reproduction records. Mobile order is demo, recipe, then build notes.
- Single prompts, ordered packs, and skill files. Skill ZIPs preserve filenames and include a versioned PLS-RECIPE.md usage guide; no application source is part of a recipe export.
- Immutable published recipe versions, optimistic revision checks, private structured snapshots, collections, personal edits, history, archive/recovery, and complete library export. Downloading a private copy requires saving current edits first.
- Creator Studio with ordered steps, safe skill files, standalone HTML/image uploads, private drafts, publication requirements, and current-release preservation while editing. Changed build instructions require a new matching build reference and fresh rebuild record.

## Evidence and checks

- [Original build and repair record](recipe-gallery-evidence/PACK_RECIPE.md), [original functional checks](recipe-gallery-evidence/VALIDATION.md), and [independent reproduction report](recipe-gallery-evidence/REPRODUCTION.md).
- All five recipes independently rebuilt from instructions without seeing the original implementations or images. The independent run passed 37 grouped Chromium checks. It establishes feature reproducibility, not pixel identity, one-shot success, or human-learning effectiveness.
- [Migration rehearsal](recipe-gallery-evidence/migration-rehearsal.json): exact live logical export restored locally; generated additive migrations 0002 and 0003 preserve all six original prompt rows, three lesson rows, and zero save rows across their original columns. Integrity and foreign-key checks pass. Guarded content seeding is tested separately for idempotence and preservation of later creator edits and earned grants.
- In-app browser: gallery/project widths 320, 375, 768, 1024, 1440, and 1600; no horizontal document overflow. Additional 200% root-text scaling at 320px exposed and resolved navigation, version-label, and button overflow. Viewport and text overrides were removed after checking.
- In-app browser: real embedded interaction, Reset, Close with focus restoration, filter/search empty-state recovery, return to the original card and filters, keyboard color reveal/pause, global pause across navigation, successful clipboard copy, and native public/private download events.
- Local isolated QA proxy: creator draft/save/publish workflow, blocked navigation while edits are unsaved, standalone demo/image uploads, preservation of an older private copy after a new release, repeated saves, private editing and history, unavailable-demo timeout/retry, and download-failure/retry. Test identities, fixtures, uploads, and outage controls are local only and are excluded from the release package.
- Denied clipboard behavior is covered by an automated helper test: primary permission failure falls back; fallback failure does not report success, removes temporary content, and restores focus.
- Focused repository checks cover creator-only publication, unpublished draft/media access, atomic failure and revision races, immutable versions, private ownership, restore from structured to plain-text history, structured lesson rewards, and independent ZIP parsing/CRC/path/Unicode checks.
- A second read-only review found no release blockers after fixes. Production build, type check, lint, and automated suite results are recorded with the deployment below.

## Demo isolation

The selected implementation uses a shared host name with an opaque browser origin, rather than a second host. Both iframe attributes and the HTML response enforce `sandbox allow-scripts`; `allow-same-origin`, forms, parent navigation, storage, and network access are not granted. A restrictive CSP also applies to direct demo visits. Camera, microphone, geolocation, and payment permissions are disabled. The demos run only after an explicit Try action and use sample/session data.

Built-in HTML is bundled only in server code. Creator HTML and images use immutable R2 object keys; draft assets require the creator's identity, and public access requires a released recipe reference. Uploaded HTML receives a readiness/error listener, while the parent validates the sending frame and opaque origin. This is reviewed static HTML hosting, not server-side execution of visitor code or prompts.

## Production recovery and access

Reuse the existing Sites project, DB, BUCKET, domain, and owner-only audience. The existing site was private before this task; publishing the redesign does not broaden its audience. PLS_CREATOR_EMAILS is configured for the existing site owner's email as a secret runtime value. Authentication still belongs to the Sites dispatcher; localhost does not implement a fake ChatGPT login.

The refreshed complete logical backup is stored privately at `work/recipe-gallery/prepublish-table-export.json`; it is excluded from Git and the deployed archive. The previous live source is `602198ff3ce6c0b95cd86883a405509ad2429f82`, version 2. Its migrations 0000/0001 remain byte-for-byte unchanged. Sites tools expose user tables but not the internal applied migration ledger; the final deployment must establish acceptance of the additive migration sequence. The unrelated local Wrangler database had a missing local migration ledger; its tables were inspected and backed up before only 0003 was applied locally. That local ledger is not evidence of production state.

If deployment fails, keep the previous application live and inspect the actual migration boundary before retrying. Do not rewrite applied migration files, rerun destructive baseline SQL, reset the production database, or restore a logical snapshot over newer writes. Prefer an additive forward fix or a schema-compatible previous application. A native D1/R2 disaster recovery has not been rehearsed; the backup is a logical table export, not a provider snapshot. Existing R2 objects are not overwritten by this release.

## Release result

Preflight passed: production build, type check, lint with no warnings, and 68 automated tests. Rendered color-pair checks passed at 6.60:1 for muted text on the canvas, 9.52:1 for secondary text on cards, 16.87:1 for primary text on cards, and 4.22:1 for control boundaries. Package, deployment, and live checks are recorded after the hosting operation.

## Remaining validation

A real newcomer usability observation remains open in the pivot plan. Agent reproduction and automated browser checks do not close that item. Safari, physical touch devices, actual browser zoom, perceptual audio quality, and manual assistive-technology testing have not been performed. No formal accessibility-conformance claim is made.
