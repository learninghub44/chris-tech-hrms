import type { Request } from "express";
import { Router } from "express";
import { AnnouncementAudience, Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { authenticate } from "../../middleware/authenticate";
import { requireAnyPermission, requirePermissions } from "../../middleware/authorize";
import { AppError } from "../../middleware/error-handler";
import { ok } from "../../utils/api-response";
import { asyncHandler } from "../../utils/async-handler";

export const notificationsRouter = Router();

const uuidSchema = z.string().uuid();
const paramsSchema = z.object({
  id: uuidSchema
});

const announcementBodySchema = z.object({
  title: z.string().trim().min(2).max(140),
  message: z.string().trim().min(3).max(2000),
  audience: z.nativeEnum(AnnouncementAudience),
  isPublished: z.boolean()
});

function parseInput<T extends z.ZodTypeAny>(schema: T, input: unknown): z.infer<T> {
  const result = schema.safeParse(input);

  if (!result.success) {
    throw new AppError(400, "VALIDATION_ERROR", "Request input is invalid", result.error.flatten());
  }

  return result.data;
}

function getAuth(req: Request) {
  if (!req.auth) {
    throw new AppError(401, "AUTHENTICATION_REQUIRED", "A valid access token is required");
  }

  return req.auth;
}

function getAudienceValues(roles: string[]): AnnouncementAudience[] {
  return ["ALL", ...roles] as AnnouncementAudience[];
}

async function createAnnouncementNotifications(input: {
  transaction: Prisma.TransactionClient;
  announcementId: string;
  title: string;
  message: string;
  audience: AnnouncementAudience;
}) {
  const users = await input.transaction.user.findMany({
    where: {
      status: "ACTIVE",
      ...(input.audience === "ALL"
        ? {}
        : {
            roles: {
              some: {
                role: {
                  name: input.audience
                }
              }
            }
          })
    },
    select: {
      id: true
    }
  });

  if (users.length === 0) {
    return;
  }

  await input.transaction.notification.createMany({
    data: users.map((user) => ({
      userId: user.id,
      title: input.title,
      message: input.message,
      category: `announcement:${input.announcementId}`
    }))
  });
}

notificationsRouter.use(authenticate);

notificationsRouter.get(
  "/notifications",
  requirePermissions(["notifications:read"]),
  asyncHandler(async (req, res) => {
    const auth = getAuth(req);
    const notifications = await prisma.notification.findMany({
      where: {
        userId: auth.id
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    const unreadCount = notifications.filter((notification) => !notification.isRead).length;

    res.status(200).json(ok({ notifications, unreadCount }, { total: notifications.length }));
  })
);

notificationsRouter.put(
  "/notifications/:id/read",
  requirePermissions(["notifications:read"]),
  asyncHandler(async (req, res) => {
    const auth = getAuth(req);
    const params = parseInput(paramsSchema, req.params);
    const notification = await prisma.notification.findFirst({
      where: {
        id: params.id,
        userId: auth.id
      }
    });

    if (!notification) {
      throw new AppError(404, "NOTIFICATION_NOT_FOUND", "Notification was not found");
    }

    const updatedNotification = await prisma.notification.update({
      where: {
        id: notification.id
      },
      data: {
        isRead: true,
        readAt: notification.readAt ?? new Date()
      }
    });

    res.status(200).json(ok({ notification: updatedNotification }));
  })
);

notificationsRouter.get(
  "/announcements",
  requirePermissions(["announcements:read"]),
  asyncHandler(async (req, res) => {
    const auth = getAuth(req);
    const canManage = auth.permissions.includes("announcements:manage");
    const announcements = await prisma.announcement.findMany({
      where: canManage
        ? {}
        : {
            isPublished: true,
            audience: {
              in: getAudienceValues(auth.roles)
            }
          },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        publishedAt: "desc"
      }
    });

    res.status(200).json(ok({ announcements }, { total: announcements.length }));
  })
);

notificationsRouter.post(
  "/announcements",
  requireAnyPermission(["announcements:manage"]),
  asyncHandler(async (req, res) => {
    const auth = getAuth(req);
    const body = parseInput(announcementBodySchema, req.body);

    const announcement = await prisma.$transaction(async (transaction) => {
      const createdAnnouncement = await transaction.announcement.create({
        data: {
          title: body.title,
          message: body.message,
          audience: body.audience,
          isPublished: body.isPublished,
          publishedAt: body.isPublished ? new Date() : new Date(0),
          createdById: auth.id
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      if (body.isPublished) {
        await createAnnouncementNotifications({
          transaction,
          announcementId: createdAnnouncement.id,
          title: createdAnnouncement.title,
          message: createdAnnouncement.message,
          audience: createdAnnouncement.audience
        });
      }

      return createdAnnouncement;
    });

    res.status(201).json(ok({ announcement }));
  })
);
