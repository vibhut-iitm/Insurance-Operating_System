# Insurance Operating System

An insurance business workspace connecting customer records with sales, policies,
renewals, claims, follow-ups, documents, complaints, and service history.

This repository contains the Next.js frontend in [`shuffal/`](./shuffal/), the
NestJS REST API in [`conflict/`](./conflict/), and the full product brief in
[`project doc/readme.md`](./project%20doc/readme.md).

The public website is a sample/demo experience. It is not an insurance provider
and does not offer real coverage. Use test details only in its enquiry form.

## Requirements

- Node.js 20.11 or newer
- PostgreSQL 14 or newer, either local or hosted by Supabase

## Run locally

### 1. Configure PostgreSQL and the API

Create `conflict/.env` from
[`conflict/.env.example`](./conflict/.env.example). For Supabase, copy the
transaction-pooler URL into `DATABASE_URL` and the direct database URL into
`DIRECT_URL` from **Project Settings → Database → Connect**. Replace
`JWT_SECRET` with a long random secret. Keep all credentials private in `.env`;
never commit or share that file.

```powershell
cd conflict
npm ci
npm run prisma:generate
npm run start:dev
```

The checked-in Prisma schema maps the existing Supabase tables. Generate the
client with `npm run prisma:generate`. If you need to inspect the live schema,
`npm run prisma:pull` writes a separate `conflict/prisma/introspected.prisma`
file and does not replace the mapped schema. Do not run migrations against the
existing database without reviewing the SQL and backing up its data.

The API listens at `http://localhost:4000/api`, its health check is
`http://localhost:4000/api/health`, and OpenAPI documentation is at
`http://localhost:4000/api/docs` outside production.

To create the first administrator, set `BOOTSTRAP_ADMIN_EMAIL`,
`BOOTSTRAP_ADMIN_NAME`, and a unique `BOOTSTRAP_ADMIN_PASSWORD` of at least 12
characters in the PowerShell session, then run `npm run prisma:seed`. The seed
does not create demo customers or change an existing user's password.

### 2. Configure and run the frontend

Create `shuffal/.env.local` from [`shuffal/.env.example`](./shuffal/.env.example).
Set the API URL if it differs from the default:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

```powershell
cd shuffal
npm ci
npm run dev
```

Open `http://localhost:3000` and sign in with the administrator you bootstrapped.

## Deploy the sample website to Vercel

Import this GitHub repository into Vercel and set the project **Root
Directory** to `shuffal`. Vercel will detect Next.js; use `npm run build` as
the build command and leave the output directory at its default. No environment
variables are needed for a frontend-only sample deployment.

Without a deployed API, the public site is viewable but enquiry submissions and
workspace sign-in are unavailable. They will display a backend-not-connected
message instead of trying to contact localhost. To enable these features,
deploy the API separately, configure its `FRONTEND_URL` to the Vercel site URL,
and set `NEXT_PUBLIC_API_URL` in Vercel to the API's public URL ending in
`/api`. Redeploy the frontend after setting that build-time variable. Do not
put database credentials or `JWT_SECRET` in `NEXT_PUBLIC_*` variables.

## API capabilities

The API provides authenticated customer 360 records and endpoints for family
members, products, leads, quotes, policies, renewals, claims, tasks, grievances,
Ombudsman cases, communications, documents, search, reports, and a daily-action
dashboard. Public website enquiries can be submitted to `POST /api/public/leads`;
the API links the enquiry to a customer and creates a follow-up task. Accepting a
quote issues a policy and creates its renewal record transactionally.

Documents are stored privately on the local filesystem by default (maximum
15 MB; PDF, JPEG, PNG, and WebP). Set `DOCUMENT_STORAGE_PATH` to a private,
persistent directory for deployments and back it up with the database.

## Integration and deployment notes

The project brief describes additional integrations and production features.
WhatsApp, email, SMS, insurer/payment APIs, S3-compatible storage, Redis/BullMQ
workers, automated reminder delivery, and report exports require separate
provider configuration and are not connected by the local setup. In-memory
request rate limits are per API process; deploy a shared gateway/store for
multi-instance production. Use HTTPS and secure production secrets.

See [`conflict/README.md`](./conflict/README.md) for API routes, document upload,
and detailed backend configuration. The original product brief is in
[`project doc/readme.md`](./project%20doc/readme.md).
