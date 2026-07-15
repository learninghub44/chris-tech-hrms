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
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-ct-blue">
          How it works
        </span>
        <h2 className="font-display mx-auto mt-3 max-w-xl text-3xl font-bold tracking-[-0.02em] sm:text-4xl lg:text-5xl">
          Simple from start to finish
        </h2>
      </div>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
        {steps.map((step, i) => (
          <div key={step.title} className="relative pl-1">
            <span className="font-mono text-sm text-ct-blue/60">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="font-display mt-2 text-lg font-bold leading-snug">{step.title}</h3>
            <p className="font-inter mt-2 text-sm leading-relaxed text-ct-graphite/70">{step.copy}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
