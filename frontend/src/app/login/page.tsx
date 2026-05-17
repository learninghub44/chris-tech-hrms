"use client";

import { BriefcaseBusiness, LogIn, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { getApiErrorMessage, login } from "@/lib/api";
import { setAuthSession } from "@/lib/auth";

type LoginFormValues = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    formState: { isSubmitting },
    handleSubmit,
    register
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "admin@hrms.local",
      password: "Admin@12345"
    }
  });

  async function onSubmit(values: LoginFormValues) {
    setError(null);
    const response = await login(values).catch(() => null);

    if (!response) {
      setError("Unable to reach the API");
      return;
    }

    if (!response.success) {
      setError(getApiErrorMessage(response));
      return;
    }

    setAuthSession(response.data);
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
            Phase 2
          </p>
          <h2 className="mt-4 max-w-xl text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
            Secure role-based access
          </h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {["JWT", "Roles", "Permissions"].map((item) => (
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
              <p className="text-sm text-slate-500">Use your HRMS account</p>
            </div>
          </div>

          {error ? (
            <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

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
            Password
            <input
              className="mt-2 h-11 w-full rounded-md border border-line px-3 text-sm outline-none transition focus:border-brand-600"
              type="password"
              autoComplete="current-password"
              {...register("password", { required: true })}
            />
          </label>

          <div className="mt-4 flex items-center justify-between gap-3 text-sm">
            <Link className="font-medium text-brand-700" href="/register">
              Create account
            </Link>
            <Link className="font-medium text-brand-700" href="/forgot-password">
              Forgot password
            </Link>
          </div>

          <button
            className="mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isSubmitting}
          >
            <LogIn size={18} aria-hidden="true" />
            Sign in
          </button>
        </form>
      </section>
    </main>
  );
}
