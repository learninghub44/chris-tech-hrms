"use client";

import { Download, ReceiptText } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { ProtectedPage } from "@/components/protected-page";
import { getPayroll, getPayslipDownload, getApiErrorMessage } from "@/lib/api";
import { getEmployeeName } from "@/lib/employee-format";
import {
  formatMoney,
  formatPayrollMonth,
  payrollStatusLabels
} from "@/lib/payroll-format";
import type { AuthUser } from "@/types";

type PayrollDetailContentProps = {
  user: AuthUser;
  token: string;
};

function downloadTextFile(fileName: string, contentType: string, content: string): void {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function PayrollDetailContent({ user, token }: PayrollDetailContentProps) {
  const params = useParams<{ id: string }>();
  const [error, setError] = useState<string | null>(null);
  const payrollQuery = useQuery({
    queryKey: ["payroll", token, params.id],
    queryFn: () => getPayroll(token, params.id),
    retry: false
  });
  const payroll = payrollQuery.data?.success ? payrollQuery.data.data.payroll : null;
  const items = payroll?.items ?? [];

  async function downloadPayslip(employeeId: string) {
    setError(null);
    const response = await getPayslipDownload(token, params.id, employeeId).catch(() => null);

    if (!response) {
      setError("Unable to reach the API");
      return;
    }

    if (!response.success) {
      setError(getApiErrorMessage(response));
      return;
    }

    downloadTextFile(
      response.data.fileName,
      response.data.contentType,
      response.data.content
    );
  }

  return (
    <AppShell user={user} token={token}>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-md bg-brand-50 text-brand-700">
            <ReceiptText size={22} aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-brand-700">Payroll</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-ink">
              {payroll
                ? formatPayrollMonth(payroll.month, payroll.year)
                : "Payroll Detail"}
            </h1>
          </div>
        </div>

        {payroll ? (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
              <p className="text-sm text-slate-500">Employees</p>
              <p className="mt-2 text-2xl font-semibold tracking-normal text-ink">
                {payroll.itemCount}
              </p>
            </div>
            <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
              <p className="text-sm text-slate-500">Gross</p>
              <p className="mt-2 text-2xl font-semibold tracking-normal text-ink">
                {formatMoney(payroll.totalGross)}
              </p>
            </div>
            <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
              <p className="text-sm text-slate-500">Deductions</p>
              <p className="mt-2 text-2xl font-semibold tracking-normal text-ink">
                {formatMoney(payroll.totalDeductions)}
              </p>
            </div>
            <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
              <p className="text-sm text-slate-500">Net</p>
              <p className="mt-2 text-2xl font-semibold tracking-normal text-brand-700">
                {formatMoney(payroll.totalNet)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {payrollStatusLabels[payroll.status]}
              </p>
            </div>
          </section>
        ) : null}

        <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-lg font-semibold tracking-normal">Payroll Items</h2>
            {error ? <p className="text-sm text-red-700">{error}</p> : null}
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-line bg-surface text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Employee</th>
                  <th className="px-4 py-3 font-semibold">Base</th>
                  <th className="px-4 py-3 font-semibold">Allowances</th>
                  <th className="px-4 py-3 font-semibold">Deductions</th>
                  <th className="px-4 py-3 font-semibold">Net</th>
                  <th className="px-4 py-3 font-semibold">Payslip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-4">
                      <div className="font-medium text-ink">
                        {getEmployeeName(item.employee)}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {item.employee.employeeCode}
                      </div>
                    </td>
                    <td className="px-4 py-4">{formatMoney(item.baseSalary)}</td>
                    <td className="px-4 py-4">{formatMoney(item.allowances)}</td>
                    <td className="px-4 py-4">{formatMoney(item.totalDeductions)}</td>
                    <td className="px-4 py-4 font-semibold text-brand-700">
                      {formatMoney(item.netPay)}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        className="grid h-9 w-9 place-items-center rounded-md border border-line text-slate-600 transition hover:bg-surface"
                        type="button"
                        onClick={() => downloadPayslip(item.employeeId)}
                        aria-label={`Download payslip for ${getEmployeeName(item.employee)}`}
                      >
                        <Download size={16} aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

export default function PayrollDetailPage() {
  return (
    <ProtectedPage requiredPermissions={["payroll:manage"]}>
      {({ user, token }) => <PayrollDetailContent user={user} token={token} />}
    </ProtectedPage>
  );
}
