import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { errorHandler } from "./middleware/error-handler";
import { notFoundHandler } from "./middleware/not-found";
import { authRouter } from "./modules/auth/auth.routes";
import { attendanceRouter } from "./modules/attendance/attendance.routes";
import { employeeCoreRouter } from "./modules/employees/employees.routes";
import { healthRouter } from "./modules/health/health.routes";
import { leaveRouter } from "./modules/leaves/leaves.routes";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true
    })
  );
  app.use(express.json({ limit: "5mb" }));
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

  app.use("/api/health", healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api", employeeCoreRouter);
  app.use("/api", attendanceRouter);
  app.use("/api", leaveRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
