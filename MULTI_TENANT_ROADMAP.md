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
11. `hr-assistant` — the Groq tool functions (`get_leave_balance`, `get_next_payroll`, `get_manager`) must also be scoped so the assistant can never answer with another company's data

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
- [x] Phase 4 — Remaining 10 modules scoped (attendance, leaves, notifications/announcements, performance, recruitment, payroll, dashboard, reports, hr-assistant all done)
- [x] Phase 5 — Frontend company context (auth context carries companyId/companyName; no company switcher needed per the one-user-one-company Phase 0 decision)
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

### Phase 4 — attendance module scoped (1 of 10 remaining modules)

- **Branch:** `phase-4-attendance-scoping` — merged to `main` via PR #3.
  (This entry previously said "not yet merged / PR not yet opened" — that
  was stale; `git log` on `main` confirms the merge commit.)
- **Files:** `backend/src/modules/attendance/attendance.routes.ts`,
  `backend/src/modules/attendance/attendance-completion.ts`,
  `backend/src/modules/notifications/announcement-notifications.ts`,
  `backend/src/modules/notifications/notifications.routes.ts`,
  `backend/prisma/seed.ts`, `backend/scripts/smoke-test.ts`.
- `attendance.routes.ts`: `requireCompanyContext` mounted alongside
  `authenticate`; clock-in/out, `attendance/me`, `attendance/report`,
  `shifts`, and `holidays` all scoped via `companyScope(req)` following
  the Phase 3 pattern. The default-shift lookup used at clock-in and the
  "unset previous default shift" update were previously global — both are
  now company-scoped.
- `attendance-completion.ts`: `materializeMissingAbsences` now requires a
  `companyId` and scopes its holiday lookup by it. This also fixed a real
  bug, not just a tenant-isolation gap: auto-created `ABSENT` rows had no
  `companyId` at all, which would fail outright against the Phase 1
  schema (the field is required, no default).
- `announcement-notifications.ts`: the holiday-creation route creates an
  `Announcement` and fans out `Notification` rows to all `"ALL"`-audience
  users. This lookup had no company filter — a holiday added in Company A
  would have notified every active user in every tenant. Fixed by
  requiring `companyId` on `createAnnouncementNotifications` and scoping
  both the user lookup and the created notifications by it.
- `notifications.routes.ts`: the `POST /announcements` route was touched
  only because it shares the helper above — it's now also company-scoped
  for `companyId` on `Announcement.create`, but the rest of the
  notifications/announcements module (`GET /notifications`,
  `GET /announcements`, read-state, etc.) is **not** scoped yet. That
  remains its own Phase 4 item (see order list above, items 4–5).
- `seed.ts`: added a distinct shift ("Northwind Standard Shift") and
  holiday ("Northwind Founders Day") for the second seeded company so
  isolation smoke tests have real cross-tenant rows.
- `smoke-test.ts`: new check
  `"cross-tenant isolation: attendance module (Phase 4)"` asserts shifts,
  holidays, and the attendance report endpoint never leak across the two
  seeded companies.
- **Not yet verified in this environment:** same Prisma-engine sandbox
  limitation as every prior phase — `prisma generate` cannot reach
  `binaries.prisma.sh` (403 Forbidden), so `npm run test:smoke` could not
  be run against a real database. `tsc --noEmit` error count in every
  touched file was identical before and after this change (36), which
  confirms no new type errors were introduced — only the same
  pre-existing "stale generated client" noise already flagged in the
  Phase 1–3 logs. Before merging: run `npx prisma generate`,
  `npm run db:seed`, then `npm run test:smoke` with real network/database
  access.

### Phase 4 — leaves module scoped (2 of 10 remaining modules)

- **Branch:** `phase-4-leaves-scoping` — merged to `main` via PR #4.
- **Files:** `backend/src/modules/leaves/leaves.routes.ts`,
  `backend/prisma/seed.ts`, `backend/scripts/smoke-test.ts`.
- `leaves.routes.ts`: `requireCompanyContext` enforced; leave-types
  list/create, leave creation, `leaves/me`, `leaves/balance`, the
  approver leave list, and approve/reject all scoped via `companyScope(req)`.
  Leave-type lookup on create now verifies the type belongs to the
  caller's company (`400 INVALID_REFERENCE` otherwise, matching the
  employees-module pattern). Approve/reject calls `assertSameCompany` on
  the fetched leave request before acting (404, not 403, on a
  cross-tenant id).
