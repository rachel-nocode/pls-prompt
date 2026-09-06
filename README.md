# PLS PROMPT

PLS PROMPT is a curated gallery of working projects and premium build recipes: try the live demo, collect the prompt, prompt pack, or skill, then make it your own.

The [active pivot plan](docs/pivot-plan.md) replaces the earlier learning-platform roadmap. Recipe-only downloads and interactive proof define this direction; payment processing is outside the current scope. The selected **ASCII Atelier** direction is defined in the [design system](docs/design-system.md), including responsive layouts, reusable components, and preview motion. The four [image-generated explorations](docs/design-explorations/README.md) remain available as design history.

## Current foundation

The ASCII Atelier gallery showcases five real browser projects with copyable recipes, native downloads, and independently checked rebuilds. My Library preserves private edits, complete prompt packs or skill files, collections, and history. Studio publishes immutable recipe/demo versions while new drafts stay private. Original prompts and lessons remain available through the archive.

The app uses React, Vinext/Vite, Tailwind, Sites authentication, D1/Drizzle, and R2. Keep the current hosting project and bindings.

## Project documents

- [Active recipe-gallery pivot plan](docs/pivot-plan.md)
- [ASCII Atelier design system](docs/design-system.md)
- [Recipe gallery release and validation](docs/recipe-gallery-release.md)
- [Historical foundation audit](docs/phase-0/README.md)
- [Historical private library and learning implementation](docs/phase-1.md)
- [Separate domain setup task](todo.md)

## Data

The schema lives in `db/schema.ts`; generated migrations live in `drizzle/`. Content setup uses guarded revisions in `lib/seed-database.ts` and `lib/seed-gallery.ts`. Preserve applied migrations, existing public URLs, private library data, and access grants through the pivot.

## Local checks

- `npm run dev` — open the local development site.
- `npm run typecheck` — check application types.
- `npm run lint` — run source checks.
- `npm test` — build the application and run automated tests.
- `npm run db:generate` — generate an additive migration after a schema change.

Local practice and public browsing work without sign-in. The real ChatGPT sign-in flow requires the hosted Sites gateway.
