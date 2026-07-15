import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { createApp } from "../src/app";
import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/modules/auth/password";

type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
};

type ApiFailure = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

type LoginData = {
  token: string;
  user: {
    id: string;
    email: string;
  };
};

type EmployeeRecord = {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  workEmail: string;
  documents?: Array<{
    fileName: string;
  }>;
};

type LeaveRequestRecord = {
  id: string;
  status: string;
  totalDays: number;
};

type PayrollRecord = {
  id: string;
  items: Array<{
    employeeId: string;
    baseSalary: number;
    allowances: number;
    deductions: number;
    netPay: number;
  }>;
};

type SmokeContext = {
  baseUrl: string;
  adminToken: string;
  employeeToken: string;
  employeeId: string;
  leaveTypeId: string;
  salaryId: string;
  leaveDate: string;
  leaveYear: number;
};

const adminEmail = "admin@hrms.local";
const adminPassword = process.env.SMOKE_ADMIN_PASSWORD ?? "Admin@12345";
const smokeEmployeeEmail = "phase10.employee@hrms.local";
const smokeEmployeePassword = "Employee@12345";
const smokeEmployeeCode = "SMOKE-EMP-001";
const smokeLeaveTypeName = "Smoke Unpaid Leave";
const smokePayrollMonth = 12;
const smokePayrollYear = 2099;

// Second-company credentials, seeded in prisma/seed.ts specifically to give
// Phase 3 (MULTI_TENANT_ROADMAP.md) cross-tenant isolation checks a real
// second tenant's rows to assert against.
const secondCompanyAdminEmail = "admin@northwind-demo.local";
const secondCompanyAdminPassword =
  process.env.SEED_SECOND_COMPANY_ADMIN_PASSWORD ?? "Admin@12345";
const secondCompanyEmployeeCode = "EMP-N001";

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function assertSuccess<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new Error(`${response.error.code}: ${response.error.message}`);
  }

  return response.data;
}

function assertFailure<T>(response: ApiResponse<T>, code: string): void {
  if (response.success) {
    throw new Error(`Expected request to fail with ${code}`);
  }

  assert(response.error.code === code, `Expected ${code}, received ${response.error.code}`);
}

function toDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function toDateOnlyFromDate(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

function getFutureBusinessDate(): Date {
  const date = new Date(Date.UTC(smokePayrollYear, 10, 30));

  while (date.getUTCDay() === 0 || date.getUTCDay() === 6) {
    date.setUTCDate(date.getUTCDate() + 1);
  }

  return date;
}

async function listen(): Promise<{ server: Server; baseUrl: string }> {
  const app = createApp();

  return new Promise((resolve, reject) => {
    const server = app.listen(0, "127.0.0.1", () => {
      const address = server.address() as AddressInfo | null;

      if (!address) {
        reject(new Error("Smoke test server did not expose an address"));
        return;
      }

      resolve({
        server,
        baseUrl: `http://127.0.0.1:${address.port}`
      });
    });

    server.on("error", reject);
  });
}

async function closeServer(server: Server): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

async function request<T>(input: {
  baseUrl: string;
  path: string;
  method?: "GET" | "POST" | "PUT";
  token?: string;
  body?: Record<string, unknown>;
  expectedStatus?: number;
}): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {};

  if (input.body !== undefined) {
    headers["content-type"] = "application/json";
  }

  if (input.token) {
    headers.authorization = `Bearer ${input.token}`;
  }

  const response = await fetch(`${input.baseUrl}${input.path}`, {
    method: input.method ?? "GET",
    headers,
    body: input.body === undefined ? undefined : JSON.stringify(input.body)
  });
  const payload = (await response.json()) as ApiResponse<T>;
  const expectedStatus = input.expectedStatus ?? 200;

  if (response.status !== expectedStatus) {
    throw new Error(
      `${input.method ?? "GET"} ${input.path} returned ${response.status}, expected ${expectedStatus}: ${JSON.stringify(payload)}`
    );
  }

  return payload;
}

async function check(name: string, action: () => Promise<void>): Promise<void> {
  await action();
  console.log(`OK: ${name}`);
}

async function login(baseUrl: string, email: string, password: string): Promise<LoginData> {
  return assertSuccess(
    await request<LoginData>({
      baseUrl,
      path: "/api/auth/login",
      method: "POST",
      body: {
        email,
        password
      }
    })
  );
}

