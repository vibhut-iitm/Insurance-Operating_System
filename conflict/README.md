# Insurance OS backend

NestJS REST API for the Insurance OS frontend in `..\shuffal`.

## Local setup

Requirements: Node.js 20.11 or newer and PostgreSQL 14 or newer. Supabase
PostgreSQL can be used instead of a local PostgreSQL server.

1. In Supabase, open **Project Settings → Database → Connect** and copy both a
   pooled connection string for the application and a direct connection string
   for Prisma schema inspection/migrations. For the pooler, select transaction
   mode. Replace the placeholders in `DATABASE_URL` and `DIRECT_URL` in your
   local `.env`, copied from `.env.example`. The exact host/user/port depends on
   your Supabase project and region. Never commit `.env` or share its password.
2. Set a long, random `JWT_SECRET`.
3. Install dependencies and generate the Prisma client:

   ```powershell
   npm install
   npm run prisma:generate
   ```

4. The checked-in Prisma schema maps the existing Supabase `snake_case` tables
   and columns to the backend's TypeScript API. Generate the client with the
   mapped schema:

   ```powershell
   npm run prisma:generate
   ```

   To inspect the live database without overwriting the mapped schema, use
   `npm run prisma:pull`. It writes raw introspection to
   `prisma/introspected.prisma`; review and merge changes into `schema.prisma`
   deliberately. Do not run migrations against this existing database unless
   you have reviewed the SQL diff and backed up the data.

5. Start the API:

   ```powershell
   npm run start:dev
   ```

The API listens on `http://localhost:4000/api`. OpenAPI documentation is at
`http://localhost:4000/api/docs` outside production. The frontend should use
`NEXT_PUBLIC_API_URL=http://localhost:4000/api`.

For a compiled deployment, run `npm run build` and then `npm start`.

To create an initial administrator, set `BOOTSTRAP_ADMIN_EMAIL`,
`BOOTSTRAP_ADMIN_NAME`, and a unique `BOOTSTRAP_ADMIN_PASSWORD` of at least 12
characters in the current PowerShell session, then run `npm run prisma:seed`.
The seed only inserts the administrator if the email is not already present;
it does not insert demo customers or change an existing user's password.

## API areas

Authenticated routes use the HTTP-only `insurance_os_token` cookie set by
`POST /api/auth/login`. Integrations can alternatively send a bearer JWT.

| Route | Purpose |
| --- | --- |
| `GET /api/dashboard/summary` | Today-focused metrics, renewals, tasks, leads, claims, and activity |
| `/api/customers` | Paginated customer records and connected customer 360 detail |
| `/api/family-members`, `/api/policy-members` | Customer family and insured members |
| `/api/products` | Insurance product master (create/update requires ADMIN) |
| `/api/leads`, `/api/quotes` | Sales pipeline and quote acceptance |
| `/api/policies`, `/api/renewals` | Policy portfolio and linked renewal tracking |
| `/api/claims` | Claim lifecycle records |
| `/api/tasks` | Assigned follow-ups and due dates |
| `/api/grievances`, `/api/ombudsman-cases` | Complaint and escalation case tracking |
| `/api/communications` | Communication history (recording only; no provider sends messages) |
| `/api/documents` | Private document metadata, upload, and authorized download |
| `/api/search?q=...` | Search across customers and key business records |
| `/api/reports/summary` | Status-grouped portfolio and workflow counts |
| `POST /api/public/leads` | Rate-limited public website enquiry intake and follow-up task creation |

List routes accept `page`, `limit` (capped at 100), and `search`. Business write
routes validate request bodies; customer-linked writes add activity timeline
events and audit records. Policy creation creates a renewal record with a
30-day reminder date. Accepting a quote issues a policy, marks its lead won,
and creates the corresponding renewal in a database transaction.

Document upload accepts a raw request body, not multipart form data. Supported
types are PDF, JPEG, PNG, and WebP, with a 15 MB maximum. Pass the filename and
record associations as query parameters, for example:

```powershell
curl.exe -X POST "http://localhost:4000/api/documents/upload?fileName=policy.pdf&customerId=<customer-uuid>&category=POLICY" `
  -H "Authorization: Bearer <token>" -H "Content-Type: application/pdf" `
  --data-binary "@policy.pdf"
```

Files are stored outside the database in a private local directory by default.
Set `DOCUMENT_STORAGE_PATH` to an access-controlled persistent directory for
deployment. Back up this directory together with PostgreSQL. Do not expose it
as a public static folder.

## Current integration boundaries

The API provides the operational data model and endpoints. WhatsApp, email,
SMS, insurer, payment, and object-storage provider integrations are not
configured. Local documents use the private filesystem. Renewal reminders are
stored as dates; a Redis/BullMQ worker or another production scheduler still
needs to be deployed to send reminders automatically. Public/login rate limits
are process-local and should be supplemented by a trusted gateway or shared
rate-limit store when running multiple instances.
