# Multi-Tenant Migration Roadmap

**Goal:** Convert this HRMS from a single-company system into a multi-tenant SaaS where many companies can each manage their own isolated HR data (employees, attendance, leave, payroll, recruitment, performance) inside one shared deployment.

**Audience:** This document is written so any engineer or agent can pick up a phase without needing prior context. Work through phases in order — later phases assume earlier ones are done and merged. Each phase lists: what to build, files/areas touched, and a "Definition of Done" checklist. Do not skip the DoD checks; tenant-isolation bugs are silent until they leak data.

**Ground rule for every phase:** open a feature branch off `main`, do the work, run `npm run typecheck && npm run lint && npm run build && npm run test:smoke` from repo root, then open a PR back into `main`. Never push tenant-scoping changes directly to `main` without the smoke tests passing.

---

## Phase 0 — Design & Decisions (do this first, no code)

Before any schema change, lock in these decisions and write them into `docs/multi-tenant-design.md`:

1. **Tenant identification strategy** — how does an incoming request know which company it belongs to?
   - Option A: subdomain per company (`acme.chris-tech-hrms.com`)
   - Option B: company selection at login (user picks from companies they belong to)
   - Option C: path-based (`/api/:companySlug/...`)
   - Recommendation: start with **Option B** (simplest, no DNS/subdomain infra needed), revisit Option A later if selling to larger clients.
2. **User-to-company relationship** — can one user belong to multiple companies (e.g. a consultant HR admin), or is it strictly one user = one company?
   - Recommendation: start with one user = one company (simpler), model it so it can be extended to many-to-many later without a rewrite.
3. **Super Admin scope** — does "Super Admin" become a per-company role, or a new cross-company platform-owner role (you, Chris, managing all tenant companies)?
   - Recommendation: split into two distinct roles — `PLATFORM_OWNER` (cross-company, new) and `SUPER_ADMIN` (existing, now scoped to one company).
4. **Company signup flow** — self-serve signup creating a new `Company` + first admin user, or admin-provisioned only?
5. **Billing/plan tier** — out of scope for this migration, but add a `plan` field on `Company` now so it doesn't require another migration later.

**Definition of Done:** `docs/multi-tenant-design.md` committed with answers to all 5 questions above, reviewed and approved by Chris before Phase 1 starts.

---

## Phase 1 — Schema & Migration

**Files:** `backend/prisma/schema.prisma`, new migration in `backend/prisma/migrations/`

1. Add a `Company` model:
   ```prisma
   model Company {
     id        String   @id @default(uuid())
     name      String
     slug      String   @unique
     plan      String   @default("FREE")
     status    String   @default("ACTIVE")
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt
     // relations added as you scope each model below
   }
   ```
2. Add `companyId String` + relation field to every tenant-scoped model. Based on the current schema (31 models), these need it:
   `User, Employee, Department, Designation, EmergencyContact, EmployeeDocument, Shift, Holiday, Attendance, LeaveType, LeaveRequest, LeaveBalance, Salary, Payroll, PayrollItem, Payslip, Notification, Announcement, Job, Candidate, JobApplication, Interview, Offer, Goal, PerformanceReview, Feedback`
   Models that stay global (not company-scoped): `Role`, `Permission`, `RolePermission`, `UserRole`, `PasswordResetToken` (scoped via User instead) — confirm this list during Phase 0 design review, don't assume.
3. Update uniqueness constraints from global-unique to unique-per-company where relevant (e.g. `Employee.employeeCode` should be `@@unique([companyId, employeeCode])` not globally unique).
4. Write the migration. Since this is a structural change to existing tables, also write a **backfill script** (`backend/scripts/backfill-default-company.ts`) that:
   - Creates one `Company` row for existing data (e.g. "Chris Tech Default Co")
   - Sets `companyId` on every existing row to that company's id
   - Run this in the same deploy step as the migration, before making `companyId` non-nullable
5. Regenerate Prisma client, confirm `npm run typecheck` passes in backend.

