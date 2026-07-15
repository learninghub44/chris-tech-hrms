import Image from "next/image";
import { Globe, Mail, Phone } from "lucide-react";
import ctLogo from "@/assets/brand/chris-tech-logo.png";

type FooterLink = { label: string; href?: string };

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: "Company",
    links: [
      { label: "About" },
      { label: "Careers" },
      { label: "Contact", href: "mailto:support@christech.co.ke" }
    ]
  },
  {
    title: "Platform",
    links: [
      { label: "Features", href: "#features" },
      { label: "Solutions", href: "#platform" },
      { label: "Pricing", href: "#get-started" },
      { label: "Security", href: "#security" }
    ]
  },
  {
    title: "Resources",
    links: [{ label: "Documentation" }, { label: "Help Center" }, { label: "Blog" }]
  },
  {
    title: "Legal",
    links: [{ label: "Privacy Policy" }, { label: "Terms of Service" }, { label: "Cookie Policy" }]
  }
];

export function SiteFooter() {
  return (
    <footer className="border-t border-ct-graphite/10 bg-ct-graphite text-white/70">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_repeat(4,1fr)] lg:gap-8">
          <div>
            <div className="flex items-center gap-3">
              <Image src={ctLogo} alt="Chris Tech" width={32} height={32} className="h-8 w-8" />
              <p className="font-display text-sm font-semibold text-white">
                Chris Tech / Zetu Business Solutions
              </p>
            </div>
            <div className="mt-5 flex flex-col gap-2 text-sm">
              <a
                href="https://www.christech.co.ke"
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-fit items-center gap-2 transition hover:text-ct-ice"
              >
                <Globe className="h-4 w-4" aria-hidden />
                www.christech.co.ke
              </a>
              <a
                href="mailto:support@christech.co.ke"
                className="inline-flex w-fit items-center gap-2 transition hover:text-ct-ice"
              >
                <Mail className="h-4 w-4" aria-hidden />
                support@christech.co.ke
              </a>
              <a
                href="tel:+254701059192"
                className="inline-flex w-fit items-center gap-2 transition hover:text-ct-ice"
              >
                <Phone className="h-4 w-4" aria-hidden />
                +254 701 059192
              </a>
            </div>
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
                      <a href={link.href} className="font-inter text-sm transition hover:text-ct-ice">
                        {link.label}
                      </a>
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

        <p className="font-inter mt-12 border-t border-white/10 pt-6 text-xs text-white/40">
          © {new Date().getFullYear()} Chris Tech. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