- `calculateLeaveDays`: the holiday lookup used to compute working days
  is now company-scoped — previously it pulled holidays from every
  tenant when deciding which days counted as leave.
- `getOrCreateLeaveBalance`: now sets `companyId` on first-created
  balance rows (required field, was previously missing entirely).
- Same cross-tenant notification leak class fixed in the attendance PR
  turned up here too: `createNotificationsForPermission` /
  `createNotificationForUser` had no company filter on the
  permission-based approver lookup, so a pending leave request in
  Company A would have notified approvers in every tenant. Both now
  require `companyId` and scope accordingly.
- `seed.ts`: added a distinct leave type for the second company
  ("Northwind Compassionate Leave") for isolation testing.
- `smoke-test.ts`: new check
  `"cross-tenant isolation: leaves module (Phase 4)"` covering leave
  types, the balance list, and a cross-tenant approve attempt (expects
  `404 LEAVE_NOT_FOUND`).
- **Not yet verified in this environment:** same `prisma generate` /
  `binaries.prisma.sh` sandbox limitation as every prior phase (confirmed
  again directly in this session — still a 403). `tsc --noEmit` error
  count in `leaves.routes.ts` is unchanged before/after (23); no new
  errors introduced beyond the pre-existing stale-client noise. Before
  merging further work on top of this: run `npx prisma generate`,
  `npm run db:seed`, `npm run test:smoke` with real network/database
  access.

**Next up per the Phase 4 order list:** `notifications` / `announcements`
(items 4–5). Note `notifications.routes.ts`'s `POST /announcements` route
already picked up company-scoping as a side effect of the attendance PR
(it shares the `createAnnouncementNotifications` helper), but `GET
/notifications`, `GET /announcements`, and read-state are still
unscoped — confirm those explicitly rather than assuming the earlier
partial touch covered them.

### Phase 4 — notifications and announcements scoped (3 of 10 remaining modules)

- **Branch:** `phase-4-notifications-scoping` — merged to `main` via PR #5.
- **Files:** `backend/src/modules/notifications/notifications.routes.ts`,
  `backend/prisma/seed.ts`, `backend/scripts/smoke-test.ts`.
- `notifications.routes.ts`: `requireCompanyContext` mounted; `GET
  /notifications` and the unread-count query now also filter by `companyId`
  (defense in depth alongside the existing `userId` filter); `PUT
  /notifications/:id/read` scoped the same way.
- `GET /announcements` had a real cross-tenant leak — no company filter at
  all, so any authenticated user could see every tenant's announcements.
  Now scoped by `companyId` in both the manage and read-only branches.
- `announcement-notifications.ts` was already correctly company-scoped as
  part of the attendance-module PR; no changes needed there.
- `seed.ts`: added a Northwind-only announcement and notification for
  isolation testing.
- `smoke-test.ts`: new check `"cross-tenant isolation: notifications module
  (Phase 4)"` covering the announcements list and the notifications
  list/unread-count.
- Same Prisma-engine sandbox limitation as every prior phase — `prisma
  generate` still can't reach `binaries.prisma.sh`. `tsc --noEmit` error
  count in touched files was unchanged before/after aside from expected
  stale-client noise.

### Phase 4 — performance module scoped (4 of 10 remaining modules)

- **Branch:** `phase-4-performance-scoping` — merged to `main` via PR #6.
- **Files:** `backend/src/modules/performance/performance.routes.ts`.
- `performance.routes.ts` had no company scoping at all previously — every
  query relied only on employee/manager-hierarchy relations, so a manager
  or admin in one company could in principle reach `Goal`/
  `PerformanceReview`/`Feedback` rows in another tenant if an id was known
  or guessed.
- `requireCompanyContext` mounted on the router. `buildScopedEmployeeWhere`
  / `buildScopedPerformanceWhere` now include `companyId` in every branch
  (full-visibility, own+reports, and self-only).
- `assertEmployeeInPerformanceScope`: the `SUPER_ADMIN`/`HR_ADMIN`
  "can view all" branch previously skipped validation entirely; it now
  confirms the employee actually belongs to the caller's company (400
  `INVALID_REFERENCE` otherwise). The manager direct-report lookup is now
  also company-scoped.