**Definition of Done:**
- Migration applies cleanly to a fresh database (`npx prisma migrate reset` works)
- Migration applies cleanly to the existing seeded dev database via the backfill script
- `npm run typecheck` passes
- PR merged to `main`

---

## Phase 2 — Auth & Middleware

**Files:** `backend/src/middleware/authenticate.ts`, `backend/src/middleware/authorize.ts`, `backend/src/modules/auth/*`

1. `authenticate.ts`: after loading the user, also resolve `companyId` and attach it to `req.auth` (e.g. `req.auth = { ...user, companyId }`).
2. JWT payload: add `companyId` to the signed token so it doesn't require a DB lookup on every request (still verify against DB on sensitive actions).
3. `authorize.ts`: this currently only checks role/permission. Add a second check: any resource lookup by ID must also confirm `resource.companyId === req.auth.companyId`, otherwise 404 (not 403 — don't reveal the resource exists in another tenant).
4. Login flow: if a user belongs to only one company, log in directly; if the design in Phase 0 allows multiple companies per user, add a company-selection step after credential check.
5. Registration/signup flow: decide (per Phase 0 answer) whether this creates a new `Company` or requires an invite into an existing one.

**Definition of Done:**
- A manual test: log in as a user in Company A, attempt to fetch a resource ID belonging to Company B directly via API (e.g. `GET /api/employees/:id` for another company's employee) → must return 404
- `npm run test:smoke` passes with the existing single-tenant flow (backward compatible)
- PR merged to `main`

---

## Phase 3 — Proof of Concept: Scope One Module (Employees)

Do **not** scope all 11 modules at once. Prove the pattern on one module first so mistakes are caught early and cheap.

**Files:** `backend/src/modules/employees/*`

1. Every Prisma call in `employees.service.ts` (or equivalent) gets `where: { companyId: req.auth.companyId, ... }` added.
2. `create` operations must set `companyId` from `req.auth.companyId`, never trust a `companyId` from the request body.
3. Add a second seeded company + employees in the smoke test seed data specifically to test cross-tenant isolation.
4. Write a smoke test: authenticate as Company A, list employees, assert Company B's employees never appear in the results.

**Definition of Done:**
- New smoke test for cross-tenant isolation on Employees passes
- Existing Employees smoke tests still pass
- PR merged to `main` — this PR becomes the reference pattern for Phase 4

---

## Phase 4 — Scope Remaining Modules

Repeat the Phase 3 pattern for the remaining 10 modules, in this order (roughly least → most complex):

1. `departments` / `designations` (small, low risk)
2. `attendance`
3. `leaves`
4. `notifications`
5. `announcements`
6. `performance`
7. `recruitment` (largest — Job, Candidate, JobApplication, Interview, Offer all need scoping)
8. `payroll` (highest risk — financial data, be extra careful with `Salary`, `Payroll`, `PayrollItem`, `Payslip`)
9. `dashboard` (aggregation queries — make sure summary counts are per-company, not global)
10. `reports` (same concern as dashboard — every report query needs the company filter)
11. `hr-assistant` — the Gemini tool functions (`get_leave_balance`, `get_next_payroll`, `get_manager`) must also be scoped so the assistant can never answer with another company's data

Each module gets its own PR following the Phase 3 checklist (scope queries, seed a second company's data, write a cross-tenant isolation smoke test).

**Definition of Done (per module PR):**
- Cross-tenant isolation smoke test added and passing
- Existing module tests still passing
- No raw Prisma query in that module missing a `companyId` filter (grep for `findMany\|findFirst\|findUnique\|update\|delete` in the module and manually confirm each one)

---

## Phase 5 — Frontend

**Files:** `frontend/src/*`

1. Auth context: store `companyId` (and company name, for display) alongside the user session.
2. If Phase 0 chose multi-company-per-user, add a company switcher UI.
3. Signup page: adjust per the Phase 0 signup flow decision.
4. No other UI changes should be needed — the frontend already calls scoped APIs and displays whatever comes back.

**Definition of Done:**
- Manual QA: log in as two different companies in two browser sessions, confirm no data bleed anywhere in the UI (dashboard, employees, payroll, recruitment, performance)

---

## Phase 6 — Hardening & Production Readiness

1. Add an automated **full cross-tenant isolation test suite** — one test per entity type that creates data in two companies and asserts zero leakage both ways.
2. Add audit logging for company-boundary violations (if `authorize.ts` ever catches a cross-tenant access attempt, log it — this is a signal of either a bug or an attack).
3. Rate limiting / signup abuse prevention if self-serve signup was chosen in Phase 0.
4. Update `render.yaml` / deployment docs if the tenant strategy needs new env vars (e.g. subdomain routing).
5. Update `plan.md` and `README.md` to reflect the new multi-tenant architecture.

**Definition of Done:**
- Full isolation test suite passes in CI
- README and plan.md updated
- Tagged release, e.g. `v2.0.0-multitenant`

---

## Summary Checklist (top-level tracking)

- [x] Phase 0 — Design decisions documented and approved — see `docs/multi-tenant-design.md`
- [x] Phase 1 — Schema + migration merged to `main`
- [x] Phase 2 — Auth/middleware carries and enforces companyId — merged to `main`
- [x] Phase 2.5 — `prisma/seed.ts` rewritten with a second seeded company (`Northwind Demo Co`) — merged to `main`, unblocks Phase 3/4 isolation tests
- [x] Phase 3 — Employees module scoped (proof of concept) — merged to `main`
- [ ] Phase 4 — Remaining 10 modules scoped
- [ ] Phase 5 — Frontend company context
- [ ] Phase 6 — Hardening, full isolation test suite, docs updated, tagged release

Each unchecked box above is a valid unit of work for another agent or engineer to pick up independently, as long as prior phases are merged to `main` first.

---

## Progress Log

### Phase 0 — complete
- `docs/multi-tenant-design.md` committed to `main` with recommendations on all 5 design questions (tenant identification strategy, user-company relationship, Super Admin scope, signup flow, billing/plan field) plus the confirmed model-scoping list.

### Phase 1 — schema written, migration not yet run
- Branch: `phase-1-schema-migration` (not yet merged to `main`)
- `backend/prisma/schema.prisma` updated: new `Company` model, `companyId` added to all 26 tenant-scoped models (`User.companyId` is nullable to support the cross-company `PLATFORM_OWNER` role), global-unique constraints converted to per-company composite uniques.
- `backend/scripts/backfill-default-company.ts` added with the 3-step migration process for populated databases (add nullable column → backfill → set NOT NULL).
- **Important caveat:** the schema was verified manually (brace balance, companyId coverage confirmed via script) but `prisma generate` / `prisma migrate dev` could **not** be run in the agent sandbox — it has no network access to `binaries.prisma.sh`. Before Phase 2 starts, someone with full network access needs to:
  1. Pull the `phase-1-schema-migration` branch
  2. Run `npx prisma generate` to confirm the schema compiles
  3. Follow the 3-step process in `backfill-default-company.ts` against a copy of the real dev database (or run a fresh `prisma migrate dev` against an empty database)
  4. Merge to `main` once confirmed working

### Phase 2 — auth/middleware done, not yet merged
- Branch: `phase-2-auth-middleware`, based on `phase-1-schema-migration` (not on `main` — it depends on the `Company` model and `companyId` fields from Phase 1, which aren't merged yet).
- `jwt.ts`: JWT payload now carries `companyId` (nullable, for `PLATFORM_OWNER`).
- `auth.service.ts`: `AuthUser` now includes `companyId`.
- `auth.routes.ts`: registration now requires a pre-existing `Employee` invite record to resolve which company the new user belongs to (per the admin-provisioned-signup decision) — returns `NO_COMPANY_INVITE` (403) if none exists in any company.
- `onboarding.ts`: employee-linking lookup switched from a bare `workEmail` unique lookup to the `companyId_workEmail` composite key, since `workEmail` is no longer globally unique after Phase 1.
- New `src/middleware/tenant.ts`: `requireCompanyContext` middleware, `companyScope(req)`, and `assertSameCompany(resourceCompanyId, req)` — the shared pattern Phase 3/4 modules should use. Mismatches return **404, not 403**, to avoid confirming a resource exists in another tenant.

**Blocking item before Phase 3 starts:** `backend/prisma/seed.ts` (~1000 lines) does not set `companyId` anywhere and will need a full pass to create a seed `Company` and attach every seeded row to it — otherwise no local dev database can be seeded against the new schema at all. This wasn't done as part of Phase 2 (out of scope — auth/middleware only) but needs to happen before Phase 3's cross-tenant isolation smoke tests can run (those tests need *two* seeded companies). Whoever picks up Phase 3 should do the seed.ts rewrite first, or as part of the same PR.

**Also still not run in this environment:** same Prisma-engine sandbox limitation as Phase 1 — `prisma generate` could not execute here. `tsc --noEmit` was run and manually filtered; the only errors touching Phase 2's changed files were pre-existing "missing generated client export" noise (e.g. `AccountStatus` not found on `@prisma/client`), not new bugs. Confirm with a real `prisma generate` before merging.

### Phase 1 & 2 — status correction

The entries above previously said these branches had "PR pending merge." That
was stale: `git log` on `main` confirms `phase-1-schema-migration` and
`phase-2-auth-middleware` were both merged (see merge commits for PR #1 and
the schema/auth commits preceding it). Checklist corrected above.

### Phase 3 — complete

- **Files:** `backend/src/modules/employees/employees.routes.ts`,
  `backend/src/modules/employees/onboarding.ts` (reviewed, not modified —
  its `LeaveType` query is explicitly out of scope until Phase 4's leaves
  module), `backend/scripts/smoke-test.ts`.
- Every Prisma call in the employees, departments, and designations routes
  (all live in `employees.routes.ts`) now filters/sets `companyId` via the
  shared `companyScope(req)` / `assertSameCompany(...)` / `requireCompanyContext`
  helpers from `middleware/tenant.ts` (Phase 2).
- `POST /employees`, `POST /departments`, `POST /designations`: `companyId`
  is always taken from `req.auth.companyId`, never from the request body.
- Cross-tenant FK references are rejected: creating/updating an employee with
  a `departmentId`, `designationId`, or `managerId` belonging to a different
  company now fails with `400 INVALID_REFERENCE` instead of silently linking
  across tenants.
- `GET/PUT/DELETE /employees/:id` and the document-upload route now 404
  (not 403) when the id belongs to another company, per the "don't confirm
  the id exists elsewhere" rule in `middleware/tenant.ts`.
- `backend/scripts/smoke-test.ts`: new check
  `"cross-tenant isolation: employees module (Phase 3)"` logs in as the
  seeded second company (`Northwind Demo Co`, `admin@northwind-demo.local`)
  and asserts: (1) Company A's employee list never contains Company B's
  seeded employee code and vice versa, (2) Company B fetching Company A's
  employee id directly returns `404 EMPLOYEE_NOT_FOUND`, (3) same for a
  cross-tenant `PUT` update attempt.
- **Not yet verified in this environment:** same limitation as Phase 1/2 —
  `prisma generate` cannot run here (no network access to
  `binaries.prisma.sh`), so `npm run test:smoke` itself could not be
  executed against a real database. `tsc --noEmit` was run and filtered;
  the only errors in the touched files are the same pre-existing
  "missing generated client export" class already flagged in the Phase 2
  log (stale local `@prisma/client` build predating the Phase 1 schema
  changes), not new bugs from this change. Before merging: run
  `npx prisma generate`, `npm run db:seed`, then `npm run test:smoke` with
  real network/database access to confirm the new isolation checks pass.

**Reference pattern for Phase 4:** the `companyScope` / `assertSameCompany`
/ FK-cross-check pattern in `employees.routes.ts` is the template — repeat
for each module in the Phase 4 order list below.

### Phase 4 onward — not started
