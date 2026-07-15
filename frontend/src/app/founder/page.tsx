import Link from "next/link";

const buildAreas = [
  {
    title: "HR & workforce platforms",
    description:
      "Chris Tech HRMS itself — attendance, leave, payroll, recruitment, and performance management built around how African employers actually run multi-branch teams."
  },
  {
    title: "Fintech & trading tools",
    description:
      "Analytics terminals and automated trading tools for retail traders, with real broker connectivity, risk controls, and live market data."
  },
  {
    title: "Marketplaces & e-commerce",
    description:
      "Multi-vendor marketplaces and listing platforms with M-Pesa-first checkout, search, and seller tooling designed for Kenyan buyers and sellers."
  },
  {
    title: "Property & real estate",
    description:
      "Rental and property discovery platforms connecting agents, landlords, and tenants with verification and appointment scheduling built in."
  },
  {
    title: "Community & wellness",
    description:
      "Platforms supporting mental wellness and community organizing, built with the same rigor as commercial products because the mission matters."
  },
  {
    title: "AI-powered products",
    description:
      "Applied AI tools — from career and document assistants to multi-model chat platforms — that put emerging AI capability into the hands of everyday users."
  }
];

const principles = [
  {
    title: "Build for the market you're actually in",
    description:
      "Software made for Silicon Valley doesn't automatically work for Nairobi. Pricing in KES, defaulting to M-Pesa, and designing for patchy connectivity aren't afterthoughts here — they're the starting point."
  },
  {
    title: "Ship, then refine",
    description:
      "A product in front of real users teaches you more in a week than a roadmap teaches you in a month. Chris favors working software over polished plans, and iterates in public with paying customers."
  },
  {
    title: "Own the whole stack",
    description:
      "From database schema to deployment pipeline to the pixel on screen, understanding every layer of a product means fewer surprises in production and faster fixes when something breaks."
  },
  {
    title: "Security and data isolation aren't optional",
    description:
      "Multi-tenant systems that handle payroll, personal data, or trading accounts are held to a high bar: proper access control, encrypted data, and clear boundaries between customers, from day one."
  }
];

