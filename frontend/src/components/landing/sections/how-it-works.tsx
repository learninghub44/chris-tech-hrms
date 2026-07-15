const steps = [
  { title: "Create your organization", copy: "Set up your company profile and workspace in minutes." },
  { title: "Add employees and departments", copy: "Bring in your people and structure them the way your business runs." },
  { title: "Configure attendance and payroll", copy: "Set shift rules, pay cycles, and policies to match how you operate." },
  { title: "Automate HR workflows", copy: "Approvals, notifications, and records update themselves from there." },
  { title: "Gain workforce insights", copy: "Real-time analytics turn day-to-day HR data into decisions." }
];

export function HowItWorks() {
  return (
    <section className="bg-ct-mist py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ct-blue">
            How it works
          </p>
          <h2 className="font-display mx-auto mt-3 max-w-xl text-3xl font-semibold tracking-tight text-ct-graphite sm:text-4xl">
            Simple from start to finish
          </h2>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((step, i) => (
            <div key={step.title} className="border-t-2 border-ct-blue/25 pt-5">
              <span className="font-display text-xl font-semibold text-ct-blue">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display mt-2 text-base font-semibold leading-snug text-ct-graphite">{step.title}</h3>
              <p className="font-inter mt-2 text-sm leading-relaxed text-ink/60">{step.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
