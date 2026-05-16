import { Router } from "express";
import { env } from "../../config/env";
import { prisma } from "../../lib/prisma";
import { fail, ok } from "../../utils/api-response";

export const healthRouter = Router();

function getDatabaseTarget(databaseUrl: string) {
  try {
    const url = new URL(databaseUrl);

    return {
      host: url.hostname,
      port: url.port || "5432",
      database: url.pathname.replace(/^\//, "") || "unknown",
      schema: url.searchParams.get("schema") ?? "public"
    };
  } catch {
    return {
      host: "unknown",
      port: "unknown",
      database: "unknown",
      schema: "unknown"
    };
  }
}

healthRouter.get("/", async (_req, res) => {
  const startedAt = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json(
      ok({
        service: "hrms-api",
        api: "running",
        database: "connected",
        uptimeSeconds: Math.round(process.uptime()),
        responseTimeMs: Date.now() - startedAt
      })
    );
  } catch (error) {
    res.status(503).json(
      fail("DATABASE_UNAVAILABLE", "API is running, but database is unavailable", {
        service: "hrms-api",
        api: "running",
        database: "disconnected",
        target: getDatabaseTarget(env.DATABASE_URL),
        hint:
          "Start PostgreSQL for DATABASE_URL, then run npm run prisma:migrate and npm run db:seed.",
        uptimeSeconds: Math.round(process.uptime()),
        responseTimeMs: Date.now() - startedAt
      })
    );
  }
});
