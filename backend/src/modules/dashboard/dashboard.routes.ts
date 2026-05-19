import type { Request } from "express";
import { Router } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { authenticate } from "../../middleware/authenticate";
import { requirePermissions } from "../../middleware/authorize";
import { AppError } from "../../middleware/error-handler";
import { ok } from "../../utils/api-response";
import { asyncHandler } from "../../utils/async-handler";

export const dashboardRouter = Router();

type DashboardCard = {
  key: string;
  label: string;
  value: string;
  detail: string;
  tone: "brand" | "blue" | "amber" | "slate";
};

function assertAuthenticated(req: Request) {
  if (!req.auth) {
    throw new AppError(401, "AUTHENTICATION_REQUIRED", "A valid access token is required");
  }

  return req.auth;
}

function hasPermission(req: Request, permission: string): boolean {
  return assertAuthenticated(req).permissions.includes(permission);
}

function toDateOnlyFromDate(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

function getMonthRange(date: Date): { monthStart: Date; monthEnd: Date } {
  const monthStart = new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1));
  const monthEnd = new Date(Date.UTC(date.getFullYear(), date.getMonth() + 1, 0));

  return { monthStart, monthEnd };
}

function getYearRange(date: Date): { yearStart: Date; yearEnd: Date } {
  const yearStart = new Date(Date.UTC(date.getFullYear(), 0, 1));
  const yearEnd = new Date(Date.UTC(date.getFullYear(), 11, 31));

  return { yearStart, yearEnd };
}

function getUserAudiences(roles: string[]): Array<"ALL" | "SUPER_ADMIN" | "HR_ADMIN" | "MANAGER" | "EMPLOYEE"> {
  return ["ALL", ...roles] as Array<"ALL" | "SUPER_ADMIN" | "HR_ADMIN" | "MANAGER" | "EMPLOYEE">;
}

async function getScopedEmployeeWhere(req: Request): Promise<Prisma.EmployeeWhereInput> {
  const auth = assertAuthenticated(req);

  if (hasPermission(req, "employees:manage") || hasPermission(req, "reports:read")) {
    return {};
  }

  const employee = await prisma.employee.findUnique({
    where: {
      userId: auth.id
    }
  });

  if (!employee) {
    return {
      id: "__none__"
    };
  }

  if (hasPermission(req, "attendance:read") || hasPermission(req, "leave:approve")) {
    return {
      managerId: employee.id
    };
  }

  return {
    id: employee.id
  };
}

dashboardRouter.use(authenticate);

dashboardRouter.get(
  "/dashboard/summary",
  requirePermissions(["dashboard:read"]),
  asyncHandler(async (req, res) => {
    const auth = assertAuthenticated(req);
    const now = new Date();
    const today = toDateOnlyFromDate(now);
    const { monthStart, monthEnd } = getMonthRange(now);
    const { yearStart, yearEnd } = getYearRange(now);
    const employeeWhere = await getScopedEmployeeWhere(req);
    const canSeeOrgMetrics =
      hasPermission(req, "employees:manage") || hasPermission(req, "reports:read");
    const canSeePayroll =
      hasPermission(req, "payroll:manage") || hasPermission(req, "reports:read");
    const employeeCount = await prisma.employee.count({
      where: employeeWhere
    });
    const activeEmployeeCount = await prisma.employee.count({
      where: {
        ...employeeWhere,
        status: {
          in: ["ONBOARDING", "ACTIVE", "PROBATION"]
        }
      }
    });
    const presentTodayCount = await prisma.attendance.count({
      where: {
        date: today,
        status: {
          in: ["PRESENT", "LATE", "HALF_DAY", "WORK_FROM_HOME"]
        },
        employee: employeeWhere
      }
    });
    const employeesOnLeaveCount = await prisma.leaveRequest.count({
      where: {
        status: "APPROVED",
        startDate: {
          lte: today
        },
        endDate: {
          gte: today
        },
        employee: employeeWhere
      }
    });
    const pendingLeaveCount = await prisma.leaveRequest.count({
      where: {
        status: "PENDING",
        employee: employeeWhere
      }
    });
    const newHireCount = await prisma.employee.count({
      where: {
        ...employeeWhere,
        dateOfJoining: {
          gte: monthStart,
          lte: monthEnd
        }
      }
    });
    const exitCount = await prisma.employee.count({
      where: {
        ...employeeWhere,
        dateOfExit: {
          gte: yearStart,
          lte: yearEnd
        }
      }
    });
    const monthlyPayroll = canSeePayroll
      ? await prisma.payroll.findUnique({
          where: {
            month_year: {
              month: now.getMonth() + 1,
              year: now.getFullYear()
            }
          }
        })
      : null;
    const unreadNotifications = await prisma.notification.count({
      where: {
        userId: auth.id,
        isRead: false
      }
    });
    const notifications = await prisma.notification.findMany({
      where: {
        userId: auth.id
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 5
    });
    const announcements = await prisma.announcement.findMany({
      where: {
        isPublished: true,
        audience: {
          in: getUserAudiences(auth.roles)
        }
      },
      orderBy: {
        publishedAt: "desc"
      },
      take: 5
    });
    const attritionRate =
      canSeeOrgMetrics && activeEmployeeCount + exitCount > 0
        ? `${((exitCount / (activeEmployeeCount + exitCount)) * 100).toFixed(1)}%`
        : "0.0%";
    const cards: DashboardCard[] = [
      {
        key: "employees",
        label: canSeeOrgMetrics ? "Total Employees" : "Team Members",
        value: String(employeeCount),
        detail: `${activeEmployeeCount} active records`,
        tone: "brand"
      },
      {
        key: "present_today",
        label: "Present Today",
        value: String(presentTodayCount),
        detail: "Marked attendance today",
        tone: "blue"
      },
      {
        key: "on_leave",
        label: "On Leave",
        value: String(employeesOnLeaveCount),
        detail: "Approved leave today",
        tone: "amber"
      },
      {
        key: "pending_leaves",
        label: "Pending Leave",
        value: String(pendingLeaveCount),
        detail: "Awaiting review",
        tone: "slate"
      },
      {
        key: "monthly_payroll",
        label: "Monthly Payroll",
        value: canSeePayroll ? String(monthlyPayroll?.totalNet ?? 0) : "-",
        detail: canSeePayroll ? "Net payroll cost" : "Restricted",
        tone: "brand"
      },
      {
        key: "new_hires",
        label: "New Hires",
        value: String(newHireCount),
        detail: "Joined this month",
        tone: "blue"
      },
      {
        key: "attrition_rate",
        label: "Attrition Rate",
        value: attritionRate,
        detail: "Current calendar year",
        tone: "amber"
      },
      {
        key: "unread_notifications",
        label: "Unread Alerts",
        value: String(unreadNotifications),
        detail: "In-app notifications",
        tone: "slate"
      }
    ];

    res.status(200).json(
      ok({
        cards,
        notifications,
        announcements,
        scope: canSeeOrgMetrics ? "organization" : "self_or_team"
      })
    );
  })
);
