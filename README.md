# Application Tracker

A starter built with Next.js 16.4.2, React 19.3.0, Tailwind CSS 4.3.3, Prisma 6.19.3, TypeScript, and Bun. It includes an `Application` database model and connection checks. CRUD screens and authentication are not implemented yet.

## Local setup

Use Bun 1.4.3 and a supported Node.js release. The existing local setup stores the MongoDB server credentials copied from `next-blog` privately in the ignored `.env` file and targets the separate `application_tracker` database.

For a new clone, create your own environment file:

```bash
cp .env.example .env
```

Set `DATABASE_URL` in `.env` to your MongoDB connection URL, including the database name. Keep credentials out of source control.

```bash
bun install
bun run dev
```

Open [localhost:3000](http://localhost:3000).

## Repository and deployment

The local repository is at `~/Documents/application-tracker`.
The public source repository is [arianizadi/application-tracker](https://github.com/arianizadi/application-tracker).

Vercel is connected to this GitHub repository. Pushes to `main` deploy to production;
other branches create preview deployments. Configure each environment's `DATABASE_URL`
in Vercel rather than committing credentials. The current MongoDB connection is
configured as a production Secret.

## Commands

| Command | Purpose |
| --- | --- |
| `bun run check` | Run ESLint, TypeScript checks, and Prisma schema validation. |
| `bun run build` | Create the production build. |
| `bun run db:check` | Run read-only ping, topology, and application-count checks; report replica-set status. |
| `bun run db:generate` | Generate Prisma Client from the schema. |
| `bun run db:push` | Apply schema collections and indexes to MongoDB. |
| `bun run db:studio` | Launch the local Prisma Studio command. |

Prisma and Prisma Client are pinned to 6.19.3 for MongoDB compatibility; Prisma 7 does not support MongoDB. This project uses `db push` instead of Prisma Migrate. Review schema changes before running `db:push`, since it changes the database. See the [Prisma MongoDB guide](https://www.prisma.io/docs/v7/prisma-orm/add-to-existing-project/mongodb).

MongoDB transactions, including the transactions Prisma uses for relevant nested writes, require a replica set. `db:check` reports topology without writing data; a successful connection check does not establish that transactional writes will work.

## Key files

| File | Purpose |
| --- | --- |
| `prisma/schema.prisma` | MongoDB datasource and `Application` model. |
| `src/lib/prisma.ts` | Shared server-side Prisma Client singleton. |
| `src/app/api/health/route.ts` | Database health endpoint returning generic status. |
| `scripts/check-db.ts` | Read-only database connection and topology checks. |
