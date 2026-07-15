export default function DocumentationPage() {
  return (
    <main className="min-h-screen bg-ct-paper text-ink">
      <section className="mx-auto max-w-6xl px-6 py-20 lg:px-10">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.28em] text-ct-blue">Documentation</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
            Product guides, implementation notes, and developer resources.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-700">
            Learn how Chris Tech HRMS works, how to configure it, and how teams can start using the platform.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {[
            { title: "Getting started", description: "Begin with setup, deployment, and environment requirements." },
            { title: "User workflows", description: "How to manage employees, attendance, leave, payroll, and more." },
            { title: "Admin guide", description: "Company setup, roles, permissions, and tenant configuration." },
            { title: "Developer notes", description: "Workspace structure, migration strategy, and deployment guidance." }
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
