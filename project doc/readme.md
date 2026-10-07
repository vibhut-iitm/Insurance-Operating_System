INSURANCE BUSINESS OPERATING SYSTEM + PREMIUM CUSTOMER-FACING WEBSITE
COMPLETE PROJECT EXPLANATION, FIRST-PRINCIPLES ANALYSIS AND RECOMMENDED TECHNOLOGY STACK

============================================================
1. WHAT IS THIS PROJECT?
============================================================

This project is not simply a website and it is not simply a CRM.

The project is an Insurance Business Operating System combined with a premium customer-facing insurance website.

The central idea is:

ONE CUSTOMER → ONE DIGITAL FILE → COMPLETE INSURANCE LIFECYCLE

The system should allow an insurance business owner to manage the complete journey of a customer from the first enquiry until policy servicing, renewal, claim, grievance, Ombudsman case and final closure.

The system should connect every important piece of information related to a customer.

For example:

Customer
    ↓
Family Members
    ↓
Leads
    ↓
Quotes
    ↓
Policy
    ↓
Renewal
    ↓
Claims
    ↓
Documents
    ↓
Tasks
    ↓
Communications
    ↓
Grievances
    ↓
Ombudsman Cases
    ↓
Complete Customer Timeline

The main objective is to eliminate scattered information.

Today, an insurance business may keep customer information in Excel, policy documents in folders, conversations in WhatsApp, quotations in email, renewal dates in a calendar and follow-up information in notebooks.

This project combines all of these business activities into one connected system.

The owner should be able to open a customer and immediately understand:

- Who the customer is
- Who belongs to the customer's family
- Which policies the customer owns
- Which insurer issued each policy
- Which products are being used
- When each policy expires
- Which policies need renewal
- Which claims are open
- Which documents have been uploaded
- Which documents are missing
- Which follow-ups are pending
- Which communications have happened
- Which grievances are open
- Which Ombudsman cases exist
- What action needs to be taken next

Therefore, the actual product is a centralized insurance business control center.

============================================================
2. THE FIRST-PRINCIPLES PROBLEM
============================================================

Before selecting technology, we should understand the problem from first principles.

The basic problem is not:

"How do we build a dashboard?"

The real problem is:

"How can one insurance business owner manage a large number of customers and all their insurance-related activities without losing information or missing important actions?"

Suppose an insurance owner has 500 customers.

One customer may have:

- Health insurance
- Life insurance
- Car insurance
- Travel insurance
- Personal accident insurance
- Home insurance

That customer may also have:

- Spouse
- Children
- Parents
- Multiple insured members
- Multiple policy documents
- Multiple renewal dates
- Claims
- Payments
- Quotations
- Follow-ups
- Complaints

If all of this information is stored separately, the owner has to search multiple systems.

That creates several problems:

1. Information gets lost.
2. Renewal dates can be missed.
3. Customer documents become difficult to find.
4. Claims become difficult to track.
5. Follow-ups are forgotten.
6. Website enquiries require manual data entry.
7. Customer history is fragmented.
8. Business reporting becomes difficult.
9. Duplicate customer records can be created.
10. The owner wastes time on administrative work.

The solution is therefore not just "more software".

The solution is:

CREATE ONE CONNECTED SOURCE OF TRUTH.

============================================================
3. WHAT DOES "ONE CONNECTED SYSTEM" MEAN?
============================================================

The most important architectural principle is that the application should not be a collection of unrelated pages.

For example, we should NOT build:

Dashboard
Customers
Policies
Claims
Documents
Reports

as completely independent modules.

Instead, every module should be connected through relationships.

Example:

CUSTOMER
    |
    +---- Family Members
    |
    +---- Leads
    |       |
    |       +---- Quotes
    |
    +---- Policies
    |       |
    |       +---- Renewals
    |
    +---- Claims
    |
    +---- Grievances
    |
    +---- Ombudsman Cases
    |
    +---- Documents
    |
    +---- Tasks
    |
    +---- Communications
    |
    +---- Activity Timeline

This means the Customer becomes one of the most important entities in the system.

When the owner opens a customer, the application should retrieve all relevant connected information.

============================================================
4. WHO IS THE PRIMARY USER?
============================================================

The initial product is designed primarily for one Owner/Admin.

The system should therefore be extremely simple for a single person to operate every day.

The first version should not be overloaded with complicated employee management.

However, the architecture should be future-ready.

