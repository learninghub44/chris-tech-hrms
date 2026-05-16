import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const defaultDatabaseUrl =
  "postgresql://postgres:postgres@localhost:5432/hrms?schema=public";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = defaultDatabaseUrl;
}

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  CORS_ORIGIN: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1).default(defaultDatabaseUrl)
});

export const env = envSchema.parse(process.env);
