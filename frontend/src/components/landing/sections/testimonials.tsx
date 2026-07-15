const testimonials = [
  {
    quote:
      'Payroll used to take all day every month. The platform now keeps our teams aligned without spreadsheets or manual follow-up.',
    name: 'F. Wambui',
    role: 'Head of HR, Amani Retail Group'
  },
  {
    quote:
      'A single source of truth for attendance, leave, and performance made every leader more confident in their decisions.',
    name: 'J. Mutiso',
    role: 'Operations Director, Northgate Logistics'
  },
  {
    quote:
      'Employees can now manage their own profiles and payslips on the go. It has become our most valued HR experience.',
    name: 'C. Adhiambo',
    role: 'People Operations Lead, Savanna Health Network'
  }
];

export function Testimonials() {
  return (
    <section id="testimonials" className="relative overflow-hidden bg-ct-graphite py-28 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-0 h-[420px] w-[420px] rounded-full bg-ct-blue/15 blur-[130px]"
      />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mb-14 max-w-2xl">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-ct-ice/70" />
            <span className="font-mono text-xs uppercase tracking-[0.32em] text-ct-ice">
              Customers
            </span>
          </div>
          <h2 className="font-display mt-4 text-3xl font-medium tracking-[-0.02em] sm:text-4xl lg:text-5xl">
            Built for teams that demand reliability.
          </h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <figure
              key={testimonial.name}
              className="glass-panel flex h-full flex-col justify-between rounded-[32px] border border-white/15 p-8 shadow-soft"
            >
              <span aria-hidden className="font-display block text-5xl font-medium leading-none text-ct-ice/70">
                “
              </span>
              <blockquote className="font-inter mt-4 flex-1 text-base leading-relaxed text-white/85">
                {testimonial.quote}
              </blockquote>
              <figcaption className="mt-8 border-t border-white/10 pt-5">
                <p className="font-display text-base font-medium text-white">{testimonial.name}</p>
                <p className="font-inter text-sm text-white/60">{testimonial.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
