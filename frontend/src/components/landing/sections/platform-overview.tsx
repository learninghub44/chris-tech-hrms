export function PlatformOverview() {
  return (
    <section id="platform" className="bg-ct-steel py-24 text-white">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
          {/* large dashboard image */}
          <div className="ct-cut order-2 border border-white/10 bg-ct-slate/60 p-5 lg:order-1">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-inter text-xs font-semibold uppercase tracking-[0.15em] text-white/50">
                Organization overview
              </span>
              <span className="flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-ct-ice/60" />
                <span className="h-2 w-2 rounded-full bg-white/20" />
                <span className="h-2 w-2 rounded-full bg-white/20" />
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Companies", value: "8" },
                { label: "Employees", value: "1,240" },
                { label: "Active workflows", value: "36" },
                { label: "Uptime, 90d", value: "99.98%" }
              ].map((stat) => (
                <div key={stat.label} className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                  <p className="font-display text-lg font-bold">{stat.value}</p>
                  <p className="font-inter text-[11px] text-white/50">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.04] p-3">
              <p className="font-inter mb-2 text-[11px] font-medium text-white/60">Departments by headcount</p>
              <div className="space-y-1.5">
                {[
                  { label: "Operations", pct: 82 },
                  { label: "Engineering", pct: 64 },
                  { label: "Finance", pct: 40 },
                  { label: "People & Culture", pct: 28 }
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-2">
                    <span className="font-inter w-24 shrink-0 text-[11px] text-white/60">{row.label}</span>
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                      <span
                        className="block h-full rounded-full bg-gradient-to-r from-ct-blue to-ct-ice"
                        style={{ width: `${row.pct}%` }}
                      />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-ct-ice">
              Solutions
            </span>
            <h2 className="font-display mt-3 max-w-lg text-3xl font-bold tracking-[-0.02em] sm:text-4xl lg:text-5xl">
              Built for modern organizations
            </h2>
            <p className="font-inter mt-5 max-w-md text-lg leading-relaxed text-white/70">
              A single platform connecting employees, managers, and HR teams
              through intuitive workflows, secure data management, and
              intelligent automation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
