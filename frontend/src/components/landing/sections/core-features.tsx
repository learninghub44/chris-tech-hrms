const features = [
  {
    title: "Employee Management",
    copy: "Maintain complete employee profiles, contracts, documents, organizational structures, and employment history from a centralized location."
  },
  {
    title: "Recruitment & Hiring",
    copy: "Manage job openings, applicants, interviews, offers, and onboarding with a streamlined recruitment process."
  },
  {
    title: "Attendance & Time Tracking",
    copy: "Monitor attendance, working hours, overtime, shifts, and remote work with real-time tracking."
  },
  {
    title: "Leave Management",
    copy: "Automate leave requests, approvals, balances, and company leave policies."
  },
  {
    title: "Payroll Management",
    copy: "Process salaries, deductions, bonuses, taxes, and payslips accurately with automated payroll workflows."
  },
  {
    title: "Performance Management",
    copy: "Set goals, conduct evaluations, monitor progress, and support employee development."
  },
  {
    title: "Employee Self-Service",
    copy: "Allow employees to manage personal information, submit requests, download payslips, and access company updates from anywhere."
  },
  {
    title: "Analytics & Reporting",
    copy: "Access real-time workforce insights with customizable dashboards and business reports."
  }
];

export function CoreFeatures() {
  return (
    <section id="features" className="bg-ct-paper py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-ct-blue">
            Core features
          </span>
          <h2 className="font-display mt-3 text-3xl font-bold tracking-[-0.02em] sm:text-4xl lg:text-5xl">
            Comprehensive HR solutions
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="ct-cut-sm border border-ct-graphite/10 bg-white p-6 transition hover:border-ct-blue/40 hover:shadow-soft"
            >
              <span className="font-mono text-xs text-ct-blue/60">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display mt-3 text-xl font-bold">{feature.title}</h3>
              <p className="font-inter mt-2 text-sm leading-relaxed text-ct-graphite/70">
                {feature.copy}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
