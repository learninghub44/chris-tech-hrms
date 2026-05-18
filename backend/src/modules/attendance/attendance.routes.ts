import type { Request } from "express";
import { Router } from "express";
import { AttendanceStatus, AttendanceWorkMode, HolidayType, Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { authenticate } from "../../middleware/authenticate";
import { requireAnyPermission, requirePermissions } from "../../middleware/authorize";
import { AppError } from "../../middleware/error-handler";
import { ok } from "../../utils/api-response";
import { asyncHandler } from "../../utils/async-handler";

export const attendanceRouter = Router();

const attendanceInclude = {
  employee: {
    select: {
      id: true,
      employeeCode: true,
      firstName: true,
      lastName: true,
      workEmail: true,
      department: true,
      designation: true
    }
  },
  shift: true
} satisfies Prisma.AttendanceInclude;

const timeSchema = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must use HH:mm format");

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

const uuidSchema = z.string().uuid();

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

const dateInputSchema = z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/);

const clockInSchema = z.object({
  workMode: z.nativeEnum(AttendanceWorkMode),
  notes: nullableStringSchema(300)
});

const clockOutSchema = z.object({
  notes: nullableStringSchema(300)
});

const attendanceQuerySchema = z.object({
  dateFrom: dateInputSchema.optional(),
  dateTo: dateInputSchema.optional()
});

const attendanceReportQuerySchema = z.object({
  dateFrom: dateInputSchema.optional(),
  dateTo: dateInputSchema.optional(),
  employeeId: uuidSchema.optional(),
  departmentId: uuidSchema.optional(),
  status: z.nativeEnum(AttendanceStatus).optional()
});

const shiftBodySchema = z.object({
  name: z.string().trim().min(2).max(100),
  startTime: timeSchema,
  endTime: timeSchema,
  lateAfterMinutes: z.number().int().min(0).max(240),
  halfDayAfterMinutes: z.number().int().min(60).max(720),
  isDefault: z.boolean(),
  isActive: z.boolean()
});

const holidayBodySchema = z.object({
  name: z.string().trim().min(2).max(120),
  date: dateInputSchema,
  type: z.nativeEnum(HolidayType),
  description: nullableStringSchema(300)
});

const holidayQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100).optional()
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

function toDateOnlyFromDate(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

function toDateOnlyFromInput(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, day));
}

function getDefaultDateRange(): { dateFrom: Date; dateTo: Date } {
  const now = new Date();
  const dateTo = toDateOnlyFromDate(now);
  const dateFrom = new Date(dateTo);
  dateFrom.setUTCDate(dateFrom.getUTCDate() - 30);

  return { dateFrom, dateTo };
}

function parseTimeToMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);

  return hours * 60 + minutes;
}

function getMinutesFromLocalMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

function computeClockInStatus(
  now: Date,
  shift: { startTime: string; lateAfterMinutes: number },
  workMode: AttendanceWorkMode
): AttendanceStatus {
  if (workMode === "WORK_FROM_HOME") {
    return "WORK_FROM_HOME";
  }

  const lateAfter = parseTimeToMinutes(shift.startTime) + shift.lateAfterMinutes;

  return getMinutesFromLocalMidnight(now) > lateAfter ? "LATE" : "PRESENT";
}

function computeClockOutStatus(input: {
  currentStatus: AttendanceStatus;
  clockInAt: Date;
  clockOutAt: Date;
  halfDayAfterMinutes: number;
}): AttendanceStatus {
  const workedMinutes =
    (input.clockOutAt.getTime() - input.clockInAt.getTime()) / 60_000;

  if (workedMinutes < input.halfDayAfterMinutes) {
    return "HALF_DAY";
  }

  return input.currentStatus;
}

async function getEmployeeForAuth(req: Request) {
  const auth = assertAuthenticated(req);
  const employee = await prisma.employee.findUnique({
    where: {
      userId: auth.id
    }
  });

  if (!employee) {
    throw new AppError(400, "EMPLOYEE_PROFILE_REQUIRED", "This account is not linked to an employee record");
  }

  return employee;
}