Later, the system can support:

- Owner
- Admin
- Sales
- Service
- Claims
- Accounts
- Custom roles
- Teams
- Branches

Therefore, the system should be designed with role-based permissions from the beginning, even if only Owner/Admin is used in the MVP.

============================================================
5. WHAT SHOULD THE OWNER SEE EVERY MORNING?
============================================================

The most important question for the dashboard is:

"WHAT DO I NEED TO DO TODAY?"

The dashboard should answer this immediately.

Example:

TODAY'S ACTIONS

Overdue Follow-ups:
4

Renewals Due Today:
3

Pending Claim Documents:
2

Upcoming Renewals:
12

New Website Leads:
5

Open Grievances:
2

Upcoming Ombudsman Deadlines:
1

The owner should not have to open five different modules to understand today's work.

The dashboard should bring important actions together.

The system should emphasize ACTION rather than just DATA.

A dashboard showing:

"500 customers"

is less useful than:

"3 renewals require action today."

Therefore, the dashboard should prioritize:

- Overdue
- Due Today
- Upcoming
- Pending
- Urgent
- Recently Added
- Recently Updated

============================================================
6. RECOMMENDED HIGH-LEVEL ARCHITECTURE
============================================================

The recommended architecture is:

FRONTEND
Next.js
+
TypeScript
+
Tailwind CSS
+
shadcn/ui

        ↓

BACKEND API
NestJS
+
TypeScript
+
REST API
+
OpenAPI

        ↓

DATABASE
PostgreSQL
+
Prisma ORM

        ↓

BACKGROUND PROCESSING
Redis
+
BullMQ

        ↓

FILE STORAGE
S3-compatible object storage
or Cloudflare R2

        ↓

EXTERNAL SERVICES
WhatsApp Business API
Email
SMS
Payment Gateway
Insurer APIs
Future AI Services

This architecture gives the project:

- Speed
- Maintainability
- Security
- Scalability
- Clear separation of responsibilities
- Easy mobile-app integration later

============================================================
7. FRONTEND: NEXT.JS
============================================================

Recommended frontend technology:

NEXT.JS + TYPESCRIPT

Next.js is a React-based framework.

It is suitable for this project because the project contains two major frontend areas:

1. Public customer-facing website
2. Private owner/admin dashboard

The public website needs:

- Fast loading
- SEO
- Responsive design
- Marketing pages
- Insurance product pages
- Contact forms
- Lead generation
- Blog/knowledge pages

The admin application needs:

- Dashboard
- Tables
- Forms
- Filters
- Search
- Customer detail screens
- Policy management
- Claims
- Documents
- Reports

Next.js can support both areas.

Possible structure:

/
/insurance
/health
/life
/motor
/travel
/property
/claims
/renewal
/compare
/about
/contact
/blog

Private application:

/app
/app/dashboard
/app/customers
/app/leads
/app/quotes
/app/policies
/app/renewals
/app/claims
/app/cases
/app/documents
/app/tasks
/app/communications
/app/reports
/app/settings

Next.js also allows public website pages to be optimized for search engines while keeping the internal business application protected.

============================================================
8. WHY TYPESCRIPT?
============================================================

Use TypeScript instead of plain JavaScript.

This project contains many connected entities.

For example:

Customer
Policy
Renewal
Claim
Document
Task
Lead
Quote
Case

These entities have relationships.

TypeScript helps developers catch incorrect data structures during development.

Example concept:

Customer ID should be treated as a specific identifier.

Policy should belong to a customer.

Renewal should belong to a policy.

Claim should be linked to a policy and customer.

TypeScript provides better development safety and makes large projects easier to maintain.

The frontend and backend can both use TypeScript.

Therefore:

Frontend:
TypeScript

Backend:
TypeScript

This creates a consistent development environment.

============================================================
9. UI: TAILWIND CSS
============================================================

Use Tailwind CSS for styling.

The application needs a modern professional insurance-advisory appearance.

The design should be:

- Premium
- Trustworthy
- Clean
- Professional
- Minimal
- Mobile-friendly
- Readable
- Fast

Tailwind makes it easier to build consistent layouts.

It can be used for:

- Cards
- Tables
- Buttons
- Forms
- Sidebars
- Modals
- Badges
- Responsive layouts
- Dashboard grids

The UI should not look like a generic corporate ERP.

It should feel like a premium insurance advisory platform.

