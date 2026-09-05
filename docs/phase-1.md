# Phase 1 — Private library, creator workspace, and beginner rewards

Implementation completed locally on September 5, 2026. Production has not been changed. The original Sites project, ChatGPT sign-in, D1/R2 bindings, and existing content URLs are preserved.

## Available experience

- `/library`: save directory prompts, write private prompts, edit personal copies, add notes and tags, search, create and rename collections, archive and restore, inspect and restore earlier versions, copy instructions, download Markdown, and export the complete library with history as JSON.
- `/studio`: explicitly authorized creators can write recipe and lesson drafts, review submissions, preview text, publish, choose prerequisites, attach a completion recipe, and author a prompt-completion exercise with a starter, optional ending, goal, hints, guided criteria, and private reference answer. Incomplete drafts can be saved; publishing checks required content and dependencies.
- `/learn`: three beginner lessons, each about three minutes, with a short reading panel and a chat-style prompt composer. Learners write the missing instructions, submit for criterion-by-criterion feedback, and revise with optional hints. Progress persists across sessions. A successful signed-in check collects the full project recipe automatically. Anonymous practice gives feedback without saving progress or granting recipe access. Returning to a completed lesson makes that saved recipe available again.
- Directory: project category and lesson-reward labels, visible earning requirements, protected recipe text, and collection buttons for accessible prompts.

First rewards are StudioDesk, a client portal; Publish Lab, a content production studio; and Evidence Desk, a research workbench. Each is one complete prompt with concrete defaults, features, design direction, data requirements, and acceptance checks. No template fields need filling before copying. The recipes are original authored instructions; their resulting projects have not been built or independently evaluated.

The user requested completion rewards during Phase 1, so basic lesson progress and protected access were moved forward from Phase 2. Prompt completion, guided grading, and progressive hints are now included. Live prompt execution, durable attempt history, mastery assessment, XP, and model-based feedback remain Phase 2 work. Payments remain Phase 3.

## Interactive lesson update

The prompt composer shows the supplied opening and ending around a labeled free-text blank. Learners can submit with the button or Command/Control + Enter, reveal hints one at a time, preview the assembled prompt, and revise without penalties. Drafts stay in session storage for that browser tab, scoped to lesson version and learner; an anonymous draft can carry into sign-in. If browser storage is unavailable, typing still works in memory for the open page.

Grading runs on the server using explicit English-language rules for these three guided exercises. It accepts tested paraphrases and rejects missing requirements and common opposite instructions. It does not run the resulting prompt against a model or assess arbitrary wording, creativity, or general mastery. The UI explains these guided checks and supports retries when wording is not recognized. Creator Studio offers the eight implemented criteria; new concepts that need other criteria require a new rule or a future model-backed evaluator. Publishing requires the creator's reference answer to pass all selected checks.

The additional `prompt-completion-exercises-v1` content revision upgrades only unchanged starter checks, preserving lesson URLs, creator edits, completions, access grants, and personal recipes. Custom legacy choice exercises remain intact in storage and show an unavailable state until their creator authors a completion exercise. No schema migration is needed.

On localhost, practice works without sign-in. ChatGPT sign-in still requires the hosted Sites gateway; the local practice result explains why recipe collection is unavailable there. No substitute authentication route or simulated learner account is added to the application.

## Data and access rules

- `drizzle/0002_square_bishop.sql` is the new generated, additive migration. Existing applied migrations are unchanged. Application startup no longer creates tables or indexes.
- `lib/seed-database.ts` performs a guarded, one-time content update and old-save backfill. All six original prompts stay free with their original content and URLs. The three original lesson URLs receive the short beginner content and new rewards. Later creator edits are preserved.
- `library_items` stores private snapshots independently of public prompts. Repeated saving preserves personal improvements; source edits never overwrite them. `library_versions` supports recovery, and collections only accept items owned by the same user.
- `lesson_completions`, `prompt_access`, and the collected recipe are written in one transaction. Unique constraints prevent repeated requests from creating extra rewards. Version checks reject stale lessons and conflicting private edits.
- Public directory responses exclude full text and attachment/source URLs. Lesson payloads omit reference answers and grading rule configuration. Full recipes and attachments require appropriate server-side access. Existing free attachments remain accessible.
- Private APIs return `private, no-store`; personalized pages disable caching. Mutation routes reject cross-site requests. Actor identity comes from Sites authentication headers, never from submitted user IDs.
- Creator access requires `PLS_CREATOR_EMAILS`, a comma-separated allowlist configured privately in the Sites runtime. An empty allowlist grants no creator access. Do not expose this Worker directly outside the trusted Sites authentication ingress.
- `editorial_versions` records previous published-content snapshots. The creator UI currently edits the current version; personal library history has its own visible recovery interface.

The Phase 0 SQL proposal remains a historical rehearsal. The generated Phase 1 migration is authoritative; its separate snapshot model avoids turning private edits into public submissions.

## Verification

- Production build, TypeScript, lint, and 59 automated tests passed after the interactive lesson update.
- Repository behavior tests cover old-content preservation, duplicate saves, user isolation, collections, archival recovery, version restoration, exports, creator authorization, publication dependencies, stale writes, one-time content setup, and atomic rewards.
- 55 local HTTP checks passed across anonymous practice, bounded submissions, the complete three-lesson path, synthetic authentication, creator permissions, five simultaneous completion requests, cross-user denial, editing, history, exports, rough draft authoring, and attachment privacy.
- Public page responses and browser bundles are checked for accidental reward-text disclosure.
- All three migrations applied successfully to a fresh local D1 database through Wrangler.
- The actual new migration and content backfill were rehearsed against the complete Phase 0 logical live export: original prompt fields were unchanged, lesson IDs and URLs survived, and database integrity passed.

These are automated code, rendering, HTTP, and local storage checks. No interactive browser usability test, live-model evaluation, production migration, or production deployment is claimed.

## Reproduce locally

Use Node 22.13 or newer. Type checking generates ignored runtime declarations using the installed Wrangler version. The existing build runner now uses a portable Node timeout and preserves the user's home directory.

```sh
npm ci
npm run db:migrate:local
npm run dev
npm run typecheck
npm run lint
npm test
```

`db:migrate:local` initializes a fresh local database and applies tracked migrations locally only. It never runs remotely. An older local database created by runtime SQL may lack the migration ledger: preserve that data and inspect its schema before reconciling it; do not reset it blindly. An optional directory argument creates a separate disposable migration rehearsal.

For HTTP verification, set the ignored `.dev.vars` allowlist to `creator@example.test`, restart the local server, then run `node --experimental-strip-types scripts/verify-phase-1-http.mjs`. The script only accepts localhost, uses synthetic identity headers, and creates identifiable local test records. This identity simulation is for local testing only; it does not verify the hosted ChatGPT sign-in round trip. Remove the test allowlist before release preparation.

## Release preparation

Before publishing this existing site, refresh the private logical export, verify the live schema and migration ledger, establish the platform recovery point, and configure the verified owner's creator allowlist. Preserve the existing owner-only audience. Deploy the validated source and generated migration through Sites when publishing is requested, then verify the hosted sign-in, learning, library, and creator flows.

The original production backup limitations in `docs/phase-0/README.md` still apply. The new recipes do not require a model-provider key or payment configuration for this phase.

The three starter recipes are included in source as course seed content. Future paid inventory should be authored in the database through Studio; do not place commercially restricted recipe bodies in a public source repository.
