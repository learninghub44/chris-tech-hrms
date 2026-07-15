import { PrismaClient, type Role, type User } from "@prisma/client";
import { hashPassword } from "../src/modules/auth/password";

const prisma = new PrismaClient();

const seedAdminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin@12345";
const seedHrPassword = process.env.SEED_HR_PASSWORD ?? "Hr@12345";
const seedManagerPassword = process.env.SEED_MANAGER_PASSWORD ?? "Manager@12345";
const seedEmployeePassword = process.env.SEED_EMPLOYEE_PASSWORD ?? "Employee@12345";
const seedSecondCompanyAdminPassword =
  process.env.SEED_SECOND_COMPANY_ADMIN_PASSWORD ?? "Admin@12345";
const seedSecondCompanyEmployeePassword =
  process.env.SEED_SECOND_COMPANY_EMPLOYEE_PASSWORD ?? "Employee@12345";

// Primary tenant. Name/slug intentionally match scripts/backfill-default-company.ts
// so a fresh `db:seed` run and an already-backfilled existing database converge
// on the same company row instead of creating a duplicate.
const PRIMARY_COMPANY_NAME = "Chris Tech Default Co";
const PRIMARY_COMPANY_SLUG = "chris-tech-default";

// Second tenant. Exists purely so cross-tenant isolation smoke tests (see
// MULTI_TENANT_ROADMAP.md Phase 3) have a second company's data to assert
// against. Deliberately small — it only needs to prove Company A never sees
// Company B's rows, not to mirror the full primary demo dataset.
const SECOND_COMPANY_NAME = "Northwind Demo Co";
const SECOND_COMPANY_SLUG = "northwind-demo-co";

const roles = [
  { name: "SUPER_ADMIN", description: "Full system access" },
  { name: "HR_ADMIN", description: "HR operations access" },
  { name: "MANAGER", description: "Team-level access" },
  { name: "EMPLOYEE", description: "Self-service access" }
];

const permissions = [
  { key: "dashboard:read", description: "View dashboard" },
  { key: "profile:read", description: "View own user profile" },
  { key: "users:manage", description: "Manage users and roles" },
  { key: "employees:manage", description: "Manage employees" },
  { key: "attendance:read", description: "View attendance" },
  { key: "attendance:write", description: "Record own attendance" },
  { key: "attendance:manage", description: "Manage shifts and holidays" },
  { key: "leave:request", description: "Request leave" },
  { key: "leave:approve", description: "Approve leave requests" },
  { key: "leave:manage", description: "Manage leave settings" },
  { key: "payroll:read", description: "View own payslips" },
  { key: "payroll:manage", description: "Manage payroll" },
  { key: "reports:read", description: "View HR reports" },
  { key: "notifications:read", description: "View own notifications" },
  { key: "announcements:read", description: "View announcements" },
  { key: "announcements:manage", description: "Manage announcements" },
  { key: "recruitment:read", description: "View recruitment records" },
  { key: "recruitment:manage", description: "Manage recruitment records" },
  { key: "performance:read", description: "View performance records" },
  { key: "performance:manage", description: "Manage goals, reviews, and feedback" }
];

const rolePermissions: Record<string, string[]> = {
  SUPER_ADMIN: permissions.map((permission) => permission.key),
  HR_ADMIN: [
    "dashboard:read",
    "profile:read",
    "employees:manage",
    "attendance:read",
    "attendance:write",
    "attendance:manage",
    "leave:request",
    "leave:approve",
    "leave:manage",
    "payroll:read",
    "payroll:manage",
    "reports:read",
    "notifications:read",
    "announcements:read",
    "announcements:manage",
    "recruitment:read",
    "recruitment:manage",
    "performance:read",
    "performance:manage"
  ],
  MANAGER: [
    "dashboard:read",
    "profile:read",
    "attendance:read",
    "attendance:write",
    "leave:request",
    "leave:approve",
    "payroll:read",
    "notifications:read",
    "announcements:read",
    "performance:read",
    "performance:manage"
  ],
  EMPLOYEE: [
    "dashboard:read",
    "profile:read",
    "attendance:write",
    "leave:request",
    "payroll:read",
    "notifications:read",
    "announcements:read",
    "performance:read"
  ]
};

const departments = [
  {
    name: "People Operations",
    description: "HR operations, employee services, and compliance"
  },
  {
    name: "Engineering",
    description: "Product engineering and platform delivery"
  }
];

const designations = [
  {
    title: "HR Director",
    description: "Owns HR operations and employee lifecycle",
    departmentName: "People Operations"
  },
  {
    title: "HR Manager",
    description: "Runs employee operations and policy workflows",
    departmentName: "People Operations"
  },
  {
    title: "Engineering Manager",
    description: "Leads delivery planning and team performance",
    departmentName: "Engineering"
  },
  {
    title: "Software Engineer",
    description: "Builds and maintains product systems",
    departmentName: "Engineering"
  }
];

