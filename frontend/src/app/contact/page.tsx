export default function ContactPage() {
  return (
    <main className="min-h-screen bg-ct-paper text-ink">
      <section className="mx-auto max-w-6xl px-6 py-20 lg:px-10">
        <div className="mb-12 space-y-4">
          <p className="text-sm uppercase tracking-[0.28em] text-ct-blue">Contact</p>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            Talk to the Chris Tech HRMS team.
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-slate-700">
            Get in touch for product demos, pricing, partnerships, and support for your HR initiatives.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-[32px] border border-slate-200 bg-white p-10 shadow-soft">
            <h2 className="text-2xl font-semibold">Contact details</h2>
            <div className="mt-8 space-y-5 text-slate-700">
              <p>
                <strong>Email:</strong> support@christech.co.ke
              </p>
              <p>
                <strong>Phone:</strong> +254 701 059192
              </p>
              <p>
                <strong>Website:</strong> https://www.christech.co.ke
              </p>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-10 shadow-soft">
            <h2 className="text-2xl font-semibold">Request a demo</h2>
            <p className="mt-4 text-slate-700 leading-relaxed">
              Tell us about your business and we’ll respond with the best onboarding path, pricing, and timeline.
            </p>
            <a
              href="mailto:support@christech.co.ke?subject=Chris%20Tech%20HRMS%20demo"
              className="mt-8 inline-flex rounded-full bg-ct-blue px-6 py-3 text-sm font-semibold text-white transition hover:bg-ct-blueDeep"
            >
              Email support
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
