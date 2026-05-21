import type { Request } from "express";
import { Router } from "express";
import {
  FeedbackCategory,
  GoalStatus,
  PerformanceReviewStatus,
  Prisma
} from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { authenticate } from "../../middleware/authenticate";
import { requireAnyPermission, requirePermissions } from "../../middleware/authorize";
import { AppError } from "../../middleware/error-handler";
import { ok } from "../../utils/api-response";
import { asyncHandler } from "../../utils/async-handler";
import {
  getPagination,
  getPaginationMeta,
  paginationQuerySchema
} from "../../utils/pagination";

export const performanceRouter = Router();

const employeeSelect = {
  id: true,
  employeeCode: true,
  firstName: true,
  lastName: true,
  workEmail: true,
  userId: true,
  managerId: true,
  department: true,
  designation: true
} satisfies Prisma.EmployeeSelect;

const goalInclude = {
  employee: {
    select: employeeSelect
  },
  createdBy: {
    select: {
      id: true,
      name: true,
      email: true
    }
  }
} satisfies Prisma.GoalInclude;

const reviewInclude = {
  employee: {
    select: employeeSelect
  },
  reviewer: {
    select: employeeSelect
  }
} satisfies Prisma.PerformanceReviewInclude;

const feedbackInclude = {
  employee: {
    select: employeeSelect
  },
  author: {
    select: employeeSelect
  }
} satisfies Prisma.FeedbackInclude;

const uuidSchema = z.string().uuid();
const dateInputSchema = z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/);
const nullableStringSchema = (maxLength: number) =>
  z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value): string | null => {
      if (typeof value !== "string") {
        return null;
      }

      const trimmedValue = value.trim();

      return trimmedValue.length > 0 ? trimmedValue : null;
    })
    .pipe(z.string().max(maxLength).nullable());
const optionalNullableStringSchema = (maxLength: number) =>
  z
    .union([z.string(), z.null()])
    .transform((value): string | null => {
      if (typeof value !== "string") {
        return null;
      }

      const trimmedValue = value.trim();

      return trimmedValue.length > 0 ? trimmedValue : null;
    })
    .pipe(z.string().max(maxLength).nullable())
    .optional();
const nullableUuidSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value): string | null => {
    if (typeof value !== "string") {
      return null;
    }

    const trimmedValue = value.trim();

    return trimmedValue.length > 0 ? trimmedValue : null;
  })
  .pipe(uuidSchema.nullable());
const nullableDateInputSchema = z
  .union([dateInputSchema, z.null(), z.undefined()])
  .transform((value): string | null => (typeof value === "string" ? value : null));
const optionalNullableDateInputSchema = z
  .union([dateInputSchema, z.null()])
  .transform((value): string | null => (typeof value === "string" ? value : null))
  .optional();

const paramsSchema = z.object({
  id: uuidSchema
});

const performanceEmployeeQuerySchema = z.object({
  search: z.string().trim().max(120).optional()
}).merge(paginationQuerySchema);

const goalQuerySchema = z.object({
  employeeId: uuidSchema.optional(),
  status: z.nativeEnum(GoalStatus).optional()
}).merge(paginationQuerySchema);

const goalBodySchema = z.object({
  employeeId: uuidSchema,
  title: z.string().trim().min(3).max(160),
  description: nullableStringSchema(2000),
  status: z.nativeEnum(GoalStatus),
  progress: z.number().int().min(0).max(100),
  startDate: nullableDateInputSchema,
  dueDate: nullableDateInputSchema
});

const goalUpdateBodySchema = z
  .object({
    title: z.string().trim().min(3).max(160).optional(),
    description: optionalNullableStringSchema(2000),
    status: z.nativeEnum(GoalStatus).optional(),
    progress: z.number().int().min(0).max(100).optional(),
    startDate: optionalNullableDateInputSchema,
    dueDate: optionalNullableDateInputSchema
  })
  .refine((body) => Object.keys(body).length > 0, "At least one field is required");

const reviewQuerySchema = z.object({
  employeeId: uuidSchema.optional(),
  status: z.nativeEnum(PerformanceReviewStatus).optional(),
  cycle: z.string().trim().max(80).optional()
}).merge(paginationQuerySchema);

const reviewBodySchema = z.object({
  employeeId: uuidSchema,
  reviewerId: nullableUuidSchema,
  cycle: z.string().trim().min(2).max(80),
  reviewPeriodStart: dateInputSchema,
  reviewPeriodEnd: dateInputSchema,
  rating: z.number().int().min(1).max(5),
  summary: z.string().trim().min(10).max(5000),
  strengths: nullableStringSchema(3000),
  improvements: nullableStringSchema(3000),
  status: z.nativeEnum(PerformanceReviewStatus)
});

