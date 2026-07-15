import Link from "next/link";
import { BackButton } from "@/components/back-button";

const sections = [
  { id: "overview", label: "1. Platform overview" },
  { id: "getting-started", label: "2. Getting started" },
  { id: "core-modules", label: "3. Core HR modules" },
  { id: "recruitment", label: "4. Recruitment & hiring" },
  { id: "performance", label: "5. Performance & growth" },
  { id: "admin-tenancy", label: "6. Admin, roles & multi-tenancy" },
  { id: "security", label: "7. Security & data protection" },
  { id: "integrations", label: "8. Integrations & payments" },
  { id: "developer-notes", label: "9. Developer & deployment notes" },
  { id: "support", label: "10. Getting help" }
];

const coreModules = [
  {
    title: "Employees",
    description:
      "A single source of truth for employee profiles, contracts, departments, and designations across every branch or company in the tenant."
  },
  {
    title: "Attendance",
    description:
      "Daily clock-in/clock-out records, shift assignment, and attendance reporting for individuals and whole departments."
  },
  {
    title: "Leave & holidays",
    description:
      "Configurable leave types and balances, approval workflows, and a shared company holiday calendar."
  },
  {
    title: "Payroll & salaries",
    description:
      "Salary structures, payroll runs, and payslip records that stay consistent with attendance and leave data."
  },
  {
    title: "Announcements & feedback",
    description:
      "Company-wide announcements and a structured feedback channel between employees and HR."
  },
  {
    title: "Reports",
    description:
      "Cross-module reporting for headcount, attendance trends, leave usage, and payroll summaries."
  }
];

const recruitmentModules = [
  {
    title: "Jobs",
    description: "Create and publish open roles, track status from draft to closed."
  },
  {
    title: "Candidates",
    description: "Centralised candidate records linked to the jobs they've applied for."
  },
  {
    title: "Interviews",
    description: "Schedule interview rounds, capture feedback, and move candidates through stages."
  },
  {
    title: "Offers",
    description: "Generate and track offer letters through acceptance or decline."
  }
];

const performanceModules = [
  {
    title: "Goals",
    description: "Set individual and team goals tied to review periods."
  },
  {
    title: "Appraisals",
    description: "Structured appraisal cycles with manager and self-assessment input."
  },
  {
    title: "Performance reviews",
    description: "Consolidated review history feeding into promotion and compensation decisions."
  }
];

