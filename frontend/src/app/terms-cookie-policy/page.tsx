import Link from "next/link";
import { BackButton } from "@/components/back-button";

const sections = [
  { id: "acceptance", label: "1. Acceptance of these terms" },
  { id: "the-service", label: "2. Description of the Service" },
  { id: "eligibility", label: "3. Eligibility and account registration" },
  { id: "subscriptions", label: "4. Subscriptions, fees, and payment" },
  { id: "acceptable-use", label: "5. Acceptable use policy" },
  { id: "customer-data", label: "6. Customer data and ownership" },
  { id: "intellectual-property", label: "7. Intellectual property" },
  { id: "availability", label: "8. Service availability and support" },
  { id: "termination", label: "9. Suspension and termination" },
  { id: "warranties", label: "10. Disclaimers and warranties" },
  { id: "liability", label: "11. Limitation of liability" },
  { id: "indemnification", label: "12. Indemnification" },
  { id: "governing-law", label: "13. Governing law and disputes" },
  { id: "cookie-policy", label: "14. Cookie policy" },
  { id: "changes", label: "15. Changes to these terms" },
  { id: "contact", label: "16. Contact us" }
];

const cookieTable = [
  {
    category: "Strictly necessary cookies",
    purpose:
      "Required to log in, maintain your session, and keep the platform secure. These cannot be switched off, as the Service will not function correctly without them.",
    examples: "Session tokens, authentication cookies, CSRF protection tokens"
  },
  {
    category: "Preference cookies",
    purpose:
      "Remember settings such as your selected theme, language, or the last company/branch you were viewing, so you don't have to reset them on every visit.",
    examples: "Theme preference, last-viewed dashboard filters"
  },
  {
    category: "Analytics cookies",
    purpose:
      "Help us understand, in aggregate, how visitors use our marketing website so we can improve navigation and content. Used only with consent where required by law.",
    examples: "Page view counts, aggregated navigation paths"
  },
  {
    category: "Third-party cookies",
    purpose:
      "Set by payment processors or embedded services (for example, during checkout) to complete their function securely.",
    examples: "Payment processor session cookies during checkout"
  }
];

