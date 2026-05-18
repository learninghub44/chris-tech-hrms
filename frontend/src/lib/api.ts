import type {
  AttendanceRecord,
  AttendanceStatus,
  AttendanceWorkMode,
  AuthUser,
  Department,
  Designation,
  Employee,
  EmployeeDocument,
  EmploymentStatus,
  Holiday,
  HolidayType,
  LeaveBalance,
  LeaveDayType,
  LeaveRequest,
  LeaveRequestStatus,
  LeaveType,
  Shift
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

export type AttendanceFilters = {
  dateFrom?: string;
  dateTo?: string;
  employeeId?: string;
  departmentId?: string;
  status?: AttendanceStatus | "";
};

export type ShiftInput = {
  name: string;
  startTime: string;
  endTime: string;
  lateAfterMinutes: number;
  halfDayAfterMinutes: number;
  isDefault: boolean;
  isActive: boolean;
};

export type HolidayInput = {
  name: string;
  date: string;
  type: HolidayType;
  description: string | null;
};

export type LeaveInput = {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  dayType: LeaveDayType;
  reason: string;
};

export type LeaveFilters = {
  status?: LeaveRequestStatus | "";
  employeeId?: string;
  departmentId?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type LeaveTypeInput = {
  name: string;
  description: string | null;
  defaultAnnualAllowance: number;
  isPaid: boolean;
  requiresApproval: boolean;
  isActive: boolean;
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

export function clockIn(
  token: string,
  input: { workMode: AttendanceWorkMode; notes: string | null }
) {
  return request<{ attendance: AttendanceRecord }>("/attendance/clock-in", {
    method: "POST",
    body: input,
    token
  });
}

export function clockOut(token: string, input: { notes: string | null }) {
  return request<{ attendance: AttendanceRecord }>("/attendance/clock-out", {
    method: "POST",
    body: input,
    token
  });
}

export function getMyAttendance(
  token: string,
  input: { dateFrom?: string; dateTo?: string }
) {
  const params = new URLSearchParams();

  if (input.dateFrom) {
    params.set("dateFrom", input.dateFrom);
  }

  if (input.dateTo) {
    params.set("dateTo", input.dateTo);
  }

  const query = params.toString();

  return request<{
    attendance: AttendanceRecord[];
    todayAttendance: AttendanceRecord | null;
  }>(`/attendance/me${query ? `?${query}` : ""}`, {
    method: "GET",
    token
  });
}

export function getAttendanceReport(token: string, filters: AttendanceFilters) {
  const params = new URLSearchParams();

  if (filters.dateFrom) {
    params.set("dateFrom", filters.dateFrom);
  }

  if (filters.dateTo) {
    params.set("dateTo", filters.dateTo);
  }

  if (filters.employeeId) {
    params.set("employeeId", filters.employeeId);
  }

  if (filters.departmentId) {
    params.set("departmentId", filters.departmentId);
  }

  if (filters.status) {
    params.set("status", filters.status);
  }

  const query = params.toString();

  return request<{ attendance: AttendanceRecord[] }>(
    `/attendance/report${query ? `?${query}` : ""}`,
    {
      method: "GET",
      token
    }
  );
}

export function listShifts(token: string) {
  return request<{ shifts: Shift[] }>("/shifts", {
    method: "GET",
    token
  });
}

export function createShift(token: string, input: ShiftInput) {
  return request<{ shift: Shift }>("/shifts", {
    method: "POST",
    body: input,
    token
  });
}

export function listHolidays(token: string, year: number) {
  return request<{ holidays: Holiday[] }>(`/holidays?year=${year}`, {
    method: "GET",
    token
  });
}

export function createHoliday(token: string, input: HolidayInput) {
  return request<{ holiday: Holiday }>("/holidays", {
    method: "POST",
    body: input,
    token
  });
}

export function listLeaveTypes(token: string) {
  return request<{ leaveTypes: LeaveType[] }>("/leave-types", {
    method: "GET",
    token
  });
}

export function createLeaveType(token: string, input: LeaveTypeInput) {
  return request<{ leaveType: LeaveType }>("/leave-types", {
    method: "POST",
    body: input,
    token
  });
}

export function applyLeave(token: string, input: LeaveInput) {
  return request<{ leaveRequest: LeaveRequest }>("/leaves", {
    method: "POST",
    body: input,
    token
  });
}

export function listMyLeaves(token: string) {
  return request<{ leaveRequests: LeaveRequest[] }>("/leaves/me", {
    method: "GET",
    token
  });
}

export function listLeaveRequests(token: string, filters: LeaveFilters) {
  const params = new URLSearchParams();

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.employeeId) {
    params.set("employeeId", filters.employeeId);
  }

  if (filters.departmentId) {
    params.set("departmentId", filters.departmentId);
  }

  if (filters.dateFrom) {
    params.set("dateFrom", filters.dateFrom);
  }

  if (filters.dateTo) {
    params.set("dateTo", filters.dateTo);
  }

  const query = params.toString();

  return request<{ leaveRequests: LeaveRequest[] }>(
    `/leaves${query ? `?${query}` : ""}`,
    {
      method: "GET",
      token
    }
  );
}

export function approveLeave(
  token: string,
  id: string,
  input: { decisionNote: string | null }
) {
  return request<{ leaveRequest: LeaveRequest }>(`/leaves/${id}/approve`, {
    method: "PUT",
    body: input,
    token
  });
}

export function rejectLeave(
  token: string,
  id: string,
  input: { decisionNote: string | null }
) {
  return request<{ leaveRequest: LeaveRequest }>(`/leaves/${id}/reject`, {
    method: "PUT",
    body: input,
    token
  });
}

export function listLeaveBalances(
  token: string,
  input: { year?: number; employeeId?: string }
) {
  const params = new URLSearchParams();

  if (input.year) {
    params.set("year", String(input.year));
  }

  if (input.employeeId) {
    params.set("employeeId", input.employeeId);
  }

  const query = params.toString();

  return request<{ leaveBalances: LeaveBalance[] }>(
    `/leaves/balance${query ? `?${query}` : ""}`,
    {
      method: "GET",
      token
    }
  );
}
