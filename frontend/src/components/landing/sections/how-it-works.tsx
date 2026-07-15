const steps = [
  { title: "Create your organization", copy: "Set up your company profile and workspace in minutes." },
  { title: "Add employees and departments", copy: "Bring in your people and structure them the way your business runs." },
  { title: "Configure attendance and payroll", copy: "Set shift rules, pay cycles, and policies to match how you operate." },
  { title: "Automate HR workflows", copy: "Approvals, notifications, and records update themselves from there." },
  { title: "Gain workforce insights", copy: "Real-time analytics turn day-to-day HR data into decisions." }
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-16 text-center">
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-ct-blue/60" />
          <span className="font-mono text-xs uppercase tracking-[0.32em] text-ct-blue">
            How it works
          </span>
          <span className="h-px w-10 bg-ct-blue/60" />
        </div>
        <h2 className="font-display mx-auto mt-4 max-w-xl text-3xl font-medium tracking-[-0.02em] sm:text-4xl lg:text-5xl">
          Simple from start to finish
        </h2>
      </div>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
        {steps.map((step, i) => (
          <div key={step.title} className="relative border-t-2 border-ct-ice/40 pl-0 pt-5">
            <span className="font-display text-2xl font-medium text-ct-ice">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="font-display mt-2 text-lg font-medium leading-snug">{step.title}</h3>
            <p className="font-inter mt-2 text-sm leading-relaxed text-ct-graphite/70">{step.copy}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
