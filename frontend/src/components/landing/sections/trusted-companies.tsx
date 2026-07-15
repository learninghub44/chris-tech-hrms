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
    <section className="border-y border-ct-graphite/10 bg-ct-paper py-14">
      <div className="mx-auto max-w-6xl px-6">
        <p className="font-inter text-center text-sm uppercase tracking-[0.2em] text-ct-graphite/40">
          Trusted by forward-thinking organizations
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {placeholderLogos.map((name) => (
            <span
              key={name}
              className="font-display text-lg font-bold tracking-tight text-ct-graphite/60"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
