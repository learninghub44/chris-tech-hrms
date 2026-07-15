/**
 * Backfill script for the multi-tenant migration.
 *
 * WHY THIS EXISTS
 * The updated prisma/schema.prisma adds a required `companyId` column to every
 * tenant-scoped table. Prisma cannot generate a single migration that both adds
 * a NOT NULL column and backfills existing rows with a valid value — that has
 * to be done in three steps, run in order, on a database that already has data
 * in it (a fresh/empty database can just run the normal migration directly and
 * skip this file entirely).
 *
 * THREE-STEP MIGRATION PROCESS (run in this order, on your own machine where
 * Prisma can reach its engine binaries):
 *
 * 1. Temporarily make every new `companyId` column nullable in schema.prisma
 *    (change `companyId String` to `companyId String?` on every tenant model,
 *    and comment out the `@@unique([companyId, ...])` / `@@index([companyId])`
 *    lines that reference it if they cause errors on the null column).
 *    Run: npx prisma migrate dev --name add_company_nullable
 *
 * 2. Run this script:
 *    npx tsx scripts/backfill-default-company.ts
 *    This creates one Company row and sets companyId on every existing row.
 *
 * 3. Revert schema.prisma back to the committed version (companyId non-nullable,
 *    all indexes/uniques restored — i.e. just `git checkout prisma/schema.prisma`).
 *    Run: npx prisma migrate dev --name add_company_not_null
 *    This step will fail if any row was missed in step 2 — check the script
 *    output below before proceeding to step 3.
 *
 * A fresh database (no existing rows) does not need any of this — just run
 * the normal migration directly against the schema as committed.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_COMPANY_NAME = "Chris Tech Default Co";
const DEFAULT_COMPANY_SLUG = "chris-tech-default";

// Tables that receive companyId, in an order safe for backfilling
// (parents before children isn't strictly required for an UPDATE, but keeping
// this list explicit makes it easy to audit against the schema's model list).
const TENANT_TABLES = [
  "users",
  "employees",
  "departments",
  "designations",
  "emergency_contacts",
  "employee_documents",
  "shifts",
  "holidays",
  "attendance",
  "leave_types",
  "leave_requests",
  "leave_balances",
  "notifications",
  "salaries",
  "payrolls",
  "payroll_items",
  "payslips",
  "announcements",
  "jobs",
  "candidates",
  "applications",
  "interviews",
  "offers",
  "goals",
  "performance_reviews",
  "feedback",
] as const;

async function main() {
  console.log("Starting multi-tenant backfill...");

  // Step 1: create (or find) the default company using raw SQL, since the
  // Prisma Client at this point may not yet have the Company model generated
  // depending on which schema version is active when this runs.
  const existing = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
    `SELECT id FROM companies WHERE slug = $1`,
    DEFAULT_COMPANY_SLUG
  );

  let companyId: string;
  if (existing.length > 0) {
    companyId = existing[0].id;
    console.log(`Found existing default company: ${companyId}`);
  } else {
    const inserted = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
      `INSERT INTO companies (id, name, slug, plan, status, "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1, $2, 'FREE', 'ACTIVE', now(), now())
       RETURNING id`,
      DEFAULT_COMPANY_NAME,
      DEFAULT_COMPANY_SLUG
    );
    companyId = inserted[0].id;
    console.log(`Created default company: ${companyId}`);
  }

  // Step 2: backfill every tenant table where companyId is currently null.
  let totalUpdated = 0;
  for (const table of TENANT_TABLES) {
    const result = await prisma.$executeRawUnsafe(
      `UPDATE "${table}" SET "companyId" = $1 WHERE "companyId" IS NULL`,
      companyId
    );
    console.log(`  ${table}: ${result} row(s) updated`);
    totalUpdated += result as number;
  }

  console.log(`\nBackfill complete. ${totalUpdated} total rows updated.`);
  console.log(`Default company id: ${companyId}`);

  // Step 3: verify no nulls remain before the caller proceeds to the
  // NOT NULL migration step.
  console.log("\nVerifying no NULL companyId values remain...");
  let allClear = true;
  for (const table of TENANT_TABLES) {
    const remaining = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
      `SELECT COUNT(*) as count FROM "${table}" WHERE "companyId" IS NULL`
    );
    const count = Number(remaining[0].count);
    if (count > 0) {
      allClear = false;
      console.error(`  ${table}: ${count} row(s) STILL NULL — do not proceed to step 3`);
    }
  }

  if (allClear) {
    console.log("All tenant tables backfilled successfully. Safe to proceed to step 3.");
  } else {
    console.error("\nBackfill incomplete — fix the tables listed above before making companyId NOT NULL.");
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error("Backfill failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