export default function FounderPage() {
  return (
    <main className="min-h-screen bg-ct-paper text-ink">
      {/* Hero */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-10">
          <p className="text-sm uppercase tracking-[0.28em] text-ct-blue">Founder</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
            Chris Odhiambo
          </h1>
          <p className="mt-3 text-lg text-slate-500">
            Founder &amp; Builder, Chris Tech / Zetu Business Solutions — Nairobi, Kenya
          </p>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-700">
            Chris is an independent software builder based in Nairobi who designs, ships, and
            operates full-stack products for the Kenyan and East African market — HR systems,
            fintech tools, marketplaces, and AI-powered platforms — end to end, from database
            schema to production deployment.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-6xl px-6 py-20 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div className="space-y-10">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">The short version</h2>
              <p className="text-base leading-relaxed text-slate-700">
                Chris Tech HRMS grew out of a simple observation: most HR software either ignores
                the East African market entirely, or bolts on a currency switcher and calls it
                &ldquo;localized.&rdquo; Payroll, leave, attendance, and recruitment all look different when
                your workforce spans multiple branches, your payments run through M-Pesa, and your
                compliance requirements are Kenyan, not American. Chris Tech HRMS was built from
                that reality outward, rather than adapted into it as an afterthought.
              </p>
              <p className="text-base leading-relaxed text-slate-700">
                That same starting point — build for the market you&apos;re actually serving — runs
                through everything Chris builds under the Chris Tech and Zetu Business Solutions
                banner, not just this HRMS.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">How Chris works</h2>
              <p className="text-base leading-relaxed text-slate-700">
                Chris operates as a full-stack, independent builder — designing the data model,
                writing the backend, building the interface, and handling deployment and
                infrastructure for each product personally. That end-to-end ownership is
                deliberate: it means fewer handoffs, faster fixes, and a product shaped by a
                single, consistent point of view rather than compromise between teams.
              </p>
              <p className="text-base leading-relaxed text-slate-700">
                The typical toolkit spans modern web frameworks (Next.js, SvelteKit, Django),
                mobile development with Flutter and Expo, and Postgres-backed infrastructure via
                Supabase, Neon, and Railway — with Cloudflare and Render handling delivery. The
                specific stack shifts from project to project, chosen for what the product needs
                rather than habit.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">What &ldquo;built for East Africa&rdquo; actually means</h2>
              <p className="text-base leading-relaxed text-slate-700">
                In practice, that phrase translates into concrete product decisions: pricing
                denominated in Kenyan shillings rather than converted from dollars, M-Pesa and
                Paystack as first-class payment options rather than an integration bolted on
                later, interfaces that hold up on inconsistent mobile connections, and workflows
                that match how Kenyan businesses — from single-branch startups to multi-company
                groups — are actually structured and regulated.
              </p>
              <p className="text-base leading-relaxed text-slate-700">
                It also means being honest in product copy and pricing pages — no inflated
                testimonials, no invented social proof, no dark patterns. Trust compounds slowly
                in this market and is lost quickly; Chris treats it accordingly.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Looking ahead</h2>
              <p className="text-base leading-relaxed text-slate-700">
                Chris Tech HRMS continues to expand its multi-tenant capabilities — deeper
                reporting, more granular role-based access, and tighter integrations with the
                payroll and compliance tools Kenyan businesses already rely on. The broader goal
                is the same one that started it: give East African businesses software that fits
                how they actually operate, rather than software they have to bend themselves
                around.
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
              <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Based in</p>
              <p className="mt-2 text-lg font-semibold">Nairobi, Kenya</p>
              <p className="mt-4 text-sm uppercase tracking-[0.18em] text-slate-500">Focus market</p>
              <p className="mt-2 text-lg font-semibold">Kenya &amp; East Africa</p>
              <p className="mt-4 text-sm uppercase tracking-[0.18em] text-slate-500">Discipline</p>
              <p className="mt-2 text-lg font-semibold">Full-stack product engineering</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-950/95 p-6 text-white shadow-soft">
              <p className="text-sm uppercase tracking-[0.18em] text-slate-400">Get in touch</p>
              <p className="mt-3 text-base leading-relaxed text-slate-200">
                For partnership, press, or product inquiries related to Chris Tech HRMS or other
                Chris Tech products, reach out directly.
              </p>
              <div className="mt-5 space-y-2 text-sm">
                <a href="mailto:support@christech.co.ke" className="block text-ct-ice hover:underline">
                  support@christech.co.ke
                </a>
                <a
                  href="https://www.christech.co.ke"
                  target="_blank"
                  rel="noreferrer"
                  className="block text-slate-300 hover:text-white"
                >
                  www.christech.co.ke
                </a>
              </div>
              <Link
                href="/contact"
                className="mt-6 inline-flex rounded-full bg-ct-blue px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ct-blueDeep"
              >
                Contact the team
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* What Chris builds */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:px-10">
          <p className="text-sm uppercase tracking-[0.28em] text-ct-blue">Track record</p>
          <h2 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl">
            Products built across the Chris Tech portfolio
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-700">
            Chris Tech HRMS is one product in a wider body of work spanning several categories,
            all built with the same full-stack, market-first approach.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {buildAreas.map((area) => (
              <div key={area.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-lg font-semibold">{area.title}</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-700">{area.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="mx-auto max-w-6xl px-6 py-20 lg:px-10">
        <p className="text-sm uppercase tracking-[0.28em] text-ct-blue">How Chris builds</p>
        <h2 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl">
          Operating principles behind every product
        </h2>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {principles.map((principle, index) => (
            <div key={principle.title} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-soft">
              <p className="text-sm font-mono uppercase tracking-[0.22em] text-ct-ice">
                {String(index + 1).padStart(2, "0")}
              </p>
              <p className="mt-3 text-xl font-semibold">{principle.title}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">{principle.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-200 bg-ct-graphite text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-16 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div>
            <h2 className="text-2xl font-semibold sm:text-3xl">
              Want to see what Chris Tech HRMS can do for your team?
            </h2>
            <p className="mt-3 max-w-xl text-slate-300">
              Reach out for a walkthrough, or read more about the platform and the company behind
              it.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="mailto:support@christech.co.ke?subject=Request%20a%20demo"
              className="rounded-full bg-ct-blue px-6 py-3 text-sm font-semibold text-white transition hover:bg-ct-blueDeep"
            >
              Request a demo
            </a>
            <Link
              href="/about"
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-ct-ice/60 hover:text-ct-ice"
            >
              About Chris Tech HRMS
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