export default function DocumentationPage() {
  return (
    <main className="min-h-screen bg-ct-paper text-ink">
      <section className="mx-auto max-w-6xl px-6 py-20 lg:px-10">
        <div className="mb-8">
          <BackButton />
        </div>

        <div className="mb-12 space-y-4">
          <p className="text-sm uppercase tracking-[0.28em] text-ct-blue">Documentation</p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
            Everything you need to configure, run, and extend Chris Tech HRMS.
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-slate-700">
            This page is the starting point for admins, HR teams, and developers working with the
            platform — from first login to multi-tenant configuration and deployment.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.32fr_0.68fr] lg:items-start">
          <nav className="sticky top-10 hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft lg:block">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
              On this page
            </p>
            <ul className="space-y-3 text-sm">
              {sections.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="text-slate-600 transition hover:text-ct-blue">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-14">
            <div id="overview" className="scroll-mt-24 rounded-[32px] border border-slate-200 bg-white p-8 shadow-soft">
              <h2 className="text-2xl font-semibold">1. Platform overview</h2>
              <p className="mt-4 leading-relaxed text-slate-700">
                Chris Tech HRMS is a multi-tenant people management platform. Each company (tenant)
                gets its own isolated employee data, roles, and configuration, while running on the
                same shared application. The platform covers the full employee lifecycle: hiring,
                onboarding, attendance and leave, payroll, performance, and offboarding.
              </p>
              <p className="mt-4 leading-relaxed text-slate-700">
                The app is split into two parts you&apos;ll see referenced throughout these docs: a
                backend API (authentication, business logic, and data) and a frontend web app (the
                dashboard your team logs into every day).
              </p>
            </div>

            <div id="getting-started" className="scroll-mt-24 rounded-[32px] border border-slate-200 bg-white p-8 shadow-soft">
              <h2 className="text-2xl font-semibold">2. Getting started</h2>
              <ol className="mt-4 space-y-4 text-slate-700">
                <li>
                  <strong>1. Create your company account.</strong> Register the company, add the
                  first admin user, and confirm the company profile (name, branches, currency).
                </li>
                <li>
                  <strong>2. Set up structure.</strong> Add departments and designations before
                  importing employees, so every profile can be assigned correctly from day one.
                </li>
                <li>
                  <strong>3. Add employees.</strong> Create employee profiles individually or in
                  bulk, and assign shifts, leave types, and reporting managers.
                </li>
                <li>
                  <strong>4. Invite your team.</strong> Assign roles so managers, HR staff, and
                  employees each see the right dashboard and permissions.
                </li>
                <li>
                  <strong>5. Turn on the modules you need.</strong> Attendance and leave first,
                  then payroll, recruitment, and performance as your team is ready for them.
                </li>
              </ol>
            </div>

            <div id="core-modules" className="scroll-mt-24 rounded-[32px] border border-slate-200 bg-white p-8 shadow-soft">
              <h2 className="text-2xl font-semibold">3. Core HR modules</h2>
              <p className="mt-4 leading-relaxed text-slate-700">
                These are the day-to-day modules most companies use from the start.
              </p>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {coreModules.map((item) => (
                  <div key={item.title} className="rounded-[20px] border border-slate-100 bg-ct-paper/60 p-5">
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div id="recruitment" className="scroll-mt-24 rounded-[32px] border border-slate-200 bg-white p-8 shadow-soft">
              <h2 className="text-2xl font-semibold">4. Recruitment &amp; hiring</h2>
              <p className="mt-4 leading-relaxed text-slate-700">
                Recruitment modules connect directly to employee records, so an accepted offer can
                become a full employee profile without re-entering data.
              </p>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {recruitmentModules.map((item) => (
                  <div key={item.title} className="rounded-[20px] border border-slate-100 bg-ct-paper/60 p-5">
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div id="performance" className="scroll-mt-24 rounded-[32px] border border-slate-200 bg-white p-8 shadow-soft">
              <h2 className="text-2xl font-semibold">5. Performance &amp; growth</h2>
              <p className="mt-4 leading-relaxed text-slate-700">
                Performance tools help managers run consistent review cycles instead of one-off
                spreadsheets.
              </p>
              <div className="mt-6 grid gap-5 sm:grid-cols-3">
                {performanceModules.map((item) => (
                  <div key={item.title} className="rounded-[20px] border border-slate-100 bg-ct-paper/60 p-5">
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div id="admin-tenancy" className="scroll-mt-24 rounded-[32px] border border-slate-200 bg-white p-8 shadow-soft">
              <h2 className="text-2xl font-semibold">6. Admin, roles &amp; multi-tenancy</h2>
              <p className="mt-4 leading-relaxed text-slate-700">
                Each company operates as its own isolated tenant. Admins manage company-level
                settings, branches, and subscription/billing, while role-based access control
                decides what each user type — admin, HR, manager, or employee — can see and do.
              </p>
              <p className="mt-4 leading-relaxed text-slate-700">
                Notifications keep managers and employees aware of approvals, announcements, and
                requests that need their attention, without needing to check every module manually.
              </p>
            </div>

            <div id="security" className="scroll-mt-24 rounded-[32px] border border-slate-200 bg-white p-8 shadow-soft">
              <h2 className="text-2xl font-semibold">7. Security &amp; data protection</h2>
              <p className="mt-4 leading-relaxed text-slate-700">
                Employee and company data is isolated per tenant, access is controlled by role, and
                authentication uses standard secure session handling. For full detail on what data
                is collected and how it&apos;s handled, see our{" "}
                <Link href="/privacy-policy" className="text-ct-blue underline underline-offset-4">
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link href="/terms-cookie-policy" className="text-ct-blue underline underline-offset-4">
                  Terms &amp; Cookie Policy
                </Link>
                .
              </p>
            </div>

            <div id="integrations" className="scroll-mt-24 rounded-[32px] border border-slate-200 bg-white p-8 shadow-soft">
              <h2 className="text-2xl font-semibold">8. Integrations &amp; payments</h2>
              <p className="mt-4 leading-relaxed text-slate-700">
                Chris Tech HRMS is built with the Kenyan market in mind, including support for
                local payment workflows for subscription billing. Additional integrations are added
                based on customer needs — talk to us on the{" "}
                <Link href="/contact" className="text-ct-blue underline underline-offset-4">
                  Contact
                </Link>{" "}
                page about a specific integration.
              </p>
            </div>

            <div id="developer-notes" className="scroll-mt-24 rounded-[32px] border border-slate-200 bg-white p-8 shadow-soft">
              <h2 className="text-2xl font-semibold">9. Developer &amp; deployment notes</h2>
              <p className="mt-4 leading-relaxed text-slate-700">
                The platform is split into a Next.js frontend and a Node/Express-style backend with
                a relational database. Environment configuration, migrations, and seed data are
                managed through the backend workspace, and the frontend is deployed independently.
                See the project&apos;s README and roadmap docs in the repository for exact setup
                commands and environment variables.
              </p>
            </div>

            <div id="support" className="scroll-mt-24 rounded-[32px] border border-slate-200 bg-white p-8 shadow-soft">
              <h2 className="text-2xl font-semibold">10. Getting help</h2>
              <p className="mt-4 leading-relaxed text-slate-700">
                For troubleshooting and FAQs, visit the{" "}
                <Link href="/help-center" className="text-ct-blue underline underline-offset-4">
                  Help Center
                </Link>
                . For anything not covered here — custom setup, onboarding support, or feature
                questions — reach out directly through the{" "}
                <Link href="/contact" className="text-ct-blue underline underline-offset-4">
                  Contact
                </Link>{" "}
                page.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