============================================================
10. UI COMPONENTS: SHADCN/UI
============================================================

Use shadcn/ui for reusable UI components.

This is useful because the project needs many standard components:

- Buttons
- Dialogs
- Dropdowns
- Tabs
- Tables
- Inputs
- Selects
- Date pickers
- Cards
- Alerts
- Badges
- Tooltips
- Navigation
- Command/search interface

Instead of designing every component from zero, use a reliable component system and customize it to match the brand.

This improves development speed.

============================================================
11. DATA FETCHING: TANSTACK QUERY
============================================================

For the admin dashboard, use TanStack Query for server-state management.

The application will constantly retrieve:

- Customers
- Policies
- Claims
- Renewals
- Tasks
- Leads
- Reports

TanStack Query can manage:

- API requests
- Caching
- Refetching
- Loading states
- Error states
- Mutations

This makes the dashboard more responsive and easier to develop.

============================================================
12. FORMS: REACT HOOK FORM + ZOD
============================================================

Insurance software contains many forms.

Examples:

Customer creation
Lead creation
Policy creation
Claim creation
Document upload
Renewal
Grievance
Task
Communication

Use:

React Hook Form

for form management.

Use:

Zod

for validation.

For example:

A policy form can require:

Policy Number
Customer
Insurer
Product
Premium
Sum Insured
Start Date
Expiry Date

The system should reject invalid data before saving it.

Validation should exist both on the frontend and backend.

Never trust frontend validation alone.

============================================================
13. BACKEND: NESTJS
============================================================

Recommended backend:

NESTJS + TYPESCRIPT

NestJS is especially suitable because this application is not a small CRUD application.

It contains many business modules.

Possible backend structure:

src/

auth/
customers/
family/
products/
leads/
quotes/
policies/
renewals/
claims/
cases/
documents/
tasks/
communications/
notifications/
reports/
audit/
settings/

Each module should have its own:

- Controller
- Service
- Database access
- Validation
- Business rules

For example:

RenewalModule

can contain:

RenewalController
RenewalService
RenewalRepository
RenewalValidation

This makes the application easier to maintain.

============================================================
14. WHY NOT PUT EVERYTHING IN THE FRONTEND?
============================================================

Never put important business logic only in the frontend.

For example, suppose the system has:

"Create renewal task automatically when policy is 30 days from expiry."

This should be controlled by backend business logic.

The frontend should display the result.

The backend should be responsible for:

- Authentication
- Authorization
- Validation
- Business rules
- Database operations
- Background jobs
- Audit logs
- Sensitive operations

The frontend is the interface.

The backend is the business engine.

============================================================
15. API-FIRST ARCHITECTURE
============================================================

The backend should expose APIs.

For example:

GET /customers
POST /customers
GET /customers/:id

GET /policies
POST /policies
GET /policies/:id

GET /renewals
POST /renewals

GET /claims
POST /claims

GET /documents

GET /tasks

The API should be documented using OpenAPI.

Why?

Because later the same backend can serve:

- Web application
- Mobile application
- Customer portal
- WhatsApp integrations
- External integrations
- Internal tools

The business logic should therefore not be tightly coupled to the web interface.

============================================================
16. DATABASE: POSTGRESQL
============================================================

For this particular project, PostgreSQL is recommended over MongoDB.

The reason is the number of relationships.

The application has relationships such as:

Customer
    ↓
Family Members

Customer
    ↓
Policies
    ↓
Renewals

Customer
    ↓
Claims

Customer
    ↓
Documents

Customer
    ↓
Tasks

Customer
    ↓
Communications

Lead
    ↓
Quotes

Policy
    ↓
Claims

Policy
    ↓
Renewals

These relationships are naturally represented in a relational database.

PostgreSQL is therefore an excellent fit.

============================================================
17. IMPORTANT DATABASE ENTITIES
============================================================

The initial database can contain tables such as:

users

customers

family_members

customer_tags

insurers

insurance_categories

insurance_products

product_variants

leads

lead_requirements

quotes

quote_versions

quote_comparisons

policies

policy_members

policy_renewals

claims

claim_documents

claim_queries

grievances

ombudsman_cases

documents

document_versions

tasks

communications

activities

notifications

audit_logs

settings

This is only a conceptual starting point.

The final database schema should be created after detailed business-rule analysis.

============================================================
18. WHY PRISMA?
============================================================

