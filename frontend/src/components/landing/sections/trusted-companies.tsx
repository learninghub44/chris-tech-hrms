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
    <section className="border-b border-slate-100 bg-white py-14">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-ink/40">
          Trusted by organizations across Kenya and East Africa
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-5">
          {placeholderLogos.map((name) => (
            <span
              key={name}
              className="font-display text-base font-semibold tracking-tight text-ink/35"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
