export default function TermsCookiePolicyPage() {
  return (
    <main className="min-h-screen bg-ct-paper text-ink">
      <section className="mx-auto max-w-6xl px-6 py-20 lg:px-10">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.28em] text-ct-blue">Terms & Cookie Policy</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">Terms of use and cookie policy</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-700">
            This page describes the terms for using the platform and the way cookies are used on our website.
            It applies to all visitors and customers of Chris Tech HRMS.
          </p>
        </div>

        <div className="space-y-8 rounded-[32px] border border-slate-200 bg-white p-10 shadow-soft">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Terms of service</h2>
            <p className="text-slate-700 leading-relaxed">
              Use of the Chris Tech HRMS website and platform is subject to our terms. Access is granted for
              authorised users only, and account holders are responsible for maintaining secure credentials.
            </p>
          </section>
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Acceptable use</h2>
            <p className="text-slate-700 leading-relaxed">
              Users must not abuse the service, attempt to access other customers&apos; data, or distribute harmful content.
              Violations may result in suspension or termination of access.
            </p>
          </section>
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Cookie policy</h2>
            <p className="text-slate-700 leading-relaxed">
              We use essential cookies to enable login and session management. No tracking cookies are used
              for advertising on the HRMS dashboard. Any analytics cookies will only be used with consent.
            </p>
          </section>
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Contact</h2>
            <p className="text-slate-700 leading-relaxed">
              Questions about the terms or cookies should be directed to support@christech.co.ke.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
