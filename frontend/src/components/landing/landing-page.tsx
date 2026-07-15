"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import {
  Boxes,
  Briefcase,
  Building2,
  CalendarClock,
  ClipboardList,
  Github,
  Globe,
  Layers,
  Lock,
  Mail,
  MessageSquareText,
  Radio,
  Sparkles,
  TrendingUp,
  Users2,
  Wallet
} from "lucide-react";
import ctLogo from "@/assets/brand/chris-tech-logo.png";

const modules = [
  {
    icon: Users2,
    title: "Employees",
    copy: "Records, departments, designations, and reporting lines in one place."
  },
  {
    icon: CalendarClock,
    title: "Attendance",
    copy: "Clock in and out, shift rules, late thresholds, and holiday calendars."
  },
  {
    icon: ClipboardList,
    title: "Leave",
    copy: "Requests, approvals, and running balances that update automatically."
  },
  {
    icon: Wallet,
    title: "Payroll",
    copy: "Salary setup, monthly runs, and payslips employees can pull up themselves."
  },
  {
    icon: Briefcase,
    title: "Recruitment",
    copy: "Jobs, candidates, interviews, and offers tracked start to finish."
  },
  {
    icon: TrendingUp,
    title: "Performance",
    copy: "Goals, reviews, and feedback tied to a full appraisal history."
  },
  {
    icon: Radio,
    title: "Real-time",
    copy: "Notifications and announcements delivered the moment they happen."
  },
  {
    icon: MessageSquareText,
    title: "AI HR assistant",
    copy: "Employees ask about leave balances or payroll dates and get real answers."
  },
  {
    icon: Layers,
    title: "Reports",
    copy: "Attendance, leave, and payroll reporting, scoped to what each role can see."
  }
];

const isolationPoints = [
  {
    icon: Building2,
    title: "One company per account",
    copy: "Sign-in resolves the company at login, so tenant scoping costs no extra steps for the person signing in."
  },
  {
    icon: Lock,
    title: "Isolation by default",
    copy: "Every company-scoped query is checked at the middleware and query level. Reach for another company's record by ID and you get a 404, not a 403 — it never confirms the record exists elsewhere."
  },
  {
    icon: Boxes,
    title: "Platform vs. company admin",
    copy: "A platform-level role manages which companies exist on the deployment, without automatic access to any company's HR or payroll data."
  }
];

const stack = [
  "Next.js",
  "React",
  "Node.js / Express",
  "PostgreSQL",
  "Prisma",
  "Socket.IO",
  "Groq AI"
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 }
};

