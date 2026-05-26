import type { Request } from "express";
import { Router } from "express";
import { Prisma } from "@prisma/client";
import { env } from "../../config/env";
import { getCachedJson, setCachedJson } from "../../lib/cache";
import { getDashboardCacheKey } from "../../lib/dashboard-cache";
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

type DashboardSummaryPayload = {
  cards: DashboardCard[];
  notifications: Prisma.NotificationGetPayload<Record<string, never>>[];
  announcements: Prisma.AnnouncementGetPayload<Record<string, never>>[];
  scope: "organization" | "self_or_team";
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

function getScopedUserWhere(req: Request): Prisma.UserWhereInput {
  const auth = assertAuthenticated(req);

  if (hasPermission(req, "employees:manage") || hasPermission(req, "reports:read")) {
    return {};
  }

  return {
    id: auth.id
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
    const cacheKey = getDashboardCacheKey({
      userId: auth.id,
      roles: auth.roles,
      permissions: auth.permissions,
      date: today
    });
    const cachedSummary = await getCachedJson<DashboardSummaryPayload>(cacheKey);

    if (cachedSummary) {
      res.status(200).json(ok(cachedSummary, { cache: "hit" }));
      return;
    }

    const employeeWhere = await getScopedEmployeeWhere(req);
    const canSeeOrgMetrics =
      hasPermission(req, "employees:manage") || hasPermission(req, "reports:read");
    const canSeePayroll =
      hasPermission(req, "payroll:manage") || hasPermission(req, "reports:read");
    const userWhere = getScopedUserWhere(req);
    const [
      employeeCount,
      activeEmployeeCount,
      userCount,
      activeUserCount,
      presentTodayCount,
      employeesOnLeaveCount,
      pendingLeaveCount,
      newHireCount,
      newUserCount,
      exitCount,
      monthlyPayroll,
      unreadNotifications,
      notifications,
      announcements
    ] = await Promise.all([
      prisma.employee.count({
        where: employeeWhere
      }),
      prisma.employee.count({
        where: {
          ...employeeWhere,
          status: {
            in: ["ONBOARDING", "ACTIVE", "PROBATION"]
          }
        }
      }),
      prisma.user.count({
        where: userWhere
      }),
      prisma.user.count({
        where: {
          ...userWhere,
          status: "ACTIVE"
        }
      }),
      prisma.attendance.count({
        where: {
          date: today,
          status: {
            in: ["PRESENT", "LATE", "HALF_DAY", "WORK_FROM_HOME"]
          },
          employee: employeeWhere
        }
      }),
      prisma.leaveRequest.count({
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
      }),
      prisma.leaveRequest.count({
        where: {
          status: "PENDING",
          employee: employeeWhere
        }
      }),
      prisma.employee.count({
        where: {
          ...employeeWhere,
          dateOfJoining: {
            gte: monthStart,
            lte: monthEnd
          }
        }
      }),
      prisma.user.count({
        where: {
          ...userWhere,
          createdAt: {
            gte: monthStart,
            lte: monthEnd
          }
        }
      }),
      prisma.employee.count({
        where: {
          ...employeeWhere,
          dateOfExit: {
            gte: yearStart,
            lte: yearEnd
          }
        }
      }),
      canSeePayroll
        ? prisma.payroll.findUnique({
            where: {
              month_year: {
                month: now.getMonth() + 1,
                year: now.getFullYear()
              }
            }
          })
        : Promise.resolve(null),
      prisma.notification.count({
        where: {
          userId: auth.id,
          isRead: false
        }
      }),
      prisma.notification.findMany({
        where: {
          userId: auth.id
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 5
      }),
      prisma.announcement.findMany({
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
      })
    ]);
    const useUserMetrics = employeeCount === 0 && userCount > 0;
    const totalPeopleCount = useUserMetrics ? userCount : employeeCount;
    const activePeopleCount = useUserMetrics ? activeUserCount : activeEmployeeCount;
    const monthlyJoinCount = useUserMetrics ? newUserCount : newHireCount;
    const attritionRate =
      canSeeOrgMetrics && !useUserMetrics && activeEmployeeCount + exitCount > 0
        ? `${((exitCount / (activeEmployeeCount + exitCount)) * 100).toFixed(1)}%`
        : "0.0%";
    const cards: DashboardCard[] = [
      {
        key: "employees",
        label: useUserMetrics
          ? "Total Users"
          : canSeeOrgMetrics
            ? "Total Employees"
            : "Team Members",
        value: String(totalPeopleCount),
        detail: `${activePeopleCount} active ${useUserMetrics ? "users" : "records"}`,
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
        label: useUserMetrics ? "New Users" : "New Hires",
        value: String(monthlyJoinCount),
        detail: useUserMetrics ? "Created this month" : "Joined this month",
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

    const summary: DashboardSummaryPayload = {
      cards,
      notifications,
      announcements,
      scope: canSeeOrgMetrics ? "organization" : "self_or_team"
    };

    await setCachedJson(cacheKey, summary, env.DASHBOARD_CACHE_TTL_SECONDS);

    res.status(200).json(ok(summary, { cache: "miss" }));
  })
);
