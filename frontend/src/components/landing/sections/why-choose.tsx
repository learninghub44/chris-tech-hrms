export function WhyChoose() {
  return (
    <section id="why" className="mx-auto max-w-6xl px-6 py-24">
      <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
        <div>
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-ct-blue">
            Why choose our HRMS
          </span>
          <h2 className="font-display mt-3 max-w-lg text-3xl font-bold tracking-[-0.02em] sm:text-4xl lg:text-5xl">
            Everything your HR team needs in one platform
          </h2>
          <p className="font-inter mt-5 max-w-md text-lg leading-relaxed text-ct-graphite/70">
            Eliminate manual processes and manage your entire workforce
            through one connected system designed for modern organizations.
          </p>
        </div>

        {/* large dashboard mockup */}
        <div className="ct-cut border border-ct-graphite/10 bg-ct-graphite p-5 text-white shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-inter text-xs font-semibold uppercase tracking-[0.15em] text-white/50">
              Employee directory
            </span>
            <span className="flex gap-1.5">
              <span className="h-2 w-2 rounded-full bg-ct-ice/60" />
              <span className="h-2 w-2 rounded-full bg-white/20" />
              <span className="h-2 w-2 rounded-full bg-white/20" />
            </span>
          </div>
          <div className="space-y-2">
            {[
              { name: "A. Wanjiru", role: "Finance Manager", status: "Active" },
              { name: "D. Otieno", role: "Software Engineer", status: "Active" },
              { name: "M. Njeri", role: "Recruiter", status: "On leave" },
              { name: "S. Kiptoo", role: "Operations Lead", status: "Active" }
            ].map((row) => (
              <div
                key={row.name}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5"
              >
                <div>
                  <p className="font-inter text-sm font-semibold text-white">{row.name}</p>
                  <p className="font-inter text-xs text-white/50">{row.role}</p>
                </div>
                <span
                  className={`font-inter rounded-full px-2.5 py-1 text-[11px] font-medium ${
                    row.status === "Active"
                      ? "bg-ct-blue/15 text-ct-ice"
                      : "bg-white/10 text-white/60"
                  }`}
                >
                  {row.status}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: "Departments", value: "12" },
              { label: "Locations", value: "5" },
              { label: "Avg. tenure", value: "3.4y" }
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg border border-white/10 bg-white/[0.04] p-3 text-center">
                <p className="font-display text-lg font-bold">{stat.value}</p>
                <p className="font-inter text-[11px] text-white/50">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
