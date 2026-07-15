import {
  IdCard,
  Briefcase,
  Clock3,
  CalendarCheck,
  Banknote,
  Target,
  UserCog,
  BarChart3
} from "lucide-react";

const features = [
  {
    icon: IdCard,
    title: "Employee Management",
    copy: "Create a single source of truth for employee profiles, contracts, documents, skills, and career progression."
  },
  {
    icon: Briefcase,
    title: "Recruitment & Hiring",
    copy: "Streamline every stage of hiring with job workflows, interview scheduling, and automated offer management."
  },
  {
    icon: Clock3,
    title: "Attendance & Time Tracking",
    copy: "Track time, shifts, remote work, and approvals in real time from a modern attendance console."
  },
  {
    icon: CalendarCheck,
    title: "Leave Management",
    copy: "Automate leave requests, approvals, balances, and policy enforcement across all teams."
  },
  {
    icon: Banknote,
    title: "Payroll Management",
    copy: "Process salaries, bonuses, deductions, taxes, and payslips with audit-ready payroll automation."
  },
  {
    icon: Target,
    title: "Performance Management",
    copy: "Set goals, review progress, and run evaluations with a streamlined performance hub."
  },
  {
    icon: UserCog,
    title: "Employee Self-Service",
    copy: "Enable employees with self-service access to payslips, leave, updates, and personal profile changes."
  },
  {
    icon: BarChart3,
    title: "Analytics & Reporting",
    copy: "Get clear workforce insights with custom dashboards and operational reports."
  }
];

export function CoreFeatures() {
  return (
    <section id="features" className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ct-blue">
            Platform modules
          </p>
          <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-ct-graphite sm:text-4xl">
            Enterprise HR tools that keep your team moving
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-slate-200 bg-white p-6 transition hover:border-ct-blue/30 hover:shadow-card"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ct-blue/10">
                <feature.icon className="h-5 w-5 text-ct-blue" aria-hidden />
              </div>
              <h3 className="font-display mt-5 text-base font-semibold text-ct-graphite">{feature.title}</h3>
              <p className="font-inter mt-2.5 text-sm leading-relaxed text-ink/60">
                {feature.copy}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
