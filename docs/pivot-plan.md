# PLS PROMPT Recipe Gallery Implementation Plan

**Status:** Active pivot plan, September 5, 2026. This replaces the previous learning-platform roadmap in full. This document is planning work; the current application has not been changed to this direction yet.

**Goal:** Let people try a working project, collect the recipe used to build it, and adapt that recipe into something of their own.

**Architecture:** Extend the existing directory, prompt detail pages, private library, and creator workspace. Pair a versioned recipe with a separately hosted, interactive demonstration and a short record of how it was built. Keep the existing Sites application, identity, and storage; introduce no payment system or general-purpose code runner.

**Tech stack:** React, Vinext/Vite, Tailwind, installed UI primitives, Sites authentication, D1/Drizzle, and R2.

Implementation should proceed task by task using the executing-plans workflow. Checkboxes track delivery; the screenshot-based design phase precedes visual implementation.

## 1. Product direction

PLS PROMPT is a curated library of premium build recipes with working projects people can explore. Visitors learn by seeing a result, understanding its recipe, and changing it to suit themselves.

The live project is the demonstration. The downloadable product is the recipe. Application source code, compiled applications, and project repositories are not included in the download.

A recipe supports three formats:

- **Single prompt:** one complete, copy-ready build instruction.
- **Prompt pack:** a named sequence of prompts, with their order and the point at which each is used.
- **Skill:** reusable skill instructions and any supporting recipe files needed to use them, with installation and usage notes for the tool actually tested.

Use “recipe” as the shared product name. Format labels explain what someone will receive without splitting the site into three separate experiences.

Premium means useful, carefully authored, demonstrated, and tested. A high word count, polished thumbnail, or unexplained quality score does not establish that quality.

## 2. The core experience

**Browse → try the project → inspect its recipe → copy, download, or save → customize.**

### Gallery

- Put the projects at the center of the homepage, with a brief explanation of the site.
- Each card shows a real preview image, project name, one-sentence outcome, and recipe format.
- Make opening the project the primary card action.
- Begin with search and a small set of useful project categories. Add filters only when inventory justifies them.
- Load screenshots in the gallery; initialize interactive demos on the project page after the visitor chooses to try one.
- Keep primary navigation to **Explore** and **My Library**, plus account controls. Show **Studio** only to the creator.

### Project page

- Give the live preview the main area, alongside a compact recipe panel on desktop.
- Stack preview and recipe on mobile, keeping the recipe easy to reach without interacting with the demo first.
- Offer clear **Try demo** and **Reset demo** controls, plus an **Open demo** fallback when embedding is unavailable.
- Show the recipe format, what it builds, the tool used, and any setup requirements before the copy or download action.
- Provide **Copy recipe**, **Download recipe**, and **Save to my library**. Packs also allow copying individual steps.
- Keep short, optional sections for **How it was made**, **What to customize**, and **Known limits**.
- Preserve existing `/prompts/[slug]` URLs. Keep the existing `/#prompts` destination working during the homepage transition.

### My Library

Reuse the private library for saved recipes, personal variations, notes, tags, collections, and exports. Saving captures the recipe version the person selected. Source updates must never overwrite their changes.

### Access for this release

Working default: visitors can try demos and copy or download the released recipes without signing in. Sign-in is needed to save to a personal library. There are no lesson requirements, checkout screens, prices, or pretend purchase buttons in the new main experience.

Already free content stays free. Existing earned access and private copies remain valid. Monetization can be designed later around new releases or explicitly defined access terms; this pivot does not retroactively lock content people already received.

## 3. What makes the demonstration credible

Every showcased project needs a traceable connection to its published recipe version.

Record:

- The recipe version and matching demo build version.
- The AI builder or tool and model, where known, plus the test date.
- Starting conditions, required accounts or services, and setup steps.
- The complete prompt sequence, including repair prompts actually needed.
- Any manual edits or other steps outside the prompts.
- The useful behaviors checked in the demo and the outcome of a separate recipe reproduction attempt.
- Known limits, including simulated services and parts not verified.

