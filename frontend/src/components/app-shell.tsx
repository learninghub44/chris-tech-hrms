"use client";

import {
  Bell,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptText,
  Users
} from "lucide-react";
import { useRouter } from "next/navigation";
import { clearDemoSession } from "@/lib/auth";
import type { DemoUser } from "@/types";

type AppShellProps = {
  user: DemoUser;
  children: React.ReactNode;
};

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Employees", icon: Users, active: false },
  { label: "Attendance", icon: ClipboardList, active: false },
  { label: "Leave", icon: CalendarDays, active: false },
  { label: "Payroll", icon: ReceiptText, active: false }
];

export function AppShell({ user, children }: AppShellProps) {
  const router = useRouter();

  function signOut() {
    clearDemoSession();
    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-surface text-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-white lg:block">
        <div className="flex h-16 items-center gap-3 border-b border-line px-5">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-brand-600 text-white">
            <LayoutDashboard size={19} aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold">HRMS</p>
            <p className="text-xs text-slate-500">Phase 1</p>
          </div>
        </div>

        <nav className="space-y-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                className={`flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm transition ${
                  item.active
                    ? "bg-brand-50 font-semibold text-brand-700"
                    : "text-slate-600 hover:bg-surface"
                }`}
                type="button"
              >
                <Icon size={18} aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <section className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-white/94 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              className="grid h-9 w-9 place-items-center rounded-md border border-line text-slate-600 lg:hidden"
              type="button"
              aria-label="Open navigation"
            >
              <Menu size={18} aria-hidden="true" />
            </button>
            <div>
              <p className="text-sm font-medium text-ink">Company Workspace</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="grid h-9 w-9 place-items-center rounded-md border border-line text-slate-600 transition hover:bg-surface"
              type="button"
              aria-label="Notifications"
            >
              <Bell size={17} aria-hidden="true" />
            </button>
            <button
              className="inline-flex h-9 items-center gap-2 rounded-md border border-line px-3 text-sm font-medium text-slate-700 transition hover:bg-surface"
              type="button"
              onClick={signOut}
            >
              <LogOut size={16} aria-hidden="true" />
              Sign out
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</div>
      </section>
    </main>
  );
}
