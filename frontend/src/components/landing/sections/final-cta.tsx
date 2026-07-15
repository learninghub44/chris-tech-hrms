export function FinalCTA() {
  return (
    <section id="get-started" className="relative overflow-hidden bg-ct-graphite py-28 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-ct-blue/25 blur-[150px]"
      />
      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <h2 className="font-display text-3xl font-bold tracking-[-0.02em] sm:text-4xl lg:text-5xl">
          Transform the way you manage your workforce
        </h2>
        <p className="font-inter mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/70">
          Replace manual HR processes with a modern platform that helps your
          organization improve efficiency, support employees, and make better
          workforce decisions.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href="mailto:support@christech.co.ke?subject=Request%20a%20demo"
            className="font-inter rounded-full bg-ct-blue px-8 py-3 text-base font-semibold text-white shadow-glow transition hover:bg-ct-blueDeep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Request a demo
          </a>
          <a
            href="mailto:support@christech.co.ke?subject=Talk%20to%20sales"
            className="font-inter rounded-full border border-white/20 px-8 py-3 text-base font-semibold text-white transition hover:border-ct-ice hover:text-ct-ice focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Contact sales
          </a>
        </div>
      </div>
    </section>
  );
}
