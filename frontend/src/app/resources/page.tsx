import Link from "next/link";
import { BackButton } from "@/components/back-button";

export default function ResourcesPage() {
  return (
    <main className="min-h-screen bg-ct-paper text-ink">
      <section className="mx-auto max-w-6xl px-6 py-20 lg:px-10">
        <div className="mb-8">
          <BackButton />
        </div>

        <div className="mb-12 space-y-4">
          <p className="text-sm uppercase tracking-[0.28em] text-ct-blue">Resources</p>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
            Guides, support articles, and product resources.
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-slate-700">
            Access everything you need to understand Chris Tech HRMS, from implementation details to business workflows.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {[
            {
              title: "Documentation",
              description: "Technical setup, API references, and product architecture.",
              href: "/documentation"
            },
            {
              title: "Help Center",
              description: "Customer support guides, FAQs, and troubleshooting articles.",
              href: "/help-center"
            },
            {
              title: "Legal",
              description: "Privacy, terms, and cookie guidance for users and visitors.",
              href: "/terms-cookie-policy"
            }
          ].map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group rounded-[32px] border border-slate-200 bg-white p-8 shadow-soft transition hover:-translate-y-1 hover:border-ct-blue/30"
            >
              <h2 className="text-2xl font-semibold transition group-hover:text-ct-blue">{item.title}</h2>
              <p className="mt-4 text-slate-700 leading-relaxed">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
