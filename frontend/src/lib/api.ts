const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
};

type ApiFailure = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type HealthResponse = {
  service: string;
  api: string;
  database: "connected" | "disconnected";
  uptimeSeconds: number;
  responseTimeMs: number;
};

export type MeResponse = {
  authenticated: boolean;
  mode: string;
  user: {
    id: string;
    name: string;
    email: string;
    roles: string[];
    permissions: string[];
  };
};

async function request<T>(path: string): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      Accept: "application/json"
    }
  });

  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok && payload.success) {
    throw new Error("Unexpected API response");
  }

  return payload;
}

export function getHealth() {
  return request<HealthResponse>("/health");
}

export function getMe() {
  return request<MeResponse>("/auth/me");
}
