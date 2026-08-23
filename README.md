# The Mentorship Exchange

Mentorship exchange platform. This repository currently contains the M1 skeleton
established in **US-38**: a Next.js application, a Turso/libSQL data layer via
Drizzle, and a CI pipeline for subsequent feature work to build on.

## Stack

| Concern    | Choice                                          |
| ---------- | ----------------------------------------------- |
| Framework  | Next.js 16 (App Router, TypeScript, Turbopack)  |
| Styling    | Tailwind CSS 4                                  |
| Database   | Turso (libSQL) via Drizzle ORM                  |
| Migrations | drizzle-kit — SQL files committed to `drizzle/` |
| CI         | GitHub Actions                                  |
| Hosting    | Vercel                                          |

Requires Node.js 22+ and pnpm 10+.

## Getting started

```bash
pnpm install
cp .env.example .env      # defaults to a local SQLite file, no Turso account needed
pnpm db:migrate           # create the schema
pnpm dev                  # http://localhost:3000
```

## Database workflow

`src/db/schema.ts` is the single source of truth. Migrations are generated from
it and committed, so every environment applies the same reviewed SQL.

```bash
pnpm db:generate   # schema.ts changed -> write a new SQL file into drizzle/
pnpm db:migrate    # apply pending migrations to TURSO_DATABASE_URL
pnpm db:seed       # seed the local whitelist configured in .env.local
pnpm db:studio     # browse the database
```

`db:seed` is restricted to a local `file:` database. Set
`DEV_WHITELIST_SESSION` and the comma-separated `DEV_WHITELIST_EMAILS` in
`.env.local`; never commit real email addresses. Re-running the command restores
the configured local entries to an active development baseline.

Commit the generated file in the same PR as the schema change — CI fails
otherwise (see below).

Query the database from a request handler, not at module scope, so builds
without credentials keep working:

```ts
import { getDb, schema } from "@/db";

const db = getDb();
const users = await db.select().from(schema.users);
```

## CI

`.github/workflows/ci.yml` runs on every pull request and on pushes to `main`:

1. `pnpm lint`
2. `pnpm typecheck`
3. **Migration drift check** — regenerates migrations and fails if the result
   differs from what is committed, catching a schema edit with no migration
4. `pnpm build`

No database credentials are needed: the Drizzle client is constructed lazily, so
nothing connects during a build.

## Environments

| Environment | Trigger         | Database                  |
| ----------- | --------------- | ------------------------- |
| Local       | `pnpm dev`      | `file:local.db`           |
| Preview     | Pull request    | Turso staging database    |
| Production  | Merge to `main` | Turso production database |

Deploys are handled by Vercel's Git integration rather than by a workflow. Set
`TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` per environment in the Vercel
project settings, pointing Preview and Production at separate Turso databases.

Migrations are not applied automatically on deploy — run `pnpm db:migrate`
against the target environment deliberately. Automating this is a decision for a
later story, alongside the shared-domain evaluation in US-41.

## Layout

```
src/
  app/          # routes, layouts, pages
  db/
    index.ts    # lazily-constructed Drizzle client
    schema.ts   # table definitions — source of truth for migrations
  env.ts        # validated server-side environment variables
drizzle/        # generated SQL migrations (committed)
docs/           # design notes and runbooks
```
