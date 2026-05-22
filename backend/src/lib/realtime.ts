import type { Server as HttpServer } from "http";
import type { Notification } from "@prisma/client";
import { Server as SocketServer } from "socket.io";
import { env } from "../config/env";
import { getAuthUserById } from "../modules/auth/auth.service";
import { verifyAccessToken } from "../modules/auth/jwt";

export type RealtimeNotification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  category: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
};

export type NotificationCreatedEvent = {
  notification: RealtimeNotification;
  unreadDelta: number;
};

export type NotificationReadEvent = {
  notification: RealtimeNotification;
  unreadDelta: number;
};

type ServerToClientEvents = {
  "notifications:ready": (payload: { userId: string }) => void;
  "notifications:created": (payload: NotificationCreatedEvent) => void;
  "notifications:read": (payload: NotificationReadEvent) => void;
};

type ClientToServerEvents = Record<string, never>;
type InterServerEvents = Record<string, never>;
type SocketData = {
  userId: string;
};

let realtimeServer: SocketServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
> | null = null;

function getAllowedCorsOrigins(): string[] {
  const origins = new Set([env.CORS_ORIGIN]);

  if (env.CORS_ORIGIN === "http://localhost:3000") {
    origins.add("http://127.0.0.1:3000");
  }

  if (env.CORS_ORIGIN === "http://127.0.0.1:3000") {
    origins.add("http://localhost:3000");
  }

  return [...origins];
}

function getUserRoom(userId: string): string {
  return `user:${userId}`;
}

function getBearerToken(value: string | string[] | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const [scheme, token] = value.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}

function getHandshakeToken(input: {
  authToken: unknown;
  authorizationHeader: string | string[] | undefined;
}): string | null {
  if (typeof input.authToken === "string" && input.authToken.trim().length > 0) {
    return input.authToken;
  }

  return getBearerToken(input.authorizationHeader);
}

function toRealtimeNotification(notification: Notification): RealtimeNotification {
  return {
    id: notification.id,
    userId: notification.userId,
    title: notification.title,
    message: notification.message,
    category: notification.category,
    isRead: notification.isRead,
    readAt: notification.readAt ? notification.readAt.toISOString() : null,
    createdAt: notification.createdAt.toISOString()
  };
}

export function initializeRealtime(server: HttpServer) {
  if (realtimeServer) {
    return realtimeServer;
  }

  const socketServer = new SocketServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(server, {
    cors: {
      origin: getAllowedCorsOrigins(),
      credentials: true
    }
  });

  socketServer.use(async (socket, next) => {
    const token = getHandshakeToken({
      authToken: socket.handshake.auth.token,
      authorizationHeader: socket.handshake.headers.authorization
    });

    if (!token) {
      next(new Error("AUTHENTICATION_REQUIRED"));
      return;
    }

    const payload = verifyAccessToken(token);

    if (!payload) {
      next(new Error("INVALID_ACCESS_TOKEN"));
      return;
    }

    try {
      const user = await getAuthUserById(payload.sub);

      if (!user || user.status !== "ACTIVE") {
        next(new Error("INVALID_ACCESS_TOKEN"));
        return;
      }

      socket.data.userId = user.id;
      next();
    } catch (error) {
      next(error instanceof Error ? error : new Error("REALTIME_AUTH_FAILED"));
    }
  });

  socketServer.on("connection", (socket) => {
    socket.join(getUserRoom(socket.data.userId));
    socket.emit("notifications:ready", {
      userId: socket.data.userId
    });
  });

  realtimeServer = socketServer;
  return socketServer;
}

export function emitNotificationCreated(notification: Notification): void {
  realtimeServer?.to(getUserRoom(notification.userId)).emit("notifications:created", {
    notification: toRealtimeNotification(notification),
    unreadDelta: notification.isRead ? 0 : 1
  });
}

export function emitNotificationRead(input: {
  notification: Notification;
  wasUnread: boolean;
}): void {
  realtimeServer?.to(getUserRoom(input.notification.userId)).emit("notifications:read", {
    notification: toRealtimeNotification(input.notification),
    unreadDelta: input.wasUnread ? -1 : 0
  });
}
