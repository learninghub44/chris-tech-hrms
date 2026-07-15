export function PlatformOverview() {
  return (
    <section id="platform" className="bg-ct-steel py-28 text-white">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-ct-ice/70" />
            <span className="font-mono text-xs uppercase tracking-[0.32em] text-ct-ice">
              Solutions
            </span>
            <span className="h-px w-10 bg-ct-ice/70" />
          </div>
          <h2 className="font-display mt-4 max-w-lg text-3xl font-medium tracking-[-0.02em] sm:text-4xl lg:text-5xl">
            Built for modern enterprise teams
          </h2>
          <p className="font-inter mt-6 max-w-md text-lg leading-relaxed text-white/70">
            Drive better outcomes with a single HR platform that aligns people,
            payroll, and performance across every location, role, and business unit.
          </p>
        </div>
      </div>
    </section>
  );
}
