# Multi-Tenant Design Decisions — Chris Tech HRMS

**Status:** DRAFT — pending Chris's approval before Phase 1 (schema/migration) begins.
**Product name:** Chris Tech HRMS (rebranding from generic "HRMS" to match Chris Tech branding).

This document answers the 5 open questions from `MULTI_TENANT_ROADMAP.md` Phase 0. Each section states the recommendation and the reasoning, so it can be approved or overridden before any code is written.

---

## 1. Tenant identification strategy

**Recommendation: Company selection at login (Option B).**

- No DNS/subdomain infrastructure needed to ship the first version.
- User logs in with email + password as today; if their account is tied to exactly one company, they go straight to the dashboard (zero UX change from today).
- If invited into multiple companies later, they'd see a company picker after credentials — but this isn't needed for v1 since each user belongs to one company (see decision 2).
- Subdomain-per-company (`acme.christech-hrms.com`) is deferred to a later phase once there's a real second/third paying company, since it needs DNS wildcard setup, TLS cert handling (wildcard cert or per-subdomain issuance), and a routing layer that doesn't exist today.

## 2. User-to-company relationship

**Recommendation: One user = one company for v1.**

- Simpler auth flow, simpler permission checks, ships faster.
- Modeled so it *can* be extended to many-to-many later: `companyId` lives directly on `User` for now (not a join table), but if a consultant-style "HR admin across multiple client companies" need comes up, migrating to a `UserCompany` join table is a contained, additive change — it doesn't require touching the 20+ other scoped models.

## 3. Super Admin scope

**Recommendation: Split into two roles.**

- **`PLATFORM_OWNER`** — new role, cross-company. This is Chris. Can see/manage the list of companies on the platform (create, suspend, view basic usage), but does **not** get automatic access to any company's HR data (employee records, payroll, etc.) — that's a deliberate privacy boundary, not just a technical one, since client companies' HR/payroll data is sensitive.
- **`SUPER_ADMIN`** — existing role, now scoped to one company. Functionally identical to today's Super Admin, just company-scoped like every other role.
- This split keeps "who runs the platform" cleanly separate from "who runs HR at Company X," which matters both for security and for eventually selling this as a real SaaS product where clients need confidence their data isn't visible to other tenants or even to the platform operator by default.

## 4. Company signup flow

**Recommendation: Admin-provisioned only for v1, not self-serve.**

- Chris (as `PLATFORM_OWNER`) creates a new `Company` row and its first `SUPER_ADMIN` user manually (via a simple internal script or admin endpoint).
- That admin then invites the rest of their team through the existing employee-creation flow.
- Self-serve signup (a public "Create your company" form) is real product work — email verification, abuse prevention, plan selection — and is explicitly deferred to Phase 6 (Hardening) or later, once there's demand from more than one or two pilot companies.

## 5. Billing/plan tier

**Recommendation: Add `plan` field now, no billing logic yet.**

- `Company.plan` defaults to `"FREE"`.
- No payment integration, no enforcement of plan limits in v1 — just reserving the field so a future billing phase doesn't require another schema migration.
- When real billing is built, M-Pesa/Paystack integration (consistent with your other projects) is the natural fit for Kenyan/East African customers.

---

## Confirmed model scoping list (from Phase 1)

**Gets `companyId`:**
`User, Employee, Department, Designation, EmergencyContact, EmployeeDocument, Shift, Holiday, Attendance, LeaveType, LeaveRequest, LeaveBalance, Salary, Payroll, PayrollItem, Payslip, Notification, Announcement, Job, Candidate, JobApplication, Interview, Offer, Goal, PerformanceReview, Feedback`

**Stays global (platform-level, not company-scoped):**
`Role, Permission, RolePermission, UserRole` — RBAC definitions are shared platform-wide (every company uses the same role/permission catalog; only the *assignment* of roles to users is implicitly company-scoped via the user).
`PasswordResetToken` — scoped indirectly through its `User` relation, doesn't need its own `companyId`.

---

## Open item for Chris to confirm before Phase 1 starts

- [ ] Approve or override recommendation 1 (login-based tenant selection)
- [ ] Approve or override recommendation 2 (one user = one company)
- [ ] Approve or override recommendation 3 (PLATFORM_OWNER vs SUPER_ADMIN split)
- [ ] Approve or override recommendation 4 (admin-provisioned signup only)
- [ ] Approve or override recommendation 5 (plan field, no billing yet)
- [ ] Confirm the model scoping list above is complete and correct

Once checked off, Phase 1 (schema + migration) can start.
