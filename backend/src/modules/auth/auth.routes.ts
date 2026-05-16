import { Router } from "express";
import { ok } from "../../utils/api-response";

export const authRouter = Router();

authRouter.get("/me", (_req, res) => {
  res.status(200).json(
    ok({
      authenticated: true,
      mode: "phase-1-demo",
      user: {
        id: "phase-1-admin",
        name: "Phase 1 Admin",
        email: "admin@hrms.local",
        roles: ["SUPER_ADMIN"],
        permissions: [
          "dashboard:read",
          "users:manage",
          "employees:manage",
          "attendance:read",
          "leave:approve",
          "payroll:manage"
        ]
      }
    })
  );
});
