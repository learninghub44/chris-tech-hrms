import { Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "Payroll used to take all day every month. The platform now keeps our teams aligned without spreadsheets or manual follow-up.",
    name: "F. Wambui",
    role: "Head of HR, Amani Retail Group"
  },
  {
    quote:
      "A single source of truth for attendance, leave, and performance made every leader more confident in their decisions.",
    name: "J. Mutiso",
    role: "Operations Director, Northgate Logistics"
  },
  {
    quote:
      "Employees can now manage their own profiles and payslips on the go. It has become our most valued HR experience.",
    name: "C. Adhiambo",
    role: "People Operations Lead, Savanna Health Network"
  }
];

export function Testimonials() {
  return (
    <section id="testimonials" className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ct-blue">
            Customers
          </p>
          <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-ct-graphite sm:text-4xl">
            Built for teams that demand reliability
          </h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <figure
              key={testimonial.name}
              className="flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-ct-mist p-7"
            >
              <Quote className="h-6 w-6 text-ct-blue/40" aria-hidden />
              <blockquote className="font-inter mt-4 flex-1 text-base leading-relaxed text-ink/75">
                {testimonial.quote}
              </blockquote>
              <figcaption className="mt-6 border-t border-slate-200 pt-4">
                <p className="font-display text-sm font-semibold text-ct-graphite">{testimonial.name}</p>
                <p className="font-inter text-sm text-ink/50">{testimonial.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
