const faqs = [
  {
    q: "How long does implementation take?",
    a: "Most organizations are fully onboarded — company profile, departments, and employees loaded — within a few days, with attendance and payroll configured shortly after."
  },
  {
    q: "Can multiple companies use the platform?",
    a: "Yes. Each company's data is fully isolated within a single deployment, so a group of businesses can run on one platform without seeing each other's records."
  },
  {
    q: "Can employees access the system remotely?",
    a: "Employees can clock in, request leave, and download payslips from anywhere through the self-service portal, on desktop or mobile."
  },
  {
    q: "Is employee data secure?",
    a: "Data is encrypted, access is controlled by role-based permissions, and every action is recorded in an audit log with continuous monitoring."
  },
  {
    q: "Does the platform support organization growth?",
    a: "The platform is built to scale from a single office to many departments, locations, and companies without changing how your team works day to day."
  },
  {
    q: "Can the platform be customized?",
    a: "Roles, leave policies, pay structures, and workflows can all be configured to match how your organization actually operates."
  }
];

export function FAQ() {
  return (
    <section id="faq" className="bg-ct-paper py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-12 text-center">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-ct-blue">
            Resources
          </span>
          <h2 className="font-display mt-3 text-3xl font-bold tracking-[-0.02em] sm:text-4xl lg:text-5xl">
            Frequently asked questions
          </h2>
        </div>
        <div className="divide-y divide-ct-graphite/10 border-y border-ct-graphite/10">
          {faqs.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="font-display flex cursor-pointer list-none items-center justify-between text-lg font-bold marker:content-none">
                {item.q}
                <span
                  aria-hidden
                  className="ml-4 shrink-0 font-mono text-xl text-ct-blue/60 transition group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="font-inter mt-3 max-w-2xl text-base leading-relaxed text-ct-graphite/70">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
