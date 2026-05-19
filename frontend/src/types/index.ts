export type RoleName = "SUPER_ADMIN" | "HR_ADMIN" | "MANAGER" | "EMPLOYEE";

export type AccountStatus = "ACTIVE" | "INACTIVE" | "TERMINATED";

export type EmploymentStatus =
  | "ONBOARDING"
  | "ACTIVE"
  | "PROBATION"
  | "INACTIVE"
  | "TERMINATED";

export type AttendanceStatus =
  | "PRESENT"
  | "LATE"
  | "HALF_DAY"
  | "ABSENT"
  | "WORK_FROM_HOME";

export type AttendanceWorkMode = "OFFICE" | "WORK_FROM_HOME";

export type HolidayType = "PUBLIC" | "COMPANY" | "OPTIONAL";

export type LeaveRequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export type LeaveDayType = "FULL_DAY" | "HALF_DAY";

export type PayrollStatus = "GENERATED" | "REVIEWED" | "PAID";

export type AnnouncementAudience =
  | "ALL"
  | "SUPER_ADMIN"
  | "HR_ADMIN"
  | "MANAGER"
  | "EMPLOYEE";

export type JobStatus = "DRAFT" | "OPEN" | "CLOSED";

export type ApplicationStatus =
  | "APPLIED"
  | "SCREENING"
  | "INTERVIEW"
  | "OFFERED"
  | "HIRED"
  | "REJECTED";

export type InterviewMode = "PHONE" | "VIDEO" | "IN_PERSON";

export type InterviewStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";

export type OfferStatus = "DRAFT" | "SENT" | "ACCEPTED" | "DECLINED";

export type GoalStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED";

export type PerformanceReviewStatus = "DRAFT" | "SUBMITTED" | "ACKNOWLEDGED";

export type FeedbackCategory = "GENERAL" | "PRAISE" | "IMPROVEMENT";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  status: AccountStatus;
  roles: RoleName[];
  permissions: string[];
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

export type Department = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    employees: number;
    designations: number;
  };
};

export type Designation = {
  id: string;
  title: string;
  description: string | null;
  departmentId: string | null;
  department: Department | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    employees: number;
  };
};

export type EmployeeManager = {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  workEmail: string;
  status: EmploymentStatus;
};

export type EmergencyContact = {
  id: string;
  employeeId: string;
  name: string;
  relationship: string;
  phone: string;
  email: string | null;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
};

export type EmployeeDocument = {
  id: string;
  employeeId: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  mimeType: string | null;
  sizeBytes: number | null;
  notes: string | null;
  uploadedById: string | null;
  uploadedBy: {
    id: string;
    name: string;
    email: string;
  } | null;
  createdAt: string;
};

export type Employee = {
  id: string;
  employeeCode: string;
  userId: string | null;
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
  department: Department | null;
  designationId: string | null;
  designation: Designation | null;
  managerId: string | null;
  manager: EmployeeManager | null;
  emergencyContacts: EmergencyContact[];
  documents: EmployeeDocument[];
  createdAt: string;
  updatedAt: string;
};

