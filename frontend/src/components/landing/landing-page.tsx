"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import ctLogo from "@/assets/brand/chris-tech-logo-icon.png";
import { TrustedCompanies } from "./sections/trusted-companies";
import { WhyChoose } from "./sections/why-choose";
import { CoreFeatures } from "./sections/core-features";
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
          <div className="absolute inset-0 bg-[linear-gradient(160deg,_#0b0e14_0%,_#11151f_45%,_#0b0e14_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,_rgba(52,84,209,0.16)_0%,_rgba(11,14,20,0)_60%)]" />
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
              backgroundSize: "56px 56px"
            }}
          />
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
                href="/register"
                className="rounded-full bg-ct-blue px-5 py-2 text-sm font-semibold text-white shadow-glow transition hover:bg-ct-blueDeep"
              >
                Register
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
                <div className="flex gap-3">
                  <Link
                    href="/login"
                    className="flex-1 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition hover:border-ct-ice/60 hover:text-ct-ice"
                    onClick={() => setMobileOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="flex-1 rounded-2xl bg-ct-blue px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-ct-blueDeep"
                    onClick={() => setMobileOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="relative z-20 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-8 px-6 py-20 text-center">
          <motion.div
            initial={shouldReduceMotion ? undefined : "hidden"}
            animate={shouldReduceMotion ? undefined : "show"}
            variants={fadeUp}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex flex-col items-center gap-8"
          >
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-ct-ice/70" />
              <span className="font-mono text-xs uppercase tracking-[0.32em] text-ct-ice">
                HR platform for African enterprise
              </span>
              <span className="h-px w-10 bg-ct-ice/70" />
            </div>

            <h1 className="font-display max-w-3xl text-[52px] font-normal leading-[1.02] tracking-[-0.01em] sm:text-6xl lg:text-[76px]">
              Modern HR management,{" "}
              <em className="text-ct-ice not-italic font-normal italic">designed for</em>{" "}
              growing African businesses.
            </h1>
            <p className="font-inter max-w-xl text-lg leading-relaxed text-white/70 sm:text-xl">
              Attendance, leave, payroll, recruitment, and performance — brought
              together in one secure, unmistakably clear platform.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
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
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ct-graphite to-transparent" />
      </section>

      <TrustedCompanies />
      <WhyChoose />
      <CoreFeatures />
      <HowItWorks />
      <Security />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <SiteFooter />
    </div>
  );
}
