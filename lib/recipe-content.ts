import type { QuickCheck } from "./library-types";

export const projectRecipes = [
  {
    id: "recipe-studiodesk", slug: "build-a-client-portal", title: "StudioDesk — a client portal",
    promise: "Build a polished workspace for clients, projects, deliverables, and approvals.",
    lessonId: "lesson-outcomes",
    text: `Build StudioDesk, a complete client portal for an independent creative studio. Make the app, not a landing page describing it. Make sensible decisions and keep building until the core flows work. Use the existing project's framework and conventions; in a new project, choose a small maintainable web stack with a server and SQLite or the platform's managed database.

OUTCOME
A studio can manage clients and projects, share deliverables, collect feedback, and see what needs attention. Use StudioDesk as the name and a fictional design studio as the starting context. No placeholders need filling before you begin.

SCREENS
1. Dashboard: active projects, overdue tasks, approvals waiting, and recent activity. Each number opens its relevant filtered list.
2. Clients: searchable list, contact details, project history, create/edit forms, and an archive action with undo.
3. Project workspace: overview, milestones, task board, deliverables, and activity. Support creating tasks, changing status, due dates, and assignees.
4. Review page: a deliverable with version history, a comment thread, and request-changes/approve actions. A new version must not erase prior comments or approvals.
5. Client view: show only that client's projects and review actions.

DATA AND ACCESS
Store clients, projects, tasks, deliverables, versions, comments, memberships, and activity in the database. Use platform identity if available. Enforce studio/client membership on the server for every read and write, including files. Never rely on a role switcher for security. If production identity is unavailable, build a clearly marked local demo with fictional clients and a setup guide; do not expose private data through a pretend login. Keep uploaded files in private object storage when available. Without storage credentials, support deliverable URLs and explain the missing upload setup.

DESIGN
Give it a calm charcoal and warm-white palette, a bright blue accent, generous spacing, readable typography, and compact status chips. Prioritize today's work in the first viewport. Use real controls, clear empty states, saved/loading/error feedback, keyboard navigation, visible focus, and layouts usable on phones. Seed three fictional clients and projects with enough realistic tasks to exercise every state; keep demo seeding separate from real data.

IMPLEMENTATION
Inspect the project first. List the smallest build sequence, then implement it. Validate all input at the server boundary. Store dates consistently and display the viewer's timezone. Use optimistic concurrency or version checks so edits do not silently overwrite another user. Never put secrets in browser code. Do not send emails, enable billing, or publish publicly without my instruction.

VERIFY BEFORE FINISHING
Create a client and project, add a task and deliverable, request changes, upload/link a second version, approve it, and confirm the state survives reload. Prove one client's account cannot access another client's records or file links. Check duplicate clicks, missing required fields, empty projects, and mobile layout. Run the project's meaningful checks and fix failures. Finish with the running app, concise setup steps, and an honest list of any integration that still needs credentials. Do not claim a feature works unless it was verified.`
  },
  {
    id: "recipe-content-studio", slug: "build-a-content-production-studio", title: "Publish Lab — a content studio",
    promise: "Build an idea library, production board, publishing calendar, and reusable content templates.",
    lessonId: "lesson-constraints",
    text: `Build Publish Lab, a working content production app for a solo creator who plans videos, newsletters, and social posts. Build the product itself. Choose sensible defaults and complete the core flow without asking me to fill in a long brief. Preserve the existing stack; otherwise use a maintainable web stack with server-backed persistent storage.

FINISHED PRODUCT
One workspace turns an idea into a finished content package with an outline, checklist, assets, and a scheduled date. Default channels are Video, Newsletter, and Social. This app plans work; it must never imply it has posted to an external service.

CORE FLOWS
Capture an idea with a title, notes, topic, channel, references, and priority. Search and filter the library. Convert an idea to a production item while retaining a link to the source. Move it through Idea, Outline, Draft, Review, Ready, and Published. Edit the outline and checklist in a focused detail view. Save reusable templates for each channel and apply a copy to new items; changing a template must not change existing work. Show a calendar with month/list views and rescheduling. Add a production dashboard for upcoming deadlines, unscheduled ready items, and stalled drafts. Allow Markdown export of one content package and JSON export/import of the workspace with a preview of import changes.

BOUNDARIES
Persist content, revisions, templates, tags, dates, and status on the server. Keep original notes and references unchanged unless explicitly edited. Archive instead of permanently deleting, and provide restore. Prevent duplicate imports using stable IDs. Validate imported data and never execute HTML or scripts inside notes. Handle daylight-saving changes and show which timezone a schedule uses. Use platform sign-in and per-user ownership checks; if auth cannot run yet, provide an explicitly local demo and a production setup path. Do not implement fake social OAuth, fake publishing, invented engagement metrics, or automatic public sharing. An optional AI drafting control may be enabled only after a real provider is configured; the full manual workflow must work without AI credentials.

EXPERIENCE
Use an editorial look with charcoal text, clean white panels, a coral accent, and strong type hierarchy. Make the board, list, and calendar different views of the same records. On mobile, use a readable list with quick status changes rather than forcing a wide board. Include clear save state, validation messages next to fields, useful empty states, keyboard operation, and an unsaved-changes warning. Seed a separate fictional demo workspace with a small set of ideas at different production stages.

BUILD AND CHECK
Inspect the codebase, write a compact implementation sequence, then execute it. Test creating an idea, converting it, applying a template, revising it, scheduling it, archiving/restoring it, and exporting/importing without duplicates. Confirm reload persistence and isolation between two accounts. Handle invalid import files, an empty calendar, and simultaneous edits without silent data loss. Run meaningful project checks and fix failures. Deliver the usable app and setup notes; clearly identify any unavailable integration. Do not deploy publicly or send messages without my instruction.`
  },
  {
    id: "recipe-evidence-desk", slug: "build-an-evidence-research-workbench", title: "Evidence Desk — a research workbench",
    promise: "Build a source library that connects claims, evidence, uncertainty, and exportable briefs.",
    lessonId: "lesson-proof",
    text: `Build Evidence Desk, a complete research workbench for a creator who wants to turn collected sources into a traceable research brief. Build a usable app rather than a marketing page. Use the current framework and database when present; otherwise pick a compact server-backed stack with persistent storage and clear setup steps.

OUTCOME
I can open a research project, add sources, record claims, connect evidence, mark uncertainty, and export a brief whose citations lead back to the exact source records. Use Evidence Desk as the product name. Start with a separate fictional demonstration project so every interaction can be tried immediately.

WORKSPACE
1. Projects: title, research question, notes, status, and last activity.
2. Sources: URL or pasted text, title, author if known, publication date if known, date added, personal notes, and tags. Search and filter by project, tag, and review status.
3. Claims: claim text, supported/contradicted/unresolved status, related evidence excerpts, source links, and a short explanation. Keep multiple disagreeing sources visible.
4. Brief builder: reorder sections, insert claims with citations, add a conclusion, and export Markdown plus a JSON project archive. Include unresolved claims in a separate visible section.
5. Review queue: claims without sources, broken source references, and records with unknown dates. Treat these as review tasks, not proof that the claims are false.

TRUST RULES
Never invent citations, authors, dates, quotes, or source text. Pasting a URL does not mean the app has read it. If a real server-side fetch/import is implemented, display retrieval status and the source text obtained; handle denied or unavailable pages explicitly. Validate fetch destinations and redirects to prevent access to private networks and metadata services. Keep manual text entry fully usable if fetching is unavailable. Render source text as inert content. AI assistance is optional, requires configured credentials, and may suggest draft claims only; it must not mark claims verified by itself. Store edits and evidence-link history so a changed source does not silently make an old citation appear valid.

DATA AND UI
Persist projects, sources, claims, excerpts, links, brief sections, and revisions. Enforce per-user ownership at every server endpoint. Use platform authentication when available; otherwise keep the demo local and provide setup instructions before sharing. Design a focused three-column desktop workspace with project navigation, the main list/editor, and source evidence; stack these panels clearly on mobile. Use a deep navy, white, and amber palette, readable body text, semantic status labels, and keyboard-friendly controls. Add autosave or explicit save status, input validation, useful empty states, and archive/restore.

ACCEPTANCE CHECKS
Create a project, add two disagreeing sources, attach them to one claim, keep the claim unresolved, revise it, and export a brief with working source references. Verify that an unknown author/date stays unknown, deleting or archiving a source cannot silently leave a verified citation behind, data survives reload, and a second account cannot read the first account's work. Check hostile pasted markup, invalid URLs, empty search, and mobile layout. Run meaningful tests and fix failures. Deliver the running app, setup notes, and a precise list of integrations still needing credentials. Do not post, email, or deploy publicly without my instruction.`
  }
];

