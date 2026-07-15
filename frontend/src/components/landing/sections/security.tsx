export function Security() {
  return (
    <section id="security" className="bg-ct-paper py-24">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-ct-blue/60" />
            <span className="font-mono text-xs uppercase tracking-[0.32em] text-ct-blue">
              Security
            </span>
            <span className="h-px w-10 bg-ct-blue/60" />
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
      </div>
    </section>
  );
}
