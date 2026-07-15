import { BackButton } from "@/components/back-button";

const categories = ["HR Technology", "Product", "Engineering", "Payroll & Compliance"];

const posts = [
  {
    title: "Why modern HR systems matter for growing African companies",
    category: "HR Technology",
    date: "June 2026",
    readTime: "6 min read",
    summary:
      "Spreadsheets and paper files stop scaling long before founders expect them to. Here's what changes for HR teams once employee data, attendance, and payroll live in one system."
  },
  {
    title: "Building secure multi-tenant apps: lessons from Chris Tech HRMS",
    category: "Engineering",
    date: "May 2026",
    readTime: "8 min read",
    summary:
      "Isolating company data, scoping every query by tenant, and designing role-based access from day one — practical patterns for keeping customers' data separate while running one shared codebase."
  },
  {
    title: "Designing a payroll workflow HR and finance actually trust",
    category: "Payroll & Compliance",
    date: "May 2026",
    readTime: "7 min read",
    summary:
      "Payroll only works when attendance, leave, and salary data agree with each other. A look at how payroll runs are structured to catch mismatches before payday, not after."
  },
  {
    title: "Rolling out an HRMS without disrupting your team",
    category: "Product",
    date: "April 2026",
    readTime: "5 min read",
    summary:
      "A practical order of operations for onboarding a company: structure first, employees second, then attendance and leave, with payroll and recruitment layered in once the basics are steady."
  },
  {
    title: "Role-based access control, explained for HR leaders",
    category: "HR Technology",
    date: "April 2026",
    readTime: "6 min read",
    summary:
      "Admin, HR, manager, and employee roles all need different views of the same data. Here's how permission boundaries are set so sensitive information — like salaries — stays visible only to the right people."
  },
  {
    title: "What changes when recruitment and HR data live in one place",
    category: "Product",
    date: "March 2026",
    readTime: "5 min read",
    summary:
      "Turning an accepted offer straight into an employee profile removes a whole category of re-entry errors. A walkthrough of how hiring and onboarding connect inside the platform."
  }
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-ct-paper text-ink">
      <section className="mx-auto max-w-6xl px-6 py-20 lg:px-10">
        <div className="mb-8">
          <BackButton />
        </div>

        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.28em] text-ct-blue">Blog</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
            Insights on HR technology, productivity, and digital transformation.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-700">
            Articles and updates about people operations, SaaS product decisions, and building
            software for the Kenyan and East African market.
          </p>
        </div>

        <div className="mb-10 flex flex-wrap gap-2">
          {categories.map((category) => (
            <span
              key={category}
              className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-600"
            >
              {category}
            </span>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {posts.map((post) => (
            <article
              key={post.title}
              className="flex flex-col rounded-[32px] border border-slate-200 bg-white p-8 shadow-soft"
            >
              <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.1em] text-ct-blue">
                <span>{post.category}</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-400">{post.date}</span>
              </div>
              <h2 className="mt-4 text-2xl font-semibold leading-snug">{post.title}</h2>
              <p className="mt-4 flex-1 leading-relaxed text-slate-700">{post.summary}</p>
              <p className="mt-6 text-sm text-slate-400">{post.readTime}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-soft">
          <h2 className="text-xl font-semibold">More articles are on the way</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-700">
            Have a topic you&apos;d like us to cover — payroll compliance, multi-branch attendance,
            or hiring workflows? Reach out through the Contact page and we&apos;ll write about it.
          </p>
        </div>
      </section>
    </main>
  );
}
