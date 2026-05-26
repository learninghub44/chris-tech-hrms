import type { QueryClient, QueryKey } from "@tanstack/react-query";
import type { ApiResponse } from "@/lib/api";
import type { Announcement, DashboardSummary, NotificationRecord } from "@/types";

type NotificationsResponse = {
  notifications: NotificationRecord[];
  unreadCount: number;
};

type AnnouncementsResponse = {
  announcements: Announcement[];
};

export type QuerySnapshot = {
  queryKey: QueryKey;
  data: unknown;
};

const announcementListPageSize = 25;
const dashboardAnnouncementLimit = 5;

function nextUnreadCount(currentCount: number, unreadDelta: number): number {
  return Math.max(0, currentCount + unreadDelta);
}

function applyDashboardUnreadDelta(
  summary: DashboardSummary,
  unreadDelta: number
): DashboardSummary {
  return {
    ...summary,
    cards: summary.cards.map((card) => {
      if (card.key !== "unread_notifications") {
        return card;
      }

      const currentValue = Number(card.value);

      if (!Number.isFinite(currentValue)) {
        return card;
      }

      return {
        ...card,
        value: String(nextUnreadCount(currentValue, unreadDelta))
      };
    })
  };
}

function setDashboardUnreadCount(
  summary: DashboardSummary,
  unreadCount: number
): DashboardSummary {
  return {
    ...summary,
    cards: summary.cards.map((card) => {
      if (card.key !== "unread_notifications") {
        return card;
      }

      return {
        ...card,
        value: String(Math.max(0, unreadCount))
      };
    })
  };
}

function markNotificationRead(
  notification: NotificationRecord,
  notificationId: string,
  readAt: string
): NotificationRecord {
  if (notification.id !== notificationId) {
    return notification;
  }

  return {
    ...notification,
    isRead: true,
    readAt
  };
}

function replaceNotification(
  notifications: NotificationRecord[],
  notification: NotificationRecord
): NotificationRecord[] {
  return notifications.map((currentNotification) =>
    currentNotification.id === notification.id ? notification : currentNotification
  );
}

function hasUnreadNotification(
  notifications: NotificationRecord[],
  notificationId: string
): boolean {
  return notifications.some(
    (notification) => notification.id === notificationId && !notification.isRead
  );
}

function getCachedReadDelta(
  queryClient: QueryClient,
  token: string,
  notificationId: string
): number {
  const notificationQueries = queryClient.getQueryCache().findAll({
    queryKey: ["notifications", token],
    exact: false
  });
  const hasUnreadInNotificationCache = notificationQueries.some((query) => {
    const current = queryClient.getQueryData<ApiResponse<NotificationsResponse>>(
      query.queryKey
    );

    return Boolean(
      current?.success &&
        hasUnreadNotification(current.data.notifications, notificationId)
    );
  });

  if (hasUnreadInNotificationCache) {
    return -1;
  }

  const dashboardSummary = queryClient.getQueryData<ApiResponse<DashboardSummary>>([
    "dashboard-summary",
    token
  ]);

  return dashboardSummary?.success &&
    hasUnreadNotification(dashboardSummary.data.notifications, notificationId)
    ? -1
    : 0;
}

function upsertAnnouncement(
  announcements: Announcement[],
  announcement: Announcement,
  limit: number
): Announcement[] {
  const withoutExistingAnnouncement = announcements.filter(
    (currentAnnouncement) => currentAnnouncement.id !== announcement.id
  );

  return [announcement, ...withoutExistingAnnouncement].slice(0, limit);
}

function removeAnnouncement(
  announcements: Announcement[],
  announcementId: string
): Announcement[] {
  return announcements.filter((announcement) => announcement.id !== announcementId);
}

export function snapshotNotificationState(
  queryClient: QueryClient,
  token: string
): QuerySnapshot[] {
  const notificationQueries = queryClient.getQueryCache().findAll({
    queryKey: ["notifications", token],
    exact: false
  });
  const dashboardQueries = queryClient.getQueryCache().findAll({
    queryKey: ["dashboard-summary", token],
    exact: true
  });

  return [...notificationQueries, ...dashboardQueries].map((query) => ({
    queryKey: query.queryKey,
    data: queryClient.getQueryData(query.queryKey)
  }));
}

export function restoreQuerySnapshots(
  queryClient: QueryClient,
  snapshots: QuerySnapshot[]
): void {
  snapshots.forEach((snapshot) => {
    queryClient.setQueryData(snapshot.queryKey, snapshot.data);
  });
}

