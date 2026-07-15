export default function PortfolioPage() {
  return (
    <main className="min-h-screen bg-ct-paper text-ink">
      <section className="mx-auto max-w-6xl px-6 py-20 lg:px-10">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.28em] text-ct-blue">Portfolio</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
            Recent HR systems, digital products, and company platforms.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-700">
            Explore client work and product examples from website development, HR software, and cloud-native applications.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {[
            { title: "Enterprise HR platform", description: "A full-stack HRMS with attendance, payroll, and performance." },
            { title: "Web application design", description: "Responsive portal experiences built for speed and clarity." },
            { title: "Cloud deployment", description: "Secure production deployment with database, API, and app delivery." }
          ].map((item) => (
            <article key={item.title} className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-soft">
              <h2 className="text-2xl font-semibold">{item.title}</h2>
              <p className="mt-4 text-slate-700 leading-relaxed">{item.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