Use Prisma as the ORM.

Prisma sits between the backend and PostgreSQL.

Architecture:

NestJS
   ↓
Prisma
   ↓
PostgreSQL

Prisma provides:

- Type-safe database queries
- Schema management
- Migrations
- Developer-friendly database access
- Easier development with TypeScript

This reduces the amount of repetitive database code.

============================================================
19. CUSTOMER 360
============================================================

Customer 360 is one of the most important parts of the product.

Suppose the customer is:

Rahul Sharma

The customer detail page should show:

CUSTOMER INFORMATION

Name
Mobile
Email
DOB
Address
KYC information
Tags
Priority
Status

FAMILY

Wife
Son
Mother

POLICIES

Health Insurance
Life Insurance
Car Insurance

RENEWALS

Health Policy
Renewal in 30 days

CLAIMS

One open claim

DOCUMENTS

Policy documents
KYC documents
Claim documents

TASKS

2 pending follow-ups

COMMUNICATION

Previous messages and calls

TIMELINE

Every important event chronologically.

The customer detail page becomes the central business record.

============================================================
20. INSURANCE PRODUCT MASTER
============================================================

The system should have an Admin-configurable insurance product master.

Categories may include:

Health Insurance
Life Insurance
Motor Insurance
Travel Insurance
Home / Property
Personal Accident
Commercial / Business
Fire / Property
Marine
Engineering
Liability
Employee / Statutory
Agriculture
Specialty / Miscellaneous
Other / Custom

The important requirement is configurability.

The administrator should be able to create:

Category
Product
Variant
Custom fields

without requiring a developer to change the code for every new product.

Example:

Health Insurance

    Individual
    Family Floater
    Senior Citizen
    Critical Illness
    Personal Accident

Motor Insurance

    Private Car
    Two Wheeler
    Commercial Vehicle
    Fleet

This makes the system future-ready.

============================================================
21. LEAD AND SALES PIPELINE
============================================================

The lead workflow should be:

Enquiry
    ↓
Requirement Analysis
    ↓
Lead Qualification
    ↓
Quote
    ↓
Comparison
    ↓
Proposal
    ↓
Medical / Underwriting
    ↓
Payment
    ↓
Policy Issued
    ↓
Servicing

A lead should contain:

Customer
Source
Insurance Category
Requirement
Priority
Expected Premium
Expected Business Value
Status
Next Action
Follow-up History

One lead can have multiple quotes.

The owner should not need to create the customer again when converting a lead.

============================================================
22. WEBSITE LEADS
============================================================

The public website should be connected to the backend.

Example:

Customer visits website.

Customer fills:

Name
Mobile
Email
Insurance requirement

Then:

Website
    ↓
API
    ↓
Lead
    ↓
Owner Dashboard
    ↓
Follow-up Task

The owner should immediately see:

"New website enquiry."

This eliminates duplicate manual data entry.

============================================================
23. QUOTATION AND COMPARISON
============================================================

The system should allow multiple quotes for a lead.

Example:

Company A
Premium: ₹18,000

Company B
Premium: ₹21,000

Company C
Premium: ₹19,500

The system should allow comparison of:

- Premium
- Sum insured
- Benefits
- Waiting periods
- Exclusions
- Deductibles
- Riders
- Add-ons
- Key conditions

Multiple versions should be stored.

A professional PDF comparison can later be generated.

The system should clearly distinguish advisory comparisons from insurer-issued policy wording.

============================================================
24. POLICY MANAGEMENT
============================================================

Every policy should contain information such as:

Policy Number
Customer
Insurer
Category
Product
Insured Members
Premium
Sum Insured
Start Date
End Date
Payment Mode
Status
Nominee
Riders
Add-ons
Waiting Periods
Important Exclusions
Notes

Possible status:

Active
Renewal Due
Expired
Cancelled
Lapsed
Other

Multiple policies can belong to one customer.

Multiple insured members can belong to one policy.

============================================================
25. SMART RENEWAL ENGINE
============================================================

Renewal automation is one of the most important features.

Suppose:

Policy expiry date = 15 October

The system can create configurable buckets:

120 days
90 days
60 days
30 days
15 days
7 days
Due
Expired

Example:

120 days:
Upcoming

30 days:
Renewal action required

7 days:
Urgent

Expiry:
Due / Expired

The system should create tasks automatically.

Example:

Policy expires in 30 days.

Backend job:

Check policies
    ↓
Find policy expiring in 30 days
    ↓
Create renewal task
    ↓
Show dashboard alert
    ↓
Optionally create communication reminder

============================================================
26. WHY REDIS + BULLMQ?
============================================================

Use Redis with BullMQ for background jobs.

The application will have jobs such as:

- Renewal reminders
- Follow-up reminders
- Claim alerts
- Grievance deadline reminders
- Ombudsman deadline reminders
- Website lead notifications
- Email sending
- Document processing
- AI processing in the future

These should not block the main application.

Architecture:

NestJS
    ↓
BullMQ
    ↓
Redis
    ↓
Worker
    ↓
Execute task

This is better than making the browser responsible for scheduled tasks.

============================================================
27. CLAIM COMMAND CENTER
============================================================

Claims should have their own workflow.

Claim lifecycle:

Claim Intimation
    ↓
Document Collection
    ↓
Submission
    ↓
Insurer Query
    ↓
Customer / Advisor Reply
    ↓
Decision
    ↓
Payment / Rejection / Partial Settlement
    ↓
Closure

Claim record should include:

Claim Number
Policy
Customer
Insured Person
Hospital / Provider
Admission Date
Discharge Date
Claim Type
Claim Amount
Documents
Queries
Replies
Status
Settlement Amount
Decision
Closure Reason

Every important event should appear in the timeline.

============================================================
28. GRIEVANCE AND OMBUDSMAN MANAGEMENT
============================================================

The system should also track customer grievances.

Information can include:

Grievance Number
Complaint Date
Issue Category
Description
Documents
Company Response
Escalation Date
Follow-up Deadline

For Ombudsman cases:

Case Number
Submission Date
Documents
Communications
Hearing Date
Award / Order
Status

Possible statuses:

Draft
Submitted
Pending
Hearing
Award
Closed

The system should show deadlines clearly.

============================================================
29. DIGITAL DOCUMENT VAULT
============================================================

Documents are extremely important in insurance.

The application should provide a secure document vault.

Document categories may include:

KYC
Policy
Proposal
Medical
Claim
Bills
Discharge Summary
Renewal
Grievance
Ombudsman
Payment
Other

The system should support:

Upload
Preview
Download
Rename
Tag
Version
Metadata
Expiry Date
Reminder Date

Documents should be linked to the appropriate entity.

Example:

Customer
    ↓
Policy
    ↓
Policy Document

Customer
    ↓
Claim
    ↓
Claim Document

Customer
    ↓
Grievance
    ↓
Grievance Document

============================================================
30. WHERE SHOULD FILES BE STORED?
============================================================

Do not store large PDF/image files directly inside PostgreSQL.

Instead:

PostgreSQL stores metadata.

Object storage stores actual files.

Example:

PostgreSQL:

document_id
customer_id
policy_id
filename
file_type
storage_key
uploaded_at

Object Storage:

actual PDF/image file

Recommended storage:

S3-compatible storage

or

Cloudflare R2

The actual document should remain private.

The backend should generate authorized access when necessary.

Never expose sensitive customer documents through unrestricted public URLs.

============================================================
31. FOLLOW-UP / TASK CENTER
============================================================

The application should have a central task system.

The main page:

TODAY

Overdue
Due Today
Upcoming
Completed

Every task should be connected to:

Customer
Lead
Policy
Claim
Case

Task fields:

Title
Priority
Due Date
Notes
Related Entity
Status
Outcome
Next Follow-up

Actions:

Complete
Reschedule
Cancel

Optional recurring tasks can be added later.

============================================================
32. COMMUNICATION CENTER
============================================================

The application should have a communication center.

Templates can include:

Renewal Reminder
Documents Required
Claim Update
Policy Issued
Payment Reminder
Birthday Message
Anniversary Message
Grievance Update
Custom Message

Templates should support variables.

Example:

Hello {{customer_name}},

Your policy {{policy_number}} is due for renewal on {{renewal_date}}.

Please contact us for renewal options.

Communication should be linked to the customer and relevant business record.

============================================================
33. WHATSAPP INTEGRATION
============================================================

Use official WhatsApp Business/API integrations where required.

Do not depend on unsafe unofficial WhatsApp automation.

Possible architecture:

Application
    ↓
Communication Service
    ↓
WhatsApp Business API
    ↓
Customer

Email and SMS can also be configured.

