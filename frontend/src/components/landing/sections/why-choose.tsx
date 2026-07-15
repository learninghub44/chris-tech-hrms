import { ShieldCheck, Gauge, Users2, LineChart } from "lucide-react";

const benefits = [
  {
    icon: Gauge,
    title: "Cut manual HR work",
    copy: "Attendance, leave, and payroll run on rules you set once — approvals and calculations happen automatically from there."
  },
  {
    icon: ShieldCheck,
    title: "Stay audit-ready",
    copy: "Role-based access and a full audit trail mean every record and approval can be traced when compliance asks for it."
  },
  {
    icon: Users2,
    title: "Give employees self-service",
    copy: "Payslips, leave balances, and profile updates are available to employees directly, without routing through HR."
  },
  {
    icon: LineChart,
    title: "Make decisions with real data",
    copy: "Workforce reports and dashboards give leadership a current, accurate view of headcount, cost, and performance."
  }
];

export function WhyChoose() {
  return (
    <section id="why" className="bg-ct-mist py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ct-blue">
            Platform benefits
          </p>
          <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-ct-graphite sm:text-4xl">
            Everything your HR team needs, in one place
          </h2>
          <p className="font-inter mt-4 text-lg leading-relaxed text-ink/60">
            Replace spreadsheets and manual approvals with a single connected
            system built for how HR teams actually work.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="rounded-xl border border-slate-200 bg-white p-6"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ct-blue/10">
                <benefit.icon className="h-5 w-5 text-ct-blue" aria-hidden />
              </div>
              <h3 className="font-display mt-4 text-base font-semibold text-ct-graphite">
                {benefit.title}
              </h3>
              <p className="font-inter mt-2 text-sm leading-relaxed text-ink/60">
                {benefit.copy}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
