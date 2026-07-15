import { ShieldCheck } from "lucide-react";

export function Security() {
  return (
    <section id="security" className="bg-white py-24">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <div className="flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ct-blue/10">
            <ShieldCheck className="h-6 w-6 text-ct-blue" aria-hidden />
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-ct-blue">
            Security
          </p>
          <h2 className="font-display mt-3 max-w-lg text-3xl font-semibold tracking-tight text-ct-graphite sm:text-4xl">
            Enterprise-grade security
          </h2>
          <p className="font-inter mt-4 max-w-md text-lg leading-relaxed text-ink/60">
            Protect sensitive employee information with advanced security
            controls, role-based permissions, encrypted data, audit logs,
            and continuous monitoring designed to meet modern business
            requirements.
          </p>
        </div>
      </div>
    </section>
  );
}