export function markNotificationReadInCache(
  queryClient: QueryClient,
  token: string,
  notificationId: string,
  readAt: string
): void {
  const unreadDelta = getCachedReadDelta(queryClient, token, notificationId);
  const notificationQueries = queryClient.getQueryCache().findAll({
    queryKey: ["notifications", token],
    exact: false
  });

  notificationQueries.forEach((query) => {
    queryClient.setQueryData<ApiResponse<NotificationsResponse>>(
      query.queryKey,
      (current) => {
        if (!current?.success) {
          return current;
        }

        return {
          ...current,
          data: {
            ...current.data,
            notifications: current.data.notifications.map((notification) =>
              markNotificationRead(notification, notificationId, readAt)
            ),
            unreadCount: nextUnreadCount(current.data.unreadCount, unreadDelta)
          }
        };
      }
    );
  });

  queryClient.setQueryData<ApiResponse<DashboardSummary>>(
    ["dashboard-summary", token],
    (current) => {
      if (!current?.success) {
        return current;
      }

      return {
        ...current,
        data: applyDashboardUnreadDelta(
          {
            ...current.data,
            notifications: current.data.notifications.map((notification) =>
              markNotificationRead(notification, notificationId, readAt)
            )
          },
          unreadDelta
        )
      };
    }
  );
}

export function replaceNotificationInCache(
  queryClient: QueryClient,
  token: string,
  notification: NotificationRecord
): void {
  const notificationQueries = queryClient.getQueryCache().findAll({
    queryKey: ["notifications", token],
    exact: false
  });

  notificationQueries.forEach((query) => {
    queryClient.setQueryData<ApiResponse<NotificationsResponse>>(
      query.queryKey,
      (current) => {
        if (!current?.success) {
          return current;
        }

        return {
          ...current,
          data: {
            ...current.data,
            notifications: replaceNotification(current.data.notifications, notification)
          }
        };
      }
    );
  });

  queryClient.setQueryData<ApiResponse<DashboardSummary>>(
    ["dashboard-summary", token],
    (current) => {
      if (!current?.success) {
        return current;
      }

      return {
        ...current,
        data: {
          ...current.data,
          notifications: replaceNotification(current.data.notifications, notification)
        }
      };
    }
  );
}

export function syncNotificationUnreadCountInCache(
  queryClient: QueryClient,
  token: string,
  unreadCount: number
): void {
  const nextUnreadCount = Math.max(0, unreadCount);
  const notificationQueries = queryClient.getQueryCache().findAll({
    queryKey: ["notifications", token],
    exact: false
  });

  notificationQueries.forEach((query) => {
    queryClient.setQueryData<ApiResponse<NotificationsResponse>>(
      query.queryKey,
      (current) => {
        if (!current?.success) {
          return current;
        }

        return {
          ...current,
          data: {
            ...current.data,
            unreadCount: nextUnreadCount
          }
        };
      }
    );
  });

  queryClient.setQueryData<ApiResponse<DashboardSummary>>(
    ["dashboard-summary", token],
    (current) => {
      if (!current?.success) {
        return current;
      }

      return {
        ...current,
        data: setDashboardUnreadCount(current.data, nextUnreadCount)
      };
    }
  );
}

export function insertPublishedAnnouncementInCache(
  queryClient: QueryClient,
  token: string,
  announcement: Announcement
): void {
  if (!announcement.isPublished) {
    return;
  }

  const announcementQueries = queryClient.getQueryCache().findAll({
    queryKey: ["announcements", token],
    exact: false
  });

  announcementQueries.forEach((query) => {
    const page = typeof query.queryKey[2] === "number" ? query.queryKey[2] : 1;

    if (page !== 1) {
      return;
    }

    queryClient.setQueryData<ApiResponse<AnnouncementsResponse>>(
      query.queryKey,
      (current) => {
        if (!current) {
          return {
            success: true,
            data: {
              announcements: [announcement]
            }
          };
        }

        if (!current?.success) {
          return current;
        }

        return {
          ...current,
          data: {
            ...current.data,
            announcements: upsertAnnouncement(
              current.data.announcements,
              announcement,
              announcementListPageSize
            )
          }
        };
      }
    );
  });

  queryClient.setQueryData<ApiResponse<DashboardSummary>>(
    ["dashboard-summary", token],
    (current) => {
      if (!current?.success) {
        return current;
      }

      return {
        ...current,
        data: {
          ...current.data,
          announcements: upsertAnnouncement(
            current.data.announcements,
            announcement,
            dashboardAnnouncementLimit
          )
        }
      };
    }
  );
}

export function removeAnnouncementFromCache(
  queryClient: QueryClient,
  token: string,
  announcementId: string
): void {
  const announcementQueries = queryClient.getQueryCache().findAll({
    queryKey: ["announcements", token],
    exact: false
  });

  announcementQueries.forEach((query) => {
    queryClient.setQueryData<ApiResponse<AnnouncementsResponse>>(
      query.queryKey,
      (current) => {
        if (!current?.success) {
          return current;
        }

        return {
          ...current,
          data: {
            ...current.data,
            announcements: removeAnnouncement(
              current.data.announcements,
              announcementId
            )
          }
        };
      }
    );
  });

  queryClient.setQueryData<ApiResponse<DashboardSummary>>(
    ["dashboard-summary", token],
    (current) => {
      if (!current?.success) {
        return current;
      }

      return {
        ...current,
        data: {
          ...current.data,
          announcements: removeAnnouncement(
            current.data.announcements,
            announcementId
          )
        }
      };
    }
  );
}