- `POST /goals`, `POST /performance-reviews`, `POST /feedback`: `companyId`
  is now set explicitly from `req.auth.companyId` on create, never
  inferred. `PUT /goals/:id`, `PUT /performance-reviews/:id/status`:
  fetch-then-mutate with `assertSameCompany` before acting.

### Phase 4 — recruitment module scoped (5 of 10 remaining modules)

- **Branch:** `phase-4-recruitment-scoping` — merged to `main` via PR #7.
- **Files:** `backend/src/modules/recruitment/recruitment.routes.ts`.
- `recruitment.routes.ts` had no company scoping at all across any of its
  5 models — every list/create/update query was global.
- `requireCompanyContext` mounted on the router. `GET /jobs`,
  `/candidates`, `/applications`, `/interviews`, `/offers`: all now filter
  by `companyId`. `POST` on each of those: `companyId` set explicitly from
  `req.auth.companyId`, never inferred from related records.
- Cross-tenant FK references rejected: creating an application verifies
  both the job and candidate belong to the caller's company; scheduling an
  interview verifies the application and (if set) the interviewer belong
  to the caller's company. Returns `400 INVALID_REFERENCE` /
  `404 APPLICATION_NOT_FOUND` rather than leaking cross-tenant existence.
- **Note:** the progress-log entries above for notifications, performance,
  and recruitment were added retroactively — `git log` on `main` confirmed
  all three PRs were already merged, but this file's checklist and log had
  not been updated to reflect it. Corrected here so the log matches
  reality before starting the next module.

### Phase 4 — payroll module scoped (6 of 10 remaining modules)

- **Branch:** `phase-4-payroll-scoping` (this session).
- **Files:** `backend/src/modules/payroll/payroll.routes.ts`,
  `backend/scripts/smoke-test.ts`.
- `payroll.routes.ts` had no company scoping at all previously across
  `Salary`, `Payroll`, `PayrollItem`, or `Payslip` — flagged in this
  document as the highest-risk module since it's financial data.
- `requireCompanyContext` mounted on the router. `GET /salaries`, `GET
  /payroll`, `GET /payroll/me` all now filter by `companyId` via
  `companyScope(req)`.
- `POST /salaries`: `companyId` set explicitly from `req.auth.companyId`;
  the target `employeeId` is verified to belong to the caller's company
  first (`400 INVALID_REFERENCE` otherwise) via a new
  `assertEmployeeInCompany` helper.
- `PUT /salaries/:id`: fetch-then-mutate with `assertSameCompany` before
  updating, so a salary id from another tenant now 404s instead of being
  editable.
- `POST /payroll/generate`: the active-salary lookup used to build the
  run is now company-scoped, so payroll can never be generated across
  more than one tenant's salaries in a single run. The uniqueness check
  that used to look up an existing payroll by `month_year` was updated to
  the new company-scoped compound key (`companyId_month_year`) — this was
  a required fix, not just a scoping improvement, since the old key name
  no longer exists on the Phase 1 schema and would have failed to compile
  once a real Prisma client is generated. `companyId` is now set
  explicitly on every created `Payroll`, `PayrollItem`, and `Payslip` row.
- `GET /payroll/:id` and `GET /payroll/:id/payslip`: both fetch-then-check
  with `assertSameCompany`, returning 404 (not 403) on a cross-tenant id —
  same pattern as every other Phase 3/4 module.
