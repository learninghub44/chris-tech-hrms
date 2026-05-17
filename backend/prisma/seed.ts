import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/modules/auth/password";

const prisma = new PrismaClient();
const seedAdminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin@12345";

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
  { key: "leave:request", description: "Request leave" },
  { key: "leave:approve", description: "Approve leave requests" },
  { key: "payroll:manage", description: "Manage payroll" }
];

const rolePermissions: Record<string, string[]> = {
  SUPER_ADMIN: permissions.map((permission) => permission.key),
  HR_ADMIN: [
    "dashboard:read",
    "profile:read",
    "employees:manage",
    "attendance:read",
    "leave:approve",
    "payroll:manage"
  ],
  MANAGER: ["dashboard:read", "profile:read", "attendance:read", "leave:approve"],
  EMPLOYEE: ["dashboard:read", "profile:read", "attendance:write", "leave:request"]
};

async function main() {
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

  const superAdmin = createdRoles.find((role) => role.name === "SUPER_ADMIN");
  const passwordHash = await hashPassword(seedAdminPassword);

  const user = await prisma.user.upsert({
    where: { email: "admin@hrms.local" },
    update: {
      name: "Phase 2 Admin",
      passwordHash,
      status: "ACTIVE"
    },
    create: {
      email: "admin@hrms.local",
      name: "Phase 2 Admin",
      passwordHash,
      status: "ACTIVE"
    }
  });

  if (superAdmin) {
    await Promise.all(
      createdRoles
        .filter((role) => role.id !== superAdmin.id)
        .map((role) =>
          prisma.userRole.deleteMany({
            where: {
              userId: user.id,
              roleId: role.id
            }
          })
        )
    );

    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId: superAdmin.id
        }
      },
      update: {},
      create: {
        userId: user.id,
        roleId: superAdmin.id
      }
    });
  }
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
