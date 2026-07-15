"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import ctLogo from "@/assets/brand/chris-tech-logo-icon.png";
import { DashboardPreview } from "./sections/dashboard-preview";
import { TrustedCompanies } from "./sections/trusted-companies";
import { WhyChoose } from "./sections/why-choose";
import { CoreFeatures } from "./sections/core-features";
import { HowItWorks } from "./sections/how-it-works";
import { Security } from "./sections/security";
import { Pricing } from "./sections/pricing";
import { Testimonials } from "./sections/testimonials";
import { FAQ } from "./sections/faq";
import { FinalCTA } from "./sections/final-cta";
import { SiteFooter } from "./sections/site-footer";

const navLinks = [
  { label: "Modules", href: "/#features" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Resources", href: "/help-center" },
  { label: "Contact", href: "/contact" }
];

export function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="font-body bg-white text-ink">
      <header
        className={`sticky top-0 z-50 border-b bg-white/95 backdrop-blur-sm transition-shadow ${
          scrolled ? "border-slate-200 shadow-sm" : "border-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <Image src={ctLogo} alt="Chris Tech" width={30} height={30} className="h-7 w-7 sm:h-8 sm:w-8" priority />
            <span className="text-sm font-semibold tracking-tight text-ct-graphite sm:text-base">
              Chris Tech <span className="font-medium text-ink/60">HRMS</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-ink/70 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="group relative py-1 transition hover:text-ct-blue"
              >
                {link.label}
                <span className="absolute inset-x-0 -bottom-0.5 h-px scale-x-0 bg-ct-blue transition-transform duration-200 group-hover:scale-x-100" />
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/login"
              className="text-sm font-medium text-ink/70 transition hover:text-ct-blue"
            >
              Log in
            </Link>
            <a
              href="mailto:support@christech.co.ke?subject=Request%20a%20demo"
              className="rounded-md bg-ct-blue px-4 py-2 text-sm font-semibold text-white transition hover:bg-ct-blueDeep"
            >
              Request a demo
            </a>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md border border-slate-200 p-2 text-ct-graphite lg:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
          >
            <span className="sr-only">Toggle navigation</span>
            <div className="space-y-1.5">
              <span className="block h-0.5 w-5 bg-ct-graphite" />
              <span className="block h-0.5 w-5 bg-ct-graphite" />
              <span className="block h-0.5 w-5 bg-ct-graphite" />
            </div>
          </button>
        </div>

        {mobileOpen ? (
          <div className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block rounded-md px-3 py-2.5 text-sm font-medium text-ink/80 transition hover:bg-slate-50 hover:text-ct-blue"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-3 flex gap-3 border-t border-slate-100 pt-3">
                <Link
                  href="/login"
                  className="flex-1 rounded-md border border-slate-200 px-4 py-2.5 text-center text-sm font-semibold text-ink/80"
                  onClick={() => setMobileOpen(false)}
                >
                  Log in
                </Link>
                <a
                  href="mailto:support@christech.co.ke?subject=Request%20a%20demo"
                  className="flex-1 rounded-md bg-ct-blue px-4 py-2.5 text-center text-sm font-semibold text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  Request a demo
                </a>
              </div>
            </div>
          </div>
        ) : null}
      </header>

      <section className="relative overflow-hidden bg-ct-mist">
        <div className="mx-auto grid max-w-6xl gap-14 px-6 py-16 sm:py-20 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:py-28">
          <div>
            <span className="inline-flex items-center rounded-full border border-ct-blue/20 bg-white px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-ct-blue">
              HR software for African enterprise
            </span>
            <h1 className="font-display mt-6 text-4xl font-semibold leading-[1.1] tracking-tight text-ct-graphite sm:text-5xl lg:text-[52px]">
              Human resources management, built for growing businesses.
            </h1>
            <p className="font-inter mt-5 max-w-lg text-lg leading-relaxed text-ink/65">
              Chris Tech HRMS brings attendance, leave, payroll, recruitment,
              and performance management into one secure platform — so your
              HR team spends less time on paperwork and more time on people.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="mailto:support@christech.co.ke?subject=Request%20a%20demo"
                className="rounded-md bg-ct-blue px-6 py-3 text-base font-semibold text-white shadow-glow transition hover:bg-ct-blueDeep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ct-blue"
              >
                Request a demo
              </a>
              <a
                href="#features"
                className="group flex items-center gap-2 rounded-md border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-ct-graphite transition hover:border-ct-blue hover:text-ct-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ct-blue"
              >
                Explore modules
                <span aria-hidden className="transition group-hover:translate-x-0.5">→</span>
              </a>
            </div>

            <div className="mt-10 flex items-center gap-3 border-t border-slate-200 pt-6 text-sm text-ink/50">
              <Image src={ctLogo} alt="" width={18} height={18} className="h-[18px] w-[18px] opacity-70" />
              <p className="font-inter">
                Built and supported by <span className="font-medium text-ink/70">Chris Tech / Zetu Business Solutions</span>
              </p>
            </div>
          </div>

          <DashboardPreview />
        </div>
      </section>

      <TrustedCompanies />
      <WhyChoose />
      <CoreFeatures />
      <HowItWorks />
      <Security />
      <Pricing />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <SiteFooter />
    </div>
  );
}
