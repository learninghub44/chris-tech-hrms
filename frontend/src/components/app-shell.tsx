"use client";

import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  Clock3,
  DollarSign,
  History,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  MessageSquare,
  Send,
  ReceiptText,
  Settings,
  Star,
  Target,
  UserCircle,
  Users,
  X
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { logout } from "@/lib/api";
import { clearAuthSession } from "@/lib/auth";
import { hasEveryPermission, roleLabels } from "@/lib/permissions";
import type { AuthUser } from "@/types";

type AppShellProps = {
  user: AuthUser;
  token: string;
  children: React.ReactNode;
};

type NavItem = {
  label: string;
  icon: LucideIcon;
  permissions: string[];
  href?: string;
};

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    permissions: ["dashboard:read"]
  },
  {
    label: "Reports",
    icon: BarChart3,
    href: "/reports",
    permissions: ["reports:read"]
  },
  {
    label: "Notifications",
    icon: Bell,
    href: "/notifications",
    permissions: ["notifications:read"]
  },
  {
    label: "Announcements",
    icon: Megaphone,
    href: "/announcements",
    permissions: ["announcements:read"]
  },
  {
    label: "Jobs",
    icon: BriefcaseBusiness,
    href: "/jobs",
    permissions: ["recruitment:read"]
  },
  {
    label: "Candidates",
    icon: Users,
    href: "/candidates",
    permissions: ["recruitment:read"]
  },
  {
    label: "Interviews",
    icon: CalendarDays,
    href: "/interviews",
    permissions: ["recruitment:read"]
  },
  {
    label: "Offers",
    icon: Send,
    href: "/offers",
    permissions: ["recruitment:read"]
  },
  {
    label: "Goals",
    icon: Target,
    href: "/goals",
    permissions: ["performance:read"]
  },
  {
    label: "Performance Reviews",
    icon: Star,
    href: "/performance-reviews",
    permissions: ["performance:read"]
  },
  {
    label: "Feedback",
    icon: MessageSquare,
    href: "/feedback",
    permissions: ["performance:read"]
  },
  {
    label: "Appraisal History",
    icon: History,
    href: "/appraisals",
    permissions: ["performance:read"]
  },
  {
    label: "Profile",
    icon: UserCircle,
    href: "/profile",
    permissions: ["profile:read"]
  },
  {
    label: "Employees",
    icon: Users,
    href: "/employees",
    permissions: ["employees:manage"]
  },
  {
    label: "Departments",
    icon: Building2,
    href: "/departments",
    permissions: ["employees:manage"]
  },
  {
    label: "Designations",
    icon: BriefcaseBusiness,
    href: "/designations",
    permissions: ["employees:manage"]
  },
  {
    label: "My Attendance",
    icon: Clock3,
    href: "/attendance",
    permissions: ["attendance:write"]
  },
  {
    label: "Attendance Report",
    icon: ClipboardList,
    href: "/attendance/report",
    permissions: ["attendance:read"]
  },
  {
    label: "Shift Settings",
    icon: Settings,
    href: "/shifts",
    permissions: ["attendance:manage"]
  },
  {
    label: "Holidays",
    icon: CalendarCheck,
    href: "/holidays",
    permissions: ["attendance:manage"]
  },
  {
    label: "Apply Leave",
    icon: CalendarDays,
    href: "/leaves/apply",
    permissions: ["leave:request"]
  },
  {
    label: "My Leaves",
    icon: CalendarDays,
    href: "/leaves/me",
    permissions: ["leave:request"]
  },
  {
    label: "Leave Approvals",
    icon: CalendarDays,
    href: "/leaves/approvals",
    permissions: ["leave:approve"]
  },
  {
    label: "Leave Balances",
    icon: ClipboardList,
    href: "/leaves/balances",
    permissions: ["leave:request"]
  },
  {
    label: "Leave Settings",
    icon: Settings,
    href: "/leave-types",
    permissions: ["leave:manage"]
  },
  {
    label: "Salary Setup",
    icon: DollarSign,
    href: "/salaries",
    permissions: ["payroll:manage"]
  },
  {
    label: "Payroll Runs",
    icon: ReceiptText,
    href: "/payroll",
    permissions: ["payroll:manage"]
  },
  {
    label: "My Payslips",
    icon: ReceiptText,
    href: "/payroll/me",
    permissions: ["payroll:read"]
  }
];

export function AppShell({ user, token, children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const primaryRole = user.roles[0];
  const visibleNavItems = navItems.filter((item) =>
    hasEveryPermission(user, item.permissions)
  );

  async function signOut() {
    setIsSigningOut(true);
    await logout(token).catch((error: unknown) => {
      console.error(error);
    });
    clearAuthSession();
    router.push("/login");
  }

  function renderNavItems() {
    return visibleNavItems.map((item) => {
      const Icon = item.icon;
      const active = item.href
        ? pathname === item.href || pathname.startsWith(`${item.href}/`)
        : false;
      const className = `flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm transition ${
        active
          ? "bg-brand-50 font-semibold text-brand-700"
          : "text-slate-600 hover:bg-surface"
      }`;

      if (item.href) {
        return (
          <Link
            key={item.label}
            className={className}
            href={item.href}
            onClick={() => setIsMobileNavOpen(false)}
          >
            <Icon size={18} aria-hidden="true" />
            {item.label}
          </Link>
        );
      }

      return (
        <button key={item.label} className={className} type="button" disabled>
          <Icon size={18} aria-hidden="true" />
          {item.label}
        </button>
      );
    });
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
            <p className="text-xs text-slate-500">Phase 10</p>
          </div>
        </div>

        <nav className="space-y-1 overflow-y-auto p-3">{renderNavItems()}</nav>
      </aside>

      {isMobileNavOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            className="absolute inset-0 bg-ink/30"
            type="button"
            onClick={() => setIsMobileNavOpen(false)}
            aria-label="Close navigation"
          />
          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col border-r border-line bg-white shadow-soft">
            <div className="flex h-16 items-center justify-between gap-3 border-b border-line px-5">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-md bg-brand-600 text-white">
                  <LayoutDashboard size={19} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold">HRMS</p>
                  <p className="text-xs text-slate-500">Phase 10</p>
                </div>
              </div>
              <button
                className="grid h-9 w-9 place-items-center rounded-md border border-line text-slate-600"
                type="button"
                onClick={() => setIsMobileNavOpen(false)}
                aria-label="Close navigation"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <nav className="space-y-1 overflow-y-auto p-3">{renderNavItems()}</nav>
          </aside>
        </div>
      ) : null}

      <section className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-white/94 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              className="grid h-9 w-9 place-items-center rounded-md border border-line text-slate-600 lg:hidden"
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={18} aria-hidden="true" />
            </button>
            <div>
              <p className="text-sm font-medium text-ink">Company Workspace</p>
              <p className="text-xs text-slate-500">
                {primaryRole ? roleLabels[primaryRole] : "User"} | {user.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/notifications"
              className="grid h-9 w-9 place-items-center rounded-md border border-line text-slate-600 transition hover:bg-surface"
              aria-label="Notifications"
            >
              <Bell size={17} aria-hidden="true" />
            </Link>
            <button
              className="inline-flex h-9 items-center gap-2 rounded-md border border-line px-3 text-sm font-medium text-slate-700 transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              onClick={signOut}
              disabled={isSigningOut}
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
