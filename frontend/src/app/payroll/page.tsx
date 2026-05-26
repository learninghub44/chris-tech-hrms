"use client";

import { Plus, ReceiptText } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { PaginationControls } from "@/components/pagination-controls";
import { ProtectedPage } from "@/components/protected-page";
import {
  generatePayroll,
  getApiErrorMessage,
  getPaginationMeta,
  listPayrolls
} from "@/lib/api";
import { formatDateTime } from "@/lib/time-format";
import {
  formatMoney,
  formatPayrollMonth,
  payrollStatusLabels
} from "@/lib/payroll-format";
import type { AuthUser } from "@/types";

type PayrollContentProps = {
  user: AuthUser;
  token: string;
};

type PayrollFormValues = {
  month: number;
  year: number;
};

const months = Array.from({ length: 12 }, (_, index) => index + 1);
const pageSize = 25;

function PayrollContent({ user, token }: PayrollContentProps) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [year]);

  const payrollsQuery = useQuery({
    queryKey: ["payrolls", token, year, page],
    queryFn: () => listPayrolls(token, { year, page, pageSize }),
    retry: false
  });
  const {
    formState: { isSubmitting },
    handleSubmit,
    register
  } = useForm<PayrollFormValues>({
    defaultValues: {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    }
  });
  const payrolls = payrollsQuery.data?.success ? payrollsQuery.data.data.payrolls : [];
  const pagination = useMemo(
    () => (payrollsQuery.data ? getPaginationMeta(payrollsQuery.data) : null),
    [payrollsQuery.data]
  );

  async function submit(values: PayrollFormValues) {
    setMessage(null);
    const response = await generatePayroll(token, {
      month: Number(values.month),
      year: Number(values.year)
    }).catch(() => null);

    if (!response) {
      setMessage("Unable to reach the API");
      return;
    }

    if (!response.success) {
      setMessage(getApiErrorMessage(response));
      return;
    }

    setYear(Number(values.year));
    setMessage("Payroll generated");
    void payrollsQuery.refetch();
  }

  return (
    <AppShell user={user} token={token}>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-brand-700">Payroll</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-ink">
              Payroll Runs
            </h1>
          </div>
          <input
            className="h-10 w-32 rounded-md border border-line px-3 text-sm outline-none transition focus:border-brand-600"
            type="number"
            value={year}
            onChange={(event) => setYear(Number(event.target.value))}
            aria-label="Filter payroll year"
          />
        </div>

        <section className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
          <form
            className="rounded-lg border border-line bg-white p-5 shadow-soft"
            onSubmit={handleSubmit(submit)}
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-md bg-brand-50 text-brand-700">
                <ReceiptText size={20} aria-hidden="true" />
              </div>
              <h2 className="text-lg font-semibold tracking-normal">Generate Payroll</h2>
            </div>

            {message ? (
              <div className="mt-5 rounded-md border border-line bg-surface px-3 py-2 text-sm text-slate-700">
                {message}
              </div>
            ) : null}

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Month
                <select
                  className="mt-2 h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-brand-600"
                  {...register("month", { valueAsNumber: true })}
                >
                  {months.map((month) => (
                    <option key={month} value={month}>
                      {formatPayrollMonth(month, 2026).replace(" 2026", "")}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Year
                <input
                  className="mt-2 h-11 w-full rounded-md border border-line px-3 text-sm outline-none transition focus:border-brand-600"
                  min="2000"
                  max="2100"
                  type="number"
                  {...register("year", { valueAsNumber: true })}
                />
              </label>
            </div>

            <button
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={isSubmitting}
            >
              <Plus size={17} aria-hidden="true" />
              Generate payroll
            </button>
          </form>

          <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
            <h2 className="text-lg font-semibold tracking-normal">Payroll History</h2>
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-[760px] w-full text-left text-sm">
                <thead className="border-b border-line bg-surface text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Month</th>
                    <th className="px-4 py-3 font-semibold">Employees</th>
                    <th className="px-4 py-3 font-semibold">Gross</th>
                    <th className="px-4 py-3 font-semibold">Net</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Generated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {payrolls.map((payroll) => (
                    <tr key={payroll.id}>
                      <td className="px-4 py-4">
                        <Link
                          className="font-medium text-brand-700 hover:underline"
                          href={`/payroll/${payroll.id}`}
                        >
                          {formatPayrollMonth(payroll.month, payroll.year)}
                        </Link>
                      </td>
                      <td className="px-4 py-4">{payroll.itemCount}</td>
                      <td className="px-4 py-4">{formatMoney(payroll.totalGross)}</td>
                      <td className="px-4 py-4 font-semibold text-brand-700">
                        {formatMoney(payroll.totalNet)}
                      </td>
                      <td className="px-4 py-4">{payrollStatusLabels[payroll.status]}</td>
                      <td className="px-4 py-4">{formatDateTime(payroll.generatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <PaginationControls
              pagination={pagination}
              onPageChange={setPage}
              isFetching={payrollsQuery.isFetching}
            />
          </div>
        </section>
      </div>
    </AppShell>
  );
}

export default function PayrollPage() {
  return (
    <ProtectedPage requiredPermissions={["payroll:manage"]}>
      {({ user, token }) => <PayrollContent user={user} token={token} />}
    </ProtectedPage>
  );
}
