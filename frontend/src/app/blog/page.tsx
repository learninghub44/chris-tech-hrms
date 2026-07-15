export default function BlogPage() {
  return (
    <main className="min-h-screen bg-ct-paper text-ink">
      <section className="mx-auto max-w-6xl px-6 py-20 lg:px-10">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.28em] text-ct-blue">Blog</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
            Insights on HR technology, productivity, and digital transformation.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-700">
            Explore articles and updates about people operations, SaaS adoption, and business growth with Chris Tech.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {[
            {
              title: "Why modern HR systems matter",
              summary: "How digital HR tools help teams move faster, reduce error, and improve employee experience."
            },
            {
              title: "Building secure multi-tenant apps",
              summary: "Practical approaches for keeping company data isolated while scaling to many customers."
            },
            {
              title: "Designing a better payroll workflow",
              summary: "Key elements of payroll automation that save time for HR and finance teams."
            }
          ].map((item) => (
            <article key={item.title} className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-soft">
              <h2 className="text-2xl font-semibold">{item.title}</h2>
              <p className="mt-4 text-slate-700 leading-relaxed">{item.summary}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
