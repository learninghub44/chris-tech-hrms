import type { Request } from "express";
import { Router } from "express";
import { Prisma, type Notification } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { emitNotificationCreated } from "../../lib/realtime";
import { authenticate } from "../../middleware/authenticate";
import { requireAnyPermission, requirePermissions } from "../../middleware/authorize";
import { AppError } from "../../middleware/error-handler";
import { assertSameCompany, companyScope, requireCompanyContext } from "../../middleware/tenant";
import { ok } from "../../utils/api-response";
import { asyncHandler } from "../../utils/async-handler";
import {
  getPagination,
  getPaginationMeta,
  paginationQuerySchema
} from "../../utils/pagination";

export const payrollRouter = Router();

const employeeSelect = {
  id: true,
  employeeCode: true,
  firstName: true,
  lastName: true,
  workEmail: true,
  userId: true,
  department: true,
  designation: true
} satisfies Prisma.EmployeeSelect;

const salaryInclude = {
  employee: {
    select: employeeSelect
  }
} satisfies Prisma.SalaryInclude;

const payrollListInclude = {
  generatedBy: {
    select: {
      id: true,
      name: true,
      email: true
    }
  }
} satisfies Prisma.PayrollInclude;

const payrollDetailInclude = {
  generatedBy: {
    select: {
      id: true,
      name: true,
      email: true
    }
  },
  items: {
    include: {
      employee: {
        select: employeeSelect
      },
      salary: true,
      payslip: true
    },
    orderBy: {
      employee: {
        employeeCode: "asc" as const
      }
    }
  }
} satisfies Prisma.PayrollInclude;

const payslipInclude = {
  payroll: true,
  payrollItem: true,
  employee: {
    select: employeeSelect
  }
} satisfies Prisma.PayslipInclude;

const uuidSchema = z.string().uuid();
const paramsSchema = z.object({
  id: uuidSchema
});

const salaryBodySchema = z.object({
  employeeId: uuidSchema,
  baseSalary: z.number().min(0).max(100_000_000),
  allowances: z.number().min(0).max(100_000_000),
  deductions: z.number().min(0).max(100_000_000),
  effectiveFrom: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/),
  isActive: z.boolean()
});

const salaryUpdateBodySchema = salaryBodySchema
  .omit({
    employeeId: true
  })
  .partial()
  .refine((body) => Object.keys(body).length > 0, "At least one field is required");

const generatePayrollSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100)
});

const payrollListQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100).optional()
}).merge(paginationQuerySchema);

const payslipQuerySchema = z.object({
  employeeId: uuidSchema.optional()
});

function parseInput<T extends z.ZodTypeAny>(schema: T, input: unknown): z.infer<T> {
  const result = schema.safeParse(input);

  if (!result.success) {
    throw new AppError(400, "VALIDATION_ERROR", "Request input is invalid", result.error.flatten());
  }

  return result.data;
}

function assertAuthenticated(req: Request) {
  if (!req.auth) {
    throw new AppError(401, "AUTHENTICATION_REQUIRED", "A valid access token is required");
  }

  return req.auth;
}

function hasPermission(req: Request, permission: string): boolean {
  const auth = assertAuthenticated(req);

  return auth.permissions.includes(permission);
}

function toDateOnlyFromInput(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, day));
}

function getMonthName(month: number): string {
  return new Intl.DateTimeFormat("en", {
    month: "long"
  }).format(new Date(Date.UTC(2026, month - 1, 1)));
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function getEmployeeName(employee: { firstName: string; lastName: string }): string {
  return `${employee.firstName} ${employee.lastName}`.trim();
}

function buildPayslipNumber(input: {
  year: number;
  month: number;
  employeeCode: string;
}): string {
  return `PAY-${input.year}-${String(input.month).padStart(2, "0")}-${input.employeeCode}`;
}

function buildPayslipContent(payslip: Prisma.PayslipGetPayload<{ include: typeof payslipInclude }>): string {
  return [
    "HRMS Payslip",
    `Payslip: ${payslip.payslipNumber}`,
    `Employee: ${getEmployeeName(payslip.employee)} (${payslip.employee.employeeCode})`,
    `Email: ${payslip.employee.workEmail}`,
    `Payroll Month: ${getMonthName(payslip.payroll.month)} ${payslip.payroll.year}`,
    `Base Salary: ${payslip.payrollItem.baseSalary.toFixed(2)}`,
    `Allowances: ${payslip.payrollItem.allowances.toFixed(2)}`,
    `Gross Pay: ${payslip.grossPay.toFixed(2)}`,
    `Deductions: ${payslip.totalDeductions.toFixed(2)}`,
    `Net Pay: ${payslip.netPay.toFixed(2)}`,
    `Issued At: ${payslip.issuedAt.toISOString()}`
  ].join("\n");
}

async function getEmployeeForAuth(req: Request) {
  const auth = assertAuthenticated(req);
  const scope = companyScope(req);
  const employee = await prisma.employee.findUnique({
    where: {
      userId: auth.id,
      companyId: scope.companyId
    }
  });

  if (!employee) {
    throw new AppError(400, "EMPLOYEE_PROFILE_REQUIRED", "This account is not linked to an employee record");
  }

  return employee;
}

async function assertEmployeeInCompany(employeeId: string, companyId: string): Promise<void> {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { companyId: true }
  });

  if (!employee || employee.companyId !== companyId) {
    throw new AppError(400, "INVALID_REFERENCE", "One of the selected related records does not exist");
  }
}

