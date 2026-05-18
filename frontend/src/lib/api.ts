import type {
  AuthUser,
  Department,
  Designation,
  Employee,
  EmployeeDocument,
  EmploymentStatus
} from "@/types";

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

type RequestOptions = {
  method: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  token?: string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type HealthResponse = {
  service: string;
  api: string;
  database: "connected" | "disconnected";
  uptimeSeconds: number;
  responseTimeMs: number;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export type MeResponse = {
  authenticated: boolean;
  user: AuthUser;
};

export type ForgotPasswordResponse = {
  message: string;
  deliveryMode: "email" | "development_response";
  resetToken?: string;
  expiresAt?: string;
};

export type EmergencyContactInput = {
  name: string;
  relationship: string;
  phone: string;
  email: string | null;
  isPrimary?: boolean;
};

export type EmployeeInput = {
  employeeCode: string;
  firstName: string;
  lastName: string;
  workEmail: string;
  personalEmail: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  dateOfJoining: string;
  dateOfExit: string | null;
  status: EmploymentStatus;
  location: string | null;
  departmentId: string | null;
  designationId: string | null;
  managerId: string | null;
  emergencyContacts: EmergencyContactInput[];
};

export type EmployeeFilters = {
  search?: string;
  status?: EmploymentStatus | "";
  departmentId?: string;
  designationId?: string;
};

export type EmployeeDocumentInput = {
  documentType: string;
  fileName: string;
  fileUrl: string;
  mimeType: string | null;
  sizeBytes: number | null;
  notes: string | null;
};

async function request<T>(
  path: string,
  options: RequestOptions
): Promise<ApiResponse<T>> {
  const headers = new Headers({
    Accept: "application/json"
  });

  if (options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok && payload.success) {
    throw new Error("Unexpected API response");
  }

  return payload;
}

export function getApiErrorMessage(response: ApiResponse<unknown>): string {
  if (response.success) {
    return "Request completed";
  }

  return response.error.message;
}

export function getHealth() {
  return request<HealthResponse>("/health", {
    method: "GET"
  });
}

export function login(input: { email: string; password: string }) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: input
  });
}

export function register(input: {
  name: string;
  email: string;
  password: string;
}) {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: input
  });
}

export function forgotPassword(input: { email: string }) {
  return request<ForgotPasswordResponse>("/auth/forgot-password", {
    method: "POST",
    body: input
  });
}

export function resetPassword(input: { token: string; password: string }) {
  return request<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: input
  });
}

export function getMe(token: string) {
  return request<MeResponse>("/auth/me", {
    method: "GET",
    token
  });
}

export function logout(token: string) {
  return request<{ message: string }>("/auth/logout", {
    method: "POST",
    token
  });
}

export function listEmployees(token: string, filters: EmployeeFilters) {
  const params = new URLSearchParams();

  if (filters.search) {
    params.set("search", filters.search);
  }

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.departmentId) {
    params.set("departmentId", filters.departmentId);
  }

  if (filters.designationId) {
    params.set("designationId", filters.designationId);
  }

  const query = params.toString();

  return request<{ employees: Employee[] }>(`/employees${query ? `?${query}` : ""}`, {
    method: "GET",
    token
  });
}

export function getEmployee(token: string, id: string) {
  return request<{ employee: Employee }>(`/employees/${id}`, {
    method: "GET",
    token
  });
}

export function getMyEmployeeProfile(token: string) {
  return request<{ employee: Employee | null }>("/employees/me", {
    method: "GET",
    token
  });
}

export function createEmployee(token: string, input: EmployeeInput) {
  return request<{ employee: Employee }>("/employees", {
    method: "POST",
    body: input,
    token
  });
}

export function updateEmployee(token: string, id: string, input: EmployeeInput) {
  return request<{ employee: Employee }>(`/employees/${id}`, {
    method: "PUT",
    body: input,
    token
  });
}

export function deactivateEmployee(token: string, id: string) {
  return request<{ employee: Employee }>(`/employees/${id}`, {
    method: "DELETE",
    token
  });
}

export function uploadEmployeeDocument(
  token: string,
  employeeId: string,
  input: EmployeeDocumentInput
) {
  return request<{ document: EmployeeDocument }>(`/employees/${employeeId}/documents`, {
    method: "POST",
    body: input,
    token
  });
}

export function listDepartments(token: string) {
  return request<{ departments: Department[] }>("/departments", {
    method: "GET",
    token
  });
}

export function createDepartment(
  token: string,
  input: { name: string; description: string | null }
) {
  return request<{ department: Department }>("/departments", {
    method: "POST",
    body: input,
    token
  });
}

export function listDesignations(token: string) {
  return request<{ designations: Designation[] }>("/designations", {
    method: "GET",
    token
  });
}

export function createDesignation(
  token: string,
  input: { title: string; description: string | null; departmentId: string | null }
) {
  return request<{ designation: Designation }>("/designations", {
    method: "POST",
    body: input,
    token
  });
}
