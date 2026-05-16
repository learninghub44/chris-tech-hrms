export type DemoRole = "SUPER_ADMIN" | "HR_ADMIN" | "MANAGER" | "EMPLOYEE";

export type DemoUser = {
  id: string;
  name: string;
  email: string;
  role: DemoRole;
};
