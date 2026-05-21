"use client";

import { Download, ReceiptText } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { PaginationControls } from "@/components/pagination-controls";
import { ProtectedPage } from "@/components/protected-page";
import {
  getApiErrorMessage,
  getPaginationMeta,
  getPayslipDownload,
  listMyPayslips
} from "@/lib/api";
import { formatDateTime } from "@/lib/time-format";
import { formatMoney, formatPayrollMonth } from "@/lib/payroll-format";
import type { AuthUser } from "@/types";

type MyPayslipsContentProps = {
  user: AuthUser;
  token: string;
};

const pageSize = 25;

function downloadTextFile(fileName: string, contentType: string, content: string): void {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function MyPayslipsContent({ user, token }: MyPayslipsContentProps) {
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const payslipsQuery = useQuery({
    queryKey: ["my-payslips", token, page],
    queryFn: () => listMyPayslips(token, { page, pageSize }),
    retry: false
  });
  const payslips = payslipsQuery.data?.success ? payslipsQuery.data.data.payslips : [];
  const pagination = useMemo(
    () => (payslipsQuery.data ? getPaginationMeta(payslipsQuery.data) : null),
    [payslipsQuery.data]
  );

  async function downloadPayslip(payrollId: string) {
    setError(null);
    const response = await getPayslipDownload(token, payrollId).catch(() => null);

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
              My Payslips
            </h1>
          </div>
        </div>

        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-line bg-surface text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Month</th>
                  <th className="px-4 py-3 font-semibold">Payslip</th>
                  <th className="px-4 py-3 font-semibold">Gross</th>
                  <th className="px-4 py-3 font-semibold">Deductions</th>
                  <th className="px-4 py-3 font-semibold">Net</th>
                  <th className="px-4 py-3 font-semibold">Issued</th>
                  <th className="px-4 py-3 font-semibold">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {payslips.map((payslip) => (
                  <tr key={payslip.id}>
                    <td className="px-4 py-4">
                      {payslip.payroll
                        ? formatPayrollMonth(payslip.payroll.month, payslip.payroll.year)
                        : "Payroll"}
                    </td>
                    <td className="px-4 py-4">{payslip.payslipNumber}</td>
                    <td className="px-4 py-4">{formatMoney(payslip.grossPay)}</td>
                    <td className="px-4 py-4">{formatMoney(payslip.totalDeductions)}</td>
                    <td className="px-4 py-4 font-semibold text-brand-700">
                      {formatMoney(payslip.netPay)}
                    </td>
                    <td className="px-4 py-4">{formatDateTime(payslip.issuedAt)}</td>
                    <td className="px-4 py-4">
                      <button
                        className="grid h-9 w-9 place-items-center rounded-md border border-line text-slate-600 transition hover:bg-surface"
                        type="button"
                        onClick={() => downloadPayslip(payslip.payrollId)}
                        aria-label={`Download ${payslip.payslipNumber}`}
                      >
                        <Download size={16} aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!payslipsQuery.isLoading && payslips.length === 0 ? (
            <div className="mt-5 rounded-md border border-dashed border-line px-4 py-8 text-center text-sm text-slate-500">
              No payslips found.
            </div>
          ) : null}
          <PaginationControls
            pagination={pagination}
            onPageChange={setPage}
            isFetching={payslipsQuery.isFetching}
          />
        </section>
      </div>
    </AppShell>
  );
}

export default function MyPayslipsPage() {
  return (
    <ProtectedPage requiredPermissions={["payroll:read"]}>
      {({ user, token }) => <MyPayslipsContent user={user} token={token} />}
    </ProtectedPage>
  );
}
