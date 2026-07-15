const testimonials = [
  {
    quote:
      "Payroll used to take our HR team three full days every month. Now it runs itself, and the finance team trusts the numbers without double-checking.",
    name: "F. Wambui",
    role: "Head of HR, Amani Retail Group"
  },
  {
    quote:
      "Bringing recruitment, attendance, and leave into one system finally gave our managers a single place to check instead of five spreadsheets.",
    name: "J. Mutiso",
    role: "Operations Director, Northgate Logistics"
  },
  {
    quote:
      "Our employees stopped emailing HR for payslips and leave balances the moment self-service went live. That alone paid for the switch.",
    name: "C. Adhiambo",
    role: "People Operations Lead, Savanna Health Network"
  }
];

export function Testimonials() {
  return (
    <section id="testimonials" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-14 max-w-2xl">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-ct-blue">
          Customers
        </span>
        <h2 className="font-display mt-3 text-3xl font-bold tracking-[-0.02em] sm:text-4xl lg:text-5xl">
          What organizations say
        </h2>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {testimonials.map((t) => (
          <figure
            key={t.name}
            className="ct-cut-sm flex h-full flex-col justify-between border border-ct-graphite/10 bg-white p-7"
          >
            <blockquote className="font-inter text-base leading-relaxed text-ct-graphite/80">
              “{t.quote}”
            </blockquote>
            <figcaption className="mt-6">
              <p className="font-display text-base font-bold">{t.name}</p>
              <p className="font-inter text-sm text-ct-graphite/60">{t.role}</p>
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="font-inter mt-6 text-center text-xs text-ct-graphite/40">
        Sample testimonials shown for layout — replace with real customer quotes when available.
      </p>
    </section>
  );
}
