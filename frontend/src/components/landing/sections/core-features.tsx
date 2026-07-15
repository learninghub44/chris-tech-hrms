const features = [
  {
    title: "Employee Management",
    copy: "Create a single source of truth for employee profiles, contracts, documents, skills, and career progression."
  },
  {
    title: "Recruitment & Hiring",
    copy: "Streamline every stage of hiring with job workflows, interview scheduling, and automated offer management."
  },
  {
    title: "Attendance & Time Tracking",
    copy: "Track time, shifts, remote work, and approvals in real time from a modern attendance console."
  },
  {
    title: "Leave Management",
    copy: "Automate leave requests, approvals, balances, and policy enforcement across all teams."
  },
  {
    title: "Payroll Management",
    copy: "Process salaries, bonuses, deductions, taxes, and payslips with audit-ready payroll automation."
  },
  {
    title: "Performance Management",
    copy: "Set goals, review progress, and run evaluations with a streamlined performance hub."
  },
  {
    title: "Employee Self-Service",
    copy: "Enable employees with self-service access to payslips, leave, updates, and personal profile changes."
  },
  {
    title: "Analytics & Reporting",
    copy: "Unlock executive-grade workforce insights with custom dashboards and operational reports."
  }
];

export function CoreFeatures() {
  return (
    <section id="features" className="bg-ct-paper py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-ct-blue">
            Core features
          </span>
          <h2 className="font-display mt-3 text-3xl font-bold tracking-[-0.02em] sm:text-4xl lg:text-5xl">
            Enterprise HR tools that keep your team moving.
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="rounded-[32px] border border-ct-graphite/10 bg-white p-7 shadow-soft transition hover:-translate-y-1 hover:border-ct-blue/30"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-3xl bg-gradient-to-br from-ct-blue to-ct-ice text-sm font-semibold text-white">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display mt-5 text-xl font-bold text-ink">{feature.title}</h3>
              <p className="font-inter mt-3 text-sm leading-relaxed text-ink/70">
                {feature.copy}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
