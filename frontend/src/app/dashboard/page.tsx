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
  UserPlus,
  Users
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ProtectedPage } from "@/components/protected-page";
import { getApiErrorMessage, getDashboardSummary, markNotificationRead } from "@/lib/api";
import {
  markNotificationReadInCache,
  replaceNotificationInCache,
  restoreQuerySnapshots,
  snapshotNotificationState,
  syncNotificationUnreadCountInCache
} from "@/lib/optimistic-cache";
import { formatDate } from "@/lib/employee-format";
import { formatMoney } from "@/lib/payroll-format";
import { formatDateTime } from "@/lib/time-format";
import type { AuthUser, DashboardCard } from "@/types";

type DashboardContentProps = {
  user: AuthUser;
  token: string;
};

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
  brand: "text-brand-600",
  blue: "text-ct-blue",
  amber: "text-amber-600",
  slate: "text-slate-500"
};

const metricIconClasses: Record<DashboardCard["tone"], string> = {
  brand: "bg-brand-50 text-brand-600",
  blue: "bg-ct-blue/10 text-ct-blue",
  amber: "bg-amber-50 text-amber-600",
  slate: "bg-slate-100 text-slate-600"
};

const metricBarClasses: Record<DashboardCard["tone"], string> = {
  brand: "bg-brand-600",
  blue: "bg-ct-blue",
  amber: "bg-amber-500",
  slate: "bg-slate-300"
};

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
  const summaryQuery = useQuery({
    queryKey: ["dashboard-summary", token],
    queryFn: () => getDashboardSummary(token),
    retry: false
  });
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
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ct-graphite via-ct-steel to-ct-blueDeep px-5 py-6 text-white shadow-[0_20px_50px_rgba(15,31,61,0.28)] sm:px-8 sm:py-7">
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
            className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-ct-blue/30 blur-3xl"
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
            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ct-graphite shadow-sm">
              {scopeLabel}
            </span>
            <span className="rounded-full px-3 py-1.5 text-xs font-semibold text-white/55">
              Managed by me
            </span>
          </div>
        </section>

        {summaryError ? (
          <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-3 text-sm text-red-700">
            {summaryError}
          </div>
        ) : null}
        {dashboardError ? (
          <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-3 text-sm text-red-700">
            {dashboardError}
          </div>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = cardIcons[card.key] ?? Users;

            return (
              <article
                className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(15,23,42,0.08)]"
                key={card.key}
              >
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-0 top-0 h-[3px] ${metricBarClasses[card.tone]}`}
                />
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {card.label}
                    </p>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-ct-graphite">
                      {getCardValue(card)}
                    </p>
                  </div>
                  <div
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg transition-transform group-hover:scale-105 ${metricIconClasses[card.tone]}`}
                  >
                    <Icon size={18} aria-hidden="true" />
                  </div>
                </div>
                <p className={`mt-3 text-xs font-medium ${metricToneClasses[card.tone]}`}>
                  {card.detail}
                </p>
              </article>
            );
          })}

          {summaryQuery.isLoading && cards.length === 0 ? (
            <div className="col-span-full rounded-xl border border-dashed border-slate-200 bg-white px-5 py-12 text-center text-sm text-slate-500">
              Loading dashboard summary...
            </div>
          ) : null}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="flex min-w-0 items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-ct-graphite">
                  Notifications
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Recent alerts and workflow updates
                </p>
                {notificationError ? (
                  <p className="mt-2 text-xs text-red-700">{notificationError}</p>
                ) : null}
              </div>
              <Link
                className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-ct-blue transition hover:gap-1.5"
                href="/notifications"
              >
                View all
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100 px-5">
              {notifications.map((notification) => {
                const isMarking = markingNotificationId === notification.id;

                return (
                <div key={notification.id} className="flex min-w-0 gap-3 py-4">
                  <div className="relative mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ct-blue/10 text-ct-blue">
                    <Bell size={17} aria-hidden="true" />
                    {!notification.isRead ? (
                      <span
                        aria-hidden="true"
                        className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-white"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <p className="font-semibold text-ct-graphite">{notification.title}</p>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <span className="text-xs text-slate-400">
                          {formatDateTime(notification.createdAt)}
                        </span>
                        <button
                          className="inline-flex h-8 items-center justify-center gap-1 rounded-md border border-slate-200 px-2 text-xs font-semibold text-slate-700 transition active:scale-[0.98] hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
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
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {notification.message}
                    </p>
                  </div>
                </div>
                );
              })}
            </div>
            {!summaryQuery.isLoading && notifications.length === 0 ? (
              <div className="m-5 rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center text-sm text-slate-500">
                No notifications found.
              </div>
            ) : null}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="flex min-w-0 items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-ct-graphite">
                  Announcements
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Published updates for the workspace
                </p>
              </div>
              <Link
                className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-ct-blue transition hover:gap-1.5"
                href="/announcements"
              >
                View all
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100 px-5">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="flex min-w-0 gap-3 py-4">
                  <div className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                    <Megaphone size={17} aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <p className="font-semibold text-ct-graphite">{announcement.title}</p>
                      <span className="shrink-0 text-xs text-slate-400">
                        {formatDate(announcement.publishedAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {announcement.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {!summaryQuery.isLoading && announcements.length === 0 ? (
              <div className="m-5 rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center text-sm text-slate-500">
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
