import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-ct-paper text-ink">
      <section className="mx-auto max-w-6xl px-6 py-20 lg:px-10">
        <div className="mb-12 space-y-6">
          <p className="text-sm uppercase tracking-[0.28em] text-ct-blue">About Chris Tech HRMS</p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
            Built to modernize HR operations for growing companies across East Africa.
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-slate-700">
            Chris Tech HRMS is a complete people management platform designed to unify employee
            data, streamline payroll, simplify leave and attendance, and power smarter HR decisions.
            It was created to help business leaders build a secure, scalable HR foundation without
            compromise.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div className="space-y-8 rounded-[32px] border border-slate-200 bg-white p-8 shadow-soft">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Our mission</h2>
              <p className="text-base leading-relaxed text-slate-700">
                We build HR software that helps businesses keep people first, not paperwork.
                Every feature is created to reduce manual work, improve team visibility, and make
                HR teams more confident in their operations.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">What we deliver</h2>
              <ul className="space-y-3 text-slate-700">
                <li>Employee profiles, attendance, leave, payroll, recruitment, and performance in one hub.</li>
                <li>Company-aware access control and secure role-based workflows.</li>
                <li>Ready-to-use dashboards and reports for people teams and executives.</li>
                <li>Documentation, help guides, and support channels to keep adoption fast.</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Founder</p>
              <p className="mt-3 text-2xl font-semibold">Chris Odhiambo</p>
              <p className="mt-2 text-base leading-relaxed text-slate-700">
                Chris is the founder of Chris Tech and the product visionary behind this HRMS.
                He combines African market insights with modern SaaS design to deliver software that
                works for real teams, not just ideal cases.
              </p>
              <Link
                href="/founder"
                className="mt-4 inline-flex text-sm font-semibold text-ct-blue hover:underline"
              >
                Read the founder&apos;s story →
              </Link>
            </div>
          </div>

          <aside className="space-y-8 rounded-[32px] border border-slate-200 bg-slate-950/90 p-8 text-white shadow-soft">
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Values we follow</h3>
              <p className="text-slate-200 leading-relaxed">
                We are committed to reliability, clarity, and local-first product design. Every
                release is guided by customer feedback and a practical view of how HR teams actually work.
              </p>
            </div>

            <div className="grid gap-4">
              {[
                { title: "Transparent pricing", description: "No hidden fees, clear product tiers." },
                { title: "Secure by default", description: "Company data isolation and strong access controls." },
                { title: "Local support", description: "Kenyan and East African support channels." }
              ].map((item) => (
                <div key={item.title} className="rounded-3xl bg-slate-900/95 p-5">
                  <p className="font-semibold">{item.title}</p>
                  <p className="mt-2 text-sm text-slate-300">{item.description}</p>
                </div>
              ))}
            </div>

            <Link
              href="/documentation"
              className="inline-flex rounded-full bg-ct-blue px-6 py-3 text-sm font-semibold text-white transition hover:bg-ct-blueDeep"
            >
              Read product documentation
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
