export type RoleName = "SUPER_ADMIN" | "HR_ADMIN" | "MANAGER" | "EMPLOYEE";

export type AccountStatus = "ACTIVE" | "INACTIVE" | "TERMINATED";

export type EmploymentStatus =
  | "ONBOARDING"
  | "ACTIVE"
  | "PROBATION"
  | "INACTIVE"
  | "TERMINATED";

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