export const beginnerLessons: { id: string; title: string; summary: string; body: string; minutes: number; prerequisite: string | null; reward: string; check: QuickCheck }[] = [
  { id: "lesson-outcomes", title: "Say what you want to build", summary: "Give your AI a clear finish line.", minutes: 3, prerequisite: null, reward: "recipe-studiodesk",
    body: "Start with the result. Tell your AI what you want to exist when it finishes.\n\nAdd two or three things the result must do. A clear finish line makes the answer easier to check.\n\nTry this thought: could someone read my request and tell when the work is done? If yes, you have a useful goal.",
    check: { question: "Which request gives the AI a clearer finish line?", options: [{ id: "a", text: "Be an amazing developer and help with my business." }, { id: "b", text: "Build a client portal where clients can see projects, leave feedback, and approve work." }, { id: "c", text: "Make something impressive. You decide everything." }], correct: "b", explanation: "The portal request names a result and three things it must do. You can check whether each one works." } },
  { id: "lesson-constraints", title: "Set a few useful rules", summary: "Tell your AI what must stay true.", minutes: 3, prerequisite: "lesson-outcomes", reward: "recipe-content-studio",
    body: "A rule helps the AI choose between many possible answers. Keep the rules connected to your goal.\n\nSay what must stay the same, what can change, and what the result must include. Short, clear rules are easier to follow.\n\nFor a project, useful rules might protect existing data, keep the app usable on a phone, or stop it from publishing before you are ready.",
    check: { question: "Your AI is building a content planner. Which rule is easiest to check?", options: [{ id: "a", text: "Make it professional and perfect." }, { id: "b", text: "Do not make mistakes." }, { id: "c", text: "Save my drafts after reload and never publish a post without my approval." }], correct: "c", explanation: "You can reload to check saved drafts and verify that publishing needs approval. Specific rules give you clear tests." } },
  { id: "lesson-proof", title: "Check before you trust", summary: "Ask for evidence that the result works.", minutes: 3, prerequisite: "lesson-constraints", reward: "recipe-evidence-desk",
    body: "An answer can sound confident and still be wrong. Look for evidence you can inspect.\n\nFor research, check the source. For an app, try the main flow and ask which tests ran. A promise that it works is not a test result.\n\nIf something could not be checked, keep that gap visible. You can decide what to verify next.",
    check: { question: "The AI says your app is finished. What should you ask next?", options: [{ id: "a", text: "Show which user flows you tested, what passed, and what you could not verify." }, { id: "b", text: "Tell me again how confident you are." }, { id: "c", text: "Give the app a score out of 100." }], correct: "a", explanation: "Tested flows and remaining gaps give you evidence to inspect. Confidence and scores alone do not show that the app works." } }
];
