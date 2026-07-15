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

- [ ] Phase 0 — Design decisions documented and approved
- [ ] Phase 1 — Schema + migration + backfill script
- [ ] Phase 2 — Auth/middleware carries and enforces companyId
- [ ] Phase 3 — Employees module scoped (proof of concept)
- [ ] Phase 4 — Remaining 10 modules scoped
- [ ] Phase 5 — Frontend company context
- [ ] Phase 6 — Hardening, full isolation test suite, docs updated, tagged release

Each unchecked box above is a valid unit of work for another agent or engineer to pick up independently, as long as prior phases are merged to `main` first.
