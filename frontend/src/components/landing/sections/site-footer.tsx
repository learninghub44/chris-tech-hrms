import Image from "next/image";
import Link from "next/link";
import { Globe, Mail, MapPin, Phone } from "lucide-react";
import ctLogo from "@/assets/brand/chris-tech-logo-icon.png";

type FooterLink = { label: string; href?: string };

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Founder", href: "/founder" },
      { label: "Portfolio", href: "/portfolio" },
      { label: "Contact", href: "/contact" }
    ]
  },
  {
    title: "Platform",
    links: [
      { label: "Services", href: "/services" },
      { label: "Documentation", href: "/documentation" },
      { label: "Help Center", href: "/help-center" },
      { label: "Blog", href: "/blog" }
    ]
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms & Cookie Policy", href: "/terms-cookie-policy" }
    ]
  }
];

const contactDetails = [
  { icon: Globe, label: "Website", value: "www.christech.co.ke", href: "https://www.christech.co.ke" },
  { icon: Mail, label: "Email", value: "support@christech.co.ke", href: "mailto:support@christech.co.ke" },
  { icon: Phone, label: "Phone", value: "+254 701 059192", href: "tel:+254701059192" },
  { icon: MapPin, label: "Location", value: "Nairobi, Kenya" }
];

export function SiteFooter() {
  return (
    <footer className="border-t border-ct-graphite/10 bg-ct-graphite text-white/70">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(4,1fr)] lg:gap-8">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3">
              <Image src={ctLogo} alt="Chris Tech" width={32} height={32} className="h-8 w-8" />
              <p className="font-display text-sm font-semibold text-white">
                Chris Tech / Zetu Business Solutions
              </p>
            </Link>
            <p className="font-inter mt-4 max-w-sm text-sm leading-relaxed text-white/50">
              Multi-tenant HR management software built for growing companies
              across Kenya and East Africa.
            </p>

            <dl className="mt-6 grid gap-3 sm:grid-cols-2">
              {contactDetails.map((item) => (
                <div key={item.label} className="flex items-start gap-2.5">
                  <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-ct-ice" aria-hidden />
                  <div>
                    <dt className="font-inter text-[11px] uppercase tracking-[0.12em] text-white/35">
                      {item.label}
                    </dt>
                    {item.href ? (
                      <a
                        href={item.href}
                        target={item.href.startsWith("http") ? "_blank" : undefined}
                        rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                        className="font-inter block text-sm text-white/75 transition hover:text-ct-ice"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <dd className="font-inter text-sm text-white/75">{item.value}</dd>
                    )}
                  </div>
                </div>
              ))}
            </dl>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="font-inter text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
                {col.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) =>
                  link.href ? (
                    <li key={link.label}>
                      <Link href={link.href} className="font-inter text-sm transition hover:text-ct-ice">
                        {link.label}
                      </Link>
                    </li>
                  ) : (
                    <li key={link.label}>
                      <span className="font-inter text-sm text-white/45">{link.label}</span>
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-inter">© {new Date().getFullYear()} Chris Tech. All rights reserved.</p>
          <p className="font-inter">Registered in Kenya · Nairobi, Kenya</p>
        </div>
      </div>
    </footer>
  );
}
