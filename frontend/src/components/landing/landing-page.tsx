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
      <section className="relative flex min-h-[100svh] flex-col overflow-hidden bg-ct-graphite text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/videos/hero-poster.jpg"
          >
            <source src="/videos/hero-workforce.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(11,14,20,0.94)_0%,_rgba(11,14,20,0.62)_38%,_rgba(11,14,20,0.55)_62%,_rgba(11,14,20,0.96)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,_rgba(11,14,20,0)_0%,_rgba(11,14,20,0.55)_75%)]" />
          <motion.div
            className="absolute -left-24 top-24 h-[520px] w-[520px] rounded-full bg-ct-blue/15 blur-[120px]"
            animate={shouldReduceMotion ? undefined : { x: [0, 24, 0], y: [0, -18, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -right-24 bottom-24 h-[420px] w-[420px] rounded-full bg-ct-ice/10 blur-[130px]"
            animate={shouldReduceMotion ? undefined : { x: [0, -18, 0], y: [0, 20, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Floating glass nav */}
        <div className="relative z-20 px-4 pt-4 sm:px-6 sm:pt-6">
          <header className="glass-panel mx-auto flex w-full max-w-6xl items-center justify-between rounded-full px-5 py-3 sm:px-6">
            <Link href="/" className="flex items-center gap-3">
              <Image src={ctLogo} alt="Chris Tech" width={34} height={34} className="h-8 w-8 sm:h-9 sm:w-9" priority />
              <span className="hidden text-sm font-semibold uppercase tracking-[0.22em] text-white/85 sm:inline">
                Chris Tech HRMS
              </span>
            </Link>

            <nav className="hidden items-center gap-7 text-sm text-white/75 lg:flex">
              {navLinks.map((link) => (
                <Link key={link.label} href={link.href} className="transition hover:text-white">
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden items-center gap-3 lg:flex">
              <Link
                href="/login"
                className="rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white transition hover:border-ct-ice/60 hover:text-ct-ice"
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
            <div className="glass-panel mx-auto mt-3 w-full max-w-6xl rounded-[28px] p-5 lg:hidden">
              <div className="space-y-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-ct-ice/60 hover:text-ct-ice"
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
        </div>

        <div className="relative z-20 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center gap-16 px-6 py-14 lg:flex-row lg:items-center lg:gap-10 lg:py-10">
          <motion.div
            initial={shouldReduceMotion ? undefined : "hidden"}
            animate={shouldReduceMotion ? undefined : "show"}
            variants={fadeUp}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex flex-1 flex-col gap-8"
          >
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-ct-ice/70" />
              <span className="font-mono text-xs uppercase tracking-[0.32em] text-ct-ice">
                HR platform for African enterprise
              </span>
            </div>

            <h1 className="font-display max-w-2xl text-[52px] font-normal leading-[1.02] tracking-[-0.01em] sm:text-6xl lg:text-[76px]">
              Modern HR management,{" "}
              <em className="text-ct-ice not-italic font-normal italic">designed for</em>{" "}
              growing African businesses.
            </h1>
            <p className="font-inter max-w-lg text-lg leading-relaxed text-white/70 sm:text-xl">
              Attendance, leave, payroll, recruitment, and performance — brought
              together in one secure, unmistakably clear platform.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="mailto:support@christech.co.ke?subject=Request%20a%20demo"
                className="rounded-full bg-ct-blue px-7 py-3.5 text-base font-semibold text-white shadow-glow transition hover:bg-ct-blueDeep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Request a demo
              </a>
              <a
                href="#features"
                className="group flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-base font-semibold text-white transition hover:border-ct-ice/50 hover:text-ct-ice focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Explore features
                <span aria-hidden className="transition group-hover:translate-x-0.5">→</span>
              </a>
            </div>

            <div className="flex items-center gap-3 pt-4 text-sm text-white/50">
              <Image src={ctLogo} alt="" width={20} height={20} className="h-5 w-5 opacity-80" />
              <p className="font-inter">
                Founded &amp; built by <span className="text-white/80">Chris Odhiambo</span>
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 32 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
            className="relative flex flex-1 items-center justify-center py-2 lg:py-0"
          >
            <div className="relative w-full max-w-md">
              <div className="absolute -left-10 top-8 h-64 w-64 rounded-full bg-ct-blue/10 blur-3xl" />
              <div className="absolute -right-8 bottom-10 h-52 w-52 rounded-full bg-ct-ice/10 blur-3xl" />

              <div className="ct-cut relative overflow-hidden rounded-[38px] border border-white/10 bg-white/[0.06] p-6 text-white shadow-[0_40px_120px_-30px_rgba(52,84,209,0.35)] backdrop-blur-xl">
                <div className="mb-5 flex items-center justify-between">
                  <span className="font-inter text-xs font-semibold uppercase tracking-[0.15em] text-white/50">
                    Workforce pulse
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
                      <p className="font-display text-2xl font-medium text-white">{stat.value}</p>
                      <p className="font-inter mt-1 text-[10px] uppercase tracking-[0.18em] text-white/50">{stat.label}</p>
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
                        className="flex-1 rounded-full bg-gradient-to-t from-ct-blue/40 to-ct-ice/70"
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

              {/* Signature floating accent chip — deliberately singular, not a
                  duplicate panel, to keep the composition uncluttered */}
              <motion.div
                animate={shouldReduceMotion ? undefined : { y: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-7 -left-6 flex items-center gap-3 rounded-full border border-white/10 bg-ct-graphite/90 px-4 py-3 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ct-ice/15">
                  <span className="h-2 w-2 rounded-full bg-ct-ice" />
                </span>
                <div>
                  <p className="font-inter text-[10px] uppercase tracking-[0.16em] text-white/50">Clocked in</p>
                  <p className="font-display text-sm font-medium text-white">08:02 AM · on time</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        <div className="relative z-20 mx-auto w-full max-w-6xl px-6 pb-12">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 border-t border-white/10 pt-8 sm:justify-between">
            {[
              { label: "Faster approvals", value: "2.3x" },
              { label: "HR tasks automated", value: "92%" },
              { label: "Employee satisfaction", value: "4.9 / 5" }
            ].map((item) => (
              <div key={item.label} className="flex items-baseline gap-3">
                <p className="font-display text-3xl font-medium text-white">{item.value}</p>
                <p className="font-inter text-sm uppercase tracking-[0.18em] text-white/50">{item.label}</p>
              </div>
            ))}
          </div>
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
