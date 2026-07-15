const placeholderLogos = [
  "Amani Retail Group",
  "Kilele Manufacturing",
  "Northgate Logistics",
  "Baraka Financial Services",
  "Savanna Health Network",
  "Pioneer Construction Co."
];

export function TrustedCompanies() {
  return (
    <section className="border-y border-ct-graphite/10 bg-ct-paper py-16">
      <div className="mx-auto max-w-6xl px-6">
        <p className="font-mono text-center text-xs uppercase tracking-[0.32em] text-ct-graphite/40">
          Trusted by forward-thinking organizations
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-x-14 gap-y-6">
          {placeholderLogos.map((name) => (
            <span
              key={name}
              className="font-display text-lg font-medium tracking-tight text-ct-graphite/50"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