const leaveTypes = [
  {
    name: "Annual Leave",
    description: "Paid planned leave for vacation and personal time",
    defaultAnnualAllowance: 18,
    isPaid: true,
    requiresApproval: true
  },
  {
    name: "Sick Leave",
    description: "Paid leave for illness or medical care",
    defaultAnnualAllowance: 10,
    isPaid: true,
    requiresApproval: true
  },
  {
    name: "Unpaid Leave",
    description: "Unpaid leave for exceptional cases",
    defaultAnnualAllowance: 0,
    isPaid: false,
    requiresApproval: true
  }
];

const holidays = [
  {
    name: "New Year's Day",
    date: new Date("2026-01-01T00:00:00.000Z"),
    type: "PUBLIC" as const,
    description: "Public holiday"
  },
  {
    name: "Company Foundation Day",
    date: new Date("2026-05-18T00:00:00.000Z"),
    type: "COMPANY" as const,
    description: "Company holiday"
  }
];

function getRequiredRole(createdRoles: Role[], roleName: string): Role {
  const role = createdRoles.find((createdRole) => createdRole.name === roleName);

  if (!role) {
    throw new Error(`Missing seed role: ${roleName}`);
  }

  return role;
}

async function assignExclusiveRole(
  userId: string,
  role: Role,
  createdRoles: Role[]
): Promise<void> {
  await Promise.all(
    createdRoles
      .filter((createdRole) => createdRole.id !== role.id)
      .map((createdRole) =>
        prisma.userRole.deleteMany({
          where: {
            userId,
            roleId: createdRole.id
          }
        })
      )
  );

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId,
        roleId: role.id
      }
    },
    update: {},
    create: {
      userId,
      roleId: role.id
    }
  });
}

async function upsertSeedUser(input: {
  email: string;
  name: string;
  password: string;
  role: Role;
  createdRoles: Role[];
  companyId: string | null;
}): Promise<User> {
  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.upsert({
    where: {
      email: input.email
    },
    update: {
      name: input.name,
      passwordHash,
      status: "ACTIVE",
      companyId: input.companyId
    },
    create: {
      email: input.email,
      name: input.name,
      passwordHash,
      status: "ACTIVE",
      companyId: input.companyId
    }
  });

  await assignExclusiveRole(user.id, input.role, input.createdRoles);

  return user;
}

