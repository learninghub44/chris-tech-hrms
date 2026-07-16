-- This migration backfills multi-tenancy support that was added to schema.prisma
-- (the Company model and companyId fields on 26 dependent models) but was never
-- captured in a migration file. It is written by hand to match schema.prisma
-- exactly, and assumes every dependent table is currently empty (true in
-- production: the seed script has always failed on prisma.company.upsert(),
-- which runs before any employee/attendance/payroll/etc. rows are created).
-- Verify with a quick row-count check before deploying if you are unsure.

-- CreateEnum
CREATE TYPE "CompanyPlan" AS ENUM ('FREE', 'STANDARD', 'PREMIUM');

-- CreateEnum
CREATE TYPE "CompanyStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "plan" "CompanyPlan" NOT NULL DEFAULT 'FREE',
    "status" "CompanyStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_slug_key" ON "companies"("slug");

-- AlterTable: add companyId (nullable — PLATFORM_OWNER users are cross-company)
ALTER TABLE "users" ADD COLUMN "companyId" TEXT;

-- AlterTable: add companyId (NOT NULL) to every tenant-scoped table
ALTER TABLE "departments" ADD COLUMN "companyId" TEXT NOT NULL;
ALTER TABLE "designations" ADD COLUMN "companyId" TEXT NOT NULL;
ALTER TABLE "employees" ADD COLUMN "companyId" TEXT NOT NULL;
ALTER TABLE "emergency_contacts" ADD COLUMN "companyId" TEXT NOT NULL;
ALTER TABLE "employee_documents" ADD COLUMN "companyId" TEXT NOT NULL;
ALTER TABLE "shifts" ADD COLUMN "companyId" TEXT NOT NULL;
ALTER TABLE "holidays" ADD COLUMN "companyId" TEXT NOT NULL;
ALTER TABLE "attendance" ADD COLUMN "companyId" TEXT NOT NULL;
ALTER TABLE "leave_types" ADD COLUMN "companyId" TEXT NOT NULL;
ALTER TABLE "leave_requests" ADD COLUMN "companyId" TEXT NOT NULL;
ALTER TABLE "leave_balances" ADD COLUMN "companyId" TEXT NOT NULL;
ALTER TABLE "notifications" ADD COLUMN "companyId" TEXT NOT NULL;
ALTER TABLE "salaries" ADD COLUMN "companyId" TEXT NOT NULL;
ALTER TABLE "payrolls" ADD COLUMN "companyId" TEXT NOT NULL;
ALTER TABLE "payroll_items" ADD COLUMN "companyId" TEXT NOT NULL;
ALTER TABLE "payslips" ADD COLUMN "companyId" TEXT NOT NULL;
ALTER TABLE "announcements" ADD COLUMN "companyId" TEXT NOT NULL;
ALTER TABLE "jobs" ADD COLUMN "companyId" TEXT NOT NULL;
ALTER TABLE "candidates" ADD COLUMN "companyId" TEXT NOT NULL;
ALTER TABLE "applications" ADD COLUMN "companyId" TEXT NOT NULL;
ALTER TABLE "interviews" ADD COLUMN "companyId" TEXT NOT NULL;
ALTER TABLE "offers" ADD COLUMN "companyId" TEXT NOT NULL;
ALTER TABLE "goals" ADD COLUMN "companyId" TEXT NOT NULL;
ALTER TABLE "performance_reviews" ADD COLUMN "companyId" TEXT NOT NULL;
ALTER TABLE "feedback" ADD COLUMN "companyId" TEXT NOT NULL;

-- DropIndex: single-column unique constraints being replaced by per-company composites
DROP INDEX "departments_name_key";
DROP INDEX "designations_title_departmentId_key";
DROP INDEX "employees_employeeCode_key";
DROP INDEX "employees_workEmail_key";
DROP INDEX "shifts_name_key";
DROP INDEX "holidays_date_key";
DROP INDEX "leave_types_name_key";
DROP INDEX "payrolls_month_year_key";
DROP INDEX "candidates_email_key";
DROP INDEX "payslips_payslipNumber_key";

