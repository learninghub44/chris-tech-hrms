import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const roles = [
  { name: "SUPER_ADMIN", description: "Full system access" },
  { name: "HR_ADMIN", description: "HR operations access" },
  { name: "MANAGER", description: "Team-level access" },
  { name: "EMPLOYEE", description: "Self-service access" }
];

const permissions = [
  { key: "dashboard:read", description: "View dashboard" },
  { key: "users:manage", description: "Manage users and roles" },
  { key: "employees:manage", description: "Manage employees" },
  { key: "attendance:read", description: "View attendance" },
  { key: "leave:approve", description: "Approve leave requests" },
  { key: "payroll:manage", description: "Manage payroll" }
];

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

  const superAdmin = createdRoles.find((role) => role.name === "SUPER_ADMIN");

  if (superAdmin) {
    await Promise.all(
      createdPermissions.map((permission) =>
        prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: superAdmin.id,
              permissionId: permission.id
            }
          },
          update: {},
          create: {
            roleId: superAdmin.id,
            permissionId: permission.id
          }
        })
      )
    );
  }

  const user = await prisma.user.upsert({
    where: { email: "admin@hrms.local" },
    update: {
      name: "Phase 1 Admin",
      status: "ACTIVE"
    },
    create: {
      email: "admin@hrms.local",
      name: "Phase 1 Admin",
      passwordHash: "phase-1-placeholder",
      status: "ACTIVE"
    }
  });

  if (superAdmin) {
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