============================================================
34. OWNER DASHBOARD
============================================================

The dashboard should contain useful widgets.

Today's Actions
Renewals
Business
Claims
Cases
Customers
Quick Add

Example:

TODAY'S ACTIONS

4 Overdue Tasks
3 Renewals Due
2 Claim Queries

RENEWALS

12 Upcoming
4 Due
3 Expired

BUSINESS

10 New Leads
5 Quotes
3 Policies Issued

CLAIMS

8 Open
2 Pending Documents

CASES

3 Grievances
1 Ombudsman Case

CUSTOMERS

527 Total
480 Active

The dashboard should not become overloaded.

The most important actions should be visible first.

============================================================
35. SEARCH
============================================================

Global search is extremely important.

The owner should be able to search by:

Customer Name
Mobile
Policy Number
Claim Number
Proposal Number
Case Number
Reference Number

Example:

Search:

"9876543210"

The system should find the relevant customer.

Search:

"POL12345"

The system should open the policy and associated customer.

Search should remain fast even when data grows.

============================================================
36. REPORTS AND ANALYTICS
============================================================

Reports should include:

Customer Report
Policy Portfolio
Renewal Report
Lead/Sales Funnel
Quote Comparison
Issued Business
Premium / Business Value
Claims
Grievances
Ombudsman Cases
Follow-ups

Filters:

Date
Category
Insurer
Status

Export options:

CSV
Excel
PDF

Reports should be based on a consistent source of truth.

============================================================
37. SECURITY
============================================================

Security is non-negotiable.

The application should use:

HTTPS
Secure authentication
Secure sessions
Strong passwords
Optional 2FA
Role-based access control
Authorization checks
Audit logs
Input validation
Rate limiting
CSRF protection where applicable
XSS protection
SQL injection protection
Secure headers

Sensitive data should not be unnecessarily logged.

Secrets and API keys should never be hard-coded.

Use environment variables and a secure secret-management approach.

============================================================
38. AUDIT LOGGING
============================================================

Important actions should be recorded.

Example:

User:
Admin

Action:
Updated policy

Policy:
POL12345

Time:
10 September 2026, 10:45 AM

Changes:

Premium:
₹18,000 → ₹19,000

Audit logs should cover important:

Create
Edit
Delete
Export
Login
Permission
Document
Policy
Claim

operations.

For critical records, prefer soft delete/archive instead of destructive deletion.

============================================================
39. AUTHENTICATION AND AUTHORIZATION
============================================================

Authentication answers:

"Who are you?"

Authorization answers:

"What are you allowed to do?"

The system should eventually support:

Owner
Admin
Sales
Service
Claims
Accounts

Permissions can be:

View
Create
Edit
Delete
Export
Approve

Even if the MVP has only Owner/Admin, the architecture should be prepared for roles.

============================================================
40. FUTURE CUSTOMER PORTAL
============================================================

A future customer portal can use the same backend API.

Customer logs in using:

OTP or secure authentication.

Customer can see:

Policies
Renewal Dates
Documents
Claim Status
Case Status
Service Requests

Customer can:

Upload documents
Raise service requests
Download approved documents

The backend must ensure that a customer can access only authorized information.

============================================================
41. AI FEATURES
============================================================

AI should be treated as a future enhancement, not the foundation of the system.

Possible AI features:

Policy document summarization
Document classification
Suggested folder/category
Claim document checklist suggestions
Customer communication drafts
Business-data search assistant
Lead/opportunity suggestions

However, AI must not silently make:

Coverage decisions
Legal decisions
Claim decisions

Human approval should remain required for consequential outputs.

The correct philosophy is:

AI = ASSISTANT

NOT:

AI = FINAL DECISION MAKER

============================================================
42. TECHNICAL ARCHITECTURE
============================================================

Recommended architecture:

                    INTERNET
                       |
                       ↓
                 NEXT.JS WEBSITE
                       |
                       ↓
                  API REQUEST
                       |
                       ↓
                 NESTJS BACKEND
                       |
        +--------------+--------------+
        |              |              |
        ↓              ↓              ↓
   PostgreSQL       Redis          Object Storage
    + Prisma        BullMQ          S3 / R2
        |              |              |
        ↓              ↓              ↓
 Business Data    Background       Documents
                  Jobs
                       |
                       ↓
              External Integrations
                       |
       +---------------+---------------+
       |               |               |
    WhatsApp         Email          Future APIs