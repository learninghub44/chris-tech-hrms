import Link from "next/link";
import { BackButton } from "@/components/back-button";

const projects = [
  {
    title: "Chris Tech HRMS",
    category: "HR & workforce platforms",
    description:
      "A multi-tenant HR system covering employees, attendance, leave, payroll, recruitment, and performance — the platform this site documents.",
    highlights: ["Multi-tenant architecture", "Role-based access control", "Payroll & attendance"]
  },
  {
    title: "School management platform",
    category: "HR & workforce platforms",
    description:
      "A multi-tenant SaaS built for schools running the CBC curriculum, with dashboards for teachers, parents, and administrators.",
    highlights: ["Multi-tenant SaaS", "Parent & guardian portal", "Role-scoped dashboards"]
  },
  {
    title: "Point-of-sale platform",
    category: "Marketplaces & e-commerce",
    description:
      "A multi-tenant POS system with tenant branding, billing, and hardened authentication for retail businesses.",
    highlights: ["Tenant branding", "Billing workflows", "Security hardening"]
  },
  {
    title: "Rental & property platform",
    category: "Property & real estate",
    description:
      "A property listing and rental management platform connecting landlords and tenants, backed by a real Postgres database.",
    highlights: ["Property listings", "Admin CRUD tooling", "Postgres-backed backend"]
  },
  {
    title: "Trading analytics tools",
    category: "Fintech & trading tools",
    description:
      "Real-time market analysis tools for retail traders, including live visualizations built on streaming market data.",
    highlights: ["Live WebSocket data", "Custom visual dashboards", "Automated trading logic"]
  },
  {
    title: "Job board aggregator",
    category: "Marketplaces & e-commerce",
    description:
      "A job board pulling listings from more than a dozen external sources into one searchable, admin-managed platform.",
    highlights: ["Multi-source aggregation", "Admin & CRUD tooling", "Ad monetisation"]
  },
  {
    title: "Community & wellness platform",
    category: "Community & wellness",
    description:
      "A membership and community platform with a full brand-driven design system built for mental wellness and community organizing.",
    highlights: ["Custom design system", "Membership tooling", "Brand-first UI"]
  },
  {
    title: "Digital credit book app",
    category: "Fintech & trading tools",
    description:
      "A mobile app that replaces the paper credit book many small business owners use to track customer debts and payments.",
    highlights: ["Mobile-first (Expo)", "Offline-friendly design", "Small business focus"]
  },
  {
    title: "Local business & storefront sites",
    category: "Marketplaces & e-commerce",
    description:
      "Fast, mobile-responsive storefronts for local businesses, with live search, carts, and direct WhatsApp ordering.",
    highlights: ["Mobile responsive", "Cart & checkout UX", "WhatsApp integration"]
  }
];

const capabilities = [
  {
    title: "Full-stack product delivery",
    description: "From database schema to deployed frontend, each product is built and shipped end to end."
  },
  {
    title: "Kenyan-market defaults",
    description: "KES pricing, M-Pesa-first payments, and designs that hold up on patchy connectivity."
  },
  {
    title: "Multi-tenant SaaS architecture",
    description: "Isolated tenant data, scoped roles, and subscription billing built in from the start."
  },
  {
    title: "Cloud-native deployment",
    description: "Production apps deployed on modern hosting with proper environment and secrets management."
  }
];

export default function PortfolioPage() {
  return (
    <main className="min-h-screen bg-ct-paper text-ink">
      <section className="mx-auto max-w-6xl px-6 py-20 lg:px-10">
        <div className="mb-8">
          <BackButton />
        </div>

        <div className="mb-12 space-y-4">
          <p className="text-sm uppercase tracking-[0.28em] text-ct-blue">Portfolio</p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
            Recent HR systems, digital products, and company platforms.
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-slate-700">
            A selection of full-stack products built for the Kenyan and East African market — HR
            software, fintech tools, marketplaces, and community platforms. Read more about how
            these are built on the{" "}
            <Link href="/founder" className="text-ct-blue underline underline-offset-4">
              Founder
            </Link>{" "}
            page.
          </p>
        </div>

        <div className="mb-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map((item) => (
            <div key={item.title} className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-soft">
              <h2 className="font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {projects.map((project) => (
            <article key={project.title} className="flex flex-col rounded-[32px] border border-slate-200 bg-white p-8 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-ct-blue">
                {project.category}
              </p>
              <h2 className="mt-3 text-2xl font-semibold leading-snug">{project.title}</h2>
              <p className="mt-4 flex-1 leading-relaxed text-slate-700">{project.description}</p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {project.highlights.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full bg-ct-paper px-3 py-1 text-xs font-medium text-slate-600"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-soft">
          <h2 className="text-xl font-semibold">Have a product in mind?</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-700">
            Whether it&apos;s an HR system, a marketplace, or something entirely new, we build it
            end to end — from database to deployment.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex rounded-full bg-ct-blue px-6 py-3 text-sm font-semibold text-white transition hover:bg-ct-blueDeep"
          >
            Start a conversation
          </Link>
        </div>
      </section>
    </main>
  );
}
