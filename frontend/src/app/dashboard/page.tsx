"use client";

import {
  Activity,
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Database,
  Users
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { StatusCard } from "@/components/status-card";
import { getDemoSession } from "@/lib/auth";
import { getHealth, getMe } from "@/lib/api";
import type { DemoUser } from "@/types";

const metrics = [
  {
    label: "Employees",
    value: "0",
    detail: "Ready for Phase 3",
    icon: Users,
    tone: "brand"
  },
  {
    label: "Present Today",
    value: "0",
    detail: "Ready for Phase 4",
    icon: Clock3,
    tone: "blue"
  },
  {
    label: "Leave Requests",
    value: "0",
    detail: "Ready for Phase 5",
    icon: CalendarDays,
    tone: "amber"
  },
  {
    label: "Payroll Runs",
    value: "0",
    detail: "Ready for Phase 6",
    icon: Activity,
    tone: "slate"
  }
] as const;

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<DemoUser | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    const session = getDemoSession();

    if (!session) {
      router.replace("/login");
      return;
    }

    setUser(session);
    setSessionChecked(true);
  }, [router]);

  const health = useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
    retry: false,
    enabled: sessionChecked
  });

  const me = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    retry: false,
    enabled: sessionChecked
  });

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

  if (!user) {
    return (
      <main className="grid min-h-screen place-items-center bg-surface">
        <div className="h-10 w-10 animate-pulse rounded-md bg-brand-100" />
      </main>
    );
  }

  return (
    <AppShell user={user}>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium text-brand-700">Dashboard</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-ink">
              HRMS Foundation
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
            <h2 className="text-lg font-semibold tracking-normal">Session</h2>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4 rounded-md bg-surface px-4 py-3">
                <span className="text-slate-500">User</span>
                <span className="font-medium text-ink">{user.name}</span>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-md bg-surface px-4 py-3">
                <span className="text-slate-500">Role</span>
                <span className="font-medium text-ink">{user.role}</span>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-md bg-surface px-4 py-3">
                <span className="text-slate-500">API user</span>
                <span className="font-medium text-ink">
                  {me.data?.success ? me.data.data.user.email : "Unavailable"}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