export default function TermsCookiePolicyPage() {
  return (
    <main className="min-h-screen bg-ct-paper text-ink">
      <section className="mx-auto max-w-6xl px-6 py-20 lg:px-10">
        <div className="mb-8">
          <BackButton />
        </div>

        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.28em] text-ct-blue">Terms &amp; Cookie Policy</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
            Terms of use and cookie policy
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-700">
            These Terms of Use (&ldquo;Terms&rdquo;) govern access to and use of the Chris Tech HRMS website
            and platform (the &ldquo;Service&rdquo;), operated by Chris Tech / Zetu Business Solutions
            (&ldquo;Chris Tech,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). They apply to all visitors, registered users,
            and organizations (&ldquo;Customers&rdquo;) that subscribe to the Service. By accessing or using
            the Service, you agree to be bound by these Terms.
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-500">
            Last updated: 15 July 2026. This document is intentionally detailed so you know
            exactly what you&apos;re agreeing to. It is provided for transparency and does not
            constitute legal advice; organizations with specific compliance needs should have
            their own counsel review any agreement before relying on it.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.85fr_2fr] lg:items-start">
          <nav className="sticky top-8 hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-soft lg:block">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              On this page
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-slate-600 transition hover:text-ct-blue">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-10 rounded-[32px] border border-slate-200 bg-white p-10 shadow-soft">
            <section id="acceptance" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-semibold">1. Acceptance of these terms</h2>
              <p className="leading-relaxed text-slate-700">
                By creating an account, subscribing to the Service, or otherwise accessing the
                Chris Tech HRMS website or platform, you confirm that you have read, understood,
                and agree to these Terms, and to our{" "}
                <Link href="/privacy-policy" className="text-ct-blue hover:underline">
                  Privacy Policy
                </Link>
                . If you are accepting these Terms on behalf of a company or other organization,
                you confirm that you have the authority to bind that organization, and &ldquo;you&rdquo; in
                these Terms refers to that organization.
              </p>
            </section>

            <section id="the-service" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-semibold">2. Description of the Service</h2>
              <p className="leading-relaxed text-slate-700">
                Chris Tech HRMS is a multi-tenant human resource management platform providing
                tools for attendance tracking, leave management, payroll processing, recruitment,
                performance reviews, and related HR workflows, delivered via web and mobile
                applications. We may add, modify, or discontinue individual features over time as
                the platform evolves; we will make reasonable efforts to communicate material
                changes affecting Customers in advance.
              </p>
            </section>

            <section id="eligibility" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-semibold">3. Eligibility and account registration</h2>
              <p className="leading-relaxed text-slate-700">
                You must be at least 18 years old and legally capable of entering into a binding
                agreement to register for the Service. When you create an account, you agree to
                provide accurate and complete information and to keep it up to date. You are
                responsible for maintaining the confidentiality of your login credentials and for
                all activity that occurs under your account. Notify us immediately at{" "}
                <a href="mailto:support@christech.co.ke" className="text-ct-blue hover:underline">
                  support@christech.co.ke
                </a>{" "}
                if you suspect unauthorized access to your account.
              </p>
              <p className="leading-relaxed text-slate-700">
                Within a Customer&apos;s account, administrators are responsible for managing which
                employees have access, what roles they are assigned, and for deactivating access
                promptly when an employee leaves the organization.
              </p>
            </section>

            <section id="subscriptions" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-semibold">4. Subscriptions, fees, and payment</h2>
              <p className="leading-relaxed text-slate-700">
                Access to paid features of the Service requires an active subscription, billed at
                the rate and interval shown at the time of purchase, in Kenyan Shillings (KES)
                unless otherwise stated. Payment may be made via M-Pesa, Paystack, or other
                methods we support from time to time. Subscriptions renew automatically at the end
                of each billing period unless cancelled before the renewal date.
              </p>
              <p className="leading-relaxed text-slate-700">
                Fees are generally non-refundable except where required by law or expressly stated
                otherwise at the time of purchase. We may change subscription pricing going
                forward; where required, we will give reasonable advance notice before a price
                change applies to an existing subscription&apos;s renewal.
              </p>
              <p className="leading-relaxed text-slate-700">
                Failure to pay applicable fees may result in suspension or downgrade of access to
                paid features until payment is received, subject to the notice provisions
                described in Section 9.
              </p>
            </section>

            <section id="acceptable-use" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-semibold">5. Acceptable use policy</h2>
              <p className="leading-relaxed text-slate-700">You agree not to:</p>
              <ul className="list-disc space-y-2 pl-6 text-slate-700">
                <li>Access or attempt to access another Customer&apos;s data, account, or company workspace without authorization.</li>
                <li>Probe, scan, or attempt to breach the security or authentication mechanisms of the Service.</li>
                <li>Use the Service to store or transmit unlawful, defamatory, or harmful content, or content that infringes the rights of others.</li>
                <li>Reverse engineer, decompile, or attempt to extract the source code of the Service, except to the extent expressly permitted by law.</li>
                <li>Use automated means (bots, scrapers) to access the Service outside of any officially supported API.</li>
                <li>Resell, sublicense, or provide access to the Service to third parties without our prior written consent.</li>
                <li>Interfere with or disrupt the integrity or performance of the Service or the data it contains.</li>
              </ul>
              <p className="leading-relaxed text-slate-700">
                Violations of this policy may result in suspension or termination of access, as
                described in Section 9, and, where applicable, referral to law enforcement.
              </p>
            </section>

            <section id="customer-data" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-semibold">6. Customer data and ownership</h2>
              <p className="leading-relaxed text-slate-700">
                As between you and Chris Tech, you retain all ownership rights to the data you
                submit to the Service, including employee records, payroll data, and other company
                information (&ldquo;Customer Data&rdquo;). You grant Chris Tech a limited license to host,
                process, and display Customer Data solely to provide and support the Service, and
                for the other purposes described in our{" "}
                <Link href="/privacy-policy" className="text-ct-blue hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
              <p className="leading-relaxed text-slate-700">
                You are responsible for ensuring you have the necessary rights and, where
                required, employee consent, to submit personal data about your employees into the
                Service. On request, and subject to a reasonable notice period, we will provide
                Customers with a mechanism to export their Customer Data in a standard format,
                including during any notice period following termination of a subscription.
              </p>
            </section>

            <section id="intellectual-property" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-semibold">7. Intellectual property</h2>
              <p className="leading-relaxed text-slate-700">
                The Service, including its software, design, branding, and underlying technology,
                is owned by Chris Tech / Zetu Business Solutions and is protected by applicable
                intellectual property laws. These Terms grant you a limited, non-exclusive,
                non-transferable right to access and use the Service for your internal business
                purposes during your subscription term. No other rights are granted, and nothing
                in these Terms transfers ownership of our intellectual property to you.
              </p>
            </section>

            <section id="availability" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-semibold">8. Service availability and support</h2>
              <p className="leading-relaxed text-slate-700">
                We work to keep the Service reliable and available, but we do not guarantee
                uninterrupted or error-free operation. Scheduled maintenance, third-party
                infrastructure issues, or unforeseen technical problems may occasionally affect
                availability. Where practical, we will provide advance notice of planned
                maintenance that may cause downtime.
              </p>
              <p className="leading-relaxed text-slate-700">
                Support is available via the channels listed on our{" "}
                <Link href="/contact" className="text-ct-blue hover:underline">
                  Contact
                </Link>{" "}
                and{" "}
                <Link href="/help-center" className="text-ct-blue hover:underline">
                  Help Center
                </Link>{" "}
                pages. Support response times may vary based on the nature and severity of the
                issue reported.
              </p>
            </section>

            <section id="termination" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-semibold">9. Suspension and termination</h2>
              <p className="leading-relaxed text-slate-700">
                You may cancel your subscription at any time; access to paid features will
                continue until the end of the current billing period unless otherwise stated. We
                may suspend or terminate your access to the Service, with notice where reasonably
                practicable, if you materially breach these Terms (including the Acceptable Use
                Policy in Section 5), fail to pay applicable fees, or if we reasonably believe
                continued access poses a security or legal risk to Chris Tech, other Customers, or
                third parties.
              </p>
              <p className="leading-relaxed text-slate-700">
                Upon termination, your right to access the Service ends. We will provide a
                reasonable window, communicated at the time of termination, during which you may
                export your Customer Data before it is deleted from our production systems in
                accordance with our data retention practices described in our{" "}
                <Link href="/privacy-policy" className="text-ct-blue hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </section>

            <section id="warranties" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-semibold">10. Disclaimers and warranties</h2>
              <p className="leading-relaxed text-slate-700">
                The Service is provided &ldquo;as is&rdquo; and &ldquo;as available.&rdquo; To the fullest extent
                permitted by applicable law, we disclaim all warranties, express or implied,
                including implied warranties of merchantability, fitness for a particular purpose,
                and non-infringement. We do not warrant that the Service will be uninterrupted,
                secure, or free of errors, or that any payroll, tax, or compliance calculations
                performed by the Service will be free of error in every circumstance; Customers
                remain responsible for reviewing and verifying outputs relevant to statutory
                compliance before relying on them.
              </p>
            </section>

            <section id="liability" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-semibold">11. Limitation of liability</h2>
              <p className="leading-relaxed text-slate-700">
                To the fullest extent permitted by applicable law, Chris Tech / Zetu Business
                Solutions will not be liable for any indirect, incidental, special, consequential,
                or punitive damages, or any loss of profits, revenue, data, or business
                opportunity, arising out of or relating to your use of the Service, even if
                advised of the possibility of such damages. Our total aggregate liability arising
                out of or relating to these Terms or the Service will not exceed the amount you
                paid us for the Service in the twelve (12) months preceding the event giving rise
                to the claim. Nothing in these Terms limits liability that cannot be limited or
                excluded under applicable law.
              </p>
            </section>

            <section id="indemnification" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-semibold">12. Indemnification</h2>
              <p className="leading-relaxed text-slate-700">
                You agree to indemnify and hold Chris Tech / Zetu Business Solutions harmless from
                any claims, damages, liabilities, and expenses (including reasonable legal fees)
                arising from your breach of these Terms, your misuse of the Service, or your
                violation of applicable law, including in connection with the Customer Data you
                submit to the Service.
              </p>
            </section>

            <section id="governing-law" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-semibold">13. Governing law and disputes</h2>
              <p className="leading-relaxed text-slate-700">
                These Terms are governed by the laws of the Republic of Kenya, without regard to
                conflict-of-law principles. Any dispute arising out of or relating to these Terms
                or the Service will first be addressed through good-faith negotiation between the
                parties; if unresolved, the dispute will be subject to the exclusive jurisdiction
                of the courts of Kenya, unless the parties agree in writing to an alternative
                dispute resolution mechanism such as arbitration or mediation.
              </p>
            </section>

            <section id="cookie-policy" className="scroll-mt-24 space-y-6">
              <h2 className="text-2xl font-semibold">14. Cookie policy</h2>
              <p className="leading-relaxed text-slate-700">
                Cookies are small text files placed on your device when you visit a website or use
                a web application. We use cookies and similar technologies (such as local storage)
                for the purposes described below. We do not use cookies to serve third-party
                advertising on the Chris Tech HRMS dashboard, and any analytics cookies on our
                marketing website are used only where permitted, with consent where required by
                law.
              </p>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-4 font-semibold text-slate-700">Category</th>
                      <th className="p-4 font-semibold text-slate-700">Purpose</th>
                      <th className="p-4 font-semibold text-slate-700">Examples</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cookieTable.map((row) => (
                      <tr key={row.category} className="border-t border-slate-200 align-top">
                        <td className="p-4 font-semibold text-slate-800">{row.category}</td>
                        <td className="p-4 text-slate-700">{row.purpose}</td>
                        <td className="p-4 text-slate-500">{row.examples}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Managing cookies</h3>
                <p className="leading-relaxed text-slate-700">
                  Most browsers let you view, manage, and delete cookies through their settings.
                  Because strictly necessary cookies are required for login and core platform
                  functionality, blocking them will prevent the Service from working correctly.
                  Where analytics or preference cookies require consent, we provide a way to
                  accept or decline them; you can change your choice at any time by clearing your
                  browser&apos;s cookies for our domain and revisiting the site.
                </p>
              </div>
            </section>

            <section id="changes" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-semibold">15. Changes to these terms</h2>
              <p className="leading-relaxed text-slate-700">
                We may update these Terms from time to time to reflect changes to the Service,
                our business, or applicable law. When we make material changes, we will update the
                &ldquo;Last updated&rdquo; date above and, where appropriate, notify Customers by email or
                through the platform in advance of the change taking effect. Continued use of the
                Service after a change takes effect constitutes acceptance of the updated Terms.
              </p>
            </section>

            <section id="contact" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-semibold">16. Contact us</h2>
              <p className="leading-relaxed text-slate-700">
                Questions about these Terms or the Cookie Policy should be directed to{" "}
                <a href="mailto:support@christech.co.ke" className="text-ct-blue hover:underline">
                  support@christech.co.ke
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
