import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const defaultDatabaseUrl =
  "postgresql://postgres:postgres@localhost:5432/hrms?schema=public";
const defaultJwtSecret = "local-development-jwt-secret-change-me-32";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = defaultDatabaseUrl;
}

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  CORS_ORIGIN: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1).default(defaultDatabaseUrl),
  JWT_SECRET: z.string().min(32).default(defaultJwtSecret),
  JWT_EXPIRES_IN_SECONDS: z.coerce.number().int().positive().default(86_400),
  PASSWORD_RESET_EXPIRES_IN_MINUTES: z.coerce.number().int().positive().default(30)
});

export const env = envSchema.parse(process.env);