Keep the visitor-facing explanation short; allow the detailed build record to expand. A recording or screenshot may support the record, but the project is marked interactive only when a working demo is available.

Do not call a multi-step build a one-shot. If a repair prompt was required, include it and label the recipe a pack. If manual setup or editing was required, explain it. Demonstrating one successful build does not guarantee identical AI output for every person.

Publishing a changed recipe does not silently reuse the old proof. Match it to an updated demo and verification record, or keep the currently demonstrated version as the published version until the new one is tested.

## 4. Scope boundaries

### Keep and adapt

- Existing prompt records, stable URLs, search, and categories.
- Private library, personal editing, collections, version recovery, and export.
- Creator authorization and draft/publish controls.
- Existing authentication, storage, hosting project, and migrations.
- Original free prompts and existing private user data.

### Retire from the main product

- Lesson-first homepage sections and primary Learn navigation.
- Completing lessons as the way to access showcased recipes.
- XP, ranks, streaks, quizzes, grader development, and curriculum expansion as roadmap priorities.
- Unsupported quality scores and “verified” claims without a matching demonstration record.

During implementation, keep existing lesson URLs available through an unobtrusive archive entry or legacy notice. Preserve completions and access grants; removing the learning pitch does not require deleting the learning data. Do not create new lesson content for this release.

### Outside this release

Payments, subscriptions, pricing, creator payouts, public submissions as the main experience, a multi-seller marketplace, AI inference offered to visitors, visitor code execution, and downloadable application source projects.

## 5. Demonstration approach

Start with self-contained browser projects using sample data and local interaction. The first version should not need a visitor's account, secrets, real payments, or a paid model call to be useful.

- Host demo builds on an isolated origin, separate from the main application's authenticated pages.
- Confirm the selected host supports the required framing policy before adopting it; use only reviewed demo URLs.
- Configure the iframe with the minimum permissions required by the specific demo. Do not give it access to the parent site's cookies, library, navigation, or arbitrary top-level redirects.
- Do not run pasted prompts, uploaded source code, or visitor-provided URLs on the PLS PROMPT server.
- Make any browser-message integration explicit and validate its source and origin.
- Keep demo data per visitor session; a reset clears that session's sample state, not another person's data.
- Label simulated AI responses, sample accounts, and disconnected services visibly.
- Provide a real screenshot, a useful loading state, an unavailable state, and a link fallback. Keep the recipe readable when the demo fails.
- Give embedded content an accessible title, maintain keyboard escape and focus behavior, and prevent narrow screens from trapping the visitor inside the preview.

Demo hosting and frame compatibility are implementation checks, not capabilities already verified for this project. Publishing new hosts or changing production remains a separate release action.

## 6. Content and storage contract

Keep the existing prompt identity as the recipe identity and extend it through additive migrations.

A published recipe version contains:

- Title, slug, summary, category, tags, and format.
- Single-prompt text, ordered pack steps, or a skill entry file and its recipe support files.
- Tool/setup guidance, customization notes, and known limits.
- A download manifest listing exactly what the recipe includes.
- Demo URL, real thumbnail asset, demo build reference, and availability state.
- The matching build record and the date and result of reproduction checks.

Use a separate immutable recipe-version record for the published payload and its proof. A private library copy records its source recipe version and preserves the structured pack or skill content alongside the learner's personal changes. Retain existing text-only library items and all of their history.

Separate gallery metadata from recipe content. Return the recipe body through the same server-side access policy used by copy, download, and save. Released recipes are free in this version; preserving that boundary avoids inconsistent access behavior later.

Download behavior:

- Single prompt: Markdown with the prompt, usage notes, and version.
- Prompt pack: one Markdown file containing the ordered sequence and step-specific guidance.
- Skill: its entry instruction file and only the supporting files required by the recipe, bundled when more than one file is needed.

