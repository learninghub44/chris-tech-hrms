import Link from "next/link";

const sections = [
  { id: "scope", label: "1. Scope of this policy" },
  { id: "who-we-are", label: "2. Who we are" },
  { id: "information-we-collect", label: "3. Information we collect" },
  { id: "how-we-collect", label: "4. How we collect information" },
  { id: "how-we-use", label: "5. How we use information" },
  { id: "legal-basis", label: "6. Legal basis for processing" },
  { id: "sharing", label: "7. Who we share data with" },
  { id: "payments", label: "8. Payments and M-Pesa data" },
  { id: "cookies", label: "9. Cookies and similar technologies" },
  { id: "retention", label: "10. Data retention" },
  { id: "security", label: "11. How we protect data" },
  { id: "international-transfers", label: "12. International data transfers" },
  { id: "your-rights", label: "13. Your rights under the Data Protection Act" },
  { id: "employer-data", label: "14. Employer, HR, and employee data" },
  { id: "children", label: "15. Children's privacy" },
  { id: "changes", label: "16. Changes to this policy" },
  { id: "contact", label: "17. Contact us" }
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-ct-paper text-ink">
      <section className="mx-auto max-w-6xl px-6 py-20 lg:px-10">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.28em] text-ct-blue">Privacy Policy</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
            Privacy and data protection
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-700">
            This Privacy Policy explains, in detail, what personal and company data Chris Tech
            HRMS (&ldquo;Chris Tech,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) collects, why we collect it, how it is used,
            who it may be shared with, and the rights you have over it. It applies to visitors of
            our marketing website, prospective customers, and organizations and individuals who
            use the Chris Tech HRMS platform (the &ldquo;Service&rdquo;).
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-500">
            Last updated: 15 July 2026. This policy is written to be read in full, and is
            organized by topic below so you can jump to what matters most to you. It is provided
            for transparency and does not constitute legal advice; if you need a policy tailored
            to specific regulatory obligations, consult a qualified professional.
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
            <section id="scope" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-semibold">1. Scope of this policy</h2>
              <p className="leading-relaxed text-slate-700">
                This policy covers data processed through our marketing website
                (christech.co.ke and related domains), the Chris Tech HRMS web application and
                mobile apps, and any support channels we operate (email, WhatsApp, phone). It
                applies whether you are a visitor browsing our website, a prospective customer
                requesting a demo, an administrator setting up a company account, or an employee
                whose data is entered into the platform by their employer.
              </p>
              <p className="leading-relaxed text-slate-700">
                Where a customer organization (&ldquo;Customer&rdquo;) uses Chris Tech HRMS to manage its own
                employees, that Customer is typically the data controller for its employees&apos;
                records, and Chris Tech acts as a data processor on the Customer&apos;s behalf. Section
                14 below explains this relationship in more detail.
              </p>
            </section>

            <section id="who-we-are" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-semibold">2. Who we are</h2>
              <p className="leading-relaxed text-slate-700">
                Chris Tech HRMS is operated by Chris Tech / Zetu Business Solutions, based in
                Nairobi, Kenya. For the purposes of applicable data protection law, including
                Kenya&apos;s Data Protection Act, 2019, we act as the data controller for account and
                billing information relating to our direct customers, and as a data processor for
                employee data that our customers enter into the platform.
              </p>
            </section>

            <section id="information-we-collect" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-semibold">3. Information we collect</h2>
              <p className="leading-relaxed text-slate-700">We collect the following categories of information:</p>
              <ul className="list-disc space-y-2 pl-6 text-slate-700">
                <li>
                  <span className="font-semibold">Account and contact information:</span> name,
                  work email, phone number, job title, and company name when you register,
                  request a demo, or contact support.
                </li>
                <li>
                  <span className="font-semibold">Company and workforce data:</span> information
                  entered by Customers into the platform, including employee names, contact
                  details, national ID or KRA PIN where required for payroll, job titles,
                  department, compensation, attendance records, leave balances, performance
                  reviews, and recruitment pipeline data.
                </li>
                <li>
                  <span className="font-semibold">Payment information:</span> billing details and
                  transaction references from M-Pesa, Paystack, or other supported payment
                  methods. We do not store full M-Pesa PINs or card numbers; these are handled
                  directly by our payment processors.
                </li>
                <li>
                  <span className="font-semibold">Usage and device data:</span> log data such as
                  IP address, browser type, device identifiers, pages visited, and timestamps,
                  collected automatically when you use our website or platform.
                </li>
                <li>
                  <span className="font-semibold">Support and communications data:</span> the
                  content of messages you send us via email, WhatsApp, contact forms, or in-app
                  support, and records of how we responded.
                </li>
                <li>
                  <span className="font-semibold">Cookies and similar technologies:</span> as
                  described in Section 9.
                </li>
              </ul>
            </section>

            <section id="how-we-collect" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-semibold">4. How we collect information</h2>
              <p className="leading-relaxed text-slate-700">
                We collect information directly from you when you fill in a form, create an
                account, or contact us; from your employer or organization administrator when
                they set up your employee profile within the platform; automatically through your
                use of our website and application (via cookies, server logs, and analytics); and
                from third parties such as payment processors, who share confirmation of a
                completed transaction with us.
              </p>
            </section>

            <section id="how-we-use" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-semibold">5. How we use information</h2>
              <p className="leading-relaxed text-slate-700">We use the information we collect to:</p>
              <ul className="list-disc space-y-2 pl-6 text-slate-700">
                <li>Provide, operate, and maintain the Chris Tech HRMS platform, including attendance, leave, payroll, recruitment, and performance features.</li>
                <li>Create and manage accounts, and authenticate users logging into the platform.</li>
                <li>Process payments and manage billing, including invoicing and subscription renewals.</li>
                <li>Respond to support requests, demo requests, and other communications.</li>
                <li>Send service-related notices, such as maintenance windows, security alerts, or changes to these terms.</li>
                <li>Monitor, secure, and improve the reliability and performance of our systems.</li>
                <li>Detect, investigate, and prevent fraud, abuse, or security incidents.</li>
                <li>Comply with legal obligations, such as tax and financial recordkeeping requirements.</li>
              </ul>
              <p className="leading-relaxed text-slate-700">
                We do not use employee data entered by our Customers for advertising, and we do
                not sell personal data to data brokers or third-party marketers.
              </p>
            </section>

            <section id="legal-basis" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-semibold">6. Legal basis for processing</h2>
              <p className="leading-relaxed text-slate-700">
                Where applicable law requires a lawful basis for processing, we rely on one or
                more of the following: performance of a contract (to provide the Service you have
                signed up for), legitimate interests (such as securing our systems and improving
                the Service), compliance with a legal obligation (such as tax recordkeeping), and,
                where required, your consent (for example, for optional analytics or marketing
                communications, which you may withdraw at any time).
              </p>
            </section>

            <section id="sharing" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-semibold">7. Who we share data with</h2>
              <p className="leading-relaxed text-slate-700">
                We do not sell personal data. We share data only in the following circumstances:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-slate-700">
                <li>
                  <span className="font-semibold">Infrastructure and hosting providers:</span> our
                  application and data are hosted using third-party infrastructure providers
                  (such as cloud hosting, database, and content-delivery services) that process
                  data on our behalf under contractual confidentiality and security obligations.
                </li>
                <li>
                  <span className="font-semibold">Payment processors:</span> transaction data is
                  shared with M-Pesa, Paystack, or other payment providers strictly to process
                  payments.
                </li>
                <li>
                  <span className="font-semibold">Professional advisors:</span> lawyers,
                  accountants, and auditors, where necessary and under confidentiality
                  obligations.
                </li>
                <li>
                  <span className="font-semibold">Legal and regulatory authorities:</span> where
                  required by law, court order, or to protect the rights, property, or safety of
                  Chris Tech, our customers, or others.
                </li>
                <li>
                  <span className="font-semibold">Business transfers:</span> in connection with a
                  merger, acquisition, or sale of assets, subject to continued protection of your
                  data under this policy or a comparable one.
                </li>
              </ul>
            </section>

            <section id="payments" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-semibold">8. Payments and M-Pesa data</h2>
              <p className="leading-relaxed text-slate-700">
                When you pay via M-Pesa, Paystack, or another supported method, the payment
                provider processes your payment details directly. We receive and store only the
                information necessary to confirm and reconcile the transaction — such as amount,
                date, phone number used for the transaction, and a transaction reference — and use
                it to maintain accurate billing records and provide receipts. We do not have
                access to, and do not store, your M-Pesa PIN or full financial account
                credentials.
              </p>
            </section>

            <section id="cookies" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-semibold">9. Cookies and similar technologies</h2>
              <p className="leading-relaxed text-slate-700">
                We use cookies and similar technologies to keep you logged in, remember your
                preferences, and understand how our website and platform are used. For a full
                breakdown of cookie categories and how to manage them, see our{" "}
                <Link href="/terms-cookie-policy" className="text-ct-blue hover:underline">
                  Terms &amp; Cookie Policy
                </Link>
                .
              </p>
            </section>

            <section id="retention" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-semibold">10. Data retention</h2>
              <p className="leading-relaxed text-slate-700">
                We retain personal data for as long as your account is active, and for a
                reasonable period afterward to comply with legal, tax, and accounting
                requirements, resolve disputes, and enforce our agreements. Company and employee
                data entered into the platform is generally retained for the duration of the
                Customer&apos;s subscription, plus a limited grace period after termination during
                which the Customer may export their data. After that period, data is securely
                deleted or anonymized, except where longer retention is required by law (for
                example, statutory payroll or tax record requirements).
              </p>
            </section>

            <section id="security" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-semibold">11. How we protect data</h2>
              <p className="leading-relaxed text-slate-700">
                We apply technical and organizational measures designed to protect personal data
                against unauthorized access, alteration, disclosure, or destruction. These
                measures include encryption of data in transit, role-based access controls,
                per-company data isolation in our multi-tenant database design, restricted
                administrative access, and ongoing monitoring for suspicious activity. No system
                is completely immune to risk, and we encourage customers to use strong, unique
                passwords and to enable any available account security features.
              </p>
            </section>

            <section id="international-transfers" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-semibold">12. International data transfers</h2>
              <p className="leading-relaxed text-slate-700">
                Some of our infrastructure and service providers may process or store data outside
                Kenya. Where this occurs, we take steps to ensure an adequate level of protection
                is maintained, consistent with the requirements of the Data Protection Act, 2019
                and its regulations, including relying on providers with appropriate security and
                contractual safeguards.
              </p>
            </section>

            <section id="your-rights" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-semibold">13. Your rights under the Data Protection Act</h2>
              <p className="leading-relaxed text-slate-700">
                Subject to applicable law, you have the right to: be informed of how your data is
                processed; access the personal data we hold about you; request correction of
                inaccurate or incomplete data; request deletion of your data, subject to our legal
                and contractual retention obligations; object to or restrict certain processing;
                request a copy of your data in a portable format; and lodge a complaint with the
                Office of the Data Protection Commissioner (ODPC) in Kenya, or another relevant
                supervisory authority.
              </p>
              <p className="leading-relaxed text-slate-700">
                To exercise any of these rights, contact us using the details in Section 17. If
                your employer manages your data within Chris Tech HRMS as your employer&apos;s HR
                system of record, some requests (particularly deletion or correction of employment
                records) may need to be directed to or approved by your employer, since they
                control that data as described in Section 14.
              </p>
            </section>

            <section id="employer-data" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-semibold">14. Employer, HR, and employee data</h2>
              <p className="leading-relaxed text-slate-700">
                When an organization (&ldquo;Customer&rdquo;) uses Chris Tech HRMS to manage its workforce,
                the Customer decides what employee data to enter and how it is used within their
                organization&apos;s account — this makes the Customer the data controller for that
                employee data under most data protection frameworks, including Kenya&apos;s. Chris Tech
                acts as a data processor, handling that data only according to the Customer&apos;s
                instructions and the terms of our agreement with them, and using appropriate
                security measures, including logical isolation of each Customer&apos;s data from other
                Customers.
              </p>
              <p className="leading-relaxed text-slate-700">
                If you are an employee whose data is held in Chris Tech HRMS by your employer, and
                you have questions about how your data is used, your first point of contact should
                generally be your employer&apos;s HR team. We remain available to assist employers with
                data requests they receive from their employees.
              </p>
            </section>

            <section id="children" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-semibold">15. Children&apos;s privacy</h2>
              <p className="leading-relaxed text-slate-700">
                Chris Tech HRMS is a business platform intended for use by employers, HR teams,
                and their working-age employees. It is not directed at children, and we do not
                knowingly collect personal data from children. If you believe a child&apos;s data has
                been provided to us without appropriate authorization, please contact us so we can
                investigate and, where appropriate, delete it.
              </p>
            </section>

            <section id="changes" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-semibold">16. Changes to this policy</h2>
              <p className="leading-relaxed text-slate-700">
                We may update this Privacy Policy from time to time to reflect changes in our
                practices, technology, legal requirements, or the Service itself. When we make
                material changes, we will update the &ldquo;Last updated&rdquo; date above and, where
                appropriate, notify Customers by email or through the platform. We encourage you
                to review this page periodically.
              </p>
            </section>

            <section id="contact" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-semibold">17. Contact us</h2>
              <p className="leading-relaxed text-slate-700">
                If you have questions, requests, or concerns about this Privacy Policy or how your
                data is handled, contact us at{" "}
                <a href="mailto:support@christech.co.ke" className="text-ct-blue hover:underline">
                  support@christech.co.ke
                </a>
                . We aim to respond to privacy-related inquiries promptly and in good faith.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
