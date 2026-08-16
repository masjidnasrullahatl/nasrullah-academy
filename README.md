# Masjid Nasrullah School Portal

## Overview

Masjid Nasrullah School Portal is a Next.js admin dashboard for managing school operations. Sprint 0 scaffolds the app shell, shared infrastructure, auth/session wiring, and dashboard layout frame.

## Tech stack

- Next.js 15 + React 19 + TypeScript
- Mantine UI (`@mantine/core`, `@mantine/dates`, `@mantine/modals`, `@mantine/notifications`, `@mantine/charts`)
- React Query (`@tanstack/react-query`)
- Supabase (`@supabase/supabase-js`, `@supabase/ssr`)
- Prisma ORM (`prisma`, `@prisma/client`)
- Zustand state management
- Zod validation

## Prerequisites

- Node.js 20+
- Yarn 1.x (or Yarn classic compatible)
- Supabase project (for auth and database)

## Environment variables

Create `.env` from `.env.example` and fill in:

| Key | Description | Where to find in Supabase |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | App base URL | Local value (for development use `http://localhost:3000`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Project Settings → API → **Project URL** |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key | Supabase Dashboard → Project Settings → API → **Project API keys** |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Supabase Dashboard → Project Settings → API → **Project API keys** |
| `DATABASE_POOLED_URL` | Prisma pooled connection (port 6543) | Supabase Dashboard → Project Settings → Database → **Connection string** → Pooler |
| `DATABASE_URL` | Prisma direct connection (port 5432) | Supabase Dashboard → Project Settings → Database → **Connection string** → Direct connection |

## Install & run

```bash
yarn install
yarn dev
```

Open `http://localhost:3000`.

## Database

```bash
yarn db:migrate
yarn db:seed
yarn db:studio
```

## How to create a staff account

1. Open Supabase Dashboard.
2. Go to **Authentication** → **Users**.
3. Click **Add user**.
4. Enter email and password.
5. In user metadata, set `full_name` under `user_metadata`.

## Project structure

```text
src/
  app/                # App Router pages, layouts, middleware, API routes
  components/         # Shared UI and layout components
  configs/            # App constants, routes, query keys, sidebar links
  helpers/            # Prisma/Supabase helper clients
  hooks/              # Shared client hooks
  stores/             # Zustand stores
prisma/
  schema.prisma       # Prisma schema (generator + datasource in Sprint 0)
```

## Scripts

- `yarn dev` — Start development server with Turbopack.
- `yarn build` — Generate Prisma client and build production bundle.
- `yarn start` — Start production server.
- `yarn lint` — Run ESLint.
- `yarn stylelint` — Run Stylelint on SCSS files.
- `yarn db:migrate` — Run Prisma migrations in development.
- `yarn db:seed` — Run seed script.
- `yarn db:studio` — Open Prisma Studio.
