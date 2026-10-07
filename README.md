# Insurance Operating System

An insurance business workspace connecting customer records with sales, policies,
renewals, claims, follow-ups, documents, complaints, and service history.

This repository contains the Next.js frontend in [`shuffal/`](./shuffal/), the
NestJS REST API in [`conflict/`](./conflict/), and the full product brief in
[`project doc/readme.md`](./project%20doc/readme.md).

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
npm install
npm run prisma:generate
npm run start:dev
```

If your Supabase tables already exist, run `npm run prisma:pull` and review the
resulting Prisma schema before starting the API. Only run
`npm run prisma:migrate -- --name init` for a new, empty database. Use the
development seed only for local/test data, never real customer data.

The API listens at `http://localhost:4000/api`, its health check is
`http://localhost:4000/api/health`, and OpenAPI documentation is at
`http://localhost:4000/api/docs` outside production.

The development seed creates `admin@example.test`, `manager@example.test`, and
`agent@example.test`, all with the development-only password `ChangeMe123!`.
Never use the seed accounts or seed data in production.

### 2. Configure and run the frontend

Create `shuffal/.env.local` from [`shuffal/.env.example`](./shuffal/.env.example).
Set the API URL if it differs from the default:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

```powershell
cd shuffal
npm install
npm run dev
```

Open `http://localhost:3000`. Sign in with the seeded admin account above.

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