async function getDefaultShift() {
  const shift = await prisma.shift.findFirst({
    where: {
      isActive: true
    },
    orderBy: [
      {
        isDefault: "desc"
      },
      {
        createdAt: "asc"
      }
    ]
  });

  if (!shift) {
    throw new AppError(400, "SHIFT_NOT_CONFIGURED", "Create an active shift before recording attendance");
  }

  return shift;
}

function handlePrismaMutationError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      throw new AppError(409, "DUPLICATE_RECORD", "A record with the same unique value already exists");
    }

    if (error.code === "P2003") {
      throw new AppError(400, "INVALID_REFERENCE", "One of the selected related records does not exist");
    }
  }

  throw error;
}

attendanceRouter.use(authenticate);

attendanceRouter.post(
  "/attendance/clock-in",
  requirePermissions(["attendance:write"]),
  asyncHandler(async (req, res) => {
    const body = parseInput(clockInSchema, req.body);
    const employee = await getEmployeeForAuth(req);
    const shift = await getDefaultShift();
    const now = new Date();
    const today = toDateOnlyFromDate(now);

    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: employee.id,
          date: today
        }
      }
    });

    if (existingAttendance?.clockInAt) {
      throw new AppError(409, "ALREADY_CLOCKED_IN", "Attendance is already clocked in for today");
    }

    try {
      const attendance = await prisma.attendance.upsert({
        where: {
          employeeId_date: {
            employeeId: employee.id,
            date: today
          }
        },
        update: {
          clockInAt: now,
          shiftId: shift.id,
          workMode: body.workMode,
          status: computeClockInStatus(now, shift, body.workMode),
          notes: body.notes
        },
        create: {
          employeeId: employee.id,
          shiftId: shift.id,
          date: today,
          clockInAt: now,
          workMode: body.workMode,
          status: computeClockInStatus(now, shift, body.workMode),
          notes: body.notes
        },
        include: attendanceInclude
      });

      res.status(201).json(ok({ attendance }));
    } catch (error) {
      handlePrismaMutationError(error);
    }
  })
);

attendanceRouter.post(
  "/attendance/clock-out",
  requirePermissions(["attendance:write"]),
  asyncHandler(async (req, res) => {
    const body = parseInput(clockOutSchema, req.body);
    const employee = await getEmployeeForAuth(req);
    const now = new Date();
    const today = toDateOnlyFromDate(now);
    const attendance = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: employee.id,
          date: today
        }
      },
      include: {
        shift: true
      }
    });

    if (!attendance?.clockInAt) {
      throw new AppError(400, "CLOCK_IN_REQUIRED", "Clock in before clocking out");
    }

    if (attendance.clockOutAt) {
      throw new AppError(409, "ALREADY_CLOCKED_OUT", "Attendance is already clocked out for today");
    }

    const halfDayAfterMinutes = attendance.shift?.halfDayAfterMinutes ?? 240;

    const updatedAttendance = await prisma.attendance.update({
      where: {
        id: attendance.id
      },
      data: {
        clockOutAt: now,
        status: computeClockOutStatus({
          currentStatus: attendance.status,
          clockInAt: attendance.clockInAt,
          clockOutAt: now,
          halfDayAfterMinutes
        }),
        notes: body.notes ?? attendance.notes
      },
      include: attendanceInclude
    });

    res.status(200).json(ok({ attendance: updatedAttendance }));
  })
);

attendanceRouter.get(
  "/attendance/me",
  requirePermissions(["attendance:write"]),
  asyncHandler(async (req, res) => {
    const query = parseInput(attendanceQuerySchema, req.query);
    const employee = await getEmployeeForAuth(req);
    const defaultRange = getDefaultDateRange();
    const dateFrom = query.dateFrom ? toDateOnlyFromInput(query.dateFrom) : defaultRange.dateFrom;
    const dateTo = query.dateTo ? toDateOnlyFromInput(query.dateTo) : defaultRange.dateTo;
    const today = toDateOnlyFromDate(new Date());
    const attendance = await prisma.attendance.findMany({
      where: {
        employeeId: employee.id,
        date: {
          gte: dateFrom,
          lte: dateTo
        }
      },
      include: attendanceInclude,
      orderBy: {
        date: "desc"
      }
    });
    const todayAttendance = attendance.find(
      (record) => record.date.getTime() === today.getTime()
    ) ?? null;

    res.status(200).json(ok({ attendance, todayAttendance }));
  })
);

