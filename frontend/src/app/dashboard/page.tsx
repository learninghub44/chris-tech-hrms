"use client";

import {
  AlertCircle,
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  IndianRupee,
  Loader2,
  RefreshCw,
  Megaphone,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { AppShell } from "@/components/app-shell";
import { ProtectedPage } from "@/components/protected-page";
import {
  getApiErrorMessage,
  getAttendanceReportData,
  getDashboardSummary,
  getEmployeeReport,
  getLeaveReportData,
  getPayrollReportData,
  markNotificationRead
} from "@/lib/api";
import {
  markNotificationReadInCache,
  replaceNotificationInCache,
  restoreQuerySnapshots,
  snapshotNotificationState,
  syncNotificationUnreadCountInCache
} from "@/lib/optimistic-cache";
import { formatDate } from "@/lib/employee-format";
import { hasEveryPermission } from "@/lib/permissions";
import { formatMoney } from "@/lib/payroll-format";
import { formatDateTime, getMonthStartInputValue, getTodayInputValue } from "@/lib/time-format";
import type { AuthUser, DashboardCard } from "@/types";

type DashboardContentProps = {
  user: AuthUser;
  token: string;
};

const chartPalette = ["#2563EB", "#3B82F6", "#22C55E", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];

const cardIcons: Record<string, LucideIcon> = {
  employees: Users,
  present_today: Users,
  on_leave: CalendarDays,
  pending_leaves: AlertCircle,
  monthly_payroll: IndianRupee,
  new_hires: UserPlus,
  attrition_rate: TrendingDown,
  unread_notifications: Bell
};

const metricToneClasses: Record<DashboardCard["tone"], string> = {
  brand: "text-success",
  blue: "text-primary-600",
  amber: "text-warning",
  slate: "text-ink2-soft"
};

const metricIconClasses: Record<DashboardCard["tone"], string> = {
  brand: "bg-success/10 text-success",
  blue: "bg-primary-50 text-primary-600 dark:bg-primary-600/15 dark:text-primary-500",
  amber: "bg-warning/10 text-warning",
  slate: "bg-slate-100 text-ink2-soft dark:bg-white/5"
};

const metricBarClasses: Record<DashboardCard["tone"], string> = {
  brand: "bg-success",
  blue: "bg-primary-600",
  amber: "bg-warning",
  slate: "bg-slate-300"
};

function AnimatedNumber({ value }: { value: string }) {
  const numericMatch = /^(-?\d+(?:\.\d+)?)(%?)$/.exec(value.replace(/,/g, ""));
  const [display, setDisplay] = useState(numericMatch ? "0" + numericMatch[2] : value);

  useEffect(() => {
    if (!numericMatch) {
      setDisplay(value);
      return;
    }

    const target = Number(numericMatch[1]);
    const suffix = numericMatch[2];
    const isDecimal = numericMatch[1].includes(".");
    const durationMs = 600;
    const startTime = performance.now();
    let frame: number;

    function tick(now: number) {
      const progress = Math.min((now - startTime) / durationMs, 1);
      const eased = 1 - (1 - progress) * (1 - progress);
      const current = target * eased;

      setDisplay(`${isDecimal ? current.toFixed(1) : Math.round(current)}${suffix}`);

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    }

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <>{display}</>;
}

function getCardValue(card: DashboardCard): string {
  if (card.key === "monthly_payroll" && card.value !== "-") {
    return formatMoney(Number(card.value));
  }

  return card.value;
}

function getCurrentDateLabel(): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short"
  }).format(new Date());
}

function getUserFirstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

