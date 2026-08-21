# Masjid Nasrullah School Portal

Masjid Nasrullah School Portal is a staff dashboard that replaces manual school spreadsheets for classes, families, students, monthly tuition tracking, payroll, and summary analytics.

## Overview

- Authentication for staff users (Supabase-managed accounts)
- Dashboard with summary cards, charts, and monthly financial table
- School management: Classes, Families, Students, Teachers, Programs
- Finance management: Monthly Payments and Teacher Payroll
- Excel export for monthly payments (`.xlsx`)

## Screenshots

- Dashboard — _add screenshot_
- Classes — _add screenshot_
- Families — _add screenshot_
- Monthly Payments — _add screenshot_
- Payroll — _add screenshot_

## Prerequisites

- Node.js 20+
- Yarn 1.x
- Supabase project (Auth + PostgreSQL)

## Installation

```bash
yarn install
yarn dev
```

Open `http://localhost:3000`.

## Environment variables

Create `.env` from `.env.example`:

| Key | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Yes | App base URL (`http://localhost:3000` in local) |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase publishable/anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `DATABASE_POOLED_URL` | Yes | PostgreSQL pooler connection string (for runtime) |
| `DATABASE_URL` | Yes | Direct PostgreSQL connection string (for migrations) |

## Database

Run migrations and seed:

```bash
yarn db:migrate
yarn db:seed
```

Open Prisma Studio:

```bash
yarn db:studio
```

Reset from scratch (fresh local data):

```bash
npx prisma migrate reset --force
```

## Creating a staff account (Supabase Dashboard)

1. Open Supabase Dashboard.
2. Go to **Authentication** → **Users**.
3. Click **Add user**.
4. Enter staff email + password.
5. (Optional) add `full_name` in user metadata.
6. Sign in at `/auth/signin` with this account.

## Feature tour

- **Dashboard**
  - 5 summary stat cards
  - income/expense/profit trends
  - gender and payment-status distribution
  - monthly summary table + top unpaid families
- **Classes**
  - class cards with teacher and enrolled students
  - assign/remove students
  - change class teacher and metadata
- **Families**
  - family profile with students and invoice history
  - create/edit family with multiple students
- **Students**
  - searchable student directory with family/class/program links
- **Teachers**
  - teacher contacts, hourly rate, class assignments
- **Programs**
  - Hifz and Weekend program setup and status management
- **Monthly Payments**
  - generate month invoices
  - edit paid values, status, and method
  - export filtered data to Excel
- **Payroll**
  - payroll periods by month
  - per-teacher weekday/weekend hours and computed pay

## Deployment (Vercel)

1. Push repository to GitHub/GitLab/Bitbucket.
2. Create a Vercel project linked to this repository.
3. Add all six environment variables from this README.
4. Keep build command as:

```bash
yarn build
```

5. Deploy.
6. Run production migrations against Supabase:

```bash
npx prisma migrate deploy
```

### Supabase Authentication URL configuration

In Supabase Dashboard → **Authentication** → **URL Configuration**:

- **Site URL**: your production app URL (for example `https://your-app.vercel.app`)
- **Redirect URLs** must include:
  - `https://your-app.vercel.app/auth/password-reset/confirm`
  - and local/dev URL if needed (for example `http://localhost:3000/auth/password-reset/confirm`)

## QA / release checks

Before release, run:

```bash
yarn lint
npx tsc --noEmit
yarn build
```

## Scripts

- `yarn dev` — Start development server
- `yarn build` — Generate Prisma client + build production bundle
- `yarn start` — Start production server
- `yarn lint` — Run ESLint
- `yarn stylelint` — Run Stylelint
- `yarn db:migrate` — Prisma migrate dev
- `yarn db:seed` — Seed database
- `yarn db:studio` — Open Prisma Studio

## Known limitations (by design)

- No Excel import feature
- Single role model (all authenticated users are staff)
- Tuition amounts are entered manually by staff
