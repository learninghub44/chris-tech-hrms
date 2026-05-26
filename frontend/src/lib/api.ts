import type {
  AttendanceRecord,
  AttendanceStatus,
  AttendanceWorkMode,
  Announcement,
  AnnouncementAudience,
  ApplicationStatus,
  AuthUser,
  Candidate,
  Department,
  DashboardSummary,
  Designation,
  Employee,
  EmployeeDocument,
  EmployeeReport,
  EmploymentStatus,
  FeedbackCategory,
  FeedbackRecord,
  Goal,
  GoalStatus,
  Holiday,
  HolidayType,
  AttendanceReport,
  Interview,
  InterviewMode,
  InterviewStatus,
  Job,
  JobApplication,
  JobStatus,
  LeaveBalance,
  LeaveDayType,
  LeaveReport,
  LeaveRequest,
  LeaveRequestStatus,
  LeaveType,
  NotificationRecord,
  Offer,
  OfferStatus,
  Payroll,
  PayrollReport,
  PerformanceEmployee,
  PerformanceReview,
  PerformanceReviewStatus,
  Payslip,
  Salary,
  Shift
} from "@/types";

const localApiUrl = "http://localhost:5000/api";
const configuredApiUrl =
  process.env.NEXT_PUBLIC_API_URL?.trim() || localApiUrl;

function trimTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, "");
}

function isLocalhostUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return url.hostname === "localhost" || url.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

function isBrowserOnHostedOrigin(): boolean {
  return (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  );
}

export function getApiBaseUrl(): string {
  return trimTrailingSlashes(configuredApiUrl);
}

function isHostedFrontendPointingToLocalApi(): boolean {
  return isBrowserOnHostedOrigin() && isLocalhostUrl(configuredApiUrl);
}

type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: PaginationMeta & Record<string, unknown>;
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

export type PaginationInput = {
  page?: number;
  pageSize?: number;
};

export type PaginationMeta = {
  total?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

function appendPagination(params: URLSearchParams, input: PaginationInput | undefined): void {
  if (!input) {
    return;
  }

  if (input.page) {
    params.set("page", String(input.page));
  }

  if (input.pageSize) {
    params.set("pageSize", String(input.pageSize));
  }
}

export function getPaginationMeta(response: ApiResponse<unknown>): PaginationMeta | null {
  if (!response.success) {
    return null;
  }

  return response.meta ?? null;
}

function failResponse(
  code: string,
  message: string,
  details: unknown
): ApiFailure {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {})
    }
  };
}

function isApiResponse<T>(payload: unknown): payload is ApiResponse<T> {
  if (!payload || typeof payload !== "object" || !("success" in payload)) {
    return false;
  }

  const response = payload as { success: unknown; data?: unknown; error?: unknown };

  if (response.success === true) {
    return "data" in response;
  }

  if (response.success !== false || !response.error || typeof response.error !== "object") {
    return false;
  }

  const error = response.error as { code?: unknown; message?: unknown };

  return typeof error.code === "string" && typeof error.message === "string";
}

async function readApiResponse<T>(
  response: Response,
  path: string
): Promise<ApiResponse<T>> {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return failResponse(
      "UNEXPECTED_API_RESPONSE",
      "The frontend did not receive JSON from the API. Check NEXT_PUBLIC_API_URL and backend routing.",
      {
        apiUrl: getApiBaseUrl(),
        path,
        status: response.status,
        statusText: response.statusText,
        contentType
      }
    );
  }

  const payload = (await response.json()) as unknown;

  if (!isApiResponse<T>(payload)) {
    return failResponse(
      "UNEXPECTED_API_RESPONSE",
      "The API returned an unexpected response shape.",
      {
        apiUrl: getApiBaseUrl(),
        path,
        status: response.status,
        statusText: response.statusText
      }
    );
  }

  return payload;
}

function getApiErrorHint(details: unknown): string | null {
  if (!details || typeof details !== "object" || !("hint" in details)) {
    return null;
  }

  const hint = (details as { hint?: unknown }).hint;

  return typeof hint === "string" ? hint : null;
}

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

export type HrAssistantChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type HrAssistantChatResponse = {
  reply: string;
  toolsUsed: string[];
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
} & PaginationInput;

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
} & PaginationInput;

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
} & PaginationInput;