export function LandingPage() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="font-body bg-ct-paper text-ct-graphite">
      {/* NAV */}
      <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <Image src={ctLogo} alt="Chris Tech" width={36} height={36} className="h-9 w-9" priority />
          <span className="font-display text-lg font-semibold tracking-tight">
            Chris Tech <span className="text-ct-blue">HRMS</span>
          </span>
        </div>
        <Link
          href="/login"
          className="rounded-full border border-ct-graphite/15 px-5 py-2 text-sm font-medium transition hover:border-ct-blue hover:text-ct-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ct-blue"
        >
          Sign in
        </Link>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-ct-graphite text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-ct-blue/30 blur-[140px]"
        />
        <div className="relative mx-auto max-w-6xl px-6 pb-28 pt-16 sm:pt-24">
          <motion.div
            initial={shouldReduceMotion ? undefined : "hidden"}
            animate={shouldReduceMotion ? undefined : "show"}
            variants={fadeUp}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-start gap-8"
          >
            <span className="font-mono inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs uppercase tracking-[0.2em] text-ct-ice">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Multi-tenant HR platform
            </span>
            <h1 className="font-display max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              One HR platform.
              <br />
              <span className="bg-gradient-to-r from-ct-blue via-ct-ice to-ct-blue bg-clip-text text-transparent">
                Every company, isolated.
              </span>
            </h1>
            <p className="max-w-xl text-base text-white/70 sm:text-lg">
              Chris Tech HRMS brings employees, attendance, leave, payroll,
              recruitment, and performance into one role-based platform —
              architected so each company&apos;s data stays fully separate
              inside a single deployment.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/login"
                className="rounded-full bg-ct-blue px-7 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-ct-blueDeep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Sign in
              </Link>
              <a
                href="#modules"
                className="rounded-full border border-white/20 px-7 py-3 text-sm font-medium text-white transition hover:border-ct-ice hover:text-ct-ice focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                See what&apos;s inside
              </a>
            </div>
          </motion.div>
        </div>
        {/* angular seam into the next section, echoing the blade-cut T */}
        <svg
          aria-hidden
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          className="absolute -bottom-px left-0 h-16 w-full text-ct-paper"
        >
          <polygon points="0,80 1440,80 1440,20 760,80 700,0 0,60" fill="currentColor" />
        </svg>
      </section>

      {/* MODULE GRID */}
      <section id="modules" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-14 max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-ct-blue">
            Everything HR touches
          </span>
          <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Nine modules, one login.
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => (
            <div
              key={mod.title}
              className="ct-cut-sm border border-ct-graphite/10 bg-white p-6 transition hover:border-ct-blue/40 hover:shadow-soft"
            >
              <mod.icon className="h-6 w-6 text-ct-blue" aria-hidden />
              <h3 className="font-display mt-4 text-lg font-semibold">{mod.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ct-graphite/70">{mod.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MULTI-TENANT ISOLATION */}
      <section className="bg-ct-steel text-white">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="mb-14 max-w-2xl">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-ct-ice">
              Built for many companies, one deployment
            </span>
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Tenant isolation isn&apos;t a setting. It&apos;s the architecture.
            </h2>
          </div>
          <div className="grid gap-8 lg:grid-cols-3">
            {isolationPoints.map((point) => (
              <div key={point.title} className="ct-cut border border-white/10 bg-ct-slate/60 p-7">
                <point.icon className="h-6 w-6 text-ct-ice" aria-hidden />
                <h3 className="font-display mt-4 text-lg font-semibold">{point.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{point.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STACK STRIP */}
      <section className="border-y border-ct-graphite/10 bg-ct-paper py-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-6">
          {stack.map((tech) => (
            <span
              key={tech}
              className="font-mono text-xs uppercase tracking-[0.15em] text-ct-graphite/50"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h2 className="font-display mx-auto max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
          Bring your HR operations into one place.
        </h2>
        <div className="mt-8 flex justify-center">
          <Link
            href="/login"
            className="rounded-full bg-ct-graphite px-8 py-3 text-sm font-semibold text-white transition hover:bg-ct-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ct-blue"
          >
            Sign in to your workspace
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-ct-graphite/10 bg-ct-graphite text-white/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <Image src={ctLogo} alt="Chris Tech" width={32} height={32} className="h-8 w-8" />
            <div>
              <p className="font-display text-sm font-semibold text-white">
                Chris Tech / Zetu Business Solutions
              </p>
              <p className="mt-1 text-xs text-white/50">
                © {new Date().getFullYear()} Chris Tech. All rights reserved.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 text-sm sm:items-end">
            <a
              href="https://www.christech.co.ke"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 transition hover:text-ct-ice"
            >
              <Globe className="h-4 w-4" aria-hidden />
              www.christech.co.ke
            </a>
            <a
              href="https://github.com/learninghub44"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 transition hover:text-ct-ice"
            >
              <Github className="h-4 w-4" aria-hidden />
              @learninghub44
            </a>
            <a
              href="mailto:chrisodhiambo958@gmail.com"
              className="inline-flex items-center gap-2 transition hover:text-ct-ice"
            >
              <Mail className="h-4 w-4" aria-hidden />
              chrisodhiambo958@gmail.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
