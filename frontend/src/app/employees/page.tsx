"use client";

import {
  Eye,
  Pencil,
  Plus,
  Search,
  UserMinus,
  Users,
  BriefcaseBusiness,
  Building2,
  Files
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { PaginationControls } from "@/components/pagination-controls";
import { ProtectedPage } from "@/components/protected-page";
import { StatusCard } from "@/components/status-card";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  deactivateEmployee,
  getApiErrorMessage,
  getPaginationMeta,
  listDepartments,
  listEmployees
} from "@/lib/api";
import { employmentStatusLabels, getEmployeeName } from "@/lib/employee-format";
import type { AuthUser, EmploymentStatus } from "@/types";

type EmployeesContentProps = {
  user: AuthUser;
  token: string;
};

const pageSize = 25;

function EmployeesContent({ user, token }: EmployeesContentProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<EmploymentStatus | "">("");
  const [departmentId, setDepartmentId] = useState("");
  const [page, setPage] = useState(1);
  const [actionError, setActionError] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, departmentId]);

  const employeesQuery = useQuery({
    queryKey: ["employees", token, debouncedSearch, status, departmentId, page],
    queryFn: () =>
      listEmployees(token, {
        search: debouncedSearch,
        status,
        departmentId,
        page,
        pageSize
      }),
    retry: false
  });
  const departmentsQuery = useQuery({
    queryKey: ["departments", token],
    queryFn: () => listDepartments(token),
    retry: false
  });
  const employees = useMemo(
    () => (employeesQuery.data?.success ? employeesQuery.data.data.employees : []),
    [employeesQuery.data]
  );
  const departments = useMemo(
    () => (departmentsQuery.data?.success ? departmentsQuery.data.data.departments : []),
    [departmentsQuery.data]
  );
  const pagination = useMemo(
    () => (employeesQuery.data ? getPaginationMeta(employeesQuery.data) : null),
    [employeesQuery.data]
  );
  const metrics = useMemo(() => {
    const activeEmployees = employees.filter((employee) => employee.status === "ACTIVE");
    const documentCount = employees.reduce(
      (total, employee) => total + employee.documents.length,
      0
    );
    const assignedDepartments = new Set(
      employees
        .map((employee) => employee.departmentId)
        .filter((value): value is string => Boolean(value))
    );

    return [
      {
        label: "Employees",
        value: String(employees.length),
        detail: "Total records",
        icon: Users,
        tone: "primary" as const
      },
      {
        label: "Active",
        value: String(activeEmployees.length),
        detail: "Currently active",
        icon: BriefcaseBusiness,
        tone: "success" as const
      },
      {
        label: "Departments",
        value: String(assignedDepartments.size),
        detail: "With assigned staff",
        icon: Building2,
        tone: "warning" as const
      },
      {
        label: "Documents",
        value: String(documentCount),
        detail: "Linked files",
        icon: Files,
        tone: "slate" as const
      }
    ];
  }, [employees]);

  async function deactivate(id: string) {
    setActionError(null);

    if (!window.confirm("Deactivate this employee record?")) {
      return;
    }

    const response = await deactivateEmployee(token, id).catch(() => null);

    if (!response) {
      setActionError("Unable to reach the API");
      return;
    }

    if (!response.success) {
      setActionError(getApiErrorMessage(response));
      return;
    }

    void employeesQuery.refetch();
  }

  return (
    <AppShell user={user} token={token}>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium text-primary">Employees</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink2">
              Employee Records
            </h1>
          </div>
          <Link
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-glow transition hover:bg-primary-700"
            href="/employees/new"
          >
            <Plus size={17} aria-hidden="true" />
            Add employee
          </Link>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <StatusCard key={metric.label} {...metric} />
          ))}
        </section>

        <section className="rounded-2xl border border-edge bg-white p-5 shadow-card">
          <div className="grid gap-3 lg:grid-cols-[1fr_180px_220px]">
            <label className="relative block text-sm font-medium text-ink2-soft">
              <span className="sr-only">Search employees</span>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink2-soft/60"
                size={17}
                aria-hidden="true"
              />
              <input
                className="h-11 w-full rounded-xl border border-edge bg-white pl-10 pr-3 text-sm text-ink2 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                placeholder="Search by name, code, or email"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <select
              className="h-11 rounded-xl border border-edge bg-white px-3 text-sm text-ink2 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              value={status}
              onChange={(event) => setStatus(event.target.value as EmploymentStatus | "")}
              aria-label="Filter by status"
            >
              <option value="">All statuses</option>
              {Object.entries(employmentStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              className="h-11 rounded-xl border border-edge bg-white px-3 text-sm text-ink2 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              value={departmentId}
              onChange={(event) => setDepartmentId(event.target.value)}
              aria-label="Filter by department"
            >
              <option value="">All departments</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>

          {actionError ? (
            <div className="mt-4 rounded-2xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
              {actionError}
            </div>
          ) : null}

          <div className="mt-5 overflow-x-auto rounded-2xl border border-edge">
            <table className="min-w-[760px] w-full text-left text-sm">
              <thead className="border-b border-edge bg-canvas text-xs uppercase tracking-wide text-ink2-soft">
                <tr>
                  <th className="px-4 py-3 font-semibold">Employee</th>
                  <th className="px-4 py-3 font-semibold">Department</th>
                  <th className="px-4 py-3 font-semibold">Designation</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Documents</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-edge">
                {employees.map((employee) => (
                  <tr key={employee.id} className="transition hover:bg-canvas/60">
                    <td className="px-4 py-4">
                      <div className="font-medium text-ink2">{getEmployeeName(employee)}</div>
                      <div className="mt-1 text-xs text-ink2-soft">
                        {employee.employeeCode} | {employee.workEmail}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-ink2-soft">
                      {employee.department?.name ?? "Unassigned"}
                    </td>
                    <td className="px-4 py-4 text-ink2-soft">
                      {employee.designation?.title ?? "Unassigned"}
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-lg bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700">
                        {employmentStatusLabels[employee.status]}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-ink2-soft">
                      {employee.documents.length}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          className="grid h-9 w-9 place-items-center rounded-xl border border-edge text-ink2-soft transition hover:border-primary/40 hover:bg-primary-50 hover:text-primary"
                          href={`/employees/${employee.id}`}
                          aria-label={`View ${getEmployeeName(employee)}`}
                        >
                          <Eye size={16} aria-hidden="true" />
                        </Link>
                        <Link
                          className="grid h-9 w-9 place-items-center rounded-xl border border-edge text-ink2-soft transition hover:border-primary/40 hover:bg-primary-50 hover:text-primary"
                          href={`/employees/${employee.id}/edit`}
                          aria-label={`Edit ${getEmployeeName(employee)}`}
                        >
                          <Pencil size={16} aria-hidden="true" />
                        </Link>
                        <button
                          className="grid h-9 w-9 place-items-center rounded-xl border border-edge text-ink2-soft transition hover:border-danger/40 hover:bg-danger/5 hover:text-danger disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-edge disabled:hover:bg-transparent disabled:hover:text-ink2-soft"
                          type="button"
                          onClick={() => deactivate(employee.id)}
                          disabled={employee.status === "INACTIVE"}
                          aria-label={`Deactivate ${getEmployeeName(employee)}`}
                        >
                          <UserMinus size={16} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!employeesQuery.isLoading && employees.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-edge bg-canvas px-4 py-8 text-center text-sm text-ink2-soft">
              No employee records found.
            </div>
          ) : null}
          <PaginationControls
            pagination={pagination}
            onPageChange={setPage}
            isFetching={employeesQuery.isFetching}
          />
        </section>
      </div>
    </AppShell>
  );
}

export default function EmployeesPage() {
  return (
    <ProtectedPage requiredPermissions={["employees:manage"]}>
      {({ user, token }) => <EmployeesContent user={user} token={token} />}
    </ProtectedPage>
  );
}
