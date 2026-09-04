# PlsPrompt

PlsPrompt is a human-verified directory of AI prompts and practical prompt-engineering lessons.

## V0.1

- Searchable, filterable prompt directory
- Prompt detail pages with copy actions and anatomy breakdowns
- GitHub-hosted prompt support
- Lesson library
- ChatGPT sign-in for submissions and personal activity
- D1 persistence for prompts and lessons
- R2 storage for optional prompt attachments
- Human-review submission queue

## Data

The D1 schema lives in `db/schema.ts`. Generated migrations live in `drizzle/`. Initial editorial content is inserted only when the new database is empty.

## Commands

- `npm run build` — create the deployable Worker
- `npm run db:generate` — generate a migration after a schema change
- `npm run lint` — run the source lint checks