export type Shift = {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  lateAfterMinutes: number;
  halfDayAfterMinutes: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Holiday = {
  id: string;
  name: string;
  date: string;
  type: HolidayType;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AttendanceEmployee = {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  workEmail: string;
  department: Department | null;
  designation: Designation | null;
};

export type AttendanceRecord = {
  id: string;
  employeeId: string;
  employee: AttendanceEmployee;
  shiftId: string | null;
  shift: Shift | null;
  date: string;
  clockInAt: string | null;
  clockOutAt: string | null;
  status: AttendanceStatus;
  workMode: AttendanceWorkMode;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LeaveType = {
  id: string;
  name: string;
  description: string | null;
  defaultAnnualAllowance: number;
  isPaid: boolean;
  requiresApproval: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LeaveEmployee = {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  workEmail: string;
  userId?: string | null;
  department: Department | null;
  designation?: Designation | null;
};

export type LeaveReviewer = {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  workEmail: string;
};

export type LeaveRequest = {
  id: string;
  employeeId: string;
  employee: LeaveEmployee;
  leaveTypeId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  dayType: LeaveDayType;
  totalDays: number;
  reason: string;
  status: LeaveRequestStatus;
  reviewerId: string | null;
  reviewer: LeaveReviewer | null;
  reviewedAt: string | null;
  decisionNote: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LeaveBalance = {
  id: string;
  employeeId: string;
  employee: LeaveEmployee;
  leaveTypeId: string;
  leaveType: LeaveType;
  year: number;
  openingBalance: number;
  accrued: number;
  used: number;
  pending: number;
  available: number;
  createdAt: string;
  updatedAt: string;
};

export type PayrollEmployee = {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  workEmail: string;
  userId: string | null;
  department: Department | null;
  designation: Designation | null;
};

export type Salary = {
  id: string;
  employeeId: string;
  employee: PayrollEmployee;
  baseSalary: number;
  allowances: number;
  deductions: number;
  effectiveFrom: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PayrollGeneratedBy = {
  id: string;
  name: string;
  email: string;
};

export type PayrollItem = {
  id: string;
  payrollId: string;
  employeeId: string;
  employee: PayrollEmployee;
  salaryId: string | null;
  salary: Salary | null;
  baseSalary: number;
  allowances: number;
  deductions: number;
  grossPay: number;
  totalDeductions: number;
  netPay: number;
  notes: string | null;
  createdAt: string;
  payslip: Payslip | null;
};

export type Payslip = {
  id: string;
  payrollId: string;
  payroll?: Payroll;
  payrollItemId: string;
  payrollItem?: PayrollItem;
  employeeId: string;
  employee?: PayrollEmployee;
  payslipNumber: string;
  grossPay: number;
  totalDeductions: number;
  netPay: number;
  issuedAt: string;
  createdAt: string;
};

export type Payroll = {
  id: string;
  month: number;
  year: number;
  status: PayrollStatus;
  generatedById: string | null;
  generatedBy: PayrollGeneratedBy | null;
  itemCount: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  generatedAt: string;
  createdAt: string;
  updatedAt: string;
  items?: PayrollItem[];
};

export type NotificationRecord = {
  id: string;
  userId: string;
  title: string;
  message: string;
  category: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
};

export type AnnouncementCreatedBy = {
  id: string;
  name: string;
  email: string;
};

export type Announcement = {
  id: string;
  title: string;
  message: string;
  audience: AnnouncementAudience;
  isPublished: boolean;
  publishedAt: string;
  createdById: string | null;
  createdBy: AnnouncementCreatedBy | null;
  createdAt: string;
  updatedAt: string;
};

export type DashboardCard = {
  key: string;
  label: string;
  value: string;
  detail: string;
  tone: "brand" | "blue" | "amber" | "slate";
};

export type DashboardSummary = {
  cards: DashboardCard[];
  notifications: NotificationRecord[];
  announcements: Announcement[];
  scope: "organization" | "self_or_team";
};

export type ReportEmployee = {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  workEmail: string;
  status: EmploymentStatus;
  dateOfJoining: string;
  dateOfExit: string | null;
  department: Department | null;
  designation: Designation | null;
};

export type EmployeeReport = {
  employees: ReportEmployee[];
  summary: {
    total: number;
    byStatus: Partial<Record<EmploymentStatus, number>>;
    byDepartment: Record<string, number>;
  };
};

export type AttendanceReport = {
  attendance: AttendanceRecord[];
  summary: {
    total: number;
    byStatus: Partial<Record<AttendanceStatus, number>>;
  };
};

export type LeaveReport = {
  leaveRequests: LeaveRequest[];
  summary: {
    total: number;
    byStatus: Partial<Record<LeaveRequestStatus, number>>;
    byType: Record<string, number>;
  };
};

export type PayrollReport = {
  payrolls: Payroll[];
  summary: {
    totalRuns: number;
    totalGross: number;
    totalDeductions: number;
    totalNet: number;
  };
};

export type RecruitmentUser = {
  id: string;
  name: string;
  email: string;
};

export type Job = {
  id: string;
  title: string;
  description: string;
  departmentId: string | null;
  department: Department | null;
  designationId: string | null;
  designation: Designation | null;
  location: string | null;
  employmentType: string | null;
  status: JobStatus;
  createdById: string | null;
  createdBy: RecruitmentUser | null;
  applications: JobApplication[];
  createdAt: string;
  updatedAt: string;
};

export type Candidate = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  source: string | null;
  resumeUrl: string | null;
  currentCompany: string | null;
  currentTitle: string | null;
  applications: JobApplication[];
  interviews: Interview[];
  offers: Offer[];
  createdAt: string;
  updatedAt: string;
};

export type JobApplication = {
  id: string;
  jobId: string;
  job: Job;
  candidateId: string;
  candidate: Candidate;
  status: ApplicationStatus;
  appliedAt: string;
  notes: string | null;
  interviews: Interview[];
  offers: Offer[];
  createdAt: string;
  updatedAt: string;
};

export type Interviewer = {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  workEmail: string;
  department: Department | null;
  designation: Designation | null;
};

export type Interview = {
  id: string;
  applicationId: string;
  application: JobApplication;
  candidateId: string;
  candidate: Candidate;
  interviewerId: string | null;
  interviewer: Interviewer | null;
  scheduledAt: string;
  mode: InterviewMode;
  location: string | null;
  status: InterviewStatus;
  feedback: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Offer = {
  id: string;
  applicationId: string;
  application: JobApplication;
  candidateId: string;
  candidate: Candidate;
  jobId: string;
  job: Job;
  offeredSalary: number | null;
  startDate: string | null;
  status: OfferStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PerformanceEmployee = {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  workEmail: string;
  userId: string | null;
  managerId: string | null;
  department: Department | null;
  designation: Designation | null;
};

export type PerformanceCreatedBy = {
  id: string;
  name: string;
  email: string;
};

export type Goal = {
  id: string;
  employeeId: string;
  employee: PerformanceEmployee;
  title: string;
  description: string | null;
  status: GoalStatus;
  progress: number;
  startDate: string | null;
  dueDate: string | null;
  createdById: string | null;
  createdBy: PerformanceCreatedBy | null;
  createdAt: string;
  updatedAt: string;
};

export type PerformanceReview = {
  id: string;
  employeeId: string;
  employee: PerformanceEmployee;
  reviewerId: string | null;
  reviewer: PerformanceEmployee | null;
  cycle: string;
  reviewPeriodStart: string;
  reviewPeriodEnd: string;
  rating: number;
  summary: string;
  strengths: string | null;
  improvements: string | null;
  status: PerformanceReviewStatus;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FeedbackRecord = {
  id: string;
  employeeId: string;
  employee: PerformanceEmployee;
  authorId: string | null;
  author: PerformanceEmployee | null;
  category: FeedbackCategory;
  message: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
};