async function createNotificationForUser(input: {
  transaction: Prisma.TransactionClient;
  companyId: string;
  userId: string | null;
  title: string;
  message: string;
  category: string;
}): Promise<Notification | null> {
  if (!input.userId) {
    return null;
  }

  return input.transaction.notification.create({
    data: {
      companyId: input.companyId,
      userId: input.userId,
      title: input.title,
      message: input.message,
      category: input.category
    }
  });
}

function handlePrismaMutationError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      throw new AppError(409, "DUPLICATE_RECORD", "A record with the same unique value already exists");
    }

    if (error.code === "P2003") {
      throw new AppError(400, "INVALID_REFERENCE", "One of the selected related records does not exist");
    }

    if (error.code === "P2025") {
      throw new AppError(404, "RECORD_NOT_FOUND", "The requested record was not found");
    }
  }

  throw error;
}

payrollRouter.use(authenticate);
payrollRouter.use(requireCompanyContext);

payrollRouter.get(
  "/salaries",
  requirePermissions(["payroll:manage"]),
  asyncHandler(async (req, res) => {
    const query = parseInput(paginationQuerySchema, req.query);
    const pagination = getPagination(query);
    const scope = companyScope(req);
    const where: Prisma.SalaryWhereInput = {
      companyId: scope.companyId
    };
    const [total, salaries] = await prisma.$transaction([
      prisma.salary.count({ where }),
      prisma.salary.findMany({
        where,
        include: salaryInclude,
        orderBy: {
          employee: {
            employeeCode: "asc"
          }
        },
        skip: pagination.skip,
        take: pagination.take
      })
    ]);

    res.status(200).json(ok({ salaries }, getPaginationMeta({ total, pagination })));
  })
);

payrollRouter.post(
  "/salaries",
  requirePermissions(["payroll:manage"]),
  asyncHandler(async (req, res) => {
    const body = parseInput(salaryBodySchema, req.body);
    const scope = companyScope(req);

    if (body.deductions > body.baseSalary + body.allowances) {
      throw new AppError(400, "INVALID_SALARY_COMPONENTS", "Deductions cannot exceed gross pay");
    }

    await assertEmployeeInCompany(body.employeeId, scope.companyId);

    try {
      const salary = await prisma.salary.create({
        data: {
          companyId: scope.companyId,
          employeeId: body.employeeId,
          baseSalary: body.baseSalary,
          allowances: body.allowances,
          deductions: body.deductions,
          effectiveFrom: toDateOnlyFromInput(body.effectiveFrom),
          isActive: body.isActive
        },
        include: salaryInclude
      });

      res.status(201).json(ok({ salary }));
    } catch (error) {
      handlePrismaMutationError(error);
    }
  })
);

