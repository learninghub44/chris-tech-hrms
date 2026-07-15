export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-ct-paper text-ink">
      <section className="mx-auto max-w-6xl px-6 py-20 lg:px-10">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.28em] text-ct-blue">Privacy Policy</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">Privacy and data protection</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-700">
            We respect user privacy and treat customer data with care. This policy describes what we collect,
            how we use it, and how we keep it safe.
          </p>
        </div>

        <div className="space-y-8 rounded-[32px] border border-slate-200 bg-white p-10 shadow-soft">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Information collection</h2>
            <p className="text-slate-700 leading-relaxed">
              We collect only the information required to deliver the HRMS platform: account details,
              employee records, attendance data, payroll information, and support requests.
            </p>
          </section>
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">How data is used</h2>
            <p className="text-slate-700 leading-relaxed">
              Data is used to run the platform, generate reports, manage access, and provide support.
              We do not sell or share customer data with third parties except where necessary to operate the service.
            </p>
          </section>
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Security</h2>
            <p className="text-slate-700 leading-relaxed">
              We protect data using encryption, secure access controls, and industry-standard infrastructure.
              Your company data is isolated from other customers and access is limited to authorized users only.
            </p>
          </section>
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Contact</h2>
            <p className="text-slate-700 leading-relaxed">
              For questions about privacy, email support@christech.co.ke.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
