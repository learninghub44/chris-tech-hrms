import { AnnouncementAudience, Prisma, type Notification } from "@prisma/client";

export function getAnnouncementAudienceValues(
  roles: string[]
): AnnouncementAudience[] {
  return ["ALL", ...roles] as AnnouncementAudience[];
}

export async function createAnnouncementNotifications(input: {
  transaction: Prisma.TransactionClient;
  announcementId: string;
  title: string;
  message: string;
  audience: AnnouncementAudience;
}): Promise<Notification[]> {
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
    return [];
  }

  return Promise.all(
    users.map((user) =>
      input.transaction.notification.create({
        data: {
          userId: user.id,
          title: input.title,
          message: input.message,
          category: `announcement:${input.announcementId}`
        }
      })
    )
  );
}
