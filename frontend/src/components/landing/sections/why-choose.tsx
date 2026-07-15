export function WhyChoose() {
  return (
    <section id="why" className="mx-auto max-w-3xl px-6 py-24 text-center">
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-3">
          <span className="h-px w-10 bg-ct-blue/60" />
          <span className="font-mono text-xs uppercase tracking-[0.32em] text-ct-blue">
            Why choose our HRMS
          </span>
          <span className="h-px w-10 bg-ct-blue/60" />
        </div>
        <h2 className="font-display mt-4 max-w-lg text-3xl font-medium tracking-[-0.02em] sm:text-4xl lg:text-5xl">
          Everything your HR team needs in one platform
        </h2>
        <p className="font-inter mt-5 max-w-md text-lg leading-relaxed text-ct-graphite/70">
          Eliminate manual processes and manage your entire workforce
          through one connected system designed for modern organizations.
        </p>
      </div>
    </section>
  );
}
