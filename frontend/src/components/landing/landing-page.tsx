"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
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
  { label: "Features", href: "#features" },
  { label: "Solutions", href: "#platform" },
  { label: "Customers", href: "#testimonials" },
  { label: "Resources", href: "#faq" },
  { label: "Contact", href: "mailto:support@christech.co.ke" }
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 }
};

export function LandingPage() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="font-body bg-ct-paper text-ct-graphite">
      {/* HERO (nav folded in — together these fill the first screen) */}
      <section className="relative flex min-h-screen flex-col overflow-hidden bg-ct-graphite text-white">
        {/* ambient background: layered navy depth + slow-drifting glows, standing in for
            the brief's cinematic office footage — no stock video asset is available in
            this environment, so the mood is built from the site's own color tokens instead */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#141a2b_0%,_#0a0e17_55%,_#05070d_100%)]" />
          <motion.div
            className="absolute -top-52 left-[8%] h-[620px] w-[620px] rounded-full bg-ct-blue/25 blur-[160px]"
            animate={shouldReduceMotion ? undefined : { x: [0, 40, 0], y: [0, 24, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-40 right-[6%] h-[520px] w-[520px] rounded-full bg-ct-ice/10 blur-[150px]"
            animate={shouldReduceMotion ? undefined : { x: [0, -30, 0], y: [0, -20, 0] }}
            transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
          />
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
              backgroundSize: "64px 64px"
            }}
          />
          <div className="absolute inset-0 bg-ct-graphite/40" />
        </div>

        {/* NAV */}
        <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <Image src={ctLogo} alt="Chris Tech" width={36} height={36} className="h-9 w-9" priority />
            <span className="font-display text-lg font-semibold tracking-tight">
              Chris Tech <span className="text-ct-blue">HRMS</span>
            </span>
          </div>
          <nav className="font-inter hidden items-center gap-8 text-base text-white/75 lg:flex">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} className="transition hover:text-white">
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="font-inter hidden rounded-full border border-white/15 px-5 py-2 text-base font-semibold text-white transition hover:border-ct-ice hover:text-ct-ice focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:inline-block"
            >
              Sign in
            </Link>
            <a
              href="mailto:support@christech.co.ke?subject=Request%20a%20demo"
              className="font-inter rounded-full bg-ct-blue px-5 py-2 text-base font-semibold text-white shadow-glow transition hover:bg-ct-blueDeep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Request demo
            </a>
          </div>
        </header>

        {/* SPLIT CONTENT */}
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center gap-14 px-6 py-10 lg:flex-row lg:items-center lg:gap-10 lg:py-6">
          {/* LEFT */}
          <motion.div
            initial={shouldReduceMotion ? undefined : "hidden"}
            animate={shouldReduceMotion ? undefined : "show"}
            variants={fadeUp}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-1 flex-col items-start gap-7"
          >
            <span className="font-inter inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-3 py-1 text-sm uppercase tracking-[0.18em] text-ct-ice backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-ct-ice" aria-hidden />
              AI-powered human resource management platform
            </span>
            <h1 className="font-display max-w-xl text-4xl font-bold leading-[1.05] tracking-[-0.02em] sm:text-6xl lg:text-[72px]">
              Manage your workforce with{" "}
              <span className="bg-gradient-to-r from-ct-blue via-ct-ice to-ct-blue bg-clip-text text-transparent">
                confidence
              </span>
            </h1>
            <p className="font-inter max-w-lg text-lg leading-relaxed text-white/70 sm:text-xl">
              Empower your organization with an intelligent HR platform that
              simplifies every stage of the employee lifecycle. From
              recruitment and onboarding to attendance, payroll, performance
              management, and workforce analytics, everything you need is
              available in one secure and intuitive platform.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="mailto:support@christech.co.ke?subject=Request%20a%20demo"
                className="font-inter rounded-full bg-ct-blue px-7 py-3 text-base font-semibold text-white shadow-glow transition hover:bg-ct-blueDeep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Request a demo
              </a>
              <a
                href="#features"
                className="font-inter rounded-full border border-white/20 px-7 py-3 text-base font-semibold text-white transition hover:border-ct-ice hover:text-ct-ice focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Explore platform
              </a>
            </div>
            <p className="font-inter max-w-md text-sm leading-relaxed text-white/45">
              Designed for businesses of all sizes to improve productivity,
              streamline HR operations, and create exceptional employee
              experiences.
            </p>
          </motion.div>

          {/* RIGHT — floating dashboard + phone mockup */}
          <motion.div
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 32 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
            className="relative flex flex-1 items-center justify-center py-6 lg:py-0"
          >
            <div className="relative w-full max-w-md">
              {/* laptop / dashboard */}
              <motion.div
                animate={shouldReduceMotion ? undefined : { y: [0, -14, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                className="ct-cut relative border border-white/10 bg-white/[0.06] p-4 shadow-[0_40px_120px_-20px_rgba(47,111,237,0.35)] backdrop-blur-xl"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-inter text-xs font-semibold uppercase tracking-[0.15em] text-white/50">
                    Workforce overview
                  </span>
                  <span className="flex gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-ct-ice/60" />
                    <span className="h-2 w-2 rounded-full bg-white/20" />
                    <span className="h-2 w-2 rounded-full bg-white/20" />
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Headcount", value: "482" },
                    { label: "Attendance", value: "97%" },
                    { label: "Open roles", value: "14" }
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                      <p className="font-display text-lg font-bold text-white">{stat.value}</p>
                      <p className="font-inter text-[11px] text-white/50">{stat.label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.04] p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-inter text-[11px] font-medium text-white/60">Payroll summary — this run</span>
                    <span className="font-inter text-[11px] text-ct-ice">On schedule</span>
                  </div>
                  <div className="flex h-10 items-end gap-1.5">
                    {[40, 65, 50, 80, 60, 90, 70].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm bg-gradient-to-t from-ct-blue/40 to-ct-ice/70"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
                <div className="mt-3 space-y-1.5 rounded-lg border border-white/10 bg-white/[0.04] p-3">
                  <p className="font-inter text-[11px] font-medium text-white/60">Recruitment pipeline</p>
                  {[
                    { stage: "Screening", n: 21 },
                    { stage: "Interview", n: 9 },
                    { stage: "Offer", n: 3 }
                  ].map((row) => (
                    <div key={row.stage} className="flex items-center justify-between">
                      <span className="font-inter text-xs text-white/70">{row.stage}</span>
                      <span className="font-inter text-xs font-semibold text-white">{row.n}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* phone — employee self-service */}
              <motion.div
                animate={shouldReduceMotion ? undefined : { y: [0, 12, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                className="absolute -bottom-8 -left-8 w-36 rounded-[26px] border border-white/15 bg-ct-graphite/90 p-2.5 shadow-[0_30px_80px_-15px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:w-40"
              >
                <div className="mx-auto mb-2 h-1 w-8 rounded-full bg-white/20" />
                <p className="font-inter mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/50">
                  Self-service
                </p>
                <div className="space-y-1.5">
                  <div className="rounded-md border border-ct-blue/30 bg-ct-blue/10 px-2 py-1.5">
                    <p className="font-inter text-[10px] text-white/80">Clock in</p>
                    <p className="font-display text-xs font-bold text-ct-ice">08:02 AM</p>
                  </div>
                  <div className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1.5">
                    <p className="font-inter text-[10px] text-white/70">Leave balance</p>
                    <p className="font-inter text-[10px] font-semibold text-white">12 days</p>
                  </div>
                  <div className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1.5">
                    <p className="font-inter text-[10px] text-white/70">Payslip · Jun</p>
                    <p className="font-inter text-[10px] font-semibold text-white">Ready</p>
                  </div>
                </div>
              </motion.div>

              {/* signature: a live-sync pulse tracing dashboard → phone, the one thing
                  the platform is actually about — data moving in real time between
                  employer and employee views */}
              {!shouldReduceMotion && (
                <svg
                  aria-hidden
                  viewBox="0 0 400 300"
                  className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
                >
                  <motion.path
                    d="M 120 180 C 60 210, 40 230, 30 250"
                    stroke="#7dc4ff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray="6 10"
                    animate={{ strokeDashoffset: [0, -32] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
                    opacity={0.6}
                  />
                </svg>
              )}
            </div>
          </motion.div>
        </div>

        {/* scroll indicator */}
        <motion.div
          className="relative z-10 mb-6 hidden justify-center sm:flex"
          animate={shouldReduceMotion ? undefined : { y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="flex h-9 w-6 items-start justify-center rounded-full border border-white/25 p-1.5">
            <span className="h-1.5 w-1 rounded-full bg-white/60" />
          </span>
        </motion.div>

        {/* angular seam into the next section, echoing the blade-cut T */}
        <svg
          aria-hidden
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          className="relative z-10 -mb-px h-16 w-full text-ct-paper"
        >
          <polygon points="0,80 1440,80 1440,20 760,80 700,0 0,60" fill="currentColor" />
        </svg>
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
