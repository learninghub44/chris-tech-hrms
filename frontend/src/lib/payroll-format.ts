import type { PayrollStatus } from "@/types";

export const payrollStatusLabels: Record<PayrollStatus, string> = {
  GENERATED: "Generated",
  REVIEWED: "Reviewed",
  PAID: "Paid"
};

export function formatMoney(value: number): string {
  return new Intl.NumberFormat("en", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(value);
}

export function formatPayrollMonth(month: number, year: number): string {
  const date = new Date(Date.UTC(year, month - 1, 1));

  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric"
  }).format(date);
}
