"use client";

import { BriefcaseBusiness, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { getApiErrorMessage, register as registerAccount } from "@/lib/api";
import { setAuthSession } from "@/lib/auth";

type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    formState: { isSubmitting },
    handleSubmit,
    register
  } = useForm<RegisterFormValues>({
    defaultValues: {
      name: "",
      email: "",
      password: ""
    }
  });

  async function onSubmit(values: RegisterFormValues) {
    setError(null);
    const response = await registerAccount(values).catch(() => null);

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
    <main className="grid min-h-screen place-items-center bg-surface px-5 py-10">
      <section className="w-full max-w-md rounded-lg border border-line bg-white p-6 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-brand-600 text-white">
            <BriefcaseBusiness size={21} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-normal">Create account</h1>
            <p className="text-sm text-slate-500">Employee self-service access</p>
          </div>
        </div>

        {error ? (
          <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <form className="mt-7 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <label className="block text-sm font-medium text-slate-700">
            Name
            <input
              className="mt-2 h-11 w-full rounded-md border border-line px-3 text-sm outline-none transition focus:border-brand-600"
              type="text"
              autoComplete="name"
              {...register("name", { required: true })}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              className="mt-2 h-11 w-full rounded-md border border-line px-3 text-sm outline-none transition focus:border-brand-600"
              type="email"
              autoComplete="email"
              {...register("email", { required: true })}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Password
            <input
              className="mt-2 h-11 w-full rounded-md border border-line px-3 text-sm outline-none transition focus:border-brand-600"
              type="password"
              autoComplete="new-password"
              {...register("password", { required: true })}
            />
          </label>

          <button
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isSubmitting}
          >
            <UserPlus size={18} aria-hidden="true" />
            Create account
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          Already registered?{" "}
          <Link className="font-medium text-brand-700" href="/login">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
