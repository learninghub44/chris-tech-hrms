"use client";

import {
  Activity,
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Database,
  ShieldCheck,
  Users
} from "lucide-react";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { ProtectedPage } from "@/components/protected-page";
import { StatusCard } from "@/components/status-card";
import { getHealth, listEmployees } from "@/lib/api";
import { hasEveryPermission, roleLabels } from "@/lib/permissions";
import type { AuthUser } from "@/types";

type DashboardContentProps = {
  user: AuthUser;
  token: string;
};

function DashboardContent({ user, token }: DashboardContentProps) {
  const health = useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
    retry: false
  });
  const canManageEmployees = hasEveryPermission(user, ["employees:manage"]);
  const employeesQuery = useQuery({
    queryKey: ["dashboard-employees", token],
    queryFn: () => listEmployees(token, {}),
    retry: false,
    enabled: canManageEmployees
  });
  const employeeCount = employeesQuery.data?.success
    ? employeesQuery.data.data.employees.length
    : 0;
  const activeEmployeeCount = employeesQuery.data?.success
    ? employeesQuery.data.data.employees.filter((employee) => employee.status === "ACTIVE").length
    : 0;
  const metrics = [
    {
      label: "Employees",
      value: canManageEmployees ? String(employeeCount) : "-",
      detail: "Managed records",
      icon: Users,
      tone: "brand" as const
    },
    {
      label: "Active Staff",
      value: canManageEmployees ? String(activeEmployeeCount) : "-",
      detail: "Employee core",
      icon: Clock3,
      tone: "blue" as const
    },
    {
      label: "Leave Requests",
      value: "0",
      detail: "Ready for Phase 5",
      icon: CalendarDays,
      tone: "amber" as const
    },
    {
      label: "Payroll Runs",
      value: "0",
      detail: "Ready for Phase 6",
      icon: Activity,
      tone: "slate" as const
    }
  ];

  const databaseStatus = useMemo(() => {
    if (health.isLoading) {
      return "Checking";
    }

    if (!health.data?.success) {
      return "Unavailable";
    }

    return health.data.data.database === "connected"
      ? "Connected"
      : "Unavailable";
  }, [health.data, health.isLoading]);

  const primaryRole = user.roles[0];

  return (
    <AppShell user={user} token={token}>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium text-brand-700">Dashboard</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-ink">
              HRMS Employee Core
            </h1>
          </div>
          <div className="inline-flex h-10 items-center gap-2 self-start rounded-md border border-line bg-white px-3 text-sm text-slate-600 md:self-auto">
            {databaseStatus === "Connected" ? (
              <CheckCircle2 className="text-brand-600" size={17} aria-hidden="true" />
            ) : (
              <AlertCircle className="text-amber-600" size={17} aria-hidden="true" />
            )}
            Database: {databaseStatus}
          </div>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <StatusCard key={metric.label} {...metric} />
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-md bg-brand-50 text-brand-700">
                <Database size={20} aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-semibold tracking-normal">
                  Backend Status
                </h2>
                <p className="text-sm text-slate-500">GET /api/health</p>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-md border border-line">
              <div className="grid grid-cols-[140px_1fr] border-b border-line bg-surface px-4 py-3 text-sm">
                <span className="font-medium text-slate-600">API</span>
                <span>{health.data?.success ? "Running" : "Not reachable"}</span>
              </div>
              <div className="grid grid-cols-[140px_1fr] border-b border-line px-4 py-3 text-sm">
                <span className="font-medium text-slate-600">Database</span>
                <span>{databaseStatus}</span>
              </div>
              <div className="grid grid-cols-[140px_1fr] px-4 py-3 text-sm">
                <span className="font-medium text-slate-600">Response</span>
                <span>
                  {health.data?.success
                    ? `${health.data.data.responseTimeMs} ms`
                    : "Waiting for backend"}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-md bg-brand-50 text-brand-700">
                <ShieldCheck size={20} aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-semibold tracking-normal">
                  Authenticated Session
                </h2>
                <p className="text-sm text-slate-500">GET /api/auth/me</p>
              </div>
            </div>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4 rounded-md bg-surface px-4 py-3">
                <span className="text-slate-500">User</span>
                <span className="font-medium text-ink">{user.name}</span>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-md bg-surface px-4 py-3">
                <span className="text-slate-500">Role</span>
                <span className="font-medium text-ink">
                  {primaryRole ? roleLabels[primaryRole] : "User"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-md bg-surface px-4 py-3">
                <span className="text-slate-500">Status</span>
                <span className="font-medium text-ink">{user.status}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedPage requiredPermissions={["dashboard:read"]}>
      {({ user, token }) => <DashboardContent user={user} token={token} />}
    </ProtectedPage>
  );
}