Preserve exact ordering and filenames during save/export. Allowlist safe relative filenames, reject path traversal, and never bundle secrets or generated app source into a recipe download.

Legacy directory items without a working demo keep their URLs and access. They do not automatically become showcased or demonstrated projects. Select the launch gallery through an explicit creator-controlled showcase state.

## 7. Implementation map

Reuse current routes and keep new responsibilities small:

- `app/page.tsx`, `components/prompt-explorer.tsx`, `components/site-header.tsx`: gallery landing page, simplified navigation, removal of lesson-led promotion.
- `app/prompts/[slug]/page.tsx`: project detail page combining demo, recipe actions, and build context.
- New `components/project-demo.tsx`: demo loading, reset, fallback, framing, and accessibility behavior.
- New `components/recipe-panel.tsx`: display single prompts, ordered packs, and skill contents; copy/save/download actions.
- `app/globals.css` and the existing `components/ui/` primitives: implement the design system after the screenshots are supplied.
- `db/schema.ts`, generated files in `drizzle/`, `lib/data.ts`, `lib/repository.ts`, and `lib/library-types.ts`: recipe format, immutable published versions, demo/proof metadata, structured private snapshots, and access-aware queries.
- New `lib/recipe-types.ts` and `lib/recipe-export.ts`: shared recipe contract and deterministic download formatting.
- New `app/api/recipes/[slug]/download/route.ts`: access-checked exports from a specific published recipe version.
- `app/api/library/route.ts` and `components/library-workspace.tsx`: collect and edit complete recipe formats while preserving existing private items.
- `app/api/studio/route.ts` and `components/creator-studio.tsx`: recipe/pack/skill authoring, proof records, demo preview, and showcase publication checks.
- `app/learn/page.tsx`, `app/learn/[slug]/page.tsx`, and `lib/seed-database.ts`: legacy lesson presentation and a guarded content transition; preserve existing completion/access data.
- `tests/library.test.mjs`, `tests/rendered-html.test.mjs`, `tests/ui-components.test.mjs`, and new focused recipe/demo tests: migration preservation, public/private access, exports, version matching, and preview states.

These are implementation targets, not files changed by the planning task. Create detailed code tasks within each phase when its inputs are ready.

## 8. Delivery phases and completion gates

### Phase A — Replace the roadmap

- [x] Replace the previous pivot plan at this path instead of retaining two competing roadmaps.
- [x] Settle the product: curated project gallery, interactive demos, recipe-only downloads, and learning through customization.
- [x] Keep payments and the design-system decisions outside this planning task.
- [x] Mark the earlier Phase 0/Phase 1 reports as historical implementation evidence and point the repository overview at this plan.

**Gate:** One active roadmap describes the new direction; existing app code and user data remain intact.

### Phase B — Build the design system from the user's screenshots

**Input:** The user will provide UI reference screenshots. Do not choose a final palette, typography, component treatment, or layout system before that input arrives.

- [ ] Review the supplied references together and identify the specific qualities to carry forward: density, hierarchy, preview prominence, navigation, and interaction treatment.
- [ ] Define an original PLS PROMPT system for typography, colors, spacing, borders, radii, controls, icons, focus states, and motion.
- [ ] Design the gallery and a representative project page on desktop and mobile.
- [ ] Include loading, empty, unavailable-demo, copied, saved, signed-out, and error states.
- [ ] Document the selected system in `docs/design-system.md` and implement its reusable primitives before applying it across pages.

**Gate:** The visual direction has been reviewed against the screenshots, and both main screens work as one coherent system; no speculative full-site restyling precedes that review.

### Phase C — Prove one recipe and its live project

