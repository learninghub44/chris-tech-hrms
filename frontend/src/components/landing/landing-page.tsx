"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import ctLogo from "@/assets/brand/chris-tech-logo.png";
import { TrustedCompanies } from "./sections/trusted-companies";
import { WhyChoose } from "./sections/why-choose";
import { CoreFeatures } from "./sections/core-features";
import { PlatformOverview } from "./sections/platform-overview";
import { HowItWorks } from "./sections/how-it-works";
import { Security } from "./sections/security";
import { Testimonials } from "./sections/testimonials";
import { FAQ } from "./sections/faq";
import { FinalCTA } from "./sections/final-cta";
import { SiteFooter } from "./sections/site-footer";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Blog", href: "/blog" },
  { label: "Docs", href: "/documentation" },
  { label: "Help Center", href: "/help-center" },
  { label: "Contact", href: "/contact" }
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 }
};

export function LandingPage() {
  const shouldReduceMotion = useReducedMotion();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="font-body bg-ct-paper text-ink">
      <section className="relative min-h-screen overflow-hidden bg-ct-graphite text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          >
            <source
              src="https://assets.mixkit.co/videos/preview/mixkit-modern-technology-laptop-638-large.mp4"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(8,9,18,0.92)_0%,_rgba(8,9,18,0.6)_45%,_rgba(8,9,18,0.82)_100%)]" />
          <motion.div
            className="absolute -left-24 top-24 h-[520px] w-[520px] rounded-full bg-ct-blue/15 blur-[110px]"
            animate={shouldReduceMotion ? undefined : { x: [0, 24, 0], y: [0, -18, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -right-24 bottom-24 h-[420px] w-[420px] rounded-full bg-ct-ice/10 blur-[120px]"
            animate={shouldReduceMotion ? undefined : { x: [0, -18, 0], y: [0, 20, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(90deg,_rgba(255,255,255,0.03)_0%,_transparent_12%,_transparent_88%,_rgba(255,255,255,0.03)_100%)]" />
        </div>

        <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 text-white">
          <div className="flex items-center gap-4">
            <Image src={ctLogo} alt="Chris Tech" width={44} height={44} className="h-11 w-11" priority />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/80">Chris Tech HRMS</p>
              <p className="text-[11px] uppercase tracking-[0.35em] text-ct-ice/90">Built by Chris Odhiambo</p>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm text-white/80 lg:flex">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} className="transition hover:text-white">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/login"
              className="rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white transition hover:border-ct-ice hover:text-ct-ice"
            >
              Login
            </Link>
            <Link
              href="/contact"
              className="rounded-full bg-ct-blue px-5 py-2 text-sm font-semibold text-white shadow-glow transition hover:bg-ct-blueDeep"
            >
              Contact
            </Link>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 p-2 text-white lg:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
          >
            <span className="sr-only">Toggle navigation</span>
            <div className="space-y-1.5">
              <span className="block h-0.5 w-5 bg-white" />
              <span className="block h-0.5 w-5 bg-white" />
              <span className="block h-0.5 w-5 bg-white" />
            </div>
          </button>
        </header>
        {mobileOpen ? (
          <div className="absolute inset-x-0 top-full z-30 rounded-b-[32px] border-t border-white/10 bg-ct-graphite/95 p-5 backdrop-blur-xl lg:hidden">
            <div className="space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-ct-ice hover:text-ct-ice"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/login"
                className="block rounded-2xl bg-ct-blue px-4 py-3 text-sm font-semibold text-white transition hover:bg-ct-blueDeep"
                onClick={() => setMobileOpen(false)}
              >
                Login
              </Link>
            </div>
          </div>
        ) : null}

        <div className="relative z-20 mx-auto flex w-full max-w-6xl flex-1 flex-col gap-14 px-6 py-10 lg:flex-row lg:items-center lg:gap-12 lg:py-8">
          <motion.div
            initial={shouldReduceMotion ? undefined : "hidden"}
            animate={shouldReduceMotion ? undefined : "show"}
            variants={fadeUp}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-1 flex-col gap-7"
          >
            <h1 className="font-display max-w-2xl text-5xl font-semibold leading-tight tracking-[-0.03em] sm:text-6xl lg:text-[72px]">
              Modern HR management designed for African businesses.
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-white/75 sm:text-xl">
              Chris Tech HRMS brings attendance, leave, payroll, recruitment, and performance together in one secure platform.
              Built for clarity, speed, and local market needs.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="mailto:support@christech.co.ke?subject=Request%20a%20demo"
                className="rounded-full bg-ct-blue px-7 py-3 text-base font-semibold text-white shadow-glow transition hover:bg-ct-blueDeep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Request a demo
              </a>
              <a
                href="#features"
                className="rounded-full border border-white/20 bg-white/5 px-7 py-3 text-base font-semibold text-white transition hover:border-ct-ice hover:text-ct-ice focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Explore features
              </a>
            </div>
            <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm uppercase tracking-[0.18em] text-white/50">Founder</p>
              <p className="mt-3 text-lg font-semibold text-white">Chris Odhiambo</p>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/70">
                Founder and product leader. Chris built Chris Tech HRMS to provide modern HR tools that work for local businesses.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Built for growth", value: "HR workflows" },
                { label: "Secure operations", value: "Tenant isolation" },
                { label: "Fast onboarding", value: "Easy setup" }
              ].map((item) => (
                <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm uppercase tracking-[0.18em] text-white/50">{item.label}</p>
                  <p className="mt-3 text-lg font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 32 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
            className="relative flex flex-1 items-center justify-center py-6 lg:py-0"
          >
            <div className="relative w-full max-w-md">
              <div className="absolute -left-10 top-8 h-64 w-64 rounded-full bg-ct-blue/10 blur-3xl" />
              <div className="absolute -right-8 bottom-10 h-52 w-52 rounded-full bg-ct-ice/10 blur-3xl" />
              <div className="ct-cut relative overflow-hidden rounded-[38px] border border-white/10 bg-white/[0.06] p-5 text-white shadow-[0_40px_120px_-30px_rgba(47,111,237,0.35)] backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-inter text-xs font-semibold uppercase tracking-[0.15em] text-white/50">
                    Workforce dashboard
                  </span>
                  <span className="flex gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-ct-ice/60" />
                    <span className="h-2 w-2 rounded-full bg-white/20" />
                    <span className="h-2 w-2 rounded-full bg-white/20" />
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Employees", value: "1,240" },
                    { label: "On duty", value: "97%" },
                    { label: "Open roles", value: "14" }
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/[0.05] p-4 text-center">
                      <p className="font-display text-xl font-bold text-white">{stat.value}</p>
                      <p className="font-inter text-[11px] uppercase tracking-[0.18em] text-white/50">{stat.label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-[26px] border border-white/10 bg-white/[0.04] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-inter text-[11px] uppercase tracking-[0.16em] text-white/60">
                      Payroll forecast
                    </span>
                    <span className="font-inter text-[11px] text-ct-ice">On schedule</span>
                  </div>
                  <div className="flex h-10 items-end gap-2">
                    {[50, 72, 58, 90, 66, 85, 74].map((height, index) => (
                      <div
                        key={index}
                        className="flex-1 rounded-full bg-gradient-to-t from-ct-blue/30 to-ct-ice/70"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>
                <div className="mt-4 space-y-2 rounded-[26px] border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-inter text-sm text-white/70">Recruitment pipeline</p>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/60">
                      Live
                    </span>
                  </div>
                  {[
                    { stage: "Screening", value: 21 },
                    { stage: "Interview", value: 9 },
                    { stage: "Offer", value: 3 }
                  ].map((item) => (
                    <div key={item.stage} className="flex items-center justify-between text-sm">
                      <span className="text-white/70">{item.stage}</span>
                      <span className="font-semibold text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute -bottom-8 left-6 w-40 rounded-[28px] border border-white/10 bg-ct-graphite/90 p-3 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl">
                <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-white/15" />
                <p className="font-inter mb-2 text-[10px] uppercase tracking-[0.16em] text-white/50">Employee self-service</p>
                <div className="space-y-2">
                  {[
                    { label: "Clock in", value: "08:02 AM", tone: "normal" },
                    { label: "Leave balance", value: "12 days", tone: "soft" },
                    { label: "Payslip · Jun", value: "Ready", tone: "soft" }
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`rounded-2xl border px-3 py-2 ${item.tone === "normal" ? "border-ct-blue/20 bg-ct-blue/10" : "border border-white/10 bg-white/[0.06]"}`}
                    >
                      <p className="font-inter text-[10px] text-white/70">{item.label}</p>
                      <p className="font-display text-xs font-bold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="relative z-20 mx-auto flex w-full max-w-6xl justify-center gap-4 px-6 pb-12">
          {[
            { label: "Faster approvals", value: "2.3x" },
            { label: "HR tasks automated", value: "92%" },
            { label: "Employee satisfaction", value: "4.9 / 5" }
          ].map((item) => (
            <div key={item.label} className="flex-1 rounded-[28px] border border-white/10 bg-white/5 p-5 text-center backdrop-blur-xl">
              <p className="font-display text-2xl font-bold text-white">{item.value}</p>
              <p className="font-inter mt-2 text-sm uppercase tracking-[0.18em] text-white/60">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ct-graphite to-transparent" />
      </section>

      <TrustedCompanies />
      <WhyChoose />
      <CoreFeatures />
      <PlatformOverview />
      <HowItWorks />
      <Security />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <SiteFooter />
    </div>
  );
}
