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
import { useMemo, useState } from "react";
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
  section: string;
  href?: string;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    section: "Home",
    permissions: ["dashboard:read"]
  },
  {
    label: "Reports",
    icon: BarChart3,
    href: "/reports",
    section: "Analyze",
    permissions: ["reports:read"]
  },
  {
    label: "Notifications",
    icon: Bell,
    href: "/notifications",
    section: "Home",
    permissions: ["notifications:read"]
  },
  {
    label: "Announcements",
    icon: Megaphone,
    href: "/announcements",
    section: "Manage",
    permissions: ["announcements:read"]
  },
  {
    label: "Jobs",
    icon: BriefcaseBusiness,
    href: "/jobs",
    section: "Recruitment",
    permissions: ["recruitment:read"]
  },
  {
    label: "Candidates",
    icon: Users,
    href: "/candidates",
    section: "Recruitment",
    permissions: ["recruitment:read"]
  },
  {
    label: "Interviews",
    icon: CalendarDays,
    href: "/interviews",
    section: "Recruitment",
    permissions: ["recruitment:read"]
  },
  {
    label: "Offers",
    icon: Send,
    href: "/offers",
    section: "Recruitment",
    permissions: ["recruitment:read"]
  },
  {
    label: "Goals",
    icon: Target,
    href: "/goals",
    section: "Performance",
    permissions: ["performance:read"]
  },
  {
    label: "Performance Reviews",
    icon: Star,
    href: "/performance-reviews",
    section: "Performance",
    permissions: ["performance:read"]
  },
  {
    label: "Feedback",
    icon: MessageSquare,
    href: "/feedback",
    section: "Performance",
    permissions: ["performance:read"]
  },
  {
    label: "Appraisal History",
    icon: History,
    href: "/appraisals",
    section: "Performance",
    permissions: ["performance:read"]
  },
  {
    label: "Profile",
    icon: UserCircle,
    href: "/profile",
    section: "Home",
    permissions: ["profile:read"]
  },
  {
    label: "Employees",
    icon: Users,
    href: "/employees",
    section: "Teams",
    permissions: ["employees:manage"]
  },
  {
    label: "Departments",
    icon: Building2,
    href: "/departments",
    section: "Teams",
    permissions: ["employees:manage"]
  },
  {
    label: "Designations",
    icon: BriefcaseBusiness,
    href: "/designations",
    section: "Teams",
    permissions: ["employees:manage"]
  },
  {
    label: "My Attendance",
    icon: Clock3,
    href: "/attendance",
    section: "Time",
    permissions: ["attendance:write"]
  },
  {
    label: "Attendance Report",
    icon: ClipboardList,
    href: "/attendance/report",
    section: "Time",
    permissions: ["attendance:read"]
  },
  {
    label: "Shift Settings",
    icon: Settings,
    href: "/shifts",
    section: "Time",
    permissions: ["attendance:manage"]
  },
  {
    label: "Holidays",
    icon: CalendarCheck,
    href: "/holidays",
    section: "Time",
    permissions: ["attendance:manage"]
  },
  {
    label: "Apply Leave",
    icon: CalendarDays,
    href: "/leaves/apply",
    section: "Leave",
    permissions: ["leave:request"]
  },
  {
    label: "My Leaves",
    icon: CalendarDays,
    href: "/leaves/me",
    section: "Leave",
    permissions: ["leave:request"]
  },
  {
    label: "Leave Approvals",
    icon: CalendarDays,
    href: "/leaves/approvals",
    section: "Leave",
    permissions: ["leave:approve"]
  },
  {
    label: "Leave Balances",
    icon: ClipboardList,
    href: "/leaves/balances",
    section: "Leave",
    permissions: ["leave:request"]
  },
  {
    label: "Leave Settings",
    icon: Settings,
    href: "/leave-types",
    section: "Leave",
    permissions: ["leave:manage"]
  },
  {
    label: "Salary Setup",
    icon: DollarSign,
    href: "/salaries",
    section: "Payroll",
    permissions: ["payroll:manage"]
  },
  {
    label: "Payroll Runs",
    icon: ReceiptText,
    href: "/payroll",
    section: "Payroll",
    permissions: ["payroll:manage"]
  },
  {
    label: "My Payslips",
    icon: ReceiptText,
    href: "/payroll/me",
    section: "Payroll",
    permissions: ["payroll:read"]
  }
];

const navSectionOrder = [
  "Home",
  "Analyze",
  "Teams",
  "Time",
  "Leave",
  "Recruitment",
  "Performance",
  "Payroll",
  "Manage"
];