async function ensureSmokeData(): Promise<{
  employeeId: string;
  leaveTypeId: string;
  salaryId: string;
  leaveDate: string;
  leaveYear: number;
}> {
  const employeeRole = await prisma.role.findUnique({
    where: {
      name: "EMPLOYEE"
    }
  });

  if (!employeeRole) {
    throw new Error("EMPLOYEE role is missing. Run npm run db:seed before smoke testing.");
  }

  const passwordHash = await hashPassword(smokeEmployeePassword);
  const user = await prisma.user.upsert({
    where: {
      email: smokeEmployeeEmail
    },
    update: {
      name: "Phase 10 Smoke Employee",
      passwordHash,
      status: "ACTIVE"
    },
    create: {
      email: smokeEmployeeEmail,
      name: "Phase 10 Smoke Employee",
      passwordHash,
      status: "ACTIVE"
    }
  });

  await prisma.userRole.deleteMany({
    where: {
      userId: user.id,
      roleId: {
        not: employeeRole.id
      }
    }
  });
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: user.id,
        roleId: employeeRole.id
      }
    },
    update: {},
    create: {
      userId: user.id,
      roleId: employeeRole.id
    }
  });
  await prisma.employee.updateMany({
    where: {
      userId: user.id,
      employeeCode: {
        not: smokeEmployeeCode
      }
    },
    data: {
      userId: null
    }
  });

  const employee = await prisma.employee.upsert({
    where: {
      employeeCode: smokeEmployeeCode
    },
    update: {
      userId: user.id,
      firstName: "Phase",
      lastName: "Smoke",
      workEmail: smokeEmployeeEmail,
      status: "ACTIVE",
      location: "Smoke Test"
    },
    create: {
      employeeCode: smokeEmployeeCode,
      userId: user.id,
      firstName: "Phase",
      lastName: "Smoke",
      workEmail: smokeEmployeeEmail,
      dateOfJoining: new Date("2026-05-19T00:00:00.000Z"),
      status: "ACTIVE",
      location: "Smoke Test"
    }
  });
  const leaveType = await prisma.leaveType.upsert({
    where: {
      name: smokeLeaveTypeName
    },
    update: {
      description: "Test-owned unpaid leave type for smoke checks",
      defaultAnnualAllowance: 5,
      isPaid: false,
      requiresApproval: true,
      isActive: true
    },
    create: {
      name: smokeLeaveTypeName,
      description: "Test-owned unpaid leave type for smoke checks",
      defaultAnnualAllowance: 5,
      isPaid: false,
      requiresApproval: true,
      isActive: true
    }
  });
  const leaveDate = getFutureBusinessDate();
  const leaveYear = leaveDate.getUTCFullYear();

  await prisma.leaveRequest.deleteMany({
    where: {
      employeeId: employee.id,
      leaveTypeId: leaveType.id
    }
  });
  await prisma.leaveBalance.upsert({
    where: {
      employeeId_leaveTypeId_year: {
        employeeId: employee.id,
        leaveTypeId: leaveType.id,
        year: leaveYear
      }
    },
    update: {
      openingBalance: 5,
      accrued: 0,
      used: 0,
      pending: 0,
      available: 5
    },
    create: {
      employeeId: employee.id,
      leaveTypeId: leaveType.id,
      year: leaveYear,
      openingBalance: 5,
      available: 5
    }
  });
  await prisma.shift.upsert({
    where: {
      name: "General Shift"
    },
    update: {
      startTime: "09:30",
      endTime: "18:30",
      lateAfterMinutes: 15,
      halfDayAfterMinutes: 240,
      isDefault: true,
      isActive: true
    },
    create: {
      name: "General Shift",
      startTime: "09:30",
      endTime: "18:30",
      lateAfterMinutes: 15,
      halfDayAfterMinutes: 240,
      isDefault: true,
      isActive: true
    }
  });
  await prisma.attendance.deleteMany({
    where: {
      employeeId: employee.id,
      date: toDateOnlyFromDate(new Date())
    }
  });
  const salary = await prisma.salary.upsert({
    where: {
      employeeId: employee.id
    },
    update: {
      baseSalary: 5000,
      allowances: 500,
      deductions: 100,
      effectiveFrom: new Date("2099-01-01T00:00:00.000Z"),
      isActive: true
    },
    create: {
      employeeId: employee.id,
      baseSalary: 5000,
      allowances: 500,
      deductions: 100,
      effectiveFrom: new Date("2099-01-01T00:00:00.000Z"),
      isActive: true
    }
  });

  await prisma.payroll.deleteMany({
    where: {
      month: smokePayrollMonth,
      year: smokePayrollYear
    }
  });

  return {
    employeeId: employee.id,
    leaveTypeId: leaveType.id,
    salaryId: salary.id,
    leaveDate: toDateInput(leaveDate),
    leaveYear
  };
}