const reviewStatusBodySchema = z.object({
  status: z.nativeEnum(PerformanceReviewStatus)
});

const feedbackQuerySchema = z.object({
  employeeId: uuidSchema.optional(),
  category: z.nativeEnum(FeedbackCategory).optional()
}).merge(paginationQuerySchema);

const feedbackBodySchema = z.object({
  employeeId: uuidSchema,
  category: z.nativeEnum(FeedbackCategory),
  message: z.string().trim().min(5).max(3000),
  isPrivate: z.boolean()
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
  return assertAuthenticated(req).permissions.includes(permission);
}

function canViewAllPerformance(req: Request): boolean {
  const auth = assertAuthenticated(req);

  return (
    auth.roles.includes("SUPER_ADMIN") ||
    auth.roles.includes("HR_ADMIN") ||
    auth.permissions.includes("employees:manage")
  );
}

function toDateOnlyFromInput(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, day));
}

function nullableDateToPrisma(value: string | null): Date | null {
  return value ? toDateOnlyFromInput(value) : null;
}

async function getEmployeeForAuth(req: Request) {
  const auth = assertAuthenticated(req);
  const employee = await prisma.employee.findUnique({
    where: {
      userId: auth.id
    },
    select: employeeSelect
  });

  if (!employee) {
    throw new AppError(400, "EMPLOYEE_PROFILE_REQUIRED", "This account is not linked to an employee record");
  }

  return employee;
}

async function assertEmployeeInPerformanceScope(req: Request, employeeId: string): Promise<void> {
  if (canViewAllPerformance(req)) {
    return;
  }

  const ownEmployee = await getEmployeeForAuth(req);

  if (employeeId === ownEmployee.id) {
    return;
  }

  if (hasPermission(req, "performance:manage")) {
    const directReport = await prisma.employee.findFirst({
      where: {
        id: employeeId,
        managerId: ownEmployee.id
      },
      select: {
        id: true
      }
    });

    if (directReport) {
      return;
    }
  }

  throw new AppError(403, "PERMISSION_DENIED", "This account cannot access that employee's performance records");
}

async function buildScopedEmployeeWhere(
  req: Request,
  employeeId: string | undefined
): Promise<Prisma.EmployeeWhereInput> {
  if (canViewAllPerformance(req)) {
    return employeeId ? { id: employeeId } : {};
  }

  const ownEmployee = await getEmployeeForAuth(req);

  if (employeeId) {
    await assertEmployeeInPerformanceScope(req, employeeId);
    return { id: employeeId };
  }

  if (hasPermission(req, "performance:manage")) {
    return {
      OR: [
        {
          id: ownEmployee.id
        },
        {
          managerId: ownEmployee.id
        }
      ]
    };
  }

  return {
    id: ownEmployee.id
  };
}

async function buildScopedPerformanceWhere(
  req: Request,
  employeeId: string | undefined
): Promise<{
  employeeId?: string;
  employee?: Prisma.EmployeeWhereInput;
}> {
  const employeeWhere = await buildScopedEmployeeWhere(req, employeeId);

  if (employeeWhere.id && Object.keys(employeeWhere).length === 1) {
    return {
      employeeId: employeeWhere.id as string
    };
  }

  return {
    employee: employeeWhere
  };
}

function assertDateOrder(startDate: Date, endDate: Date): void {
  if (endDate.getTime() < startDate.getTime()) {
    throw new AppError(400, "INVALID_DATE_RANGE", "End date cannot be before start date");
  }
}