export function AppShell({ user, token, children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const primaryRole = user.roles[0];
  const visibleNavItems = useMemo(
    () => navItems.filter((item) => hasEveryPermission(user, item.permissions)),
    [user]
  );
  const visibleNavSections = useMemo<NavSection[]>(
    () =>
      navSectionOrder
        .map((section) => ({
          label: section,
          items: visibleNavItems.filter((item) => item.section === section)
        }))
        .filter((section) => section.items.length > 0),
    [visibleNavItems]
  );

  async function signOut() {
    setIsSigningOut(true);
    await logout(token).catch((error: unknown) => {
      console.error(error);
    });
    clearAuthSession();
    router.push("/login");
  }

  function renderNavItems(items: NavItem[]) {
    return items.map((item) => {
      const Icon = item.icon;
      const active = item.href
        ? pathname === item.href || pathname.startsWith(`${item.href}/`)
        : false;
      const className = `flex h-9 w-full items-center gap-3 rounded-md border px-3 text-sm transition ${
        active
          ? "border-slate-200 bg-white font-semibold text-slate-950 shadow-[0_8px_20px_rgba(15,23,42,0.06)]"
          : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-white"
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

  function renderNavSections() {
    return visibleNavSections.map((section) => {
      return (
        <div className="space-y-1.5" key={section.label}>
          <p className="px-3 text-xs font-medium text-slate-400">{section.label}</p>
          <div className="space-y-1">{renderNavItems(section.items)}</div>
        </div>
      );
    });
  }

  return (
    <main className="min-h-screen bg-[#f4f6f8] text-slate-950">
      <aside className="fixed inset-y-3 left-3 hidden w-[232px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-[#f8fafc] shadow-[0_18px_45px_rgba(15,23,42,0.08)] lg:flex">
        <div className="m-2 flex h-12 items-center gap-3 rounded-lg bg-slate-950 px-3 text-white">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-white text-slate-950">
            <LayoutDashboard size={19} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">HRMS</p>
            <p className="truncate text-xs text-white/60">Organization</p>
          </div>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-2 pb-4 pt-2">
          {renderNavSections()}
        </nav>

        <div className="border-t border-slate-200 p-3">
          <Link
            href="/profile"
            className="flex items-center gap-3 rounded-md px-2 py-2 transition hover:bg-white"
          >
            <div className="grid h-9 w-9 place-items-center rounded-md bg-white text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
              <UserCircle size={20} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            </div>
          </Link>
        </div>
      </aside>

      {isMobileNavOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            className="absolute inset-0 bg-ink/30"
            type="button"
            onClick={() => setIsMobileNavOpen(false)}
            aria-label="Close navigation"
          />
          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col border-r border-slate-200 bg-[#f8fafc] shadow-soft">
            <div className="flex h-16 items-center justify-between gap-3 border-b border-slate-200 px-5">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-md bg-slate-950 text-white">
                  <LayoutDashboard size={19} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold">HRMS</p>
                  <p className="text-xs text-slate-500">Organization</p>
                </div>
              </div>
              <button
                className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 text-slate-600"
                type="button"
                onClick={() => setIsMobileNavOpen(false)}
                aria-label="Close navigation"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <nav className="space-y-5 overflow-y-auto p-3">{renderNavSections()}</nav>
          </aside>
        </div>
      ) : null}

      <section className="lg:pl-[252px]">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-[#f4f6f8]/92 px-3 py-3 backdrop-blur sm:px-5">
          <div className="flex h-12 items-center justify-between rounded-lg border border-slate-200 bg-white px-3 shadow-[0_8px_26px_rgba(15,23,42,0.04)] sm:px-4">
          <div className="flex items-center gap-3">
            <button
              className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 text-slate-600 lg:hidden"
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={18} aria-hidden="true" />
            </button>
            <div>
              <p className="text-sm font-semibold text-slate-950">Company Workspace</p>
              <p className="text-xs text-slate-500">
                {primaryRole ? roleLabels[primaryRole] : "User"} | {user.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/notifications"
              className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50"
              aria-label="Notifications"
            >
              <Bell size={17} aria-hidden="true" />
            </Link>
            <button
              className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              onClick={signOut}
              disabled={isSigningOut}
            >
              <LogOut size={16} aria-hidden="true" />
              Sign out
            </button>
          </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-3 pb-6 pt-3 sm:px-5">{children}</div>
      </section>
    </main>
  );
}
