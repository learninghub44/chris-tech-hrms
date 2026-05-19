import { PrismaClient } from "@prisma/client";

const shouldLogQueries =
  process.env.NODE_ENV === "development" && process.env.PRISMA_QUERY_LOGS === "true";

export const prisma = new PrismaClient({
  log: shouldLogQueries ? ["query", "error", "warn"] : ["error"]
});