function getSubmittedAt(status: PerformanceReviewStatus): Date | null {
  return status === "DRAFT" ? null : new Date();
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

performanceRouter.use(authenticate);

performanceRouter.get(
  "/performance/employees",
  requireAnyPermission(["performance:read", "performance:manage"]),
  asyncHandler(async (req, res) => {
    const query = parseInput(performanceEmployeeQuerySchema, req.query);
    const scopedWhere = await buildScopedEmployeeWhere(req, undefined);
    const searchWhere: Prisma.EmployeeWhereInput | null = query.search
      ? {
          OR: [
            {
              employeeCode: {
                contains: query.search,
                mode: "insensitive"
              }
            },
            {
              firstName: {
                contains: query.search,
                mode: "insensitive"
              }
            },
            {
              lastName: {
                contains: query.search,
                mode: "insensitive"
              }
            },
            {
              workEmail: {
                contains: query.search,
                mode: "insensitive"
              }
            }
          ]
        }
      : null;
    const where: Prisma.EmployeeWhereInput = {
      AND: searchWhere ? [scopedWhere, searchWhere] : [scopedWhere]
    };
    const pagination = getPagination(query);
    const [total, employees] = await prisma.$transaction([
      prisma.employee.count({
        where
      }),
      prisma.employee.findMany({
        where,
        select: employeeSelect,
        orderBy: [
          {
            employeeCode: "asc"
          },
          {
            firstName: "asc"
          }
        ],
        skip: pagination.skip,
        take: pagination.take
      })
    ]);

    res.status(200).json(ok({ employees }, getPaginationMeta({ total, pagination })));
  })
);

performanceRouter.get(
  "/goals",
  requireAnyPermission(["performance:read", "performance:manage"]),
  asyncHandler(async (req, res) => {
    const query = parseInput(goalQuerySchema, req.query);
    const scopedWhere = await buildScopedPerformanceWhere(req, query.employeeId);
    const pagination = getPagination(query);
    const where: Prisma.GoalWhereInput = {
      ...scopedWhere,
      ...(query.status ? { status: query.status } : {})
    };
    const [total, goals] = await prisma.$transaction([
      prisma.goal.count({
        where
      }),
      prisma.goal.findMany({
        where,
        include: goalInclude,
        orderBy: [
          {
            dueDate: "asc"
          },
          {
            createdAt: "desc"
          }
        ],
        skip: pagination.skip,
        take: pagination.take
      })
    ]);

    res.status(200).json(ok({ goals }, getPaginationMeta({ total, pagination })));
  })
);

performanceRouter.post(
  "/goals",
  requirePermissions(["performance:manage"]),
  asyncHandler(async (req, res) => {
    const body = parseInput(goalBodySchema, req.body);

    await assertEmployeeInPerformanceScope(req, body.employeeId);

    try {
      const goal = await prisma.goal.create({
        data: {
          employeeId: body.employeeId,
          title: body.title,
          description: body.description,
          status: body.status,
          progress: body.progress,
          startDate: nullableDateToPrisma(body.startDate),
          dueDate: nullableDateToPrisma(body.dueDate),
          createdById: assertAuthenticated(req).id
        },
        include: goalInclude
      });

      res.status(201).json(ok({ goal }));
    } catch (error) {
      handlePrismaMutationError(error);
    }
  })
);

performanceRouter.put(
  "/goals/:id",
  requirePermissions(["performance:manage"]),
  asyncHandler(async (req, res) => {
    const params = parseInput(paramsSchema, req.params);
    const body = parseInput(goalUpdateBodySchema, req.body);
    const existingGoal = await prisma.goal.findUnique({
      where: {
        id: params.id
      },
      select: {
        employeeId: true
      }
    });

    if (!existingGoal) {
      throw new AppError(404, "GOAL_NOT_FOUND", "Goal was not found");
    }

    await assertEmployeeInPerformanceScope(req, existingGoal.employeeId);

    try {
      const data: Prisma.GoalUpdateInput = {};

      if (body.title !== undefined) {
        data.title = body.title;
      }

      if (body.description !== undefined) {
        data.description = body.description;
      }

      if (body.status !== undefined) {
        data.status = body.status;
      }

      if (body.progress !== undefined) {
        data.progress = body.progress;
      }

      if (body.startDate !== undefined) {
        data.startDate = nullableDateToPrisma(body.startDate);
      }

      if (body.dueDate !== undefined) {
        data.dueDate = nullableDateToPrisma(body.dueDate);
      }

      const goal = await prisma.goal.update({
        where: {
          id: params.id
        },
        data,
        include: goalInclude
      });

      res.status(200).json(ok({ goal }));
    } catch (error) {
      handlePrismaMutationError(error);
    }
  })
);

performanceRouter.get(
  "/performance-reviews",
  requireAnyPermission(["performance:read", "performance:manage"]),
  asyncHandler(async (req, res) => {
    const query = parseInput(reviewQuerySchema, req.query);
    const scopedWhere = await buildScopedPerformanceWhere(req, query.employeeId);
    const pagination = getPagination(query);
    const where: Prisma.PerformanceReviewWhereInput = {
      ...scopedWhere,
      ...(query.status ? { status: query.status } : {}),
      ...(query.cycle ? { cycle: query.cycle } : {})
    };
    const [total, reviews] = await prisma.$transaction([
      prisma.performanceReview.count({
        where
      }),
      prisma.performanceReview.findMany({
        where,
        include: reviewInclude,
        orderBy: [
          {
            reviewPeriodEnd: "desc"
          },
          {
            createdAt: "desc"
          }
        ],
        skip: pagination.skip,
        take: pagination.take
      })
    ]);

    res.status(200).json(ok({ reviews }, getPaginationMeta({ total, pagination })));
  })
);

performanceRouter.post(
  "/performance-reviews",
  requirePermissions(["performance:manage"]),
  asyncHandler(async (req, res) => {
    const body = parseInput(reviewBodySchema, req.body);
    const reviewPeriodStart = toDateOnlyFromInput(body.reviewPeriodStart);
    const reviewPeriodEnd = toDateOnlyFromInput(body.reviewPeriodEnd);

    assertDateOrder(reviewPeriodStart, reviewPeriodEnd);
    await assertEmployeeInPerformanceScope(req, body.employeeId);

    try {
      const ownEmployee = await prisma.employee.findUnique({
        where: {
          userId: assertAuthenticated(req).id
        },
        select: {
          id: true
        }
      });
      const review = await prisma.performanceReview.create({
        data: {
          employeeId: body.employeeId,
          reviewerId: body.reviewerId ?? ownEmployee?.id ?? null,
          cycle: body.cycle,
          reviewPeriodStart,
          reviewPeriodEnd,
          rating: body.rating,
          summary: body.summary,
          strengths: body.strengths,
          improvements: body.improvements,
          status: body.status,
          submittedAt: getSubmittedAt(body.status)
        },
        include: reviewInclude
      });

      res.status(201).json(ok({ review }));
    } catch (error) {
      handlePrismaMutationError(error);
    }
  })
);

performanceRouter.put(
  "/performance-reviews/:id/status",
  requirePermissions(["performance:manage"]),
  asyncHandler(async (req, res) => {
    const params = parseInput(paramsSchema, req.params);
    const body = parseInput(reviewStatusBodySchema, req.body);
    const existingReview = await prisma.performanceReview.findUnique({
      where: {
        id: params.id
      },
      select: {
        employeeId: true
      }
    });

    if (!existingReview) {
      throw new AppError(404, "REVIEW_NOT_FOUND", "Performance review was not found");
    }

    await assertEmployeeInPerformanceScope(req, existingReview.employeeId);

    try {
      const review = await prisma.performanceReview.update({
        where: {
          id: params.id
        },
        data: {
          status: body.status,
          submittedAt: getSubmittedAt(body.status)
        },
        include: reviewInclude
      });

      res.status(200).json(ok({ review }));
    } catch (error) {
      handlePrismaMutationError(error);
    }
  })
);

performanceRouter.get(
  "/feedback",
  requireAnyPermission(["performance:read", "performance:manage"]),
  asyncHandler(async (req, res) => {
    const query = parseInput(feedbackQuerySchema, req.query);
    const scopedWhere = await buildScopedPerformanceWhere(req, query.employeeId);
    const pagination = getPagination(query);
    const where: Prisma.FeedbackWhereInput = {
      ...scopedWhere,
      ...(query.category ? { category: query.category } : {})
    };
    const [total, feedback] = await prisma.$transaction([
      prisma.feedback.count({
        where
      }),
      prisma.feedback.findMany({
        where,
        include: feedbackInclude,
        orderBy: {
          createdAt: "desc"
        },
        skip: pagination.skip,
        take: pagination.take
      })
    ]);

    res.status(200).json(ok({ feedback }, getPaginationMeta({ total, pagination })));
  })
);

performanceRouter.post(
  "/feedback",
  requirePermissions(["performance:manage"]),
  asyncHandler(async (req, res) => {
    const body = parseInput(feedbackBodySchema, req.body);

    await assertEmployeeInPerformanceScope(req, body.employeeId);

    try {
      const ownEmployee = await prisma.employee.findUnique({
        where: {
          userId: assertAuthenticated(req).id
        },
        select: {
          id: true
        }
      });
      const feedback = await prisma.feedback.create({
        data: {
          employeeId: body.employeeId,
          authorId: ownEmployee?.id ?? null,
          category: body.category,
          message: body.message,
          isPrivate: body.isPrivate
        },
        include: feedbackInclude
      });

      res.status(201).json(ok({ feedback }));
    } catch (error) {
      handlePrismaMutationError(error);
    }
  })
);