async function main() {
  // ===================== Global RBAC catalog (shared across all companies) =====================

  const createdPermissions = await Promise.all(
    permissions.map((permission) =>
      prisma.permission.upsert({
        where: { key: permission.key },
        update: permission,
        create: permission
      })
    )
  );

  const createdRoles = await Promise.all(
    roles.map((role) =>
      prisma.role.upsert({
        where: { name: role.name },
        update: role,
        create: role
      })
    )
  );

  await Promise.all(
    createdRoles.flatMap((role) => {
      const permissionKeys = rolePermissions[role.name] ?? [];
      const permissionsForRole = createdPermissions.filter((permission) =>
        permissionKeys.includes(permission.key)
      );

      return permissionsForRole.map((permission) =>
        prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: permission.id
            }
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId: permission.id
          }
        })
      );
    })
  );

  const superAdmin = getRequiredRole(createdRoles, "SUPER_ADMIN");
  const hrAdminRole = getRequiredRole(createdRoles, "HR_ADMIN");
  const managerRole = getRequiredRole(createdRoles, "MANAGER");
  const employeeRole = getRequiredRole(createdRoles, "EMPLOYEE");

  // ===================== Companies =====================

  const primaryCompany = await prisma.company.upsert({
    where: { slug: PRIMARY_COMPANY_SLUG },
    update: { name: PRIMARY_COMPANY_NAME },
    create: { name: PRIMARY_COMPANY_NAME, slug: PRIMARY_COMPANY_SLUG }
  });

  const secondCompany = await prisma.company.upsert({
    where: { slug: SECOND_COMPANY_SLUG },
    update: { name: SECOND_COMPANY_NAME },
    create: { name: SECOND_COMPANY_NAME, slug: SECOND_COMPANY_SLUG }
  });

  // ===================== Primary company: full demo dataset =====================

  const user = await upsertSeedUser({
    email: "admin@hrms.local",
    name: "Elon Musk",
    password: seedAdminPassword,
    role: superAdmin,
    createdRoles,
    companyId: primaryCompany.id
  });
  const hrUser = await upsertSeedUser({
    email: "hr@hrms.local",
    name: "Avery Stone",
    password: seedHrPassword,
    role: hrAdminRole,
    createdRoles,
    companyId: primaryCompany.id
  });
  const managerUser = await upsertSeedUser({
    email: "manager@hrms.local",
    name: "Jordan Lee",
    password: seedManagerPassword,
    role: managerRole,
    createdRoles,
    companyId: primaryCompany.id
  });
  const selfServiceUser = await upsertSeedUser({
    email: "employee@hrms.local",
    name: "Maya Rao",
    password: seedEmployeePassword,
    role: employeeRole,
    createdRoles,
    companyId: primaryCompany.id
  });
  const ankitUser = await upsertSeedUser({
    email: "ankit@hrms.local",
    name: "Ankit Kumar",
    password: seedEmployeePassword,
    role: employeeRole,
    createdRoles,
    companyId: primaryCompany.id
  });

  const createdDepartments = await Promise.all(
    departments.map((department) =>
      prisma.department.upsert({
        where: {
          companyId_name: {
            companyId: primaryCompany.id,
            name: department.name
          }
        },
        update: {
          description: department.description
        },
        create: {
          name: department.name,
          description: department.description,
          companyId: primaryCompany.id
        }
      })
    )
  );

  const createdDesignations = await Promise.all(
    designations.map((designation) => {
      const department = createdDepartments.find(
        (createdDepartment) => createdDepartment.name === designation.departmentName
      );

      if (!department) {
        throw new Error(`Missing seed department: ${designation.departmentName}`);
      }

      return prisma.designation.upsert({
        where: {
          companyId_title_departmentId: {
            companyId: primaryCompany.id,
            title: designation.title,
            departmentId: department.id
          }
        },
        update: {
          description: designation.description,
          departmentId: department.id
        },
        create: {
          title: designation.title,
          description: designation.description,
          departmentId: department.id,
          companyId: primaryCompany.id
        }
      });
    })
  );

  const peopleOperations = createdDepartments.find(
    (department) => department.name === "People Operations"
  );
  const hrDirector = createdDesignations.find(
    (designation) => designation.title === "HR Director"
  );
  const hrManager = createdDesignations.find(
    (designation) => designation.title === "HR Manager"
  );
  const engineering = createdDepartments.find((department) => department.name === "Engineering");
  const engineeringManager = createdDesignations.find(
    (designation) => designation.title === "Engineering Manager"
  );
  const softwareEngineer = createdDesignations.find(
    (designation) => designation.title === "Software Engineer"
  );

  const employee = await prisma.employee.upsert({
    where: {
      companyId_employeeCode: {
        companyId: primaryCompany.id,
        employeeCode: "EMP-0001"
      }
    },
    update: {
      userId: user.id,
      firstName: "Elon",
      lastName: "Musk",
      workEmail: user.email,
      departmentId: peopleOperations?.id ?? null,
      designationId: hrDirector?.id ?? null,
      status: "ACTIVE",
      location: "Head Office"
    },
    create: {
      companyId: primaryCompany.id,
      employeeCode: "EMP-0001",
      userId: user.id,
      firstName: "Elon",
      lastName: "Musk",
      workEmail: user.email,
      dateOfJoining: new Date("2026-05-18T00:00:00.000Z"),
      departmentId: peopleOperations?.id ?? null,
      designationId: hrDirector?.id ?? null,
      status: "ACTIVE",
      location: "Head Office"
    }
  });

  const hrEmployee = await prisma.employee.upsert({
    where: {
      companyId_employeeCode: {
        companyId: primaryCompany.id,
        employeeCode: "EMP-0002"
      }
    },
    update: {
      userId: hrUser.id,
      firstName: "Avery",
      lastName: "Stone",
      workEmail: hrUser.email,
      departmentId: peopleOperations?.id ?? null,
      designationId: hrManager?.id ?? null,
      managerId: employee.id,
      status: "ACTIVE",
      location: "Head Office"
    },
    create: {
      companyId: primaryCompany.id,
      employeeCode: "EMP-0002",
      userId: hrUser.id,
      firstName: "Avery",
      lastName: "Stone",
      workEmail: hrUser.email,
      dateOfJoining: new Date("2026-05-19T00:00:00.000Z"),
      departmentId: peopleOperations?.id ?? null,
      designationId: hrManager?.id ?? null,
      managerId: employee.id,
      status: "ACTIVE",
      location: "Head Office"
    }
  });

  const managerEmployee = await prisma.employee.upsert({
    where: {
      companyId_employeeCode: {
        companyId: primaryCompany.id,
        employeeCode: "EMP-0004"
      }
    },
    update: {
      userId: managerUser.id,
      firstName: "Jordan",
      lastName: "Lee",
      workEmail: managerUser.email,
      departmentId: engineering?.id ?? null,
      designationId: engineeringManager?.id ?? null,
      managerId: hrEmployee.id,
      status: "ACTIVE",
      location: "Head Office"
    },
    create: {
      companyId: primaryCompany.id,
      employeeCode: "EMP-0004",
      userId: managerUser.id,
      firstName: "Jordan",
      lastName: "Lee",
      workEmail: managerUser.email,
      dateOfJoining: new Date("2026-05-20T00:00:00.000Z"),
      departmentId: engineering?.id ?? null,
      designationId: engineeringManager?.id ?? null,
      managerId: hrEmployee.id,
      status: "ACTIVE",
      location: "Head Office"
    }
  });

  const selfServiceEmployee = await prisma.employee.upsert({
    where: {
      companyId_employeeCode: {
        companyId: primaryCompany.id,
        employeeCode: "EMP-0003"
      }
    },
    update: {
      userId: selfServiceUser.id,
      firstName: "Maya",
      lastName: "Rao",
      workEmail: selfServiceUser.email,
      departmentId: engineering?.id ?? null,
      designationId: softwareEngineer?.id ?? null,
      managerId: managerEmployee.id,
      status: "ACTIVE",
      location: "Remote"
    },
    create: {
      companyId: primaryCompany.id,
      employeeCode: "EMP-0003",
      userId: selfServiceUser.id,
      firstName: "Maya",
      lastName: "Rao",
      workEmail: selfServiceUser.email,
      dateOfJoining: new Date("2026-05-20T00:00:00.000Z"),
      departmentId: engineering?.id ?? null,
      designationId: softwareEngineer?.id ?? null,
      managerId: managerEmployee.id,
      status: "ACTIVE",
      location: "Remote"
    }
  });

  const ankitEmployee = await prisma.employee.upsert({
    where: {
      companyId_employeeCode: {
        companyId: primaryCompany.id,
        employeeCode: "EMP-0005"
      }
    },
    update: {
      userId: ankitUser.id,
      firstName: "Ankit",
      lastName: "Kumar",
      workEmail: ankitUser.email,
      departmentId: engineering?.id ?? null,
      designationId: softwareEngineer?.id ?? null,
      managerId: managerEmployee.id,
      status: "ACTIVE",
      location: "Head Office"
    },
    create: {
      companyId: primaryCompany.id,
      employeeCode: "EMP-0005",
      userId: ankitUser.id,
      firstName: "Ankit",
      lastName: "Kumar",
      workEmail: ankitUser.email,
      dateOfJoining: new Date("2026-05-21T00:00:00.000Z"),
      departmentId: engineering?.id ?? null,
      designationId: softwareEngineer?.id ?? null,
      managerId: managerEmployee.id,
      status: "ACTIVE",
      location: "Head Office"
    }
  });

  await prisma.emergencyContact.deleteMany({
    where: {
      employeeId: employee.id
    }
  });

  await prisma.emergencyContact.create({
    data: {
      companyId: primaryCompany.id,
      employeeId: employee.id,
      name: "HR Desk",
      relationship: "Office",
      phone: "+1-555-0100",
      isPrimary: true
    }
  });

  await prisma.salary.upsert({
    where: {
      employeeId: employee.id
    },
    update: {
      baseSalary: 120000,
      allowances: 15000,
      deductions: 5000,
      effectiveFrom: new Date("2026-05-01T00:00:00.000Z"),
      isActive: true
    },
    create: {
      companyId: primaryCompany.id,
      employeeId: employee.id,
      baseSalary: 120000,
      allowances: 15000,
      deductions: 5000,
      effectiveFrom: new Date("2026-05-01T00:00:00.000Z"),
      isActive: true
    }
  });

  await prisma.salary.upsert({
    where: {
      employeeId: hrEmployee.id
    },
    update: {
      baseSalary: 90000,
      allowances: 10000,
      deductions: 3500,
      effectiveFrom: new Date("2026-05-01T00:00:00.000Z"),
      isActive: true
    },
    create: {
      companyId: primaryCompany.id,
      employeeId: hrEmployee.id,
      baseSalary: 90000,
      allowances: 10000,
      deductions: 3500,
      effectiveFrom: new Date("2026-05-01T00:00:00.000Z"),
      isActive: true
    }
  });

  await prisma.salary.upsert({
    where: {
      employeeId: managerEmployee.id
    },
    update: {
      baseSalary: 100000,
      allowances: 12000,
      deductions: 4000,
      effectiveFrom: new Date("2026-05-01T00:00:00.000Z"),
      isActive: true
    },
    create: {
      companyId: primaryCompany.id,
      employeeId: managerEmployee.id,
      baseSalary: 100000,
      allowances: 12000,
      deductions: 4000,
      effectiveFrom: new Date("2026-05-01T00:00:00.000Z"),
      isActive: true
    }
  });

  await prisma.salary.upsert({
    where: {
      employeeId: selfServiceEmployee.id
    },
    update: {
      baseSalary: 70000,
      allowances: 8000,
      deductions: 2500,
      effectiveFrom: new Date("2026-05-01T00:00:00.000Z"),
      isActive: true
    },
    create: {
      companyId: primaryCompany.id,
      employeeId: selfServiceEmployee.id,
      baseSalary: 70000,
      allowances: 8000,
      deductions: 2500,
      effectiveFrom: new Date("2026-05-01T00:00:00.000Z"),
      isActive: true
    }
  });

  await prisma.salary.upsert({
    where: {
      employeeId: ankitEmployee.id
    },
    update: {
      baseSalary: 72000,
      allowances: 8000,
      deductions: 2500,
      effectiveFrom: new Date("2026-05-01T00:00:00.000Z"),
      isActive: true
    },
    create: {
      companyId: primaryCompany.id,
      employeeId: ankitEmployee.id,
      baseSalary: 72000,
      allowances: 8000,
      deductions: 2500,
      effectiveFrom: new Date("2026-05-01T00:00:00.000Z"),
      isActive: true
    }
  });

  await prisma.shift.upsert({
    where: {
      companyId_name: {
        companyId: primaryCompany.id,
        name: "General Shift"
      }
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
      companyId: primaryCompany.id,
      name: "General Shift",
      startTime: "09:30",
      endTime: "18:30",
      lateAfterMinutes: 15,
      halfDayAfterMinutes: 240,
      isDefault: true,
      isActive: true
    }
  });

  await Promise.all(
    holidays.map((holiday) =>
      prisma.holiday.upsert({
        where: {
          companyId_date: {
            companyId: primaryCompany.id,
            date: holiday.date
          }
        },
        update: {
          name: holiday.name,
          type: holiday.type,
          description: holiday.description
        },
        create: {
          ...holiday,
          companyId: primaryCompany.id
        }
      })
    )
  );

  const createdLeaveTypes = await Promise.all(
    leaveTypes.map((leaveType) =>
      prisma.leaveType.upsert({
        where: {
          companyId_name: {
            companyId: primaryCompany.id,
            name: leaveType.name
          }
        },
        update: leaveType,
        create: {
          ...leaveType,
          companyId: primaryCompany.id
        }
      })
    )
  );

  await Promise.all(
    [employee, hrEmployee, managerEmployee, selfServiceEmployee, ankitEmployee].flatMap(
      (seedEmployee) =>
        createdLeaveTypes.map((leaveType) =>
          prisma.leaveBalance.upsert({
            where: {
              employeeId_leaveTypeId_year: {
                employeeId: seedEmployee.id,
                leaveTypeId: leaveType.id,
                year: 2026
              }
            },
            update: {},
            create: {
              companyId: primaryCompany.id,
              employeeId: seedEmployee.id,
              leaveTypeId: leaveType.id,
              year: 2026,
              openingBalance: leaveType.defaultAnnualAllowance,
              available: leaveType.defaultAnnualAllowance
            }
          })
        )
    )
  );

  await prisma.announcement.upsert({
    where: {
      id: "phase-7-welcome-announcement"
    },
    update: {
      title: "Phase 7 dashboard and reports are available",
      message: "Dashboard metrics, reports, notifications, and announcements are now enabled.",
      audience: "ALL",
      isPublished: true,
      createdById: user.id
    },
    create: {
      id: "phase-7-welcome-announcement",
      companyId: primaryCompany.id,
      title: "Phase 7 dashboard and reports are available",
      message: "Dashboard metrics, reports, notifications, and announcements are now enabled.",
      audience: "ALL",
      isPublished: true,
      createdById: user.id
    }
  });

  await prisma.notification.upsert({
    where: {
      id: "seed-hr-workspace-ready"
    },
    update: {
      userId: hrUser.id,
      title: "HR workspace ready",
      message: "Employee management, leave approvals, payroll, recruitment, and performance tools are enabled.",
      category: "SYSTEM",
      isRead: false
    },
    create: {
      id: "seed-hr-workspace-ready",
      companyId: primaryCompany.id,
      userId: hrUser.id,
      title: "HR workspace ready",
      message: "Employee management, leave approvals, payroll, recruitment, and performance tools are enabled.",
      category: "SYSTEM",
      isRead: false
    }
  });

  await prisma.notification.upsert({
    where: {
      id: "seed-manager-workspace-ready"
    },
    update: {
      userId: managerUser.id,
      title: "Manager workspace ready",
      message: "Team dashboard, leave approvals, attendance, payroll, and performance tools are enabled.",
      category: "SYSTEM",
      isRead: false
    },
    create: {
      id: "seed-manager-workspace-ready",
      companyId: primaryCompany.id,
      userId: managerUser.id,
      title: "Manager workspace ready",
      message: "Team dashboard, leave approvals, attendance, payroll, and performance tools are enabled.",
      category: "SYSTEM",
      isRead: false
    }
  });

  await prisma.notification.upsert({
    where: {
      id: "seed-employee-self-service-ready"
    },
    update: {
      userId: selfServiceUser.id,
      title: "Employee self-service ready",
      message: "Attendance, leave requests, payslips, announcements, and performance pages are enabled.",
      category: "SYSTEM",
      isRead: false
    },
    create: {
      id: "seed-employee-self-service-ready",
      companyId: primaryCompany.id,
      userId: selfServiceUser.id,
      title: "Employee self-service ready",
      message: "Attendance, leave requests, payslips, announcements, and performance pages are enabled.",
      category: "SYSTEM",
      isRead: false
    }
  });

  await prisma.notification.upsert({
    where: {
      id: "seed-ankit-self-service-ready"
    },
    update: {
      userId: ankitUser.id,
      title: "Employee self-service ready",
      message: "Attendance, leave requests, payslips, announcements, and performance pages are enabled.",
      category: "SYSTEM",
      isRead: false
    },
    create: {
      id: "seed-ankit-self-service-ready",
      companyId: primaryCompany.id,
      userId: ankitUser.id,
      title: "Employee self-service ready",
      message: "Attendance, leave requests, payslips, announcements, and performance pages are enabled.",
      category: "SYSTEM",
      isRead: false
    }
  });

  const job = await prisma.job.upsert({
    where: {
      id: "phase-8-software-engineer-job"
    },
    update: {
      title: "Software Engineer",
      description: "Builds and maintains HRMS product systems.",
      departmentId: engineering?.id ?? null,
      designationId: softwareEngineer?.id ?? null,
      location: "Remote",
      employmentType: "Full-time",
      status: "OPEN",
      createdById: user.id
    },
    create: {
      id: "phase-8-software-engineer-job",
      companyId: primaryCompany.id,
      title: "Software Engineer",
      description: "Builds and maintains HRMS product systems.",
      departmentId: engineering?.id ?? null,
      designationId: softwareEngineer?.id ?? null,
      location: "Remote",
      employmentType: "Full-time",
      status: "OPEN",
      createdById: user.id
    }
  });
  const candidate = await prisma.candidate.upsert({
    where: {
      companyId_email: {
        companyId: primaryCompany.id,
        email: "candidate.phase8@example.com"
      }
    },
    update: {
      firstName: "Phase",
      lastName: "Candidate",
      phone: "+1-555-0110",
      source: "Seed",
      currentCompany: "Example Labs",
      currentTitle: "Frontend Engineer"
    },
    create: {
      companyId: primaryCompany.id,
      firstName: "Phase",
      lastName: "Candidate",
      email: "candidate.phase8@example.com",
      phone: "+1-555-0110",
      source: "Seed",
      currentCompany: "Example Labs",
      currentTitle: "Frontend Engineer"
    }
  });
  const application = await prisma.jobApplication.upsert({
    where: {
      jobId_candidateId: {
        jobId: job.id,
        candidateId: candidate.id
      }
    },
    update: {
      status: "SCREENING",
      notes: "Seeded Phase 8 application"
    },
    create: {
      companyId: primaryCompany.id,
      jobId: job.id,
      candidateId: candidate.id,
      status: "SCREENING",
      notes: "Seeded Phase 8 application"
    }
  });

  const existingInterview = await prisma.interview.findFirst({
    where: {
      applicationId: application.id
    }
  });

  if (!existingInterview) {
    await prisma.interview.create({
      data: {
        companyId: primaryCompany.id,
        applicationId: application.id,
        candidateId: candidate.id,
        interviewerId: employee.id,
        scheduledAt: new Date("2026-05-22T10:00:00.000Z"),
        mode: "VIDEO",
        location: "Google Meet",
        status: "SCHEDULED"
      }
    });
  }

  await prisma.goal.upsert({
    where: {
      id: "phase-9-admin-goal"
    },
    update: {
      employeeId: employee.id,
      title: "Improve HR service delivery",
      description: "Reduce manual follow-up by keeping employee lifecycle records current.",
      status: "IN_PROGRESS",
      progress: 40,
      startDate: new Date("2026-05-01T00:00:00.000Z"),
      dueDate: new Date("2026-06-30T00:00:00.000Z"),
      createdById: user.id
    },
    create: {
      id: "phase-9-admin-goal",
      companyId: primaryCompany.id,
      employeeId: employee.id,
      title: "Improve HR service delivery",
      description: "Reduce manual follow-up by keeping employee lifecycle records current.",
      status: "IN_PROGRESS",
      progress: 40,
      startDate: new Date("2026-05-01T00:00:00.000Z"),
      dueDate: new Date("2026-06-30T00:00:00.000Z"),
      createdById: user.id
    }
  });

  await prisma.performanceReview.upsert({
    where: {
      id: "phase-9-admin-review"
    },
    update: {
      employeeId: employee.id,
      reviewerId: employee.id,
      cycle: "2026 H1",
      reviewPeriodStart: new Date("2026-01-01T00:00:00.000Z"),
      reviewPeriodEnd: new Date("2026-06-30T00:00:00.000Z"),
      rating: 4,
      summary: "Strong ownership of HRMS setup and employee operations.",
      strengths: "Clear process ownership and consistent follow-through.",
      improvements: "Continue building repeatable reporting routines.",
      status: "SUBMITTED",
      submittedAt: new Date("2026-05-19T00:00:00.000Z")
    },
    create: {
      id: "phase-9-admin-review",
      companyId: primaryCompany.id,
      employeeId: employee.id,
      reviewerId: employee.id,
      cycle: "2026 H1",
      reviewPeriodStart: new Date("2026-01-01T00:00:00.000Z"),
      reviewPeriodEnd: new Date("2026-06-30T00:00:00.000Z"),
      rating: 4,
      summary: "Strong ownership of HRMS setup and employee operations.",
      strengths: "Clear process ownership and consistent follow-through.",
      improvements: "Continue building repeatable reporting routines.",
      status: "SUBMITTED",
      submittedAt: new Date("2026-05-19T00:00:00.000Z")
    }
  });

  await prisma.feedback.upsert({
    where: {
      id: "phase-9-admin-feedback"
    },
    update: {
      employeeId: employee.id,
      authorId: employee.id,
      category: "PRAISE",
      message: "Phase 9 performance records are ready for appraisal tracking.",
      isPrivate: false
    },
    create: {
      id: "phase-9-admin-feedback",
      companyId: primaryCompany.id,
      employeeId: employee.id,
      authorId: employee.id,
      category: "PRAISE",
      message: "Phase 9 performance records are ready for appraisal tracking.",
      isPrivate: false
    }
  });

  // ===================== Second company: minimal isolation-test tenant =====================
  // Deliberately small. Its only job is to give cross-tenant isolation smoke
  // tests (Phase 3 of MULTI_TENANT_ROADMAP.md) a second company's rows to
  // assert never leak into Company A's ("Chris Tech Default Co") queries.

  const secondCompanyAdminUser = await upsertSeedUser({
    email: "admin@northwind-demo.local",
    name: "Priya Nandan",
    password: seedSecondCompanyAdminPassword,
    role: superAdmin,
    createdRoles,
    companyId: secondCompany.id
  });
  const secondCompanyEmployeeUser = await upsertSeedUser({
    email: "employee@northwind-demo.local",
    name: "Sam Okafor",
    password: seedSecondCompanyEmployeePassword,
    role: employeeRole,
    createdRoles,
    companyId: secondCompany.id
  });

  const secondCompanyDepartment = await prisma.department.upsert({
    where: {
      companyId_name: {
        companyId: secondCompany.id,
        name: "Operations"
      }
    },
    update: {
      description: "Day-to-day operations for the Northwind demo tenant"
    },
    create: {
      name: "Operations",
      description: "Day-to-day operations for the Northwind demo tenant",
      companyId: secondCompany.id
    }
  });

  const secondCompanyDesignation = await prisma.designation.upsert({
    where: {
      companyId_title_departmentId: {
        companyId: secondCompany.id,
        title: "Operations Lead",
        departmentId: secondCompanyDepartment.id
      }
    },
    update: {
      description: "Owns operations for the Northwind demo tenant",
      departmentId: secondCompanyDepartment.id
    },
    create: {
      title: "Operations Lead",
      description: "Owns operations for the Northwind demo tenant",
      departmentId: secondCompanyDepartment.id,
      companyId: secondCompany.id
    }
  });

  const secondCompanyAdminEmployee = await prisma.employee.upsert({
    where: {
      companyId_employeeCode: {
        companyId: secondCompany.id,
        employeeCode: "EMP-N001"
      }
    },
    update: {
      userId: secondCompanyAdminUser.id,
      firstName: "Priya",
      lastName: "Nandan",
      workEmail: secondCompanyAdminUser.email,
      departmentId: secondCompanyDepartment.id,
      designationId: secondCompanyDesignation.id,
      status: "ACTIVE",
      location: "Head Office"
    },
    create: {
      companyId: secondCompany.id,
      employeeCode: "EMP-N001",
      userId: secondCompanyAdminUser.id,
      firstName: "Priya",
      lastName: "Nandan",
      workEmail: secondCompanyAdminUser.email,
      dateOfJoining: new Date("2026-05-18T00:00:00.000Z"),
      departmentId: secondCompanyDepartment.id,
      designationId: secondCompanyDesignation.id,
      status: "ACTIVE",
      location: "Head Office"
    }
  });

  const secondCompanyEmployee = await prisma.employee.upsert({
    where: {
      companyId_employeeCode: {
        companyId: secondCompany.id,
        employeeCode: "EMP-N002"
      }
    },
    update: {
      userId: secondCompanyEmployeeUser.id,
      firstName: "Sam",
      lastName: "Okafor",
      workEmail: secondCompanyEmployeeUser.email,
      departmentId: secondCompanyDepartment.id,
      designationId: null,
      managerId: secondCompanyAdminEmployee.id,
      status: "ACTIVE",
      location: "Remote"
    },
    create: {
      companyId: secondCompany.id,
      employeeCode: "EMP-N002",
      userId: secondCompanyEmployeeUser.id,
      firstName: "Sam",
      lastName: "Okafor",
      workEmail: secondCompanyEmployeeUser.email,
      dateOfJoining: new Date("2026-05-19T00:00:00.000Z"),
      departmentId: secondCompanyDepartment.id,
      managerId: secondCompanyAdminEmployee.id,
      status: "ACTIVE",
      location: "Remote"
    }
  });

  await prisma.salary.upsert({
    where: {
      employeeId: secondCompanyAdminEmployee.id
    },
    update: {
      baseSalary: 95000,
      allowances: 9000,
      deductions: 3000,
      effectiveFrom: new Date("2026-05-01T00:00:00.000Z"),
      isActive: true
    },
    create: {
      companyId: secondCompany.id,
      employeeId: secondCompanyAdminEmployee.id,
      baseSalary: 95000,
      allowances: 9000,
      deductions: 3000,
      effectiveFrom: new Date("2026-05-01T00:00:00.000Z"),
      isActive: true
    }
  });

  await prisma.salary.upsert({
    where: {
      employeeId: secondCompanyEmployee.id
    },
    update: {
      baseSalary: 65000,
      allowances: 6000,
      deductions: 2000,
      effectiveFrom: new Date("2026-05-01T00:00:00.000Z"),
      isActive: true
    },
    create: {
      companyId: secondCompany.id,
      employeeId: secondCompanyEmployee.id,
      baseSalary: 65000,
      allowances: 6000,
      deductions: 2000,
      effectiveFrom: new Date("2026-05-01T00:00:00.000Z"),
      isActive: true
    }
  });

  const secondCompanyLeaveType = await prisma.leaveType.upsert({
    where: {
      companyId_name: {
        companyId: secondCompany.id,
        name: "Annual Leave"
      }
    },
    update: {
      description: "Paid planned leave for vacation and personal time",
      defaultAnnualAllowance: 18,
      isPaid: true,
      requiresApproval: true
    },
    create: {
      companyId: secondCompany.id,
      name: "Annual Leave",
      description: "Paid planned leave for vacation and personal time",
      defaultAnnualAllowance: 18,
      isPaid: true,
      requiresApproval: true
    }
  });

  await prisma.leaveType.upsert({
    where: {
      companyId_name: {
        companyId: secondCompany.id,
        name: "Northwind Compassionate Leave"
      }
    },
    update: {
      description: "Northwind demo tenant-only leave type used for isolation checks",
      defaultAnnualAllowance: 5,
      isPaid: true,
      requiresApproval: true
    },
    create: {
      companyId: secondCompany.id,
      name: "Northwind Compassionate Leave",
      description: "Northwind demo tenant-only leave type used for isolation checks",
      defaultAnnualAllowance: 5,
      isPaid: true,
      requiresApproval: true
    }
  });

  await Promise.all(
    [secondCompanyAdminEmployee, secondCompanyEmployee].map((seedEmployee) =>
      prisma.leaveBalance.upsert({
        where: {
          employeeId_leaveTypeId_year: {
            employeeId: seedEmployee.id,
            leaveTypeId: secondCompanyLeaveType.id,
            year: 2026
          }
        },
        update: {},
        create: {
          companyId: secondCompany.id,
          employeeId: seedEmployee.id,
          leaveTypeId: secondCompanyLeaveType.id,
          year: 2026,
          openingBalance: secondCompanyLeaveType.defaultAnnualAllowance,
          available: secondCompanyLeaveType.defaultAnnualAllowance
        }
      })
    )
  );
  await prisma.shift.upsert({
    where: {
      companyId_name: {
        companyId: secondCompany.id,
        name: "Northwind Standard Shift"
      }
    },
    update: {
      startTime: "08:00",
      endTime: "17:00",
      lateAfterMinutes: 10,
      halfDayAfterMinutes: 240,
      isDefault: true,
      isActive: true
    },
    create: {
      companyId: secondCompany.id,
      name: "Northwind Standard Shift",
      startTime: "08:00",
      endTime: "17:00",
      lateAfterMinutes: 10,
      halfDayAfterMinutes: 240,
      isDefault: true,
      isActive: true
    }
  });

  await prisma.holiday.upsert({
    where: {
      companyId_date: {
        companyId: secondCompany.id,
        date: new Date("2026-11-11T00:00:00.000Z")
      }
    },
    update: {
      name: "Northwind Founders Day",
      type: "COMPANY",
      description: "Northwind demo tenant-only holiday used for isolation checks"
    },
    create: {
      companyId: secondCompany.id,
      name: "Northwind Founders Day",
      date: new Date("2026-11-11T00:00:00.000Z"),
      type: "COMPANY",
      description: "Northwind demo tenant-only holiday used for isolation checks"
    }
  });

  await prisma.announcement.upsert({
    where: {
      id: "northwind-demo-announcement"
    },
    update: {
      title: "Northwind demo tenant-only announcement",
      message: "This announcement exists only for cross-tenant isolation checks.",
      audience: "ALL",
      isPublished: true,
      createdById: secondCompanyAdminUser.id
    },
    create: {
      id: "northwind-demo-announcement",
      companyId: secondCompany.id,
      title: "Northwind demo tenant-only announcement",
      message: "This announcement exists only for cross-tenant isolation checks.",
      audience: "ALL",
      isPublished: true,
      createdById: secondCompanyAdminUser.id
    }
  });

  await prisma.notification.upsert({
    where: {
      id: "northwind-demo-notification"
    },
    update: {
      userId: secondCompanyAdminUser.id,
      title: "Northwind workspace ready",
      message: "Northwind demo tenant-only notification used for isolation checks.",
      category: "SYSTEM",
      isRead: false
    },
    create: {
      id: "northwind-demo-notification",
      companyId: secondCompany.id,
      userId: secondCompanyAdminUser.id,
      title: "Northwind workspace ready",
      message: "Northwind demo tenant-only notification used for isolation checks.",
      category: "SYSTEM",
      isRead: false
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