-- CreateIndex: new per-company composite unique constraints
CREATE UNIQUE INDEX "departments_companyId_name_key" ON "departments"("companyId", "name");
CREATE UNIQUE INDEX "designations_companyId_title_departmentId_key" ON "designations"("companyId", "title", "departmentId");
CREATE UNIQUE INDEX "employees_companyId_employeeCode_key" ON "employees"("companyId", "employeeCode");
CREATE UNIQUE INDEX "employees_companyId_workEmail_key" ON "employees"("companyId", "workEmail");
CREATE UNIQUE INDEX "shifts_companyId_name_key" ON "shifts"("companyId", "name");
CREATE UNIQUE INDEX "holidays_companyId_date_key" ON "holidays"("companyId", "date");
CREATE UNIQUE INDEX "leave_types_companyId_name_key" ON "leave_types"("companyId", "name");
CREATE UNIQUE INDEX "payrolls_companyId_month_year_key" ON "payrolls"("companyId", "month", "year");
CREATE UNIQUE INDEX "candidates_companyId_email_key" ON "candidates"("companyId", "email");
CREATE UNIQUE INDEX "payslips_companyId_payslipNumber_key" ON "payslips"("companyId", "payslipNumber");

-- CreateIndex: companyId lookup indexes (@@index([companyId]) on every model)
CREATE INDEX "users_companyId_idx" ON "users"("companyId");
CREATE INDEX "departments_companyId_idx" ON "departments"("companyId");
CREATE INDEX "designations_companyId_idx" ON "designations"("companyId");
CREATE INDEX "employees_companyId_idx" ON "employees"("companyId");
CREATE INDEX "emergency_contacts_companyId_idx" ON "emergency_contacts"("companyId");
CREATE INDEX "employee_documents_companyId_idx" ON "employee_documents"("companyId");
CREATE INDEX "shifts_companyId_idx" ON "shifts"("companyId");
CREATE INDEX "holidays_companyId_idx" ON "holidays"("companyId");
CREATE INDEX "attendance_companyId_idx" ON "attendance"("companyId");
CREATE INDEX "leave_types_companyId_idx" ON "leave_types"("companyId");
CREATE INDEX "leave_requests_companyId_idx" ON "leave_requests"("companyId");
CREATE INDEX "leave_balances_companyId_idx" ON "leave_balances"("companyId");
CREATE INDEX "notifications_companyId_idx" ON "notifications"("companyId");
CREATE INDEX "salaries_companyId_idx" ON "salaries"("companyId");
CREATE INDEX "payrolls_companyId_idx" ON "payrolls"("companyId");
CREATE INDEX "payroll_items_companyId_idx" ON "payroll_items"("companyId");
CREATE INDEX "payslips_companyId_idx" ON "payslips"("companyId");
CREATE INDEX "announcements_companyId_idx" ON "announcements"("companyId");
CREATE INDEX "jobs_companyId_idx" ON "jobs"("companyId");
CREATE INDEX "candidates_companyId_idx" ON "candidates"("companyId");
CREATE INDEX "applications_companyId_idx" ON "applications"("companyId");
CREATE INDEX "interviews_companyId_idx" ON "interviews"("companyId");
CREATE INDEX "offers_companyId_idx" ON "offers"("companyId");
CREATE INDEX "goals_companyId_idx" ON "goals"("companyId");
CREATE INDEX "performance_reviews_companyId_idx" ON "performance_reviews"("companyId");
CREATE INDEX "feedback_companyId_idx" ON "feedback"("companyId");

-- AddForeignKey: companyId -> companies(id), matching each relation's onDelete rule in schema.prisma
ALTER TABLE "users" ADD CONSTRAINT "users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "departments" ADD CONSTRAINT "departments_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "designations" ADD CONSTRAINT "designations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "employees" ADD CONSTRAINT "employees_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "emergency_contacts" ADD CONSTRAINT "emergency_contacts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "employee_documents" ADD CONSTRAINT "employee_documents_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "holidays" ADD CONSTRAINT "holidays_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "leave_types" ADD CONSTRAINT "leave_types_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "leave_balances" ADD CONSTRAINT "leave_balances_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "salaries" ADD CONSTRAINT "salaries_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "payrolls" ADD CONSTRAINT "payrolls_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "payroll_items" ADD CONSTRAINT "payroll_items_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "payslips" ADD CONSTRAINT "payslips_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "applications" ADD CONSTRAINT "applications_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "offers" ADD CONSTRAINT "offers_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "goals" ADD CONSTRAINT "goals_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
