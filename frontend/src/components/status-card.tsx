import type { LucideIcon } from "lucide-react";

type StatusCardProps = {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone: "brand" | "blue" | "amber" | "slate" | "primary" | "success" | "warning" | "danger";
};

const toneClasses: Record<StatusCardProps["tone"], string> = {
  // Legacy tones kept working for unmigrated call sites.
  brand: "bg-primary-50 text-primary-700",
  blue: "bg-primary-50 text-primary-700",
  amber: "bg-warning/10 text-warning",
  slate: "bg-canvas text-ink2-soft",
  // New premium palette tones.
  primary: "bg-primary-50 text-primary-700",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger"
};

export function StatusCard({
  label,
  value,
  detail,
  icon: Icon,
  tone
}: StatusCardProps) {
  return (
    <article className="min-w-0 rounded-2xl border border-edge bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-elevated">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink2-soft">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-ink2">
            {value}
          </p>
        </div>
        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${toneClasses[tone]}`}>
          <Icon size={20} aria-hidden="true" />
        </div>
      </div>
      <p className="mt-4 text-sm text-ink2-soft">{detail}</p>
    </article>
  );
}