payrollRouter.put(
  "/salaries/:id",
  requirePermissions(["payroll:manage"]),
  asyncHandler(async (req, res) => {
    const params = parseInput(paramsSchema, req.params);
    const body = parseInput(salaryUpdateBodySchema, req.body);
    const existingSalary = await prisma.salary.findUnique({
      where: {
        id: params.id
      }
    });

    if (!existingSalary) {
      throw new AppError(404, "SALARY_NOT_FOUND", "Salary setup was not found");
    }

    assertSameCompany(existingSalary.companyId, req);

    const baseSalary = body.baseSalary ?? existingSalary.baseSalary;
    const allowances = body.allowances ?? existingSalary.allowances;
    const deductions = body.deductions ?? existingSalary.deductions;

    if (deductions > baseSalary + allowances) {
      throw new AppError(400, "INVALID_SALARY_COMPONENTS", "Deductions cannot exceed gross pay");
    }

    try {
      const salary = await prisma.salary.update({
        where: {
          id: params.id
        },
        data: {
          ...(body.baseSalary !== undefined ? { baseSalary: body.baseSalary } : {}),
          ...(body.allowances !== undefined ? { allowances: body.allowances } : {}),
          ...(body.deductions !== undefined ? { deductions: body.deductions } : {}),
          ...(body.effectiveFrom !== undefined
            ? { effectiveFrom: toDateOnlyFromInput(body.effectiveFrom) }
            : {}),
          ...(body.isActive !== undefined ? { isActive: body.isActive } : {})
        },
        include: salaryInclude
      });

      res.status(200).json(ok({ salary }));
    } catch (error) {
      handlePrismaMutationError(error);
    }
  })
);

payrollRouter.post(
  "/payroll/generate",
  requirePermissions(["payroll:manage"]),
  asyncHandler(async (req, res) => {
    const body = parseInput(generatePayrollSchema, req.body);
    const auth = assertAuthenticated(req);
    const scope = companyScope(req);
    const salaries = await prisma.salary.findMany({
      where: {
        companyId: scope.companyId,
        isActive: true,
        employee: {
          status: {
            in: ["ONBOARDING", "ACTIVE", "PROBATION"]
          }
        }
      },
      include: salaryInclude,
      orderBy: {
        employee: {
          employeeCode: "asc"
        }
      }
    });

    if (salaries.length === 0) {
      throw new AppError(400, "NO_ACTIVE_SALARIES", "Create active salary records before generating payroll");
    }

    try {
      const transactionResult = await prisma.$transaction(async (transaction) => {
        const existingPayroll = await transaction.payroll.findUnique({
          where: {
            companyId_month_year: {
              companyId: scope.companyId,
              month: body.month,
              year: body.year
            }
          }
        });

        if (existingPayroll) {
          throw new AppError(409, "PAYROLL_ALREADY_GENERATED", "Payroll already exists for this month");
        }

        const itemInputs = salaries.map((salary) => {
          const grossPay = roundMoney(salary.baseSalary + salary.allowances);
          const totalDeductions = roundMoney(salary.deductions);
          const netPay = roundMoney(grossPay - totalDeductions);

          if (netPay < 0) {
            throw new AppError(400, "INVALID_SALARY_COMPONENTS", "A salary setup has negative net pay");
          }

          return {
            salary,
            grossPay,
            totalDeductions,
            netPay
          };
        });
        const totalGross = roundMoney(
          itemInputs.reduce((total, item) => total + item.grossPay, 0)
        );
        const totalDeductions = roundMoney(
          itemInputs.reduce((total, item) => total + item.totalDeductions, 0)
        );
        const totalNet = roundMoney(
          itemInputs.reduce((total, item) => total + item.netPay, 0)
        );
        const createdPayroll = await transaction.payroll.create({
          data: {
            companyId: scope.companyId,
            month: body.month,
            year: body.year,
            status: "GENERATED",
            generatedById: auth.id,
            itemCount: itemInputs.length,
            totalGross,
            totalDeductions,
            totalNet
          }
        });
        const notifications: Notification[] = [];

        for (const itemInput of itemInputs) {
          const payrollItem = await transaction.payrollItem.create({
            data: {
              companyId: scope.companyId,
              payrollId: createdPayroll.id,
              employeeId: itemInput.salary.employeeId,
              salaryId: itemInput.salary.id,
              baseSalary: itemInput.salary.baseSalary,
              allowances: itemInput.salary.allowances,
              deductions: itemInput.salary.deductions,
              grossPay: itemInput.grossPay,
              totalDeductions: itemInput.totalDeductions,
              netPay: itemInput.netPay
            }
          });

          await transaction.payslip.create({
            data: {
              companyId: scope.companyId,
              payrollId: createdPayroll.id,
              payrollItemId: payrollItem.id,
              employeeId: itemInput.salary.employeeId,
              payslipNumber: buildPayslipNumber({
                year: body.year,
                month: body.month,
                employeeCode: itemInput.salary.employee.employeeCode
              }),
              grossPay: itemInput.grossPay,
              totalDeductions: itemInput.totalDeductions,
              netPay: itemInput.netPay
            }
          });

          const notification = await createNotificationForUser({
            transaction,
            companyId: scope.companyId,
            userId: itemInput.salary.employee.userId,
            title: "Payslip generated",
            message: `Your ${getMonthName(body.month)} ${body.year} payslip is available`,
            category: "payroll"
          });

          if (notification) {
            notifications.push(notification);
          }
        }

        const payroll = await transaction.payroll.findUniqueOrThrow({
          where: {
            id: createdPayroll.id
          },
          include: payrollDetailInclude
        });

        return {
          payroll,
          notifications
        };
      });

      await Promise.all(transactionResult.notifications.map(emitNotificationCreated));
      res.status(201).json(ok({ payroll: transactionResult.payroll }));
    } catch (error) {
      handlePrismaMutationError(error);
    }
  })
);

