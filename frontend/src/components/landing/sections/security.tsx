export function Security() {
  return (
    <section id="security" className="bg-ct-paper py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-ct-blue/60" />
              <span className="font-mono text-xs uppercase tracking-[0.32em] text-ct-blue">
                Security
              </span>
            </div>
            <h2 className="font-display mt-4 max-w-lg text-3xl font-medium tracking-[-0.02em] sm:text-4xl lg:text-5xl">
              Enterprise-grade security
            </h2>
            <p className="font-inter mt-5 max-w-md text-lg leading-relaxed text-ct-graphite/70">
              Protect sensitive employee information with advanced security
              controls, role-based permissions, encrypted data, audit logs,
              and continuous monitoring designed to meet modern business
              requirements.
            </p>
          </div>

          <div className="ct-cut border border-ct-graphite/10 bg-ct-graphite p-5 text-white shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-inter text-xs font-semibold uppercase tracking-[0.15em] text-white/50">
                Audit log
              </span>
              <span className="font-inter rounded-full bg-ct-blue/15 px-2.5 py-1 text-[11px] font-medium text-ct-ice">
                Encrypted at rest
              </span>
            </div>
            <div className="space-y-2">
              {[
                { who: "H. Mwangi", action: "Approved payroll run — June", time: "2m ago" },
                { who: "System", action: "Rotated data encryption keys", time: "1h ago" },
                { who: "R. Achieng", action: "Updated role: Finance Manager", time: "3h ago" },
                { who: "System", action: "Access attempt blocked — invalid company scope", time: "6h ago" }
              ].map((row) => (
                <div
                  key={row.action}
                  className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="font-inter truncate text-sm text-white/85">{row.action}</p>
                    <p className="font-inter text-xs text-white/45">{row.who}</p>
                  </div>
                  <span className="font-inter shrink-0 text-[11px] text-white/40">{row.time}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { label: "Role-based access", value: "Enforced" },
                { label: "Data isolation", value: "Per company" },
                { label: "Monitoring", value: "24/7" }
              ].map((stat) => (
                <div key={stat.label} className="rounded-lg border border-white/10 bg-white/[0.04] p-3 text-center">
                  <p className="font-inter text-xs font-semibold text-ct-ice">{stat.value}</p>
                  <p className="font-inter text-[11px] text-white/50">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