export type LeaveTypeInput = {
  name: string;
  description: string | null;
  defaultAnnualAllowance: number;
  isPaid: boolean;
  requiresApproval: boolean;
  isActive: boolean;
};

export type SalaryInput = {
  employeeId: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  effectiveFrom: string;
  isActive: boolean;
};

export type SalaryUpdateInput = {
  baseSalary: number;
  allowances: number;
  deductions: number;
  effectiveFrom: string;
  isActive: boolean;
};

export type AnnouncementInput = {
  title: string;
  message: string;
  audience: AnnouncementAudience;
  isPublished: boolean;
};

export type JobInput = {
  title: string;
  description: string;
  departmentId: string | null;
  designationId: string | null;
  location: string | null;
  employmentType: string | null;
  status: JobStatus;
};

export type CandidateInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  source: string | null;
  resumeUrl: string | null;
  currentCompany: string | null;
  currentTitle: string | null;
  jobId: string | null;
  notes: string | null;
};

export type ApplicationInput = {
  jobId: string;
  candidateId: string;
  status: ApplicationStatus;
  notes: string | null;
};

export type InterviewInput = {
  applicationId: string;
  interviewerId: string | null;
  scheduledAt: string;
  mode: InterviewMode;
  location: string | null;
  status: InterviewStatus;
  feedback: string | null;
};

export type OfferInput = {
  applicationId: string;
  offeredSalary: number | null;
  startDate: string | null;
  status: OfferStatus;
  notes: string | null;
};

export type GoalInput = {
  employeeId: string;
  title: string;
  description: string | null;
  status: GoalStatus;
  progress: number;
  startDate: string | null;
  dueDate: string | null;
};

export type GoalUpdateInput = {
  title?: string;
  description?: string | null;
  status?: GoalStatus;
  progress?: number;
  startDate?: string | null;
  dueDate?: string | null;
};

export type PerformanceReviewInput = {
  employeeId: string;
  reviewerId: string | null;
  cycle: string;
  reviewPeriodStart: string;
  reviewPeriodEnd: string;
  rating: number;
  summary: string;
  strengths: string | null;
  improvements: string | null;
  status: PerformanceReviewStatus;
};

export type FeedbackInput = {
  employeeId: string;
  category: FeedbackCategory;
  message: string;
  isPrivate: boolean;
};

async function request<T>(
  path: string,
  options: RequestOptions
): Promise<ApiResponse<T>> {
  const apiBaseUrl = getApiBaseUrl();

  if (isHostedFrontendPointingToLocalApi()) {
    return failResponse(
      "API_URL_NOT_CONFIGURED",
      "The deployed frontend is still pointing at a local API URL. Set NEXT_PUBLIC_API_URL in Vercel to your Render backend API URL.",
      {
        configuredApiUrl,
        expectedFormat: "https://<your-render-service>.onrender.com/api",
        path
      }
    );
  }

  const headers = new Headers({
    Accept: "application/json"
  });

  if (options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      method: options.method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });
  } catch (error) {
    return failResponse(
      "API_REQUEST_FAILED",
      "Unable to reach the API. Check NEXT_PUBLIC_API_URL and the Render backend service status.",
      {
        apiUrl: apiBaseUrl,
        path,
        error: error instanceof Error ? error.message : String(error)
      }
    );
  }

  const payload = await readApiResponse<T>(response, path);

  if (!response.ok && payload.success) {
    throw new Error("Unexpected API response");
  }

  return payload;
}

export function getApiErrorMessage(response: ApiResponse<unknown>): string {
  if (response.success) {
    return "Request completed";
  }

  const hint = getApiErrorHint(response.error.details);

  return hint ? `${response.error.message}. ${hint}` : response.error.message;
}

export function getHealth() {
  return request<HealthResponse>("/health", {
    method: "GET"
  });
}