payrollRouter.get(
  "/payroll/me",
  requirePermissions(["payroll:read"]),
  asyncHandler(async (req, res) => {
    const query = parseInput(paginationQuerySchema, req.query);
    const pagination = getPagination(query);
    const scope = companyScope(req);
    const employee = await getEmployeeForAuth(req);
    const where: Prisma.PayslipWhereInput = {
      companyId: scope.companyId,
      employeeId: employee.id
    };
    const [total, payslips] = await prisma.$transaction([
      prisma.payslip.count({
        where
      }),
      prisma.payslip.findMany({
        where,
        include: payslipInclude,
        orderBy: [
          {
            payroll: {
              year: "desc"
            }
          },
          {
            payroll: {
              month: "desc"
            }
          }
        ],
        skip: pagination.skip,
        take: pagination.take
      })
    ]);

    res.status(200).json(ok({ payslips }, getPaginationMeta({ total, pagination })));
  })
);

payrollRouter.get(
  "/payroll/:id/payslip",
  requireAnyPermission(["payroll:manage", "payroll:read"]),
  asyncHandler(async (req, res) => {
    const params = parseInput(paramsSchema, req.params);
    const query = parseInput(payslipQuerySchema, req.query);
    const canManagePayroll = hasPermission(req, "payroll:manage");
    const employeeId = canManagePayroll ? query.employeeId : (await getEmployeeForAuth(req)).id;

    if (!employeeId) {
      throw new AppError(400, "EMPLOYEE_REQUIRED", "Select an employee payslip to download");
    }

    const payslip = await prisma.payslip.findUnique({
      where: {
        payrollId_employeeId: {
          payrollId: params.id,
          employeeId
        }
      },
      include: payslipInclude
    });

    if (!payslip) {
      throw new AppError(404, "PAYSLIP_NOT_FOUND", "Payslip was not found");
    }

    assertSameCompany(payslip.companyId, req);

    res.status(200).json(
      ok({
        payslip,
        fileName: `${payslip.payslipNumber}.txt`,
        contentType: "text/plain",
        content: buildPayslipContent(payslip)
      })
    );
  })
);

payrollRouter.get(
  "/payroll",
  requirePermissions(["payroll:manage"]),
  asyncHandler(async (req, res) => {
    const query = parseInput(payrollListQuerySchema, req.query);
    const pagination = getPagination(query);
    const scope = companyScope(req);
    const where: Prisma.PayrollWhereInput = {
      companyId: scope.companyId,
      ...(query.year ? { year: query.year } : {})
    };
    const [total, payrolls] = await prisma.$transaction([
      prisma.payroll.count({
        where
      }),
      prisma.payroll.findMany({
        where,
        include: payrollListInclude,
        orderBy: [
          {
            year: "desc"
          },
          {
            month: "desc"
          }
        ],
        skip: pagination.skip,
        take: pagination.take
      })
    ]);

    res.status(200).json(ok({ payrolls }, getPaginationMeta({ total, pagination })));
  })
);

payrollRouter.get(
  "/payroll/:id",
  requirePermissions(["payroll:manage"]),
  asyncHandler(async (req, res) => {
    const params = parseInput(paramsSchema, req.params);
    const payroll = await prisma.payroll.findUnique({
      where: {
        id: params.id
      },
      include: payrollDetailInclude
    });

    if (!payroll) {
      throw new AppError(404, "PAYROLL_NOT_FOUND", "Payroll was not found");
    }

    assertSameCompany(payroll.companyId, req);

    res.status(200).json(ok({ payroll }));
  })
);
