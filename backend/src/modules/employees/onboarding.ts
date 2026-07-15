import type { EmploymentStatus, Prisma } from "@prisma/client";
import { AppError } from "../../middleware/error-handler";

const linkableEmployeeStatuses: EmploymentStatus[] = [
  "ONBOARDING",
  "ACTIVE",
  "PROBATION"
];

export function getCurrentLeaveBalanceYear(): number {
  return new Date().getFullYear();
}

export async function initializeLeaveBalancesForEmployee(input: {
  transaction: Prisma.TransactionClient;
  employeeId: string;
  year: number;
}): Promise<void> {
  // TODO(Phase 4 — leaves module scoping, see MULTI_TENANT_ROADMAP.md): this
  // query is not yet company-scoped and will pull every active LeaveType
  // across all companies once more than one company has data. Left as-is
  // here deliberately — Phase 2 only touches auth/middleware, not module
  // query bodies. Do not "fix" this in isolation without also scoping the
  // rest of the leaves module in the same PR.
  const leaveTypes = await input.transaction.leaveType.findMany({
    where: {
      isActive: true
    },
    select: {
      id: true,
      defaultAnnualAllowance: true
    }
  });

  await Promise.all(
    leaveTypes.map((leaveType) =>
      input.transaction.leaveBalance.upsert({
        where: {
          employeeId_leaveTypeId_year: {
            employeeId: input.employeeId,
            leaveTypeId: leaveType.id,
            year: input.year
          }
        },
        update: {},
        create: {
          employeeId: input.employeeId,
          leaveTypeId: leaveType.id,
          year: input.year,
          openingBalance: leaveType.defaultAnnualAllowance,
          available: leaveType.defaultAnnualAllowance
        }
      })
    )
  );
}

export async function linkExistingEmployeeForUser(input: {
  transaction: Prisma.TransactionClient;
  userId: string;
  email: string;
  companyId: string;
}): Promise<string | null> {
  const employee = await input.transaction.employee.findUnique({
    where: {
      companyId_workEmail: {
        companyId: input.companyId,
        workEmail: input.email
      }
    },
    select: {
      id: true,
      userId: true,
      status: true
    }
  });

  if (!employee) {
    return null;
  }

  if (!linkableEmployeeStatuses.includes(employee.status)) {
    throw new AppError(
      403,
      "EMPLOYEE_PROFILE_NOT_ACTIVE",
      "This employee profile is not active for account registration"
    );
  }

  if (employee.userId && employee.userId !== input.userId) {
    throw new AppError(
      409,
      "EMPLOYEE_PROFILE_ALREADY_LINKED",
      "This employee profile is already linked to another account"
    );
  }

  if (!employee.userId) {
    await input.transaction.employee.update({
      where: {
        id: employee.id
      },
      data: {
        userId: input.userId
      }
    });
  }

  await initializeLeaveBalancesForEmployee({
    transaction: input.transaction,
    employeeId: employee.id,
    year: getCurrentLeaveBalanceYear()
  });

  return employee.id;
}
