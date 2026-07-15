export default function HelpCenterPage() {
  return (
    <main className="min-h-screen bg-ct-paper text-ink">
      <section className="mx-auto max-w-6xl px-6 py-20 lg:px-10">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.28em] text-ct-blue">Help Center</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
            Answers for customers and administrators.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-700">
            Find support articles, troubleshooting guides, and the fastest way to get help from our team.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {[
            { title: "Setup help", description: "Steps for installation, login, and onboarding." },
            { title: "Account support", description: "How to manage users, roles, and company settings." },
            { title: "Troubleshooting", description: "Resolve common issues quickly and efficiently." }
          ].map((item) => (
            <div key={item.title} className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-soft">
              <h2 className="text-xl font-semibold">{item.title}</h2>
              <p className="mt-4 text-slate-700">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
