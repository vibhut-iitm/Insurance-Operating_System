# Insurance OS backend

NestJS REST API for the Insurance OS frontend in `..\shuffal`.

## Local setup

Requirements: Node.js 20.11 or newer and PostgreSQL 14 or newer.

1. Start PostgreSQL and create a database named `insurance_os`.
2. Copy `.env.example` to `.env`; set `DATABASE_URL` to the local database URL and set a long, random `JWT_SECRET`.
3. Install dependencies and prepare the database:

   ```powershell
   npm install
   npm run prisma:generate
   npm run prisma:migrate -- --name init
   npm run prisma:seed
   ```

4. Start the API:

   ```powershell
   npm run start:dev
   ```

The API listens on `http://localhost:4000/api`. OpenAPI documentation is at
`http://localhost:4000/api/docs` outside production. The frontend should use
`NEXT_PUBLIC_API_URL=http://localhost:4000/api`.

The development seed creates `admin@example.test`, `manager@example.test`,
and `agent@example.test`; each uses the development-only password
`ChangeMe123!`. Do not use the seed credentials or seed data in production.

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
