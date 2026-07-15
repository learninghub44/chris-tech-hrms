"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

type BackButtonProps = {
  /** Where to send the user if there's no in-app history to go back to. */
  fallbackHref?: string;
  label?: string;
  className?: string;
};

export function BackButton({
  fallbackHref = "/",
  label = "Back",
  className = ""
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-soft transition hover:-translate-x-0.5 hover:border-ct-blue/30 hover:text-ct-blue ${className}`}
    >
      <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" aria-hidden />
      {label}
    </button>
  );
}
