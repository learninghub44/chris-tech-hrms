"use client";

import { DollarSign, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { PaginationControls } from "@/components/pagination-controls";
import { ProtectedPage } from "@/components/protected-page";
import {
  createSalary,
  getApiErrorMessage,
  getPaginationMeta,
  listEmployees,
  listSalaries,
  updateSalary
} from "@/lib/api";
import { formatDate, getEmployeeName } from "@/lib/employee-format";
import { formatMoney } from "@/lib/payroll-format";
import type { AuthUser } from "@/types";

type SalariesContentProps = {
  user: AuthUser;
  token: string;
};

type SalaryFormValues = {
  employeeId: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  effectiveFrom: string;
  isActive: boolean;
};

const pageSize = 25;

function SalariesContent({ user, token }: SalariesContentProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const salariesQuery = useQuery({
    queryKey: ["salaries", token, page],
    queryFn: () => listSalaries(token, { page, pageSize }),
    retry: false
  });
  const employeesQuery = useQuery({
    queryKey: ["employees", token, "salary-setup"],
    queryFn: () => listEmployees(token, { pageSize: 100 }),
    retry: false
  });
  const salaries = useMemo(
    () => (salariesQuery.data?.success ? salariesQuery.data.data.salaries : []),
    [salariesQuery.data]
  );
  const employees = useMemo(
    () => (employeesQuery.data?.success ? employeesQuery.data.data.employees : []),
    [employeesQuery.data]
  );
  const pagination = useMemo(
    () => (salariesQuery.data ? getPaginationMeta(salariesQuery.data) : null),
    [salariesQuery.data]
  );
  const {
    formState: { isSubmitting },
    handleSubmit,
    register,
    reset,
    setValue,
    watch
  } = useForm<SalaryFormValues>({
    defaultValues: {
      employeeId: "",
      baseSalary: 0,
      allowances: 0,
      deductions: 0,
      effectiveFrom: new Date().toISOString().slice(0, 10),
      isActive: true
    }
  });
  const selectedEmployeeId = watch("employeeId");
  const selectedSalary = useMemo(
    () => salaries.find((salary) => salary.employeeId === selectedEmployeeId) ?? null,
    [salaries, selectedEmployeeId]
  );

  useEffect(() => {
    if (!selectedSalary) {
      return;
    }

    setValue("baseSalary", selectedSalary.baseSalary);
    setValue("allowances", selectedSalary.allowances);
    setValue("deductions", selectedSalary.deductions);
    setValue("effectiveFrom", selectedSalary.effectiveFrom.slice(0, 10));
    setValue("isActive", selectedSalary.isActive);
  }, [selectedSalary, setValue]);

  useEffect(() => {
    if (!selectedEmployeeId || selectedSalary) {
      return;
    }

    setValue("baseSalary", 0);
    setValue("allowances", 0);
    setValue("deductions", 0);
    setValue("effectiveFrom", new Date().toISOString().slice(0, 10));
    setValue("isActive", true);
  }, [selectedEmployeeId, selectedSalary, setValue]);

  async function submit(values: SalaryFormValues) {
    setMessage(null);
    const input = {
      employeeId: values.employeeId,
      baseSalary: Number(values.baseSalary),
      allowances: Number(values.allowances),
      deductions: Number(values.deductions),
      effectiveFrom: values.effectiveFrom,
      isActive: values.isActive
    };
    const response = selectedSalary
      ? await updateSalary(token, selectedSalary.id, {
          baseSalary: input.baseSalary,
          allowances: input.allowances,
          deductions: input.deductions,
          effectiveFrom: input.effectiveFrom,
          isActive: input.isActive
        }).catch(() => null)
      : await createSalary(token, input).catch(() => null);

    if (!response) {
      setMessage("Unable to reach the API");
      return;
    }

    if (!response.success) {
      setMessage(getApiErrorMessage(response));
      return;
    }

    setMessage(selectedSalary ? "Salary setup updated" : "Salary setup created");
    await salariesQuery.refetch();
  }

  function startNewSetup() {
    reset({
      employeeId: "",
      baseSalary: 0,
      allowances: 0,
      deductions: 0,
      effectiveFrom: new Date().toISOString().slice(0, 10),
      isActive: true
    });
    setMessage(null);
  }

  return (
    <AppShell user={user} token={token}>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-brand-700">Payroll</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-ink">
              Salary Setup
            </h1>
          </div>
          <button
            className="inline-flex h-10 items-center justify-center rounded-md border border-line bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-surface"
            type="button"
            onClick={startNewSetup}
          >
            Clear form
          </button>
        </div>

        <section className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
          <form
            className="rounded-lg border border-line bg-white p-5 shadow-soft"
            onSubmit={handleSubmit(submit)}
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-md bg-brand-50 text-brand-700">
                <DollarSign size={20} aria-hidden="true" />
              </div>
              <h2 className="text-lg font-semibold tracking-normal">
                {selectedSalary ? "Update Salary" : "Create Salary"}
              </h2>
            </div>

            {message ? (
              <div className="mt-5 rounded-md border border-line bg-surface px-3 py-2 text-sm text-slate-700">
                {message}
              </div>
            ) : null}

            <label className="mt-5 block text-sm font-medium text-slate-700">
              Employee
              <select
                className="mt-2 h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-brand-600"
                {...register("employeeId", { required: true })}
              >
                <option value="">Select employee</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.employeeCode} - {getEmployeeName(employee)}
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Base salary
                <input
                  className="mt-2 h-11 w-full rounded-md border border-line px-3 text-sm outline-none transition focus:border-brand-600"
                  min="0"
                  step="0.01"
                  type="number"
                  {...register("baseSalary", { valueAsNumber: true })}
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Allowances
                <input
                  className="mt-2 h-11 w-full rounded-md border border-line px-3 text-sm outline-none transition focus:border-brand-600"
                  min="0"
                  step="0.01"
                  type="number"
                  {...register("allowances", { valueAsNumber: true })}
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Deductions
                <input
                  className="mt-2 h-11 w-full rounded-md border border-line px-3 text-sm outline-none transition focus:border-brand-600"
                  min="0"
                  step="0.01"
                  type="number"
                  {...register("deductions", { valueAsNumber: true })}
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Effective from
                <input
                  className="mt-2 h-11 w-full rounded-md border border-line px-3 text-sm outline-none transition focus:border-brand-600"
                  type="date"
                  {...register("effectiveFrom", { required: true })}
                />
              </label>
            </div>

            <label className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-slate-700">
              <input type="checkbox" {...register("isActive")} />
              Active salary setup
            </label>

            <button
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={isSubmitting}
            >
              <Save size={17} aria-hidden="true" />
              {selectedSalary ? "Update salary" : "Create salary"}
            </button>
          </form>

          <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
            <h2 className="text-lg font-semibold tracking-normal">Current Salaries</h2>
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-line bg-surface text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Employee</th>
                    <th className="px-4 py-3 font-semibold">Gross</th>
                    <th className="px-4 py-3 font-semibold">Deductions</th>
                    <th className="px-4 py-3 font-semibold">Net</th>
                    <th className="px-4 py-3 font-semibold">Effective</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {salaries.map((salary) => {
                    const grossPay = salary.baseSalary + salary.allowances;
                    const netPay = grossPay - salary.deductions;

                    return (
                      <tr key={salary.id}>
                        <td className="px-4 py-4">
                          <div className="font-medium text-ink">
                            {getEmployeeName(salary.employee)}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            {salary.employee.employeeCode}
                          </div>
                        </td>
                        <td className="px-4 py-4">{formatMoney(grossPay)}</td>
                        <td className="px-4 py-4">{formatMoney(salary.deductions)}</td>
                        <td className="px-4 py-4 font-semibold text-brand-700">
                          {formatMoney(netPay)}
                        </td>
                        <td className="px-4 py-4">{formatDate(salary.effectiveFrom)}</td>
                        <td className="px-4 py-4">
                          {salary.isActive ? "Active" : "Inactive"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <PaginationControls
              pagination={pagination}
              onPageChange={setPage}
              isFetching={salariesQuery.isFetching}
            />
          </div>
        </section>
      </div>
    </AppShell>
  );
}

export default function SalariesPage() {
  return (
    <ProtectedPage requiredPermissions={["payroll:manage"]}>
      {({ user, token }) => <SalariesContent user={user} token={token} />}
    </ProtectedPage>
  );
}
