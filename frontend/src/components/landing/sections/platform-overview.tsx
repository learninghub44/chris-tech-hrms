"use client";

import { motion, useReducedMotion } from "framer-motion";

export function PlatformOverview() {
  const shouldReduceMotion = useReducedMotion();
  return (
    <section id="platform" className="bg-ct-steel py-28 text-white">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-ct-ice/70" />
              <span className="font-mono text-xs uppercase tracking-[0.32em] text-ct-ice">
                Solutions
              </span>
            </div>
            <h2 className="font-display mt-4 max-w-lg text-3xl font-medium tracking-[-0.02em] sm:text-4xl lg:text-5xl">
              Built for modern enterprise teams
            </h2>
            <p className="font-inter mt-6 max-w-md text-lg leading-relaxed text-white/70">
              Drive better outcomes with a single HR platform that aligns people,
              payroll, and performance across every location, role, and business unit.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {[
                { label: 'Secure workflows', value: 'Role-based access' },
                { label: 'People insights', value: 'Real-time dashboards' },
                { label: 'Smart automation', value: 'Policy-driven approvals' },
                { label: 'Scalable model', value: 'Multi-company support' }
              ].map((item) => (
                <div key={item.label} className="rounded-3xl border border-white/10 bg-white/[0.05] p-5">
                  <p className="font-inter text-sm uppercase tracking-[0.18em] text-white/50">{item.label}</p>
                  <p className="font-display mt-3 text-lg font-bold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="ct-cut relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.06] p-6 shadow-[0_40px_120px_-30px_rgba(47,111,237,0.28)]">
            <div className="absolute top-6 right-6 h-24 w-24 rounded-full bg-ct-blue/10 blur-3xl" />
            <div className="mb-5 flex items-center justify-between">
              <span className="font-inter text-xs font-semibold uppercase tracking-[0.15em] text-white/50">
                Organization health
              </span>
              <span className="inline-flex items-center gap-1.5 font-inter text-[11px] text-white/50">
                <motion.span
                  className="h-1.5 w-1.5 rounded-full bg-ct-blue"
                  animate={shouldReduceMotion ? undefined : { opacity: [1, 0.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                Synced
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { label: 'Legal entities', value: '5' },
                { label: 'Active policies', value: '128' },
                { label: 'Monthly payruns', value: '2' },
                { label: 'Audit ready', value: 'Yes' }
              ].map((stat) => (
                <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/[0.035] p-4">
                  <p className="font-display text-lg font-bold text-white">{stat.value}</p>
                  <p className="font-inter mt-2 text-[11px] uppercase tracking-[0.18em] text-white/50">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-inter text-[11px] uppercase tracking-[0.16em] text-white/60">Headcount distribution</p>
                <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] text-white/60">Live</span>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Operations', pct: 82 },
                  { label: 'Engineering', pct: 64 },
                  { label: 'Finance', pct: 40 },
                  { label: 'People & Culture', pct: 28 }
                ].map((row) => (
                  <div key={row.label} className="space-y-1">
                    <div className="flex items-center justify-between text-sm text-white/70">
                      <span>{row.label}</span>
                      <span>{row.pct}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-gradient-to-r from-ct-blue to-ct-ice" style={{ width: `${row.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
