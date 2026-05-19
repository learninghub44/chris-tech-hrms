"use client";

import {
  AlertCircle,
  Bell,
  CalendarDays,
  DollarSign,
  Megaphone,
  TrendingDown,
  UserPlus,
  Users
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { ProtectedPage } from "@/components/protected-page";
import { StatusCard } from "@/components/status-card";
import { getDashboardSummary } from "@/lib/api";
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
  monthly_payroll: DollarSign,
  new_hires: UserPlus,
  attrition_rate: TrendingDown,
  unread_notifications: Bell
};

function getCardValue(card: DashboardCard): string {
  if (card.key === "monthly_payroll" && card.value !== "-") {
    return formatMoney(Number(card.value));
  }

  return card.value;
}

function DashboardContent({ user, token }: DashboardContentProps) {
  const summaryQuery = useQuery({
    queryKey: ["dashboard-summary", token],
    queryFn: () => getDashboardSummary(token),
    retry: false
  });
  const summary = summaryQuery.data?.success ? summaryQuery.data.data : null;
  const cards = summary?.cards ?? [];
  const notifications = summary?.notifications ?? [];
  const announcements = summary?.announcements ?? [];

  return (
    <AppShell user={user} token={token}>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium text-brand-700">Dashboard</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-ink">
              HRMS Operations
            </h1>
          </div>
          <div className="inline-flex h-10 items-center gap-2 self-start rounded-md border border-line bg-white px-3 text-sm text-slate-600 md:self-auto">
            {summary?.scope === "organization" ? "Organization view" : "Self-service view"}
          </div>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = cardIcons[card.key] ?? Users;

            return (
              <StatusCard
                key={card.key}
                label={card.label}
                value={getCardValue(card)}
                detail={card.detail}
                icon={Icon}
                tone={card.tone}
              />
            );
          })}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-md bg-brand-50 text-brand-700">
                  <Bell size={20} aria-hidden="true" />
                </div>
                <h2 className="text-lg font-semibold tracking-normal">Notifications</h2>
              </div>
              <Link className="text-sm font-medium text-brand-700" href="/notifications">
                View all
              </Link>
            </div>
            <div className="mt-5 divide-y divide-line">
              {notifications.map((notification) => (
                <div key={notification.id} className="py-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-ink">{notification.title}</p>
                    <span className="text-xs text-slate-500">
                      {formatDateTime(notification.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
                </div>
              ))}
            </div>
            {!summaryQuery.isLoading && notifications.length === 0 ? (
              <div className="mt-5 rounded-md border border-dashed border-line px-4 py-8 text-center text-sm text-slate-500">
                No notifications found.
              </div>
            ) : null}
          </div>

          <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-md bg-brand-50 text-brand-700">
                  <Megaphone size={20} aria-hidden="true" />
                </div>
                <h2 className="text-lg font-semibold tracking-normal">Announcements</h2>
              </div>
              <Link className="text-sm font-medium text-brand-700" href="/announcements">
                View all
              </Link>
            </div>
            <div className="mt-5 divide-y divide-line">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="py-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-ink">{announcement.title}</p>
                    <span className="text-xs text-slate-500">
                      {formatDate(announcement.publishedAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{announcement.message}</p>
                </div>
              ))}
            </div>
            {!summaryQuery.isLoading && announcements.length === 0 ? (
              <div className="mt-5 rounded-md border border-dashed border-line px-4 py-8 text-center text-sm text-slate-500">
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