- [ ] Choose one project for the first demonstration based on the actual recipe inventory and its suitability for a self-contained browser demo.
- [ ] Build it while recording the prompt sequence, tool, setup, interventions, and functional checks.
- [ ] Rebuild from the finished recipe in a clean starting environment; revise the recipe to include any missing steps.
- [ ] Produce the real preview image and a resettable demo with sample data.
- [ ] Confirm the demo host, framing permissions, failure fallback, and separation from PLS PROMPT accounts.
- [ ] Prepare the exact downloadable recipe and its concise “How it was made” record.

**Gate:** Someone can try the project and follow the documented recipe; the demonstration and download refer to the same version. The existing three lesson-reward recipes are candidate content, not already proven demos.

### Phase D — Deliver the complete gallery-to-library path

- [ ] Add the recipe/version/demo fields through generated additive migrations and rehearse them against a local copy of existing data.
- [ ] Implement the gallery and project page using the Phase B design system and the Phase C real project.
- [ ] Add explicit Try, Reset, Copy, Download, and Save states, with working error recovery.
- [ ] Support single prompts, ordered packs, and skill files in display and exports; preserve the complete format in a saved private copy.
- [ ] Keep released-recipe browsing, copying, and downloads available to visitors; require sign-in for private collection.
- [ ] Remove lesson requirements from selected showcase recipes through an explicit, one-time content update. Preserve existing earned grants and personal copies.
- [ ] Replace lesson-led navigation and home sections; keep old prompt URLs and lesson archive access working.

**Gate:** A visitor can discover, try, and download a recipe, and a signed-in member can save, customize, restore, and export it without losing content or seeing another member's data.

### Phase E — Make publishing repeatable

- [ ] Extend Studio with recipe format, ordered steps or skill files, demo/thumbnail fields, and proof notes.
- [ ] Require complete recipe content, a matching demo version, build/reproduction records, and a usable fallback before an item is showcased.
- [ ] Allow incomplete drafts to remain private and give clear feedback for missing publication requirements.
- [ ] Keep the existing demonstrated version available while a revised recipe is being tested.
- [ ] Confirm the creator can add a second verified project without editing application source.
- [ ] Add only further recipes that pass the same proof and download checks.

**Gate:** Publishing is an editorial workflow the owner can repeat; the application does not need custom code for every new listing.

### Phase F — Verify the experience and prepare release

- [ ] Verify the gallery and project page with keyboard input and on narrow screens, including leaving/resetting embedded demos.
- [ ] Check blocked embeds, slow loads, unavailable demos, denied clipboard access, failed downloads, sign-in return paths, and repeated saves.
- [ ] Verify exports preserve pack order and skill filenames; ensure no application source or private files enter recipe packages.
- [ ] Verify migration preservation, recipe/demo version matching, private ownership, and existing access grants.
- [ ] Run the production build, type checks, lint, and focused automated tests for the changed behavior.
- [ ] Observe a newcomer finding a project, trying it, obtaining the recipe, and identifying what they could customize; fix points requiring live explanation.
- [ ] Refresh the production backup, confirm the migration ledger and recovery procedure, and verify hosted authentication before a requested release.

**Gate:** The core journey works with real content and truthful proof. Production publishing is not included in the present plan-writing request.

## 9. Measures that matter

Track only the signals needed to improve this experience: project opens, demo starts, recipe copies/downloads, saves, and returns to saved recipes. Do not record prompt text or detailed activity inside the demo by default.

Use feedback to determine whether people understand what they receive, can reproduce the project, and find the customization guidance useful. Do not treat a copied prompt or a played demo as proof of a successful rebuild.

Consider monetization after the free experience demonstrates repeat use and reliable recipes. Pricing and payment implementation require a separate decision and plan.

## 10. Next input and project record

The next user-provided input is the UI screenshots. Use them to begin Phase B, then establish the first real recipe/demo pair before expanding the catalog. No additional feature implementation is authorized by this document alone.

The earlier [foundation audit](phase-0/README.md) and [library and learning implementation report](phase-1.md) remain historical evidence of completed work. Their former future phases are superseded by this plan. The unrelated domain setup item remains in [the project to-do](../todo.md).
