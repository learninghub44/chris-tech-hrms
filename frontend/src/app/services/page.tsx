import { BackButton } from "@/components/back-button";

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-ct-paper text-ink">
      <section className="mx-auto max-w-6xl px-6 py-20 lg:px-10">
        <div className="mb-8">
          <BackButton />
        </div>

        <div className="mb-12">
          <p className="text-sm uppercase tracking-[0.28em] text-ct-blue">Services</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
            Transforming business technology with tailored digital services.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-700">
            We provide end-to-end services for web and mobile digital products, branding, and cloud deployments.
            Our goal is to help organisations move faster with smart systems and beautiful customer experiences.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {[
            {
              title: "Website development",
              description:
                "Build responsive, performance-focused websites that look polished on mobile and desktop."
            },
            {
              title: "SaaS product design",
              description:
                "Design user-centered workflows for complex business systems like HR, payroll, and recruitment."
            },
            {
              title: "Cloud deployment",
              description:
                "Deploy reliable production apps with containerized backend, database, and modern hosting."
            }
          ].map((item) => (
            <div key={item.title} className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-soft">
              <h2 className="text-2xl font-semibold">{item.title}</h2>
              <p className="mt-4 text-base leading-relaxed text-slate-700">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
