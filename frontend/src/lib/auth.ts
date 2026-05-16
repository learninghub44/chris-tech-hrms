import type { DemoUser } from "@/types";

const SESSION_KEY = "hrms_demo_user";

export function setDemoSession(user: DemoUser) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function getDemoSession(): DemoUser | null {
  const rawSession = window.localStorage.getItem(SESSION_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as DemoUser;
  } catch {
    clearDemoSession();
    return null;
  }
}

export function clearDemoSession() {
  window.localStorage.removeItem(SESSION_KEY);
}