function DashboardContent({ user, token }: DashboardContentProps) {
  const queryClient = useQueryClient();
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [isRefreshingDashboard, setIsRefreshingDashboard] = useState(false);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const [markingNotificationId, setMarkingNotificationId] = useState<string | null>(null);
  const canReadReports = hasEveryPermission(user, ["reports:read"]);
  const dateFrom = useMemo(() => getMonthStartInputValue(), []);
  const dateTo = useMemo(() => getTodayInputValue(), []);
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const summaryQuery = useQuery({
    queryKey: ["dashboard-summary", token],
    queryFn: () => getDashboardSummary(token),
    retry: false
  });
  const employeeReportQuery = useQuery({
    queryKey: ["dashboard-employee-report", token, dateFrom, dateTo],
    queryFn: () => getEmployeeReport(token, { dateFrom, dateTo }),
    enabled: canReadReports,
    retry: false,
    staleTime: 5 * 60_000
  });
  const attendanceReportQuery = useQuery({
    queryKey: ["dashboard-attendance-report", token, dateFrom, dateTo],
    queryFn: () => getAttendanceReportData(token, { dateFrom, dateTo }),
    enabled: canReadReports,
    retry: false,
    staleTime: 5 * 60_000
  });
  const leaveReportQuery = useQuery({
    queryKey: ["dashboard-leave-report", token, dateFrom, dateTo],
    queryFn: () => getLeaveReportData(token, { dateFrom, dateTo }),
    enabled: canReadReports,
    retry: false,
    staleTime: 5 * 60_000
  });
  const payrollReportQuery = useQuery({
    queryKey: ["dashboard-payroll-report", token, currentYear],
    queryFn: () => getPayrollReportData(token, { year: currentYear }),
    enabled: canReadReports,
    retry: false,
    staleTime: 5 * 60_000
  });
  const employeeReport = employeeReportQuery.data?.success ? employeeReportQuery.data.data : null;
  const attendanceReport = attendanceReportQuery.data?.success
    ? attendanceReportQuery.data.data
    : null;
  const leaveReport = leaveReportQuery.data?.success ? leaveReportQuery.data.data : null;
  const payrollReport = payrollReportQuery.data?.success ? payrollReportQuery.data.data : null;
  const departmentChartData = useMemo(
    () =>
      Object.entries(employeeReport?.summary.byDepartment ?? {}).map(([name, count]) => ({
        name,
        count
      })),
    [employeeReport]
  );
  const leaveTypeChartData = useMemo(
    () =>
      Object.entries(leaveReport?.summary.byType ?? {}).map(([name, count]) => ({
        name,
        count
      })),
    [leaveReport]
  );
  const attendanceStatusChartData = useMemo(
    () =>
      Object.entries(attendanceReport?.summary.byStatus ?? {}).map(([name, count]) => ({
        name,
        count
      })),
    [attendanceReport]
  );
  const monthLabels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ];
  const payrollChartData = useMemo(
    () =>
      [...(payrollReport?.payrolls ?? [])]
        .sort((a, b) => a.month - b.month)
        .map((payroll) => ({
          name: monthLabels[payroll.month - 1] ?? String(payroll.month),
          net: payroll.totalNet
        })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [payrollReport]
  );
  const hasAnalyticsData =
    departmentChartData.length > 0 ||
    leaveTypeChartData.length > 0 ||
    attendanceStatusChartData.length > 0 ||
    payrollChartData.length > 0;
  const summary = summaryQuery.data?.success ? summaryQuery.data.data : null;
  const cards = summary?.cards ?? [];
  const notifications = summary?.notifications ?? [];
  const announcements = summary?.announcements ?? [];
  const summaryError =
    summaryQuery.data && !summaryQuery.data.success
      ? getApiErrorMessage(summaryQuery.data)
      : summaryQuery.isError
        ? "Unable to reach the API. Check the deployed backend URL and Render service status."
        : null;
  const scopeLabel =
    summary?.scope === "organization" ? "Organization" : "Self-service";

  async function refreshDashboard() {
    setDashboardError(null);
    setIsRefreshingDashboard(true);

    const response = await getDashboardSummary(token, { refresh: true }).catch(() => null);

    setIsRefreshingDashboard(false);

    if (!response) {
      setDashboardError("Unable to reach the API");
      return;
    }

    if (!response.success) {
      setDashboardError(getApiErrorMessage(response));
      return;
    }

    queryClient.setQueryData(["dashboard-summary", token], response);
    void queryClient.invalidateQueries({
      queryKey: ["notifications", token],
      exact: false
    });
  }

  async function markDashboardNotificationRead(id: string) {
    setNotificationError(null);
    setMarkingNotificationId(id);

    const snapshots = snapshotNotificationState(queryClient, token);
    markNotificationReadInCache(
      queryClient,
      token,
      id,
      new Date().toISOString()
    );

    const response = await markNotificationRead(token, id).catch(() => null);

    setMarkingNotificationId(null);

    if (!response) {
      restoreQuerySnapshots(queryClient, snapshots);
      setNotificationError("Unable to reach the API");
      return;
    }

    if (!response.success) {
      restoreQuerySnapshots(queryClient, snapshots);
      setNotificationError(getApiErrorMessage(response));
      return;
    }

    replaceNotificationInCache(queryClient, token, response.data.notification);
    if (Number.isFinite(response.data.unreadCount)) {
      syncNotificationUnreadCountInCache(
        queryClient,
        token,
        response.data.unreadCount
      );
    }
    void queryClient.invalidateQueries({
      queryKey: ["notifications", token],
      exact: false
    });
    void queryClient.invalidateQueries({
      queryKey: ["dashboard-summary", token],
      exact: true
    });
  }

  return (
    <AppShell user={user} token={token}>
      <div className="space-y-5">
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F172A] via-primary-700 to-primary-600 px-5 py-6 text-white shadow-elevated sm:px-8 sm:py-7 animate-fade-in">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "20px 20px"
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary-500/30 blur-3xl"
          />

          <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
                {scopeLabel} overview
              </p>
              <h1 className="mt-1.5 text-2xl font-semibold tracking-tight sm:text-3xl">
                Hey, {getUserFirstName(user.name)}
              </h1>
              <p className="mt-2 max-w-md text-sm text-white/70">
                Quickly access all information about you, your team, and your members
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2 self-start md:self-auto">
              <div className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 text-sm font-medium text-white/85 backdrop-blur-sm">
                <CalendarDays size={16} aria-hidden="true" />
                {getCurrentDateLabel()}
              </div>
              <button
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/15 bg-white/10 text-white/85 backdrop-blur-sm transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                onClick={refreshDashboard}
                disabled={isRefreshingDashboard}
                aria-label="Refresh dashboard"
                aria-busy={isRefreshingDashboard}
              >
                <RefreshCw
                  className={isRefreshingDashboard ? "animate-spin" : undefined}
                  size={16}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>

          <div className="relative mt-6 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full px-3 py-1.5 text-xs font-semibold text-white/55">
              Personal
            </span>
            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-primary-700 shadow-sm">
              {scopeLabel}
            </span>
            <span className="rounded-full px-3 py-1.5 text-xs font-semibold text-white/55">
              Managed by me
            </span>
          </div>
        </section>

        {summaryError ? (
          <div className="rounded-xl border border-danger/20 bg-danger/10 px-5 py-3 text-sm text-danger">
            {summaryError}
          </div>
        ) : null}
        {dashboardError ? (
          <div className="rounded-xl border border-danger/20 bg-danger/10 px-5 py-3 text-sm text-danger">
            {dashboardError}
          </div>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card, index) => {
            const Icon = cardIcons[card.key] ?? Users;

            return (
              <article
                className="group relative overflow-hidden rounded-2xl border border-edge bg-white p-5 shadow-card transition duration-200 hover:-translate-y-1 hover:shadow-elevated dark:border-white/10 dark:bg-[#0c1424] animate-fade-in"
                key={card.key}
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-0 top-0 h-[3px] ${metricBarClasses[card.tone]}`}
                />
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold uppercase tracking-wide text-ink2-soft">
                      {card.label}
                    </p>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-ink2">
                      <AnimatedNumber value={getCardValue(card)} />
                    </p>
                  </div>
                  <div
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3 ${metricIconClasses[card.tone]}`}
                  >
                    <Icon size={18} aria-hidden="true" />
                  </div>
                </div>
                <p className={`mt-3 flex items-center gap-1 text-xs font-medium ${metricToneClasses[card.tone]}`}>
                  {card.tone === "brand" ? <TrendingUp size={12} aria-hidden="true" /> : null}
                  {card.tone === "amber" ? <AlertCircle size={12} aria-hidden="true" /> : null}
                  {card.detail}
                </p>
              </article>
            );
          })}

          {summaryQuery.isLoading && cards.length === 0
            ? Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[124px] rounded-2xl border border-edge bg-white p-5 dark:border-white/10 dark:bg-[#0c1424]"
                >
                  <div className="skeleton h-3 w-20" />
                  <div className="skeleton mt-3 h-8 w-16" />
                  <div className="skeleton mt-3 h-3 w-24" />
                </div>
              ))
            : null}
        </section>

        {canReadReports && hasAnalyticsData ? (
          <section className="grid gap-4 lg:grid-cols-2">
            {departmentChartData.length > 0 ? (
              <div className="rounded-2xl border border-edge bg-white p-5 shadow-card dark:border-white/10 dark:bg-[#0c1424] animate-fade-in">
                <h2 className="text-sm font-semibold text-ink2">Department Distribution</h2>
                <p className="mt-0.5 text-xs text-ink2-soft">
                  Headcount by department, joined {formatDate(dateFrom)} – {formatDate(dateTo)}
                </p>
                <div className="mt-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={departmentChartData}
                        dataKey="count"
                        nameKey="name"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={2}
                      >
                        {departmentChartData.map((entry, index) => (
                          <Cell key={entry.name} fill={chartPalette[index % chartPalette.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid #E2E8F0",
                          fontSize: 12
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
                  {departmentChartData.map((entry, index) => (
                    <span key={entry.name} className="flex items-center gap-1.5 text-xs text-ink2-soft">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: chartPalette[index % chartPalette.length] }}
                        aria-hidden="true"
                      />
                      {entry.name} ({entry.count})
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {payrollChartData.length > 0 ? (
              <div className="rounded-2xl border border-edge bg-white p-5 shadow-card dark:border-white/10 dark:bg-[#0c1424] animate-fade-in">
                <h2 className="text-sm font-semibold text-ink2">Payroll Overview</h2>
                <p className="mt-0.5 text-xs text-ink2-soft">Net payout by month, {currentYear}</p>
                <div className="mt-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={payrollChartData}>
                      <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#64748B" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value: number) => formatMoney(value)}
                        width={80}
                      />
                      <Tooltip
                        formatter={(value) => formatMoney(Number(value ?? 0))}
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid #E2E8F0",
                          fontSize: 12
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="net"
                        stroke="#2563EB"
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: "#2563EB" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : null}

            {leaveTypeChartData.length > 0 ? (
              <div className="rounded-2xl border border-edge bg-white p-5 shadow-card dark:border-white/10 dark:bg-[#0c1424] animate-fade-in">
                <h2 className="text-sm font-semibold text-ink2">Leave Analytics</h2>
                <p className="mt-0.5 text-xs text-ink2-soft">
                  Requests by type, {formatDate(dateFrom)} – {formatDate(dateTo)}
                </p>
                <div className="mt-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={leaveTypeChartData}>
                      <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid #E2E8F0",
                          fontSize: 12
                        }}
                      />
                      <Bar dataKey="count" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : null}

            {attendanceStatusChartData.length > 0 ? (
              <div className="rounded-2xl border border-edge bg-white p-5 shadow-card dark:border-white/10 dark:bg-[#0c1424] animate-fade-in">
                <h2 className="text-sm font-semibold text-ink2">Attendance Overview</h2>
                <p className="mt-0.5 text-xs text-ink2-soft">
                  Records by status, {formatDate(dateFrom)} – {formatDate(dateTo)}
                </p>
                <div className="mt-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attendanceStatusChartData} layout="vertical">
                      <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        tick={{ fontSize: 11, fill: "#64748B" }}
                        axisLine={false}
                        tickLine={false}
                        width={90}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid #E2E8F0",
                          fontSize: 12
                        }}
                      />
                      <Bar dataKey="count" fill="#22C55E" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : null}
          </section>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-2xl border border-edge bg-white shadow-card dark:border-white/10 dark:bg-[#0c1424]">
            <div className="flex min-w-0 items-center justify-between gap-3 border-b border-edge px-5 py-4 dark:border-white/10">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-ink2">
                  Notifications
                </h2>
                <p className="mt-1 text-xs text-ink2-soft">
                  Recent alerts and workflow updates
                </p>
                {notificationError ? (
                  <p className="mt-2 text-xs text-danger">{notificationError}</p>
                ) : null}
              </div>
              <Link
                className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary-600 transition hover:gap-1.5"
                href="/notifications"
              >
                View all
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>

            <div className="divide-y divide-edge px-5 dark:divide-white/10">
              {notifications.map((notification) => {
                const isMarking = markingNotificationId === notification.id;

                return (
                <div key={notification.id} className="flex min-w-0 gap-3 py-4">
                  <div className="relative mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-600/15 dark:text-primary-500">
                    <Bell size={17} aria-hidden="true" />
                    {!notification.isRead ? (
                      <span
                        aria-hidden="true"
                        className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-warning ring-2 ring-white dark:ring-[#0c1424]"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <p className="font-semibold text-ink2">{notification.title}</p>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <span className="text-xs text-ink2-soft">
                          {formatDateTime(notification.createdAt)}
                        </span>
                        <button
                          className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-edge px-2 text-xs font-semibold text-ink2 transition active:scale-[0.98] hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:hover:bg-white/5"
                          type="button"
                          onClick={() => markDashboardNotificationRead(notification.id)}
                          disabled={notification.isRead || isMarking}
                          aria-busy={isMarking}
                        >
                          {isMarking ? (
                            <Loader2 className="animate-spin" size={14} aria-hidden="true" />
                          ) : (
                            <Check size={14} aria-hidden="true" />
                          )}
                          {isMarking
                            ? "Saving..."
                            : notification.isRead
                              ? "Read"
                              : "Mark as read"}
                        </button>
                      </div>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-ink2-soft">
                      {notification.message}
                    </p>
                  </div>
                </div>
                );
              })}
            </div>
            {!summaryQuery.isLoading && notifications.length === 0 ? (
              <div className="m-5 rounded-xl border border-dashed border-edge bg-canvas px-4 py-8 text-center text-sm text-ink2-soft dark:border-white/10 dark:bg-white/5">
                No notifications found.
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-edge bg-white shadow-card dark:border-white/10 dark:bg-[#0c1424]">
            <div className="flex min-w-0 items-center justify-between gap-3 border-b border-edge px-5 py-4 dark:border-white/10">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-ink2">
                  Announcements
                </h2>
                <p className="mt-1 text-xs text-ink2-soft">
                  Published updates for the workspace
                </p>
              </div>
              <Link
                className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary-600 transition hover:gap-1.5"
                href="/announcements"
              >
                View all
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>

            <div className="divide-y divide-edge px-5 dark:divide-white/10">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="flex min-w-0 gap-3 py-4">
                  <div className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-success/10 text-success">
                    <Megaphone size={17} aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <p className="font-semibold text-ink2">{announcement.title}</p>
                      <span className="shrink-0 text-xs text-ink2-soft">
                        {formatDate(announcement.publishedAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-ink2-soft">
                      {announcement.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {!summaryQuery.isLoading && announcements.length === 0 ? (
              <div className="m-5 rounded-xl border border-dashed border-edge bg-canvas px-4 py-8 text-center text-sm text-ink2-soft dark:border-white/10 dark:bg-white/5">
                No announcements found.
              </div>
            ) : null}
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
