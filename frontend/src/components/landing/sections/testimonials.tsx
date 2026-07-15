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
    <section id="testimonials" className="mx-auto max-w-6xl px-6 py-28">
      <div className="mb-14 max-w-2xl">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-ct-blue">
          Customers
        </span>
        <h2 className="font-display mt-3 text-3xl font-bold tracking-[-0.02em] sm:text-4xl lg:text-5xl">
          Built for teams that demand reliability.
        </h2>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {testimonials.map((testimonial) => (
          <figure
            key={testimonial.name}
            className="glass-panel flex h-full flex-col justify-between rounded-[32px] border border-white/15 p-8 shadow-soft"
          >
            <blockquote className="font-inter text-base leading-relaxed text-white/85">
              “{testimonial.quote}”
            </blockquote>
            <figcaption className="mt-8">
              <p className="font-display text-base font-semibold text-white">{testimonial.name}</p>
              <p className="font-inter text-sm text-white/60">{testimonial.role}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
