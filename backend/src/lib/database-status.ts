export type DatabaseTarget = {
  host: string;
  port: string;
  database: string;
  schema: string;
};

export type DatabaseStatusDetails = {
  service: "hrms-api";
  api: "running";
  database: "connected" | "disconnected";
  target: DatabaseTarget;
  hint: string;
  uptimeSeconds: number;
  responseTimeMs: number;
};

export function getDatabaseTarget(databaseUrl: string): DatabaseTarget {
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

export function getDatabaseUnavailableDetails(
  databaseUrl: string,
  startedAt: number
): DatabaseStatusDetails {
  return {
    service: "hrms-api",
    api: "running",
    database: "disconnected",
    target: getDatabaseTarget(databaseUrl),
    hint:
      "Start PostgreSQL for DATABASE_URL, then run npm run prisma:migrate:deploy and npm run db:seed (use prisma:migrate instead only against a local dev database).",
    uptimeSeconds: Math.round(process.uptime()),
    responseTimeMs: Date.now() - startedAt
  };
}

export function getDatabaseSchemaNotReadyDetails(
  databaseUrl: string,
  startedAt: number
): DatabaseStatusDetails {
  return {
    service: "hrms-api",
    api: "running",
    database: "connected",
    target: getDatabaseTarget(databaseUrl),
    hint:
      "The database is reachable, but the schema is not ready. Run npm run prisma:migrate:deploy and npm run db:seed (prisma:migrate is for local dev only — it runs 'prisma migrate dev', which is unsafe against a hosted production database).",
    uptimeSeconds: Math.round(process.uptime()),
    responseTimeMs: Date.now() - startedAt
  };
}