attendanceRouter.get(
  "/attendance/report",
  requirePermissions(["attendance:read"]),
  asyncHandler(async (req, res) => {
    const query = parseInput(attendanceReportQuerySchema, req.query);
    const auth = assertAuthenticated(req);
    const defaultRange = getDefaultDateRange();
    const dateFrom = query.dateFrom ? toDateOnlyFromInput(query.dateFrom) : defaultRange.dateFrom;
    const dateTo = query.dateTo ? toDateOnlyFromInput(query.dateTo) : defaultRange.dateTo;
    const where: Prisma.AttendanceWhereInput = {
      date: {
        gte: dateFrom,
        lte: dateTo
      }
    };
    const employeeWhere: Prisma.EmployeeWhereInput = {};

    if (query.employeeId) {
      where.employeeId = query.employeeId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.departmentId) {
      employeeWhere.departmentId = query.departmentId;
    }

    if (!auth.permissions.includes("employees:manage")) {
      const manager = await prisma.employee.findUnique({
        where: {
          userId: auth.id
        }
      });

      if (!manager) {
        throw new AppError(400, "EMPLOYEE_PROFILE_REQUIRED", "This account is not linked to an employee record");
      }

      employeeWhere.managerId = manager.id;
    }

    if (Object.keys(employeeWhere).length > 0) {
      where.employee = employeeWhere;
    }

    const attendance = await prisma.attendance.findMany({
      where,
      include: attendanceInclude,
      orderBy: [
        {
          date: "desc"
        },
        {
          createdAt: "desc"
        }
      ]
    });

    res.status(200).json(ok({ attendance }, { total: attendance.length }));
  })
);

attendanceRouter.get(
  "/shifts",
  requireAnyPermission(["attendance:manage", "attendance:read", "attendance:write"]),
  asyncHandler(async (_req, res) => {
    const shifts = await prisma.shift.findMany({
      orderBy: [
        {
          isDefault: "desc"
        },
        {
          createdAt: "asc"
        }
      ]
    });

    res.status(200).json(ok({ shifts }, { total: shifts.length }));
  })
);

attendanceRouter.post(
  "/shifts",
  requirePermissions(["attendance:manage"]),
  asyncHandler(async (req, res) => {
    const body = parseInput(shiftBodySchema, req.body);

    try {
      const shift = await prisma.$transaction(async (transaction) => {
        if (body.isDefault) {
          await transaction.shift.updateMany({
            where: {
              isDefault: true
            },
            data: {
              isDefault: false
            }
          });
        }

        return transaction.shift.create({
          data: body
        });
      });

      res.status(201).json(ok({ shift }));
    } catch (error) {
      handlePrismaMutationError(error);
    }
  })
);

attendanceRouter.get(
  "/holidays",
  requireAnyPermission([
    "attendance:manage",
    "attendance:read",
    "leave:request",
    "leave:approve",
    "leave:manage"
  ]),
  asyncHandler(async (req, res) => {
    const query = parseInput(holidayQuerySchema, req.query);
    const year = query.year ?? new Date().getFullYear();
    const dateFrom = new Date(Date.UTC(year, 0, 1));
    const dateTo = new Date(Date.UTC(year, 11, 31));
    const holidays = await prisma.holiday.findMany({
      where: {
        date: {
          gte: dateFrom,
          lte: dateTo
        }
      },
      orderBy: {
        date: "asc"
      }
    });

    res.status(200).json(ok({ holidays }, { total: holidays.length }));
  })
);

attendanceRouter.post(
  "/holidays",
  requireAnyPermission(["attendance:manage", "leave:manage"]),
  asyncHandler(async (req, res) => {
    const body = parseInput(holidayBodySchema, req.body);

    try {
      const holiday = await prisma.holiday.create({
        data: {
          name: body.name,
          date: toDateOnlyFromInput(body.date),
          type: body.type,
          description: body.description
        }
      });

      res.status(201).json(ok({ holiday }));
    } catch (error) {
      handlePrismaMutationError(error);
    }
  })
);