export function getDashboardSummary(token: string, input?: { refresh: boolean }) {
  const params = new URLSearchParams();

  if (input?.refresh) {
    params.set("refresh", "true");
  }

  const query = params.toString();

  return request<DashboardSummary>(`/dashboard/summary${query ? `?${query}` : ""}`, {
    method: "GET",
    token
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

export function askHrAssistant(
  token: string,
  input: { message: string; history: HrAssistantChatMessage[] }
) {
  return request<HrAssistantChatResponse>("/hr-assistant/chat", {
    method: "POST",
    body: input,
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

  appendPagination(params, filters);
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

export function deleteDepartment(token: string, id: string) {
  return request<{ department: Department }>(`/departments/${id}`, {
    method: "DELETE",
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

export function deleteDesignation(token: string, id: string) {
  return request<{ designation: Designation }>(`/designations/${id}`, {
    method: "DELETE",
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
  input: { dateFrom?: string; dateTo?: string } & PaginationInput
) {
  const params = new URLSearchParams();

  if (input.dateFrom) {
    params.set("dateFrom", input.dateFrom);
  }

  if (input.dateTo) {
    params.set("dateTo", input.dateTo);
  }

  appendPagination(params, input);
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

  appendPagination(params, filters);
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

export function listMyLeaves(token: string, pagination?: PaginationInput) {
  const params = new URLSearchParams();

  appendPagination(params, pagination);
  const query = params.toString();

  return request<{ leaveRequests: LeaveRequest[] }>(`/leaves/me${query ? `?${query}` : ""}`, {
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

  appendPagination(params, filters);
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
  input: { year?: number; employeeId?: string } & PaginationInput
) {
  const params = new URLSearchParams();

  if (input.year) {
    params.set("year", String(input.year));
  }

  if (input.employeeId) {
    params.set("employeeId", input.employeeId);
  }

  appendPagination(params, input);
  const query = params.toString();

  return request<{ leaveBalances: LeaveBalance[] }>(
    `/leaves/balance${query ? `?${query}` : ""}`,
    {
      method: "GET",
      token
    }
  );
}

export function listSalaries(token: string, pagination?: PaginationInput) {
  const params = new URLSearchParams();

  appendPagination(params, pagination);
  const query = params.toString();

  return request<{ salaries: Salary[] }>(`/salaries${query ? `?${query}` : ""}`, {
    method: "GET",
    token
  });
}

export function createSalary(token: string, input: SalaryInput) {
  return request<{ salary: Salary }>("/salaries", {
    method: "POST",
    body: input,
    token
  });
}

export function updateSalary(token: string, id: string, input: SalaryUpdateInput) {
  return request<{ salary: Salary }>(`/salaries/${id}`, {
    method: "PUT",
    body: input,
    token
  });
}

export function generatePayroll(
  token: string,
  input: { month: number; year: number }
) {
  return request<{ payroll: Payroll }>("/payroll/generate", {
    method: "POST",
    body: input,
    token
  });
}

export function listPayrolls(token: string, input: { year?: number } & PaginationInput) {
  const params = new URLSearchParams();

  if (input.year) {
    params.set("year", String(input.year));
  }

  appendPagination(params, input);
  const query = params.toString();

  return request<{ payrolls: Payroll[] }>(`/payroll${query ? `?${query}` : ""}`, {
    method: "GET",
    token
  });
}

export function getPayroll(token: string, id: string) {
  return request<{ payroll: Payroll }>(`/payroll/${id}`, {
    method: "GET",
    token
  });
}

export function listMyPayslips(token: string, pagination?: PaginationInput) {
  const params = new URLSearchParams();

  appendPagination(params, pagination);
  const query = params.toString();

  return request<{ payslips: Payslip[] }>(`/payroll/me${query ? `?${query}` : ""}`, {
    method: "GET",
    token
  });
}

export function getPayslipDownload(
  token: string,
  payrollId: string,
  employeeId?: string
) {
  const params = new URLSearchParams();

  if (employeeId) {
    params.set("employeeId", employeeId);
  }

  const query = params.toString();

  return request<{
    payslip: Payslip;
    fileName: string;
    contentType: string;
    content: string;
  }>(`/payroll/${payrollId}/payslip${query ? `?${query}` : ""}`, {
    method: "GET",
    token
  });
}

export function getEmployeeReport(
  token: string,
  filters: {
    status?: EmploymentStatus | "";
    departmentId?: string;
    dateFrom?: string;
    dateTo?: string;
  }
) {
  const params = new URLSearchParams();

  if (filters.status) {
    params.set("status", filters.status);
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

  return request<EmployeeReport>(`/reports/employees${query ? `?${query}` : ""}`, {
    method: "GET",
    token
  });
}

export function getAttendanceReportData(token: string, filters: AttendanceFilters) {
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

  return request<AttendanceReport>(`/reports/attendance${query ? `?${query}` : ""}`, {
    method: "GET",
    token
  });
}

export function getLeaveReportData(token: string, filters: LeaveFilters) {
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

  return request<LeaveReport>(`/reports/leaves${query ? `?${query}` : ""}`, {
    method: "GET",
    token
  });
}

export function getPayrollReportData(token: string, input: { year?: number }) {
  const params = new URLSearchParams();

  if (input.year) {
    params.set("year", String(input.year));
  }

  const query = params.toString();

  return request<PayrollReport>(`/reports/payroll${query ? `?${query}` : ""}`, {
    method: "GET",
    token
  });
}

export function listNotifications(token: string, pagination?: PaginationInput) {
  const params = new URLSearchParams();

  appendPagination(params, pagination);
  const query = params.toString();

  return request<{ notifications: NotificationRecord[]; unreadCount: number }>(
    `/notifications${query ? `?${query}` : ""}`,
    {
      method: "GET",
      token
    }
  );
}

export function markNotificationRead(token: string, id: string) {
  return request<{ notification: NotificationRecord }>(`/notifications/${id}/read`, {
    method: "PUT",
    token
  });
}

export function listAnnouncements(token: string, pagination?: PaginationInput) {
  const params = new URLSearchParams();

  appendPagination(params, pagination);
  const query = params.toString();

  return request<{ announcements: Announcement[] }>(`/announcements${query ? `?${query}` : ""}`, {
    method: "GET",
    token
  });
}

export function createAnnouncement(token: string, input: AnnouncementInput) {
  return request<{ announcement: Announcement }>("/announcements", {
    method: "POST",
    body: input,
    token
  });
}

export function listJobs(
  token: string,
  filters: { status?: JobStatus | ""; departmentId?: string } & PaginationInput
) {
  const params = new URLSearchParams();

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.departmentId) {
    params.set("departmentId", filters.departmentId);
  }

  appendPagination(params, filters);
  const query = params.toString();

  return request<{ jobs: Job[] }>(`/jobs${query ? `?${query}` : ""}`, {
    method: "GET",
    token
  });
}

export function createJob(token: string, input: JobInput) {
  return request<{ job: Job }>("/jobs", {
    method: "POST",
    body: input,
    token
  });
}

export function getJob(token: string, id: string) {
  return request<{ job: Job }>(`/jobs/${id}`, {
    method: "GET",
    token
  });
}

export function listCandidates(token: string, input: { search?: string } & PaginationInput) {
  const params = new URLSearchParams();

  if (input.search) {
    params.set("search", input.search);
  }

  appendPagination(params, input);
  const query = params.toString();

  return request<{ candidates: Candidate[] }>(`/candidates${query ? `?${query}` : ""}`, {
    method: "GET",
    token
  });
}

export function createCandidate(token: string, input: CandidateInput) {
  return request<{ candidate: Candidate }>("/candidates", {
    method: "POST",
    body: input,
    token
  });
}

export function getCandidate(token: string, id: string) {
  return request<{ candidate: Candidate }>(`/candidates/${id}`, {
    method: "GET",
    token
  });
}

export function listApplications(token: string, pagination?: PaginationInput) {
  const params = new URLSearchParams();

  appendPagination(params, pagination);
  const query = params.toString();

  return request<{ applications: JobApplication[] }>(`/applications${query ? `?${query}` : ""}`, {
    method: "GET",
    token
  });
}

export function createApplication(token: string, input: ApplicationInput) {
  return request<{ application: JobApplication }>("/applications", {
    method: "POST",
    body: input,
    token
  });
}

export function updateApplicationStatus(
  token: string,
  id: string,
  input: { status: ApplicationStatus; notes: string | null }
) {
  return request<{ application: JobApplication }>(`/applications/${id}/status`, {
    method: "PUT",
    body: input,
    token
  });
}

export function listInterviews(token: string, pagination?: PaginationInput) {
  const params = new URLSearchParams();

  appendPagination(params, pagination);
  const query = params.toString();

  return request<{ interviews: Interview[] }>(`/interviews${query ? `?${query}` : ""}`, {
    method: "GET",
    token
  });
}

export function createInterview(token: string, input: InterviewInput) {
  return request<{ interview: Interview }>("/interviews", {
    method: "POST",
    body: input,
    token
  });
}

export function updateInterviewStatus(
  token: string,
  id: string,
  input: { status: InterviewStatus; feedback: string | null }
) {
  return request<{ interview: Interview }>(`/interviews/${id}/status`, {
    method: "PUT",
    body: input,
    token
  });
}

export function listOffers(token: string, pagination?: PaginationInput) {
  const params = new URLSearchParams();

  appendPagination(params, pagination);
  const query = params.toString();

  return request<{ offers: Offer[] }>(`/offers${query ? `?${query}` : ""}`, {
    method: "GET",
    token
  });
}

export function createOffer(token: string, input: OfferInput) {
  return request<{ offer: Offer }>("/offers", {
    method: "POST",
    body: input,
    token
  });
}

export function updateOfferStatus(
  token: string,
  id: string,
  input: { status: OfferStatus; notes: string | null }
) {
  return request<{ offer: Offer }>(`/offers/${id}/status`, {
    method: "PUT",
    body: input,
    token
  });
}

export function listPerformanceEmployees(
  token: string,
  input: { search?: string } & PaginationInput
) {
  const params = new URLSearchParams();

  if (input.search) {
    params.set("search", input.search);
  }

  appendPagination(params, input);
  const query = params.toString();

  return request<{ employees: PerformanceEmployee[] }>(
    `/performance/employees${query ? `?${query}` : ""}`,
    {
      method: "GET",
      token
    }
  );
}

export function listGoals(
  token: string,
  filters: { employeeId?: string; status?: GoalStatus | "" } & PaginationInput
) {
  const params = new URLSearchParams();

  if (filters.employeeId) {
    params.set("employeeId", filters.employeeId);
  }

  if (filters.status) {
    params.set("status", filters.status);
  }

  appendPagination(params, filters);
  const query = params.toString();

  return request<{ goals: Goal[] }>(`/goals${query ? `?${query}` : ""}`, {
    method: "GET",
    token
  });
}

export function createGoal(token: string, input: GoalInput) {
  return request<{ goal: Goal }>("/goals", {
    method: "POST",
    body: input,
    token
  });
}

export function updateGoal(token: string, id: string, input: GoalUpdateInput) {
  return request<{ goal: Goal }>(`/goals/${id}`, {
    method: "PUT",
    body: input,
    token
  });
}

export function listPerformanceReviews(
  token: string,
  filters: {
    employeeId?: string;
    status?: PerformanceReviewStatus | "";
    cycle?: string;
  } & PaginationInput
) {
  const params = new URLSearchParams();

  if (filters.employeeId) {
    params.set("employeeId", filters.employeeId);
  }

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.cycle) {
    params.set("cycle", filters.cycle);
  }

  appendPagination(params, filters);
  const query = params.toString();

  return request<{ reviews: PerformanceReview[] }>(
    `/performance-reviews${query ? `?${query}` : ""}`,
    {
      method: "GET",
      token
    }
  );
}

export function createPerformanceReview(token: string, input: PerformanceReviewInput) {
  return request<{ review: PerformanceReview }>("/performance-reviews", {
    method: "POST",
    body: input,
    token
  });
}

export function updatePerformanceReviewStatus(
  token: string,
  id: string,
  input: { status: PerformanceReviewStatus }
) {
  return request<{ review: PerformanceReview }>(`/performance-reviews/${id}/status`, {
    method: "PUT",
    body: input,
    token
  });
}

export function listFeedbackRecords(
  token: string,
  filters: { employeeId?: string; category?: FeedbackCategory | "" } & PaginationInput
) {
  const params = new URLSearchParams();

  if (filters.employeeId) {
    params.set("employeeId", filters.employeeId);
  }

  if (filters.category) {
    params.set("category", filters.category);
  }

  appendPagination(params, filters);
  const query = params.toString();

  return request<{ feedback: FeedbackRecord[] }>(
    `/feedback${query ? `?${query}` : ""}`,
    {
      method: "GET",
      token
    }
  );
}

export function createFeedbackRecord(token: string, input: FeedbackInput) {
  return request<{ feedback: FeedbackRecord }>("/feedback", {
    method: "POST",
    body: input,
    token
  });
}
