"use client";

import { BriefcaseBusiness, LogIn, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { setDemoSession } from "@/lib/auth";
import type { DemoRole } from "@/types";

type LoginFormValues = {
  email: string;
};

const roles: DemoRole[] = ["SUPER_ADMIN", "HR_ADMIN", "MANAGER", "EMPLOYEE"];

const roleLabels: Record<DemoRole, string> = {
  SUPER_ADMIN: "Super Admin",
  HR_ADMIN: "HR Admin",
  MANAGER: "Manager",
  EMPLOYEE: "Employee"
};

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<DemoRole>("SUPER_ADMIN");
  const { handleSubmit, register } = useForm<LoginFormValues>({
    defaultValues: {
      email: "admin@hrms.local"
    }
  });

  function onSubmit(values: LoginFormValues) {
    setDemoSession({
      id: "phase-1-user",
      name: roleLabels[role],
      email: values.email,
      role
    });
    router.push("/dashboard");
  }

  return (
    <main className="grid min-h-screen grid-cols-1 bg-surface lg:grid-cols-[minmax(0,0.85fr)_minmax(420px,0.55fr)]">
      <section className="flex min-h-[44vh] flex-col justify-between bg-ink px-6 py-7 text-white sm:px-10 lg:min-h-screen lg:px-12">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-brand-600">
            <BriefcaseBusiness size={22} aria-hidden="true" />
          </div>
          <div>
          <p className="text-sm text-white/60">HR Management System</p>
            <h1 className="text-xl font-semibold tracking-normal">Workspace</h1>
          </div>
        </div>

        <div className="max-w-2xl py-10">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-brand-100">
            Phase 1
          </p>
          <h2 className="mt-4 max-w-xl text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
            Core access and dashboard foundation
          </h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {["Frontend", "Backend", "Database"].map((item) => (
              <div
                key={item}
                className="rounded-md border border-white/10 bg-white/10 px-4 py-3"
              >
                <p className="text-sm text-white/72">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-white/60">localhost:3000</p>
      </section>

      <section className="flex items-center justify-center px-5 py-10 sm:px-8">
        <form
          className="w-full max-w-md rounded-lg border border-line bg-white p-6 shadow-soft"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-md bg-brand-50 text-brand-700">
              <ShieldCheck size={21} aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-normal">Sign in</h2>
              <p className="text-sm text-slate-500">Phase 1 demo access</p>
            </div>
          </div>

          <label className="mt-7 block text-sm font-medium text-slate-700">
            Email
            <input
              className="mt-2 h-11 w-full rounded-md border border-line px-3 text-sm outline-none transition focus:border-brand-600"
              type="email"
              autoComplete="email"
              {...register("email", { required: true })}
            />
          </label>

          <label className="mt-5 block text-sm font-medium text-slate-700">
            Role
            <select
              className="mt-2 h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-brand-600"
              value={role}
              onChange={(event) => setRole(event.target.value as DemoRole)}
            >
              {roles.map((item) => (
                <option key={item} value={item}>
                  {roleLabels[item]}
                </option>
              ))}
            </select>
          </label>

          <button
            className="mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700"
            type="submit"
          >
            <LogIn size={18} aria-hidden="true" />
            Continue
          </button>
        </form>
      </section>
    </main>
  );
}
