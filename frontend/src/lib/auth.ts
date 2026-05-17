import type { AuthSession, AuthUser } from "@/types";

const SESSION_KEY = "hrms_auth_session";

export function setAuthSession(session: AuthSession): void {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getAuthSession(): AuthSession | null {
  const rawSession = window.localStorage.getItem(SESSION_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as AuthSession;
  } catch {
    clearAuthSession();
    return null;
  }
}

export function updateAuthUser(user: AuthUser): AuthSession | null {
  const session = getAuthSession();

  if (!session) {
    return null;
  }

  const nextSession = {
    ...session,
    user
  };

  setAuthSession(nextSession);
  return nextSession;
}

export function clearAuthSession(): void {
  window.localStorage.removeItem(SESSION_KEY);
}