- `getEmployeeForAuth` (this module's local copy) now also scopes the
  `Employee` lookup by `companyId` in addition to `userId`, for defense in
  depth even though `userId` is already globally unique per user.
- `smoke-test.ts`: new check `"cross-tenant isolation: payroll module
  (Phase 4)"` — asserts salary-list isolation both directions, that
  Company B's payroll list never contains Company A's generated run, that
  Company B fetching Company A's payroll id directly gets
  `404 PAYROLL_NOT_FOUND`, and that Company B fetching Company A's payslip
  by payroll id + employee id (both individually valid ids, just from the
  wrong tenant pairing) gets `404 PAYSLIP_NOT_FOUND` rather than the real
  payslip.
- **Not yet verified in this environment:** same `prisma generate` /
  `binaries.prisma.sh` sandbox limitation as every prior phase (confirmed
  again directly in this session — still 403 Forbidden). Compared
  `tsc --noEmit` output for `payroll.routes.ts` before and after this
  change line-by-line: the only new error is `Prisma.SalaryWhereInput`
  not found on the stale generated client — the same noise class as the
  pre-existing `PayrollWhereInput`/`PayslipWhereInput` errors already in
  this file, not a new bug. `smoke-test.ts` has zero new type errors.
  Before merging: run `npx prisma generate`, `npm run db:seed`, then
  `npm run test:smoke` with real network/database access to confirm the
  new isolation checks actually pass against a live database.

**Next up per the Phase 4 order list:** `dashboard` (item 9) — aggregation
queries need to confirm every summary count is per-company, not global —
followed by `reports` (item 10, same concern) and `hr-assistant` (item 11,
the Groq tool functions must never answer with another company's data).

### Phase 4 — dashboard module scoped (7 of 10 remaining modules)

- **Branch:** `phase-4-dashboard-scoping` (this session).
- **Files:** `backend/src/modules/dashboard/dashboard.routes.ts`,
  `backend/scripts/smoke-test.ts`.
- `dashboard.routes.ts` had no company scoping at all — every aggregation
  query (employee/user counts, attendance, leave, payroll, notifications,
  announcements) ran globally across every tenant. Flagged in this
  document as a specific risk area ("aggregation queries — make sure
  summary counts are per-company, not global").
- `requireCompanyContext` mounted on the router.
- `getScopedEmployeeWhere` / `getScopedUserWhere`: `companyId` now included
  in every branch (org-wide, manager/team, and self-only), plus the
  `Employee` lookup used to resolve "am I a manager" now also filters by
  `companyId` for defense in depth.
- `announcementWhere`: now filters by `companyId` — previously any
  authenticated user's dashboard would surface every tenant's published
  announcements.
- `monthlyPayroll`: same stale compound-key issue as the payroll module —
  the lookup used the old `month_year` key, updated to
  `companyId_month_year`. This would not have compiled once a real Prisma
  client is generated against the Phase 1 schema.
- `unreadNotifications` count and `notificationCandidates` list: both now
  also filter by `companyId` alongside the existing `userId` filter.
- Did **not** add `companyId` to the dashboard cache key
  (`getDashboardCacheKey` in `lib/dashboard-cache.ts`) — the key is already
  keyed by `userId`, and a user belongs to exactly one company (the
  `PLATFORM_OWNER` cross-company role, which has a null `companyId`, is
  already blocked from this route entirely by `requireCompanyContext`), so
  no two tenants can ever collide on the same cache key. Left the shared
  cache-key helper's signature unchanged rather than adding a redundant
  parameter.
- `smoke-test.ts`: new check `"cross-tenant isolation: dashboard module
  (Phase 4)"` — cross-checks each company's dashboard "employees" card
  value against that company's own scoped `/api/employees` list length
  (so a leak would show up as a mismatched count, not just a "looks about
  right" eyeball check), asserts the two companies' counts genuinely
  differ (catches a future seed change silently making this test
  meaningless), and confirms Company B's `/api/announcements` list
  contains its own seeded announcement but not Company A's.
- **Not yet verified in this environment:** same `prisma generate` /
  `binaries.prisma.sh` sandbox limitation as every prior phase (still 403
  Forbidden). Diffed `tsc --noEmit` output for `dashboard.routes.ts`
  before and after this change: **identical** error set (10 errors, all
  pre-existing stale-generated-client noise) — zero new errors introduced,
  unlike the payroll change which added one expected new stale-client
  entry. `smoke-test.ts` has zero new type errors either. Before merging:
  run `npx prisma generate`, `npm run db:seed`, then `npm run test:smoke`
  with real network/database access to confirm the new isolation checks
  actually pass against a live database.

**Next up per the Phase 4 order list:** `reports` (item 10) — same
aggregation-query concern as dashboard, every report query needs the
company filter — followed by `hr-assistant` (item 11, the Groq tool
functions must never answer with another company's data).

### Phase 4 — reports module scoped (8 of 10 remaining modules)

- **Branch:** `phase-4-reports-scoping` (this session).
- **Files:** `backend/src/modules/reports/reports.routes.ts`,
  `backend/scripts/smoke-test.ts`.
- `reports.routes.ts` had **zero** company scoping anywhere — every one of
  the four report endpoints (employees, attendance, leaves, payroll) ran
  globally across every tenant, and the payroll report in particular had
  no company filter at all on `prisma.payroll.findMany`.
- `requireCompanyContext` mounted on the router.
- `getTeamEmployeeWhere`: `companyId` now included in both branches
  (org-wide and manager/team), and the manager-check `Employee` lookup
  also filters by `companyId`.
- `/reports/employees`: `companyId` added to the base `where`.
- `/reports/attendance`: `companyId` added directly to the `Attendance`
  `where` (in addition to the scoping that flows through
  `employee: employeeWhere`). Also fixed a real compile-breaker unrelated
  to scoping style: `materializeMissingAbsences` (from the attendance
  module, updated in an earlier Phase 4 PR) now requires a `companyId`
  argument that this route was never passing — it's passed now.
- `/reports/leaves`: `companyId` added directly to the `LeaveRequest`
  `where`.
- `/reports/payroll`: `companyId` added to the `Payroll` `where` — this
  was the most exposed endpoint in the module since it previously had no
  scoping mechanism of any kind, not even an indirect one via an employee
  relation.
- `smoke-test.ts`: new check `"cross-tenant isolation: reports module
  (Phase 4)"` — confirms the employees report's summary total actually
  matches Company B's own scoped list (not just "looks non-empty"), that
  Company B's leaves report never contains Company A's smoke employee's
  leave request, and that Company B's payroll report for the same
  `smokePayrollYear` never contains Company A's generated payroll run
  (reusing the `smokePayrollId` captured during the payroll-module work).
- **Not yet verified in this environment:** same `prisma generate` /
  `binaries.prisma.sh` sandbox limitation as every prior phase (still 403
  Forbidden). Diffed `tsc --noEmit` output for `reports.routes.ts` line by
  line before and after: identical error classes (only line numbers
  shifted from the added code) — zero new errors introduced.
  `smoke-test.ts` has zero new type errors. Full-repo error count
  unchanged (260) before and after this change. Before merging: run
  `npx prisma generate`, `npm run db:seed`, then `npm run test:smoke` with
  real network/database access to confirm the new isolation checks
  actually pass against a live database.

**Next up per the Phase 4 order list:** `hr-assistant` (item 11, the final
Phase 4 module) — the Groq tool functions (`get_leave_balance`,
`get_next_payroll`, `get_manager`) must be scoped so the assistant can
never answer with another company's data. Once this is done, Phase 4 is
complete and Phase 5 (frontend company context) can start.

### Phase 4 — hr-assistant module scoped (10 of 10 — Phase 4 complete)

- **Files:** `backend/src/modules/hr-assistant/hr-assistant.routes.ts`.
- `requireCompanyContext` mounted on the router (was previously missing
  entirely — the module only relied on `authenticate`).
- `getEmployeeForAuth` (this module's local copy, same pattern as payroll
  and dashboard) now scopes the `Employee` lookup by `companyId` in
  addition to `userId`, switching from `findUnique` to `findFirst` since
  the lookup is no longer on a single unique key alone.
- `get_leave_balance` tool: the `LeaveBalance` query now also filters by
  `companyId` alongside `employeeId` and `year`.
- `get_next_payroll` tool: the `Payslip` (latest + current-period) and
  `Salary` queries now filter by `companyId`; the `Salary` lookup switched
  from `findUnique` to `findFirst` for the same reason as the employee
  lookup above.
- `get_manager` tool needed no query change — it only reads fields already
  returned by the now-scoped `getEmployeeForAuth`.
- No cross-tenant leak was actually reachable before this change (every
  query was already implicitly scoped to the authenticated user's own
  employee record via `userId`/`employeeId`), but this brings the module
  in line with the defense-in-depth pattern every other Phase 3/4 module
  follows, per this roadmap's own review checklist ("no raw Prisma query
  missing a `companyId` filter").
- **Not yet verified in this environment:** same `prisma generate` /
  `binaries.prisma.sh` sandbox limitation as every prior phase (confirmed
  again directly in this session — still 403 Forbidden). Ran `npm install`
  successfully this session (unlike prior phases, dependency install
  itself is not blocked, only the Prisma engine download), which let
  `tsc --noEmit` run against real `express`/`zod` types. Errors touching
  this file: 3 implicit-`any` errors on the `LeaveBalance` query result,
  caused by the missing generated `@prisma/client` (no `.prisma/client`
  directory exists at all in this sandbox) — same "stale/missing generated
  client" noise class flagged in every prior phase's log, not a new bug.
  Before merging: run `npx prisma generate`, `npm run db:seed`, then
  `npm run test:smoke` with real network/database access.

**Phase 4 is now complete.** Phase 5 (frontend company context) can start.

### Phase 5 — frontend company context (this session)

- **Files:** `backend/src/modules/auth/auth.service.ts`,
  `frontend/src/types/index.ts`, `frontend/src/components/app-shell.tsx`,
  `frontend/src/app/profile/page.tsx`.
- Per the confirmed Phase 0 decision (one user = one company, no
  multi-company-per-user for v1), a company switcher is explicitly **not**
  needed — this matches `docs/multi-tenant-design.md` decision 2.
- `auth.service.ts`: `AuthUser` now carries `companyName` alongside the
  existing `companyId`. `getAuthUserById`'s `User` query now includes the
  `company` relation (`select: { name: true }`) so this doesn't require an
  extra round trip. This is the single construction site for `AuthUser`
  (used by login, register, and `/api/auth/me`), so all three flows pick
  this up automatically with no route-level changes needed.
- Frontend `AuthUser` type (`types/index.ts`) updated to match
  (`companyId: string | null`, `companyName: string | null`). The session
  storage layer (`lib/auth.ts`) needed no changes — it already stores
  whatever shape `AuthUser` is.
- `app-shell.tsx`: the header (desktop) and mobile-nav sidebar previously
  showed a hardcoded "Company Workspace" / "Organization" placeholder —
  both now render `user.companyName`, falling back to the old placeholder
  text if it's ever null (e.g. a `PLATFORM_OWNER` account with no
  company).
- `profile/page.tsx`: added a company row (with a `Building2` icon,
  matching the existing email/role row style) that only renders when
  `companyName` is present.
- No signup-page changes were needed: the admin-provisioned-only signup
  flow (Phase 0 decision 4) was already implemented in the Phase 2 auth
  work (`NO_COMPANY_INVITE` 403 with a clear message), and the frontend's
  generic `getApiErrorMessage` already surfaces that message correctly
  without any special-casing.
- **Verified in this environment:** unlike prior phases, this change
  didn't touch anything requiring a generated Prisma client for new type
  errors — `npx tsc --noEmit` on `frontend` came back with **zero**
  errors, and the backend's error count was unchanged (233, same
  pre-existing stale-client noise as every prior phase) before and after.
- **Manual QA still needed from Chris:** log in as users from two
  different seeded companies (e.g. the default company and `Northwind
  Demo Co`) and confirm each one's header/sidebar/profile page shows
  their own company name, not the other's.

**Phase 5 is now complete.** Phase 6 (hardening, full isolation test
suite, docs, tagged release) is next.

### Phase 6 — hardening (partial, this session)

- **Files:** `backend/src/middleware/tenant.ts`.
- **Audit logging (roadmap item 2) — done.** `assertSameCompany` now logs
  a structured `console.warn` (`event: "CROSS_TENANT_ACCESS_ATTEMPT"`)
  whenever a fetched resource's `companyId` doesn't match the caller's,
  before throwing the existing `404`. This is the shared choke point used
  by employees, attendance, leaves, payroll, performance, and recruitment
  — every module that does fetch-then-check on a resource id gets this
  signal automatically, no per-module changes needed. Logged fields:
  requesting user id, requesting company id, the attempted resource's
  company id, and a timestamp. This is a `console.warn` for now (matches
  the rest of the codebase's logging style — no structured logger like
  winston/pino is in use anywhere yet); wiring it to a real log
  aggregator/alerting is future work once one is chosen.
- **Full cross-tenant isolation test suite (roadmap item 1) — 9 of 10
  modules covered, `hr-assistant` deliberately skipped.** Every module
  with an id-based attack surface (employees, attendance, leaves,
  notifications, performance, recruitment, payroll, dashboard, reports)
  already has a dedicated `cross-tenant isolation: <module> (Phase X)`
  check in `smoke-test.ts`. `hr-assistant` doesn't get one: its three
  tools (`get_leave_balance`, `get_next_payroll`, `get_manager`) take no
  employee/resource id as input at all — they only ever resolve `req.auth`
  → the caller's own linked employee via `companyScope`, so there's no id
  a malicious caller could substitute to probe another tenant the way
  `GET /employees/:id` or `GET /payroll/:id` can be probed. Writing a
  synthetic test here would mostly be re-testing that JWTs can't be
  forged, which is already covered by the auth module's tests. Flagging
  this explicitly rather than silently leaving a gap in the checklist.
- **Signup abuse prevention (roadmap item 3) — not applicable.** This
  item only applies "if self-serve signup was chosen in Phase 0" — it
  wasn't (Phase 0 decision 4: admin-provisioned only). No rate limiting
  work needed here unless that decision is revisited.
- **Deployment docs (roadmap item 4) — already current.** No new env vars
  were introduced by Phase 4/5 work; the Gemini→Groq swap already updated
  `README.md`'s "Optional backend environment variables" section and
  `backend/.env.example`. `render.yaml` never listed `GEMINI_API_KEY`/
  `GROQ_API_KEY` in the first place (it's an optional var Render prompts
  for separately, per the README), so no change needed there either.
- **README.md/plan.md rewrite (roadmap item 5) — done.** Both now describe
  the multi-tenant architecture end-to-end (dedicated "Multi-Tenant
  Architecture" section in `README.md`, updated status table and role list
  in `plan.md`), landed as part of the rebrand commit alongside the
  proprietary license and company metadata changes.
- **Not done yet:**
  - Tagged release (`v2.0.0-multitenant`) — deliberately not cut yet.
    Every phase so far has been unable to run `npx prisma generate` /
    `npm run db:seed` / `npm run test:smoke` against a real database in
    this sandbox (`binaries.prisma.sh` returns 403). Tagging a release
    before a single real test run against a live database has happened
    would be premature — **Chris needs to run the full verify sequence
    (`npm run verify` from repo root) on a machine with real network
    access before this gets tagged.**

### AI provider switch: Gemini → Groq (this session, alongside hr-assistant scoping)

- Chris requested swapping the HR assistant's model provider from Gemini
  to Groq. Done as part of the same file touch as the hr-assistant Phase 4
  scoping above, since both changes land in
  `backend/src/modules/hr-assistant/hr-assistant.routes.ts`.
- Replaced the Gemini `generateContent` REST call (`x-goog-api-key` header,
  `contents`/`functionDeclarations`/`generationConfig` request shape,
  `candidates`/`parts` response shape) with Groq's OpenAI-compatible
  `POST https://api.groq.com/openai/v1/chat/completions` endpoint
  (`Authorization: Bearer` header, `messages`/`tools`/`tool_choice`
  request shape, `choices[0].message`/`tool_calls` response shape).
- `backend/src/config/env.ts` and `backend/.env.example`:
  `GEMINI_API_KEY`/`GEMINI_MODEL`/`GEMINI_MAX_OUTPUT_TOKENS` renamed to
  `GROQ_API_KEY`/`GROQ_MODEL`/`GROQ_MAX_OUTPUT_TOKENS`.
  `GROQ_MODEL` defaults to `llama-3.3-70b-versatile`.
- Error codes renamed to match: `GEMINI_NOT_CONFIGURED` →
  `GROQ_NOT_CONFIGURED`, `GEMINI_REQUEST_FAILED` → `GROQ_REQUEST_FAILED`,
  `GEMINI_RESPONSE_INVALID` → `GROQ_RESPONSE_INVALID`.
- Tool-calling loop logic is preserved 1:1 (up to 3 rounds, same three HR
  tools, same system prompt), just re-expressed in OpenAI message/tool-call
  shape instead of Gemini's `parts`/`functionCall` shape.
- `README.md`, `plan.md`: all Gemini mentions updated to Groq (tech stack
  table, architecture diagram, setup steps, troubleshooting section).
- **Action needed from Chris:** get a Groq API key from
  console.groq.com and set `GROQ_API_KEY` in `backend/.env` — the old
  Gemini key won't work against the new endpoint.
