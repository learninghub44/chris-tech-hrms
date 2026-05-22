"use client";

import { Bell, Check } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { PaginationControls } from "@/components/pagination-controls";
import { ProtectedPage } from "@/components/protected-page";
import {
  getApiErrorMessage,
  getPaginationMeta,
  listNotifications,
  markNotificationRead
} from "@/lib/api";
import { formatDateTime } from "@/lib/time-format";
import type { AuthUser } from "@/types";

type NotificationsContentProps = {
  user: AuthUser;
  token: string;
};

const pageSize = 25;

function NotificationsContent({ user, token }: NotificationsContentProps) {
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const notificationsQuery = useQuery({
    queryKey: ["notifications", token, page],
    queryFn: () => listNotifications(token, { page, pageSize }),
    retry: false
  });
  const notifications = notificationsQuery.data?.success
    ? notificationsQuery.data.data.notifications
    : [];
  const unreadCount = notificationsQuery.data?.success
    ? notificationsQuery.data.data.unreadCount
    : 0;
  const pagination = useMemo(
    () => (notificationsQuery.data ? getPaginationMeta(notificationsQuery.data) : null),
    [notificationsQuery.data]
  );

  async function markRead(id: string) {
    setError(null);
    const response = await markNotificationRead(token, id).catch(() => null);

    if (!response) {
      setError("Unable to reach the API");
      return;
    }

    if (!response.success) {
      setError(getApiErrorMessage(response));
      return;
    }

    await notificationsQuery.refetch();
  }

  return (
    <AppShell user={user} token={token}>
      <div className="space-y-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-md bg-brand-50 text-brand-700">
            <Bell size={22} aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-brand-700">Notifications</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-ink">
              In-app Alerts
            </h1>
          </div>
        </div>

        <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-lg font-semibold tracking-normal">
              {unreadCount} unread
            </h2>
            {error ? <p className="text-sm text-red-700">{error}</p> : null}
          </div>
          <div className="mt-5 divide-y divide-line">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`grid gap-4 py-4 sm:grid-cols-[1fr_auto] ${
                  notification.isRead ? "text-slate-600" : "text-ink"
                }`}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{notification.title}</p>
                    {!notification.isRead ? (
                      <span className="rounded-md bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700">
                        New
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    {formatDateTime(notification.createdAt)}
                  </p>
                </div>
                <button
                  className="grid h-9 w-9 place-items-center rounded-md border border-line text-slate-600 transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
                  type="button"
                  onClick={() => markRead(notification.id)}
                  disabled={notification.isRead}
                  aria-label="Mark notification as read"
                >
                  <Check size={16} aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
          {!notificationsQuery.isLoading && notifications.length === 0 ? (
            <div className="mt-5 rounded-md border border-dashed border-line px-4 py-8 text-center text-sm text-slate-500">
              No notifications found.
            </div>
          ) : null}
          <PaginationControls
            pagination={pagination}
            onPageChange={setPage}
            isFetching={notificationsQuery.isFetching}
          />
        </section>
      </div>
    </AppShell>
  );
}

export default function NotificationsPage() {
  return (
    <ProtectedPage requiredPermissions={["notifications:read"]}>
      {({ user, token }) => <NotificationsContent user={user} token={token} />}
    </ProtectedPage>
  );
}
