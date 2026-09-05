PLS PROMPT — Learning, prompt library, and store

Working plan • September 4, 2026

Implementation status: Phase 0 inventory, logical backup, content mapping, starter lesson drafts, and local migration/restore rehearsal completed. See [Phase 0 evidence and next work](phase-0/README.md). Private library implementation is next; production migration, model calibration, and sales remain later work.

Build one place to understand AI, practice using it, and collect useful prompts. Your own study process supplies new lessons and products. Visitors can learn, buy, or organize prompts independently, with clear connections between all three.

Research scope: public Boot.dev pages, official Codewars documentation, and a source review of [rachel-nocode/pls-prompt](https://github.com/rachel-nocode/pls-prompt/tree/8b97641a8ac6ec5933df47150fc29fdd3ee85ccf) at commit 8b97641. Interactive browser inspection was blocked by browser security checks; authenticated screens, visual details, and full signup/payment flows remain unverified. Repository findings describe checked-in code, not verified production behavior. No application changes or deployment are part of this planning task.

0. Existing foundation and pivot gaps

- Reuse: searchable directory, category filters, prompt detail pages, copy actions, anatomy explanations, and GitHub-linked prompts. [Directory component](https://github.com/rachel-nocode/pls-prompt/blob/8b97641a8ac6ec5933df47150fc29fdd3ee85ccf/components/prompt-explorer.tsx)
- Extend: /learn and /learn/[slug] currently present reading material. Add interactive challenges, a module sequence, persistent attempts, and rewards. Source includes six seed prompts and three seed lessons; these are starter content counts, not production inventory. [Content source](https://github.com/rachel-nocode/pls-prompt/blob/8b97641a8ac6ec5933df47150fc29fdd3ee85ccf/lib/content.ts)
- Finish: prompt_saves exists in the schema, but no save/list flow was found; /profile shows submitted prompts. Add an actual private library, personal drafts, and collections. [Schema](https://github.com/rachel-nocode/pls-prompt/blob/8b97641a8ac6ec5933df47150fc29fdd3ee85ccf/db/schema.ts), [profile](https://github.com/rachel-nocode/pls-prompt/blob/8b97641a8ac6ec5933df47150fc29fdd3ee85ccf/app/profile/page.tsx)
- Reuse: ChatGPT sign-in helpers, D1 storage, R2 uploads, and submission records with review status. No creator moderation/publishing interface was found. [Identity helper](https://github.com/rachel-nocode/pls-prompt/blob/8b97641a8ac6ec5933df47150fc29fdd3ee85ccf/app/chatgpt-auth.ts), [data functions](https://github.com/rachel-nocode/pls-prompt/blob/8b97641a8ac6ec5933df47150fc29fdd3ee85ccf/lib/data.ts)
- Build: checkout, orders, access grants, protected downloads, learning progression, challenge runner, grading, and prompt version history.
- Keep: current Sites hosting, Vinext/Vite runtime, React, Tailwind, installed UI primitives, D1/Drizzle, and R2. This pivot needs feature work within the existing stack. [Dependencies](https://github.com/rachel-nocode/pls-prompt/blob/8b97641a8ac6ec5933df47150fc29fdd3ee85ccf/package.json), [runtime configuration](https://github.com/rachel-nocode/pls-prompt/blob/8b97641a8ac6ec5933df47150fc29fdd3ee85ccf/vite.config.ts)

Commercial prerequisite: current listings return full prompt records, the homepage passes them into a client component, prompt pages render full text, and the attachment route serves a supplied storage key without checking identity or ownership. That fits an open directory, but paid/private content requires changing all these paths before adding a paywall. Hiding the copy button is insufficient. [Public API](https://github.com/rachel-nocode/pls-prompt/blob/8b97641a8ac6ec5933df47150fc29fdd3ee85ccf/app/api/prompts/route.ts), [homepage](https://github.com/rachel-nocode/pls-prompt/blob/8b97641a8ac6ec5933df47150fc29fdd3ee85ccf/app/page.tsx), [attachment route](https://github.com/rachel-nocode/pls-prompt/blob/8b97641a8ac6ec5933df47150fc29fdd3ee85ccf/app/assets/%5B...key%5D/route.ts)

1. Product direction

- Learn: short explanations, guided practice, visible progress, and useful prompt rewards.
- Directory: browse your published prompts, see their purpose, and earn access or buy downloads.
- My Library: save personal prompts, organize collections, and reuse earned or purchased prompts.
- Creator workspace: keep study notes, test prompts, build lessons, and publish reviewed work.

One prompt can connect to several lessons, appear in the directory, and live in many personal libraries. Maintain one published source with versions; avoid separate copies for the shop and learning rewards.

Launch audience: everyday AI users and beginner vibe coders. Shared fundamentals come first; specialized paths follow. Use plain language while preserving accurate concepts. Public positioning should promise clarity and practice, without describing learners as “dumb.”

2. What Boot.dev contributes

Observed: Boot.dev emphasizes structured learning paths, hands-on work, portfolio projects, a short learning demo, and an AI mentor using questions and hints. Interactive access starts free for several chapters before membership is required. [Source: Boot.dev](https://www.boot.dev/)

Observed: Training Grounds adds practice tailored to learning history, spaced review, different challenge types, and XP, streaks, and quests. Its launch article describes validating generated challenges before serving them. [Sources: Training Grounds](https://www.boot.dev/training), [launch explanation](https://www.boot.dev/blog/news/training-grounds-launch)

Product interpretation: clear next steps and immediate application make a large subject feel manageable; review helps separate completing a lesson from understanding it.

Adaptation:

- Give newcomers one recommended next lesson and a visible module map.
- Let visitors try a short exercise before registration; save progress when they join.
- Keep explanations next to the task, with optional deeper material.
- Offer progressively stronger hints and explain why a revision worked.
- End modules with practical checkpoints and a useful prompt unlock.
- Start with authored challenges and fixed hints; add adaptive practice after quality and cost are measured.

3. What Codewars contributes

Observed: Codewars centers on compact kata, in-browser testing, ranked difficulty, community contributions, and comparing solutions after completion. [Source: Codewars](https://www.codewars.com/)

Observed: rank reflects solved challenge difficulty, with overall and language-specific progression. Its discovery tools support recommendations and filters for topics, difficulty, and progress. [Sources: ranks](https://docs.codewars.com/gamification/ranks/), [finding kata](https://docs.codewars.com/getting-started/finding-kata/)

Observed: kata support bookmarks and collections. Solutions become available after completion or explicit solution unlock; unlocking forfeits rank and honor for that kata. [Sources: kata](https://docs.codewars.com/concepts/kata/), [solutions](https://docs.codewars.com/concepts/kata/solutions/)

Product interpretation: focused repetition and comparing approaches can turn knowledge into judgment. A broad challenge catalog also creates navigation work for beginners.

Adaptation:

- Make practice available by skill, difficulty, and completion state.
- Let learners retry familiar concepts with fresh inputs.
- Show a small set of reviewed approaches after an attempt, explaining tradeoffs.
- Track topic mastery separately from participation XP.
- Let people bookmark challenges and save their own successful prompts.
- Use plain difficulty labels; add public competition only after solo learning works.

Combined experience: Boot.dev-inspired guided learning plus Codewars-inspired practice, connected through a reusable prompt collection. Borrow interaction patterns; create original branding, lesson text, challenges, and artwork.

4. Main screens and user journeys

- Home: short interactive introduction plus clear entrances to learning and the directory; retain the existing /#prompts destination during the transition.
- Learn: current module, next lesson, progress, and upcoming prompt rewards.
- Lesson workspace: concise concept, objective, editable prompt, run action, output, and feedback. Desktop can use adjacent panels; mobile uses a clear stacked sequence.
- Practice: filters, recommended challenge, retries, hints, and solution review; reuse the lesson workspace.
- Directory: search by use case and concept; filter access state and price. Each product explains inputs, intended result, tested model/date, limitations, download contents, price, and earning requirement.
- My Library: add /library for personal, earned, purchased, and bookmarked prompts; collections, notes, search, editing, and export. Keep /profile for identity and existing submissions.
- Creator workspace: private study notes, prompt versions, lesson drafts, test results, preview, and publication controls.

Learner journey: try lesson → sign in to keep progress → pass challenge → unlock prompt → customize and save → continue learning.

Buyer journey: find prompt → inspect product → buy → access in library → download or customize → optionally study linked concept.

Collector journey: add own prompt → tag and organize → revise → reuse or export. Learning progress is never required for personal storage.

Interface requirements: keyboard access, readable contrast, visible focus, reduced-motion support, saved drafts, clear loading/error states, and one primary action per lesson. Celebrate success briefly; keep retries easy and respectful.

5. Unlocks, ownership, and selling

Recommended launch model: free starter learning plus one-time prompt and bundle purchases. Measure usage costs and demand before adding a learning subscription.

- Each reward-linked product offers two routes to the same prompt version: complete its stated learning requirement or purchase access immediately.
- Purchase grants content access. Skill progress requires a challenge pass on fresh inputs; earned rewards stay available after progress resets.
- Already-owned rewards acknowledge ownership and still award eligible learning progress. Avoid duplicate charges; show bundle overlap before checkout.
- Saving a locked product creates a bookmark. It does not expose protected prompt text.
- Full access permits copying, downloading, and creating a private editable version. Upstream updates never overwrite personal edits.
- Personal prompts stay private unless the owner explicitly publishes them. Launch with you as the only seller; preserve existing community submissions and review status without automatically making contributors sellers.
- Downloads should include prompt text, variable guidance, usage notes, and version information, available as plain text or Markdown; support library JSON export for portability.
- State whether updates are included on each product. Keep buyers’ purchased versions accessible. A refund removes only the purchase-based access grant; independent earned access and personal drafts remain.

Pricing remains a launch experiment. Start with individually priced prompts and a small curated bundle. Define price after reviewing actual inventory and purchase interest; avoid unsupported revenue forecasts.

6. Your own learning and publishing workflow

Capture question → study source material → explain concept in your words → test prompt → record failures and revisions → draft lesson → validate challenge → publish lesson and linked product.

- Private study notes can remain rough and incomplete.
- Every publishable concept needs sources, a learning objective, and a last-reviewed date.
- Every published prompt needs a reproducible use case, input guidance, version, and testing notes.
- Every challenge needs a reviewed reference solution, meaningful failure cases, hints, and acceptance rules.
- AI can help draft material; publishing requires your review and evidence that the exercise works.
- Track confusing lessons and disputed scores in the creator workspace so real use improves the curriculum.

This workflow makes the app useful to you before it has customers and makes each study session capable of producing reusable material.

7. Starter curriculum and later ML learning

First release: five short modules, three challenges per module, and one capstone; target five to ten minutes per ordinary lesson. These are scope targets, to adjust after learner testing.

- Intent and instructions: define the task and assess whether the result meets it.
- Context: supply relevant information and understand what the model can access.
- Constraints and output shape: control required content and structure.
- Demonstrations and reusable templates: guide behavior and separate variables from instructions.
- Evaluation and revision: detect unsupported claims, compare attempts, and improve reliability.

Capstone: apply several concepts to unseen inputs and save a reusable prompt. Every module grants a related prompt reward; maintain roughly 10–15 reviewed prompts across the starter directory.

Introduce brief AI foundations alongside relevant lessons: tokens, context limits, output variability, and model limitations. Follow with a dedicated ML foundations path covering data and labels, training versus inference, train/test splits, overfitting, classification, embeddings, retrieval, and evaluation. Use visual experiments and prediction tasks before optional code or math.

Later vibe-coding path: requirements, context selection, task decomposition, reading changes, debugging, and verifying generated work. Keep ML education on the roadmap explicitly; prompt lessons alone do not cover it.

8. Challenge grading: critical build risk

Design grading before building a large course. Users need understandable evidence for pass or retry, and different successful prompt styles must be accepted.

- Start with bounded tasks that support objective checks. Check required fields, constraints, and correct use of supplied information in code where possible.
- Use a small held-out input set for completion checks. Keep evaluation inputs and expected answers separate from the learner-facing task.
- Pin the provider model version where available, generation settings, challenge version, and rubric version. Record them on every attempt; pinning reduces drift but does not eliminate output variation.
- Add rubric-based AI feedback only where needed. Calibrate it against human-reviewed passing and failing attempts before it controls rewards.
- Treat submitted prompts and generated text as untrusted input to the evaluator. Keep grading instructions separate and validate the grader's response format.
- Define a repeat-run rule for borderline results. Explain conflicting outcomes and offer rechecks; provider errors must not become learner failures or consume a retry allowance.
- Show which requirement passed or failed and a useful next revision. Avoid an unexplained universal prompt score.
- Fixed hints come first. Viewing a full solution marks that attempt assisted; offer a fresh variation for independent mastery credit.
- Award completion XP once per challenge version under an explicit migration rule; retries improve practice without farming rewards.

Run the first lesson against intentionally weak, borderline, and varied successful prompts before expanding content. Provide a report-feedback action for disputed results.

9. Required build components

Extend the existing Sites application. Keep its package manager, lockfile, build scripts, hosting project, D1/R2 bindings, and ChatGPT sign-in. Add hosted checkout and model-provider calls over HTTP from server routes; verify provider compatibility and hosted secrets before implementation. Confirm signed payment webhooks can reach the chosen public endpoint. Alternative public identity providers need a platform capability check before being added.

- Identity and permissions: visitor, member, and creator/admin access; private library ownership checks.
- Content system: editable modules, lessons, prompts, versions, products, and publication status.
- Learning engine: prerequisites, attempts, progress, hints, mastery checks, and reward grants.
- Evaluation service: model calls, deterministic checks, optional rubric scoring, timeouts, and result history.
- Library: collections, saved items, personal prompt versions, bookmarks, search, and exports.
- Commerce: checkout, verified payment events, orders, refunds, access grants, and protected downloads.
- Operations: error reporting, cost tracking, backups, feedback review, and product analytics.

Keep existing prompts, lessons, and prompt_saves. Add user preferences keyed by the existing stable user ID, concepts, modules, challenge versions, attempts, progress, prompt versions, collections, products, product-prompt links, orders, and access grants. Link concepts to prompts and lessons; link successful challenges and purchases to independent access grants. Add a unique user/prompt constraint to saves after checking and deduplicating existing records.

Repository implementation map:

- db/schema.ts and drizzle/: additive schema migrations and backfills. lib/data.ts currently duplicates table setup in runtime SQL; bring schema evolution under one explicit migration path so the two definitions cannot drift.
- lib/data.ts and lib/content.ts: separate public listing metadata from access-controlled prompt bodies, add versions and ownership, and keep fallback seed content explicitly free. Stored quality_score values are editorial metadata; do not reuse them as learner grades.
- components/prompt-explorer.tsx and app/prompts/[slug]/page.tsx: show saved/owned/earn/buy states, expose earning requirements, and serve full content only after server-side access checks.
- app/learn/page.tsx and app/learn/[slug]/page.tsx: retain slugs, attach module progress, and add the shared lesson/challenge workspace. Add /practice only once that workspace is functional.
- New /library and /studio routes: personal editing and collections, plus creator-only review/publishing. Reuse the current submission form where suitable, but saving privately must be distinct from submitting for review.
- New attempt, save, checkout, and webhook endpoints: persist server-confirmed outcomes; harden app/assets/[...key]/route.ts to resolve downloads through prompt ownership/access.
- components/site-header.tsx: expose Learn, Practice, Directory, and My Library; keep account and community submissions reachable.

AccessGrant must record why access exists: free, earned, or purchased. Enforce access on the server; protected text must not ship inside public listing responses. Verify payment events and process duplicate events safely. Grant earned access and progress together so retries cannot create inconsistent state.

Keep provider credentials server-side. Initial exercises use supplied text without external tools or arbitrary code execution. Set per-user request limits, input/output bounds, and a total spending ceiling. Retain only necessary attempt data and allow personal-library deletion/export.

Track cost per completed lesson, including failed runs, feedback, and rechecks. Use that evidence to set free daily live-run allowances; downloaded prompts and reading access should remain usable independently.

10. Build sequence and completion gates

Phase 0 — Production inventory and content definition.

Completed for accessible site data: inventoried all live user tables and columns, exported six prompts and three lessons with zero saves, checked owner-only access, selected five text prompts, adapted three lesson drafts, and passed local migration/restore rehearsal on the exported data. Existing published prompts remain free. The [Phase 0 report](phase-0/README.md) records backup limits, unverified production source parity, and external sales/content provenance still awaiting owner confirmation. Before production changes, refresh the snapshot and verify native schema/migration history and restore support.

Phase 1 — Private library and creator workspace.

Implemented locally: saves, private prompt editing, tags, collections, notes, version recovery, Markdown and JSON export, explicit creator authorization, draft/published controls, and lesson authoring. At the user's request, three short beginner lessons now collect complete project recipes, with basic progress and protected content access brought forward from Phase 2. The [Phase 1 report](phase-1.md) records verification and remaining production release steps. Gate: daily study and recovery/export work without developer help, and one user cannot read or edit another user's private prompts; local behavior and HTTP checks pass, with hosted acceptance pending publication.

Phase 2 — One complete learning loop.

Extend the playable beginner path with server-side prompt execution, meaningful output checks, hints, and attempt history. Basic progress, atomic recipe collection, metadata-only public listings, and protected downloads are implemented in Phase 1. Gate: a newcomer finishes a prompt-writing mission, understands feedback, and retrieves the reward after signing back in; varied successful prompts receive fair checks, repeated requests cannot duplicate rewards, and locked content stays unavailable before a valid grant.

Phase 3 — Paid directory.

Extend existing listings and search with products, checkout, verified fulfillment, library access, and downloads, reusing the access controls from Phase 2. Gate: test purchases, failed payments, duplicate payment events, refunds, and earned/purchased overlap all behave correctly; locked text remains inaccessible through API responses, page payloads, seed fallbacks, and attachment URLs.

Phase 4 — Starter learning experience.

Expand to five modules and capstone; add practice filters, reviewed solutions, clear levels, and progress overview. Gate: all exercises have reviewed content and calibrated acceptance checks; mobile and keyboard flows work.

Phase 5 — Small beta and refinement.

Recruit 5–10 target users when ready; observe first use, score disputes, repeat visits, and actual prompt reuse. Fix unclear lessons and unreliable grading before broad launch. Recruitment and public launch are future actions, outside this planning task.

Phase 6 — Expand from evidence.

Add ML foundations, vibe-coding specialization, spaced review, and richer rewards based on what users complete and return for. Consider subscriptions, community solutions, and additional sellers only after demand and operating costs are clear.

Scope excludes launch-time multiplayer, public leaderboards, creator payouts, generated infinite courses, and a general-purpose coding sandbox. Those add separate systems before the core loop is proven.

11. Validation and release decisions

Proposed beta targets are internal decision thresholds, not industry benchmarks:

- At least 4 of the first 5 observed newcomers finish the first lesson without live explanation from you.
- At least 4 of those 5 can explain the taught concept in their own words afterward.
- At least 3 return within seven days to practice or reuse a saved prompt.
- Reviewed passing and failing prompts behave consistently enough to resolve every observed unfair grade before public release.
- Purchase and unlock tests preserve correct access across sign-out, duplicate requests, and refunds.
- Measured cost per completed lesson supports the chosen usage allowance and product pricing.

Instrument lesson starts/completions, hints, retries, disputed results, reward saves, repeat copies/downloads, directory visits, checkout completion, and cost. Use delayed fresh-input challenges to assess learning retention. Track buyers, learners, and personal-library users separately, then measure movement between them.

Existing tests cover build packaging and selected UI contracts. Keep those checks, then add behavior tests for private-library access, access grants, payment fulfillment, grading, migrations, and the complete learn/save/buy flows. No build or application tests were run for this source-only planning review.

Before implementation, confirm production prompt inventory, initial content rights, the first published lesson set, model-run budget, payment-provider setup, and launch prices. The existing www-domain task remains separate launch housekeeping; no DNS or domain changes are required for this plan.
