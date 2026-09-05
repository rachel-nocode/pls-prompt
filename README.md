# PLS PROMPT

PLS PROMPT is moving toward a curated gallery of working projects and premium build recipes: try the live demo, collect the prompt, prompt pack, or skill, then make it your own.

The [active pivot plan](docs/pivot-plan.md) replaces the earlier learning-platform roadmap. Recipe-only downloads and interactive proof define this direction; payment processing is outside the current scope. The selected **ASCII Atelier** direction is defined in the [design system](docs/design-system.md), including responsive layouts, reusable components, and preview motion. The four [image-generated explorations](docs/design-explorations/README.md) remain available as design history.

## Current foundation

The existing application includes a searchable prompt directory, prompt detail pages, private library with collections and version recovery, creator workspace, and interactive beginner lessons. Playable project demos and the new gallery layout are planned, not implemented yet.

The app uses React, Vinext/Vite, Tailwind, Sites authentication, D1/Drizzle, and R2. Keep the current hosting project and bindings.

## Project documents

- [Active recipe-gallery pivot plan](docs/pivot-plan.md)
- [ASCII Atelier design system](docs/design-system.md)
- [Historical foundation audit](docs/phase-0/README.md)
- [Historical private library and learning implementation](docs/phase-1.md)
- [Separate domain setup task](todo.md)

## Data

The schema lives in `db/schema.ts`; generated migrations live in `drizzle/`. Content setup uses guarded revisions in `lib/seed-database.ts`. Preserve applied migrations, existing public URLs, private library data, and access grants through the pivot.

## Local checks

- `npm run dev` — open the local development site.
- `npm run typecheck` — check application types.
- `npm run lint` — run source checks.
- `npm test` — build the application and run automated tests.
- `npm run db:generate` — generate an additive migration after a schema change.

Local practice and public browsing work without sign-in. The real ChatGPT sign-in flow requires the hosted Sites gateway.
