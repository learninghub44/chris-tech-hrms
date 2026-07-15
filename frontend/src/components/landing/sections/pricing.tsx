import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "KES 15,000",
    period: "/month",
    description: "For small teams getting HR processes off spreadsheets.",
    features: [
      "Up to 50 employees",
      "Attendance & leave management",
      "Employee self-service portal",
      "Email support"
    ],
    featured: false
  },
  {
    name: "Business",
    price: "KES 45,000",
    period: "/month",
    description: "For growing companies that need payroll and recruitment.",
    features: [
      "Up to 250 employees",
      "Everything in Starter",
      "Payroll & recruitment modules",
      "Performance management",
      "Priority support"
    ],
    featured: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For multi-company groups with custom requirements.",
    features: [
      "Unlimited employees & companies",
      "Everything in Business",
      "Multi-tenant company isolation",
      "Custom workflows & integrations",
      "Dedicated account manager"
    ],
    featured: false
  }
];

export function Pricing() {
  return (
    <section id="pricing" className="bg-ct-mist py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ct-blue">
            Pricing
          </p>
          <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-ct-graphite sm:text-4xl">
            Plans that grow with your business
          </h2>
          <p className="font-inter mt-4 text-lg leading-relaxed text-ink/60">
            Straightforward monthly pricing. Every plan includes secure
            hosting, regular updates, and Kenyan-based support.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl border bg-white p-8 ${
                plan.featured ? "border-ct-blue shadow-soft" : "border-slate-200"
              }`}
            >
              {plan.featured ? (
                <span className="absolute -top-3 left-8 rounded-full bg-ct-blue px-3 py-1 text-xs font-semibold text-white">
                  Most popular
                </span>
              ) : null}
              <h3 className="font-display text-lg font-semibold text-ct-graphite">{plan.name}</h3>
              <p className="font-inter mt-1.5 text-sm text-ink/55">{plan.description}</p>
              <p className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-3xl font-semibold text-ct-graphite">{plan.price}</span>
                {plan.period ? <span className="text-sm text-ink/45">{plan.period}</span> : null}
              </p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-ink/70">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-ct-blue" aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href={`mailto:support@christech.co.ke?subject=${encodeURIComponent(plan.name + " plan enquiry")}`}
                className={`mt-8 block rounded-md px-5 py-2.5 text-center text-sm font-semibold transition ${
                  plan.featured
                    ? "bg-ct-blue text-white hover:bg-ct-blueDeep"
                    : "border border-slate-300 text-ct-graphite hover:border-ct-blue hover:text-ct-blue"
                }`}
              >
                {plan.name === "Enterprise" ? "Contact sales" : "Get started"}
              </a>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-ink/40">
          Prices shown are indicative. Contact sales for a quote based on your organization&apos;s size.
        </p>
      </div>
    </section>
  );
}