async function runSmoke(baseUrl: string): Promise<void> {
  await check("health endpoint and database connection", async () => {
    const health = assertSuccess(
      await request<{ database: string }>({
        baseUrl,
        path: "/api/health"
      })
    );

    assert(health.database === "connected", "Health endpoint did not confirm database connection");
  });

  const adminLogin = await login(baseUrl, adminEmail, adminPassword);
  const smokeData = await ensureSmokeData();
  const employeeLogin = await login(baseUrl, smokeEmployeeEmail, smokeEmployeePassword);
  let smokePayrollId: string | undefined;
  const context: SmokeContext = {
    baseUrl,
    adminToken: adminLogin.token,
    employeeToken: employeeLogin.token,
    ...smokeData
  };

  await check("auth session and unauthenticated rejection", async () => {
    const auth = assertSuccess(
      await request<{ authenticated: boolean }>({
        baseUrl,
        path: "/api/auth/me",
        token: context.adminToken
      })
    );
    const rejected = await request<unknown>({
      baseUrl,
      path: "/api/auth/me",
      expectedStatus: 401
    });

    assert(auth.authenticated, "Authenticated session was not returned");
    assertFailure(rejected, "AUTHENTICATION_REQUIRED");
  });

  await check("employee RBAC blocks employee list access", async () => {
    const rejected = await request<unknown>({
      baseUrl,
      path: "/api/employees",
      token: context.employeeToken,
      expectedStatus: 403
    });

    assertFailure(rejected, "PERMISSION_DENIED");
  });

  await check("employee profile, detail, and document upload", async () => {
    const list = assertSuccess(
      await request<{ employees: EmployeeRecord[] }>({
        baseUrl,
        path: `/api/employees?search=${smokeEmployeeCode}`,
        token: context.adminToken
      })
    );
    const employee = list.employees.find((record) => record.id === context.employeeId);

    assert(Boolean(employee), "Smoke employee was not returned by employee search");
    await request<{ document: { id: string } }>({
      baseUrl,
      path: `/api/employees/${context.employeeId}/documents`,
      method: "POST",
      token: context.adminToken,
      expectedStatus: 201,
      body: {
        documentType: "Smoke Check",
        fileName: "phase10-smoke.txt",
        fileUrl: "data:text/plain;base64,c21va2U=",
        mimeType: "text/plain",
        sizeBytes: 5,
        notes: "Created by smoke test"
      }
    });
    const detail = assertSuccess(
      await request<{ employee: EmployeeRecord }>({
        baseUrl,
        path: `/api/employees/${context.employeeId}`,
        token: context.adminToken
      })
    );

    assert(
      Boolean(detail.employee.documents?.some((document) => document.fileName === "phase10-smoke.txt")),
      "Uploaded smoke document was not returned on employee detail"
    );
  });

  await check("cross-tenant isolation: employees module (Phase 3)", async () => {
    const secondCompanyLogin = await login(baseUrl, secondCompanyAdminEmail, secondCompanyAdminPassword);

    // Company A (primary) admin lists employees — must never see Company B's
    // (Northwind) seeded employee codes.
    const primaryList = assertSuccess(
      await request<{ employees: EmployeeRecord[] }>({
        baseUrl,
        path: "/api/employees",
        token: context.adminToken
      })
    );

    assert(
      !primaryList.employees.some((record) => record.employeeCode === secondCompanyEmployeeCode),
      "Company A employee list leaked a Company B employee"
    );

    // Company B (Northwind) admin lists employees — must never see Company
    // A's smoke employee, and must only see its own seeded employees.
    const secondCompanyList = assertSuccess(
      await request<{ employees: EmployeeRecord[] }>({
        baseUrl,
        path: "/api/employees",
        token: secondCompanyLogin.token
      })
    );

    assert(
      !secondCompanyList.employees.some((record) => record.employeeCode === smokeEmployeeCode),
      "Company B employee list leaked Company A's smoke employee"
    );
    assert(
      secondCompanyList.employees.some((record) => record.employeeCode === secondCompanyEmployeeCode),
      "Company B employee list did not return its own seeded employee"
    );

    // Company B admin fetching Company A's employee by id directly must be
    // rejected as not found, not forbidden — a 403 would confirm the id
    // exists in another tenant, which is itself a leak.
    const crossTenantDetail = await request<unknown>({
      baseUrl,
      path: `/api/employees/${context.employeeId}`,
      token: secondCompanyLogin.token,
      expectedStatus: 404
    });

    assertFailure(crossTenantDetail, "EMPLOYEE_NOT_FOUND");

    // Company B admin attempting to update Company A's employee directly
    // must also be rejected as not found.
    const crossTenantUpdate = await request<unknown>({
      baseUrl,
      path: `/api/employees/${context.employeeId}`,
      method: "PUT",
      token: secondCompanyLogin.token,
      expectedStatus: 404,
      body: {
        location: "Should not be applied"
      }
    });

    assertFailure(crossTenantUpdate, "EMPLOYEE_NOT_FOUND");
  });

  await check("cross-tenant isolation: attendance module (Phase 4)", async () => {
    const secondCompanyLogin = await login(baseUrl, secondCompanyAdminEmail, secondCompanyAdminPassword);

    // Shifts: each company's default shift must be invisible to the other.
    const primaryShifts = assertSuccess(
      await request<{ shifts: Array<{ name: string }> }>({
        baseUrl,
        path: "/api/shifts",
        token: context.adminToken
      })
    );
    assert(
      !primaryShifts.shifts.some((shift) => shift.name === "Northwind Standard Shift"),
      "Company A shift list leaked Company B's shift"
    );

    const secondCompanyShifts = assertSuccess(
      await request<{ shifts: Array<{ name: string }> }>({
        baseUrl,
        path: "/api/shifts",
        token: secondCompanyLogin.token
      })
    );
    assert(
      !secondCompanyShifts.shifts.some((shift) => shift.name === "General Shift"),
      "Company B shift list leaked Company A's shift"
    );
    assert(
      secondCompanyShifts.shifts.some((shift) => shift.name === "Northwind Standard Shift"),
      "Company B shift list did not return its own seeded shift"
    );

    // Holidays: same isolation expectation, scoped by year.
    const primaryHolidays = assertSuccess(
      await request<{ holidays: Array<{ name: string }> }>({
        baseUrl,
        path: "/api/holidays?year=2026",
        token: context.adminToken
      })
    );
    assert(
      !primaryHolidays.holidays.some((holiday) => holiday.name === "Northwind Founders Day"),
      "Company A holiday list leaked Company B's holiday"
    );

    const secondCompanyHolidays = assertSuccess(
      await request<{ holidays: Array<{ name: string }> }>({
        baseUrl,
        path: "/api/holidays?year=2026",
        token: secondCompanyLogin.token
      })
    );
    assert(
      secondCompanyHolidays.holidays.some((holiday) => holiday.name === "Northwind Founders Day"),
      "Company B holiday list did not return its own seeded holiday"
    );

    // Attendance report: Company B must never see Company A's smoke employee.
    const secondCompanyReport = assertSuccess(
      await request<{ attendance: Array<{ employee: { employeeCode: string } }> }>({
        baseUrl,
        path: "/api/attendance/report",
        token: secondCompanyLogin.token
      })
    );
    assert(
      !secondCompanyReport.attendance.some(
        (record) => record.employee.employeeCode === smokeEmployeeCode
      ),
      "Company B attendance report leaked Company A's smoke employee"
    );
  });

  await check("cross-tenant isolation: leaves module (Phase 4)", async () => {
    const secondCompanyLogin = await login(baseUrl, secondCompanyAdminEmail, secondCompanyAdminPassword);

    // Leave types: each company's catalog must be invisible to the other.
    const primaryLeaveTypes = assertSuccess(
      await request<{ leaveTypes: Array<{ name: string }> }>({
        baseUrl,
        path: "/api/leave-types",
        token: context.adminToken
      })
    );
    assert(
      !primaryLeaveTypes.leaveTypes.some((leaveType) => leaveType.name === "Northwind Compassionate Leave"),
      "Company A leave-type list leaked Company B's leave type"
    );

    const secondCompanyLeaveTypes = assertSuccess(
      await request<{ leaveTypes: Array<{ name: string }> }>({
        baseUrl,
        path: "/api/leave-types",
        token: secondCompanyLogin.token
      })
    );
    assert(
      !secondCompanyLeaveTypes.leaveTypes.some((leaveType) => leaveType.name === "Sick Leave"),
      "Company B leave-type list leaked Company A's leave type"
    );
    assert(
      secondCompanyLeaveTypes.leaveTypes.some(
        (leaveType) => leaveType.name === "Northwind Compassionate Leave"
      ),
      "Company B leave-type list did not return its own seeded leave type"
    );

    // Leave balances: Company B's approver view must never include Company
    // A's smoke employee, even without an employeeId filter applied.
    const secondCompanyBalances = assertSuccess(
      await request<{ leaveBalances: Array<{ employee: { employeeCode: string } }> }>({
        baseUrl,
        path: "/api/leaves/balance",
        token: secondCompanyLogin.token
      })
    );
    assert(
      !secondCompanyBalances.leaveBalances.some(
        (balance) => balance.employee.employeeCode === smokeEmployeeCode
      ),
      "Company B leave balance list leaked Company A's smoke employee"
    );

    // Leave requests: Company B admin fetching Company A's leave request by
    // id directly must be rejected as not found, not forbidden.
    const primaryLeaves = assertSuccess(
      await request<{ leaveRequests: Array<{ id: string }> }>({
        baseUrl,
        path: `/api/leaves?employeeId=${context.employeeId}`,
        token: context.adminToken
      })
    );

    if (primaryLeaves.leaveRequests.length > 0) {
      const crossTenantApprove = await request<unknown>({
        baseUrl,
        path: `/api/leaves/${primaryLeaves.leaveRequests[0].id}/approve`,
        method: "PUT",
        token: secondCompanyLogin.token,
        expectedStatus: 404,
        body: {
          decisionNote: "Should not be applied"
        }
      });

      assertFailure(crossTenantApprove, "LEAVE_NOT_FOUND");
    }
  });

  await check("cross-tenant isolation: notifications module (Phase 4)", async () => {
    const secondCompanyLogin = await login(baseUrl, secondCompanyAdminEmail, secondCompanyAdminPassword);

    // Announcements: each company's announcements must be invisible to the other.
    const primaryAnnouncements = assertSuccess(
      await request<{ announcements: Array<{ title: string }> }>({
        baseUrl,
        path: "/api/announcements",
        token: context.adminToken
      })
    );
    assert(
      !primaryAnnouncements.announcements.some(
        (announcement) => announcement.title === "Northwind demo tenant-only announcement"
      ),
      "Company A announcement list leaked Company B's announcement"
    );

    const secondCompanyAnnouncements = assertSuccess(
      await request<{ announcements: Array<{ title: string }> }>({
        baseUrl,
        path: "/api/announcements",
        token: secondCompanyLogin.token
      })
    );
    assert(
      !secondCompanyAnnouncements.announcements.some(
        (announcement) => announcement.title === "Phase 7 dashboard and reports are available"
      ),
      "Company B announcement list leaked Company A's announcement"
    );
    assert(
      secondCompanyAnnouncements.announcements.some(
        (announcement) => announcement.title === "Northwind demo tenant-only announcement"
      ),
      "Company B announcement list did not return its own seeded announcement"
    );

    // Notifications: Company B's notification list must never include Company
    // A's seeded notifications, and the unread count must reflect only its own.
    const secondCompanyNotifications = assertSuccess(
      await request<{ notifications: Array<{ title: string }>; unreadCount: number }>({
        baseUrl,
        path: "/api/notifications",
        token: secondCompanyLogin.token
      })
    );
    assert(
      !secondCompanyNotifications.notifications.some(
        (notification) => notification.title === "HR workspace ready"
      ),
      "Company B notification list leaked Company A's notification"
    );
    assert(
      secondCompanyNotifications.notifications.some(
        (notification) => notification.title === "Northwind workspace ready"
      ),
      "Company B notification list did not return its own seeded notification"
    );
  });

  await check("cross-tenant isolation: performance module (Phase 4)", async () => {
    const secondCompanyLogin = await login(baseUrl, secondCompanyAdminEmail, secondCompanyAdminPassword);

    // Performance employees list: Company B must never see Company A's smoke employee.
    const secondCompanyPerformanceEmployees = assertSuccess(
      await request<{ employees: Array<{ employeeCode: string }> }>({
        baseUrl,
        path: "/api/performance/employees",
        token: secondCompanyLogin.token
      })
    );
    assert(
      !secondCompanyPerformanceEmployees.employees.some(
        (employee) => employee.employeeCode === smokeEmployeeCode
      ),
      "Company B performance employee list leaked Company A's smoke employee"
    );

    // Goals: each company's goals must be invisible to the other.
    const primaryGoals = assertSuccess(
      await request<{ goals: Array<{ title: string }> }>({
        baseUrl,
        path: "/api/goals",
        token: context.adminToken
      })
    );
    assert(
      !primaryGoals.goals.some((goal) => goal.title === "Northwind demo tenant-only goal"),
      "Company A goal list leaked Company B's goal"
    );

    const secondCompanyGoals = assertSuccess(
      await request<{ goals: Array<{ title: string; id: string }> }>({
        baseUrl,
        path: "/api/goals",
        token: secondCompanyLogin.token
      })
    );
    assert(
      !secondCompanyGoals.goals.some((goal) => goal.title === "Improve HR service delivery"),
      "Company B goal list leaked Company A's goal"
    );
    assert(
      secondCompanyGoals.goals.some((goal) => goal.title === "Northwind demo tenant-only goal"),
      "Company B goal list did not return its own seeded goal"
    );

    // Cross-tenant update attempt: Company B updating Company A's goal id
    // directly must be rejected as not found, not forbidden.
    if (primaryGoals.goals.length > 0) {
      const primaryGoalId = (primaryGoals.goals[0] as { id?: string }).id;

      if (primaryGoalId) {
        const crossTenantUpdate = await request<unknown>({
          baseUrl,
          path: `/api/goals/${primaryGoalId}`,
          method: "PUT",
          token: secondCompanyLogin.token,
          expectedStatus: 404,
          body: {
            progress: 99
          }
        });

        assertFailure(crossTenantUpdate, "GOAL_NOT_FOUND");
      }
    }
  });

  await check("cross-tenant isolation: recruitment module (Phase 4)", async () => {
    const secondCompanyLogin = await login(baseUrl, secondCompanyAdminEmail, secondCompanyAdminPassword);

    // Jobs: each company's job postings must be invisible to the other.
    const primaryJobs = assertSuccess(
      await request<{ jobs: Array<{ title: string; id: string }> }>({
        baseUrl,
        path: "/api/jobs",
        token: context.adminToken
      })
    );
    assert(
      !primaryJobs.jobs.some((job) => job.title === "Northwind demo tenant-only job"),
      "Company A job list leaked Company B's job"
    );

    const secondCompanyJobs = assertSuccess(
      await request<{ jobs: Array<{ title: string }> }>({
        baseUrl,
        path: "/api/jobs",
        token: secondCompanyLogin.token
      })
    );
    assert(
      !secondCompanyJobs.jobs.some((job) => job.title === "Software Engineer"),
      "Company B job list leaked Company A's job"
    );
    assert(
      secondCompanyJobs.jobs.some((job) => job.title === "Northwind demo tenant-only job"),
      "Company B job list did not return its own seeded job"
    );

    // Cross-tenant job fetch-by-id must be rejected as not found.
    if (primaryJobs.jobs.length > 0) {
      const crossTenantJob = await request<unknown>({
        baseUrl,
        path: `/api/jobs/${primaryJobs.jobs[0].id}`,
        token: secondCompanyLogin.token,
        expectedStatus: 404
      });

      assertFailure(crossTenantJob, "JOB_NOT_FOUND");
    }

    // Candidates: each company's candidate pool must be invisible to the other.
    const secondCompanyCandidates = assertSuccess(
      await request<{ candidates: Array<{ email: string }> }>({
        baseUrl,
        path: "/api/candidates",
        token: secondCompanyLogin.token
      })
    );
    assert(
      !secondCompanyCandidates.candidates.some(
        (candidate) => candidate.email === "candidate.phase8@example.com"
      ),
      "Company B candidate list leaked Company A's candidate"
    );
    assert(
      secondCompanyCandidates.candidates.some(
        (candidate) => candidate.email === "candidate.northwind@example.com"
      ),
      "Company B candidate list did not return its own seeded candidate"
    );

    // Applications: Company B's application list must never include
    // Company A's seeded application.
    const secondCompanyApplications = assertSuccess(
      await request<{ applications: Array<{ candidate: { email: string } }> }>({
        baseUrl,
        path: "/api/applications",
        token: secondCompanyLogin.token
      })
    );
    assert(
      !secondCompanyApplications.applications.some(
        (application) => application.candidate.email === "candidate.phase8@example.com"
      ),
      "Company B application list leaked Company A's application"
    );
  });

  await check("attendance clock-in and clock-out", async () => {
    await request<unknown>({
      baseUrl,
      path: "/api/attendance/clock-in",
      method: "POST",
      token: context.employeeToken,
      expectedStatus: 201,
      body: {
        workMode: "WORK_FROM_HOME",
        notes: "Smoke clock-in"
      }
    });
    await request<unknown>({
      baseUrl,
      path: "/api/attendance/clock-out",
      method: "POST",
      token: context.employeeToken,
      body: {
        notes: "Smoke clock-out"
      }
    });
    const attendance = assertSuccess(
      await request<{ todayAttendance: { id: string } | null }>({
        baseUrl,
        path: "/api/attendance/me",
        token: context.employeeToken
      })
    );

    assert(Boolean(attendance.todayAttendance), "Today attendance was not returned");
  });

  await check("leave request, approval, and balance update", async () => {
    const createdLeave = assertSuccess(
      await request<{ leaveRequest: LeaveRequestRecord }>({
        baseUrl,
        path: "/api/leaves",
        method: "POST",
        token: context.employeeToken,
        expectedStatus: 201,
        body: {
          leaveTypeId: context.leaveTypeId,
          startDate: context.leaveDate,
          endDate: context.leaveDate,
          dayType: "FULL_DAY",
          reason: "Phase 10 smoke test leave"
        }
      })
    );
    const approvedLeave = assertSuccess(
      await request<{ leaveRequest: LeaveRequestRecord }>({
        baseUrl,
        path: `/api/leaves/${createdLeave.leaveRequest.id}/approve`,
        method: "PUT",
        token: context.adminToken,
        body: {
          decisionNote: "Approved by smoke test"
        }
      })
    );
    const balances = assertSuccess(
      await request<{
        leaveBalances: Array<{
          employee: { id: string };
          leaveType: { id: string };
          used: number;
        }>;
      }>({
        baseUrl,
        path: `/api/leaves/balance?employeeId=${context.employeeId}&year=${context.leaveYear}`,
        token: context.adminToken
      })
    );
    const smokeBalance = balances.leaveBalances.find(
      (balance) =>
        balance.employee.id === context.employeeId &&
        balance.leaveType.id === context.leaveTypeId
    );

    assert(approvedLeave.leaveRequest.status === "APPROVED", "Leave was not approved");
    assert(smokeBalance !== undefined, "Smoke leave balance was not returned");
    assert(smokeBalance.used >= approvedLeave.leaveRequest.totalDays, "Leave balance used count was not updated");
  });

  await check("salary setup and payroll generation", async () => {
    await request<unknown>({
      baseUrl,
      path: `/api/salaries/${context.salaryId}`,
      method: "PUT",
      token: context.adminToken,
      body: {
        baseSalary: 5000,
        allowances: 500,
        deductions: 100,
        effectiveFrom: "2099-01-01",
        isActive: true
      }
    });
    const generatedPayroll = assertSuccess(
      await request<{ payroll: PayrollRecord }>({
        baseUrl,
        path: "/api/payroll/generate",
        method: "POST",
        token: context.adminToken,
        expectedStatus: 201,
        body: {
          month: smokePayrollMonth,
          year: smokePayrollYear
        }
      })
    );
    const detail = assertSuccess(
      await request<{ payroll: PayrollRecord }>({
        baseUrl,
        path: `/api/payroll/${generatedPayroll.payroll.id}`,
        token: context.adminToken
      })
    );
    const smokeItem = detail.payroll.items.find(
      (item) => item.employeeId === context.employeeId
    );

    smokePayrollId = generatedPayroll.payroll.id;

    assert(smokeItem !== undefined, "Smoke payroll item was not generated");
    assert(smokeItem.netPay === 5400, `Expected smoke net pay 5400, received ${smokeItem.netPay}`);
    assert(smokeItem.baseSalary + smokeItem.allowances - smokeItem.deductions === smokeItem.netPay, "Payroll item math is invalid");
    await request<unknown>({
      baseUrl,
      path: `/api/payroll/${generatedPayroll.payroll.id}/payslip?employeeId=${context.employeeId}`,
      token: context.adminToken
    });
  });

  await check("cross-tenant isolation: payroll module (Phase 4)", async () => {
    assert(Boolean(smokePayrollId), "Smoke payroll id was not captured from the generation check");

    const payrollId = smokePayrollId as string;
    const secondCompanyLogin = await login(baseUrl, secondCompanyAdminEmail, secondCompanyAdminPassword);

    // Salaries: each company's salary setups must be invisible to the other.
    const primarySalaries = assertSuccess(
      await request<{ salaries: Array<{ employee: { employeeCode: string } }> }>({
        baseUrl,
        path: "/api/salaries",
        token: context.adminToken
      })
    );
    assert(
      !primarySalaries.salaries.some((salary) => salary.employee.employeeCode.startsWith("EMP-N")),
      "Company A salary list leaked Company B's salary setup"
    );

    const secondCompanySalaries = assertSuccess(
      await request<{ salaries: Array<{ employee: { employeeCode: string } }> }>({
        baseUrl,
        path: "/api/salaries",
        token: secondCompanyLogin.token
      })
    );
    assert(
      !secondCompanySalaries.salaries.some((salary) => salary.employee.employeeCode === smokeEmployeeCode),
      "Company B salary list leaked Company A's salary setup"
    );
    assert(
      secondCompanySalaries.salaries.some((salary) => salary.employee.employeeCode === "EMP-N001"),
      "Company B salary list did not return its own seeded salary setup"
    );

    // Payroll runs: Company B's payroll list must never include Company A's
    // generated run, and fetching Company A's payroll id directly must be
    // rejected as not found.
    const primaryPayrolls = assertSuccess(
      await request<{ payrolls: Array<{ id: string }> }>({
        baseUrl,
        path: `/api/payroll?year=${smokePayrollYear}`,
        token: context.adminToken
      })
    );
    assert(
      primaryPayrolls.payrolls.some((payroll) => payroll.id === payrollId),
      "Company A payroll list did not return its own generated payroll run"
    );

    const secondCompanyPayrolls = assertSuccess(
      await request<{ payrolls: Array<{ id: string }> }>({
        baseUrl,
        path: `/api/payroll?year=${smokePayrollYear}`,
        token: secondCompanyLogin.token
      })
    );
    assert(
      !secondCompanyPayrolls.payrolls.some((payroll) => payroll.id === payrollId),
      "Company B payroll list leaked Company A's generated payroll run"
    );

    const crossTenantPayroll = await request<unknown>({
      baseUrl,
      path: `/api/payroll/${payrollId}`,
      token: secondCompanyLogin.token,
      expectedStatus: 404
    });

    assertFailure(crossTenantPayroll, "PAYROLL_NOT_FOUND");

    // Payslips: Company B fetching Company A's payslip by payroll id +
    // employee id must be rejected as not found, even though the payroll id
    // and employee id are each individually valid within their own tenant.
    const crossTenantPayslip = await request<unknown>({
      baseUrl,
      path: `/api/payroll/${payrollId}/payslip?employeeId=${context.employeeId}`,
      token: secondCompanyLogin.token,
      expectedStatus: 404
    });

    assertFailure(crossTenantPayslip, "PAYSLIP_NOT_FOUND");
  });

  await check("dashboard, notifications, announcements, and reports", async () => {
    await request<unknown>({
      baseUrl,
      path: "/api/dashboard/summary",
      token: context.adminToken
    });
    await request<unknown>({
      baseUrl,
      path: "/api/notifications",
      token: context.adminToken
    });
    await request<unknown>({
      baseUrl,
      path: "/api/announcements",
      token: context.adminToken
    });

    for (const path of [
      "/api/reports/employees",
      "/api/reports/attendance",
      "/api/reports/leaves",
      `/api/reports/payroll?year=${smokePayrollYear}`
    ]) {
      await request<unknown>({
        baseUrl,
        path,
        token: context.adminToken
      });
    }
  });

  await check("password reset development response", async () => {
    const response = assertSuccess(
      await request<{
        message: string;
        deliveryMode: "email" | "development_response";
      }>({
        baseUrl,
        path: "/api/auth/forgot-password",
        method: "POST",
        body: {
          email: adminEmail
        }
      })
    );

    assert(response.message.length > 0, "Forgot-password response message was empty");
    assert(
      response.deliveryMode === "development_response" || response.deliveryMode === "email",
      "Forgot-password delivery mode was invalid"
    );
  });

  await check("recruitment and performance endpoints", async () => {
    for (const path of [
      "/api/jobs",
      "/api/candidates",
      "/api/applications",
      "/api/interviews",
      "/api/offers",
      "/api/performance/employees",
      "/api/goals",
      "/api/performance-reviews",
      "/api/feedback"
    ]) {
      await request<unknown>({
        baseUrl,
        path,
        token: context.adminToken
      });
    }
  });

  await check("performance validation returns 400", async () => {
    const rejected = await request<unknown>({
      baseUrl,
      path: "/api/goals",
      method: "POST",
      token: context.adminToken,
      expectedStatus: 400,
      body: {
        employeeId: context.employeeId,
        title: "No",
        description: null,
        status: "NOT_STARTED",
        progress: 150,
        startDate: null,
        dueDate: null
      }
    });

    assertFailure(rejected, "VALIDATION_ERROR");
  });
}

async function main(): Promise<void> {
  const { server, baseUrl } = await listen();

  try {
    await runSmoke(baseUrl);
    console.log("Smoke test passed.");
  } finally {
    await closeServer(server);
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
