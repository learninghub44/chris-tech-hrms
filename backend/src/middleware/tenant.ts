import type { RequestHandler } from "express";
import { AppError } from "./error-handler";
import type { AuthUser } from "../modules/auth/auth.service";

/**
 * Phase 2 of the multi-tenant migration (see MULTI_TENANT_ROADMAP.md).
 *
 * These helpers are the shared pattern every company-scoped module (Phase 3
 * onward) should use:
 *
 *   - `requireCompanyContext` as route middleware, mounted alongside
 *     `authenticate` on every router except a future platform-admin router.
 *   - `companyScope(req)` to build a `{ companyId }` filter for Prisma
 *     `where` clauses on list/create queries.
 *   - `assertSameCompany(resourceCompanyId, req)` after fetching a single
 *     resource by id, to confirm it belongs to the caller's company before
 *     returning or mutating it.
 *
 * IMPORTANT: a mismatch throws 404, not 403. Returning 403 confirms to the
 * caller that a resource with that id exists in another tenant, which is
 * itself an information leak across the company boundary. 404 reveals
 * nothing about whether the id exists at all.
 */

export const requireCompanyContext: RequestHandler = (req, _res, next) => {
  if (!req.auth) {
    throw new AppError(401, "AUTHENTICATION_REQUIRED", "A valid access token is required");
  }

  if (!req.auth.companyId) {
    throw new AppError(
      403,
      "COMPANY_CONTEXT_REQUIRED",
      "This account is not associated with a company"
    );
  }

  next();
};

export function companyScope(req: { auth?: AuthUser }): { companyId: string } {
  if (!req.auth?.companyId) {
    throw new AppError(
      403,
      "COMPANY_CONTEXT_REQUIRED",
      "This account is not associated with a company"
    );
  }

  return { companyId: req.auth.companyId };
}

export function assertSameCompany(
  resourceCompanyId: string | null | undefined,
  req: { auth?: AuthUser }
): void {
  const scope = companyScope(req);

  if (resourceCompanyId !== scope.companyId) {
    // Phase 6 hardening (see MULTI_TENANT_ROADMAP.md): this branch only
    // fires when an authenticated user's request resolves to a resource
    // owned by a *different* company than their own — either a bug in a
    // module's scoping, or a deliberate attempt to guess/enumerate another
    // tenant's resource ids. Either way it's worth a durable signal, since
    // this is exactly the kind of thing that's silent until it leaks data.
    console.warn("tenant boundary violation blocked", {
      event: "CROSS_TENANT_ACCESS_ATTEMPT",
      requestingUserId: req.auth?.id ?? null,
      requestingCompanyId: scope.companyId,
      attemptedResourceCompanyId: resourceCompanyId ?? null,
      timestamp: new Date().toISOString()
    });

    throw new AppError(404, "NOT_FOUND", "The requested resource was not found");
  }
}
