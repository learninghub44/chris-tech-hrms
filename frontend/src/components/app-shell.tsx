"use client";

import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarCheck,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock3,
  DollarSign,
  History,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
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
import { useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import darkModeIcon from "@/assets/dark-mode.png";
import { HrAssistantWidget } from "@/components/hr-assistant-widget";
import { RealtimeNotifications } from "@/components/realtime-notifications";
import { listNotifications, logout } from "@/lib/api";
import { clearAuthSession } from "@/lib/auth";
import { prefetchNavData } from "@/lib/nav-prefetch";
import {
  notificationUnreadCountEventName,
  type NotificationUnreadCountEventDetail
} from "@/lib/optimistic-cache";
import { hasAnyPermission, hasEveryPermission, roleLabels } from "@/lib/permissions";
import { applyTheme, getPreferredTheme, persistTheme, type ThemeMode } from "@/lib/theme";
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
  permissionMode?: "all" | "any";
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
    permissions: [
      "attendance:manage",
      "attendance:read",
      "attendance:write",
      "leave:request",
      "leave:approve",
      "leave:manage"
    ],
    permissionMode: "any"
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

const navDataPrefetchKeys = new Set<string>();
const navScrollStorageKey = "hrms-nav-scroll-top";
const notificationBadgePageSize = 25;

function getNavDataPrefetchKey(token: string, href: string): string {
  return `${token}:${href}`;
}

function prefetchNavTargetData(
  queryClient: QueryClient,
  token: string,
  href: string
): void {
  const key = getNavDataPrefetchKey(token, href);

  if (navDataPrefetchKeys.has(key)) {
    return;
  }

  navDataPrefetchKeys.add(key);
  prefetchNavData(queryClient, token, href);
}

export function AppShell({ user, token, children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const desktopNavRef = useRef<HTMLElement | null>(null);
  const mobileNavRef = useRef<HTMLElement | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [navFilter, setNavFilter] = useState("");
  const [headerSearch, setHeaderSearch] = useState("");
  const [isHeaderSearchOpen, setIsHeaderSearchOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const headerSearchRef = useRef<HTMLDivElement | null>(null);
  const [liveUnreadNotificationCount, setLiveUnreadNotificationCount] = useState<
    number | null
  >(null);
  const primaryRole = user.roles[0];
  const canReadNotifications = hasEveryPermission(user, ["notifications:read"]);
  const visibleNavItems = useMemo(
    () =>
      navItems.filter((item) =>
        item.permissionMode === "any"
          ? hasAnyPermission(user, item.permissions)
          : hasEveryPermission(user, item.permissions)
      ),
    [user]
  );
  const notificationsQuery = useQuery({
    queryKey: ["notifications", token, 1],
    queryFn: () =>
      listNotifications(token, {
        page: 1,
        pageSize: notificationBadgePageSize
      }),
    enabled: canReadNotifications,
    retry: false,
    staleTime: 5 * 60_000,
    refetchOnMount: false
  });
  const queryUnreadNotificationCount = notificationsQuery.data?.success
    ? notificationsQuery.data.data.unreadCount
    : 0;
  const unreadNotificationCount =
    liveUnreadNotificationCount ?? queryUnreadNotificationCount;
  const hasUnreadNotifications = unreadNotificationCount > 0;
  const unreadNotificationLabel =
    unreadNotificationCount > 99 ? "99+" : String(unreadNotificationCount);
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
  const filteredNavSections = useMemo<NavSection[]>(() => {
    const query = navFilter.trim().toLowerCase();

    if (!query) {
      return visibleNavSections;
    }

    return visibleNavSections
      .map((section) => ({
        label: section.label,
        items: section.items.filter((item) => item.label.toLowerCase().includes(query))
      }))
      .filter((section) => section.items.length > 0);
  }, [navFilter, visibleNavSections]);
  const headerSearchResults = useMemo(() => {
    const query = headerSearch.trim().toLowerCase();

    if (!query) {
      return [];
    }

    return visibleNavItems.filter((item) => item.href && item.label.toLowerCase().includes(query)).slice(0, 8);
  }, [headerSearch, visibleNavItems]);
  const breadcrumbSegments = useMemo(() => {
    const activeHref = pendingHref ?? pathname;
    const matchedItem = visibleNavItems.find(
      (item) => item.href && (activeHref === item.href || activeHref.startsWith(`${item.href}/`))
    );

    if (matchedItem) {
      return [matchedItem.section, matchedItem.label];
    }

    const fallback = activeHref
      .split("/")
      .filter(Boolean)
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "));

    return fallback.length > 0 ? fallback : ["Dashboard"];
  }, [pathname, pendingHref, visibleNavItems]);

  useEffect(() => {
    const preferredTheme = getPreferredTheme();

    setTheme(preferredTheme);
    applyTheme(preferredTheme);

    const storedCollapsed = window.localStorage.getItem("hrms-sidebar-collapsed");

    if (storedCollapsed === "true") {
      setIsSidebarCollapsed(true);
    }
  }, []);

  useEffect(() => {
    if (!isProfileMenuOpen) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  useEffect(() => {
    if (!isHeaderSearchOpen) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      if (!headerSearchRef.current?.contains(event.target as Node)) {
        setIsHeaderSearchOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isHeaderSearchOpen]);

  useEffect(() => {
    if (notificationsQuery.data?.success) {
      setLiveUnreadNotificationCount(notificationsQuery.data.data.unreadCount);
    }
  }, [notificationsQuery.data]);

  useEffect(() => {
    function handleUnreadCountUpdate(event: Event) {
      const detail = (event as CustomEvent<NotificationUnreadCountEventDetail>).detail;

      if (detail?.token !== token) {
        return;
      }

      setLiveUnreadNotificationCount(detail.unreadCount);
    }

    window.addEventListener(
      notificationUnreadCountEventName,
      handleUnreadCountUpdate
    );

    return () => {
      window.removeEventListener(
        notificationUnreadCountEventName,
        handleUnreadCountUpdate
      );
    };
  }, [token]);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  useEffect(() => {
    const storedScrollTop = window.sessionStorage.getItem(navScrollStorageKey);

    if (!storedScrollTop) {
      return;
    }

    const scrollTop = Number(storedScrollTop);

    if (!Number.isFinite(scrollTop)) {
      return;
    }

    window.requestAnimationFrame(() => {
      desktopNavRef.current?.scrollTo({ top: scrollTop });
      mobileNavRef.current?.scrollTo({ top: scrollTop });
    });
  }, [pathname, isMobileNavOpen]);

  function toggleTheme() {
    const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";

    setTheme(nextTheme);
    persistTheme(nextTheme);
    applyTheme(nextTheme);
  }

  function goToSearchResult(href: string) {
    rememberNavScroll();
    setPendingHref(href);
    prefetchRoute(href);
    router.push(href);
    setHeaderSearch("");
    setIsHeaderSearchOpen(false);
  }

  function toggleSidebar() {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;

      window.localStorage.setItem("hrms-sidebar-collapsed", String(next));

      return next;
    });
  }

  function prefetchRoute(href: string) {
    router.prefetch(href);
    prefetchNavTargetData(queryClient, token, href);
  }

  function rememberNavScroll() {
    const scrollTop = desktopNavRef.current?.scrollTop ?? mobileNavRef.current?.scrollTop ?? 0;

    window.sessionStorage.setItem(navScrollStorageKey, String(scrollTop));
  }

  async function signOut() {
    setIsSigningOut(true);
    await logout(token).catch((error: unknown) => {
      console.error(error);
    });
    clearAuthSession();
    queryClient.clear();
    router.push("/login");
  }

  function renderNavItems(items: NavItem[], collapsed = false) {
    const activePathname = pendingHref ?? pathname;

    return items.map((item) => {
      const Icon = item.icon;
      const active = item.href
        ? activePathname === item.href || activePathname.startsWith(`${item.href}/`)
        : false;
      const className = `group relative flex min-h-10 w-full min-w-0 items-center gap-3 rounded-xl px-3 text-sm transition-all duration-150 ${
        collapsed ? "justify-center px-0" : ""
      } ${
        active
          ? "bg-primary-50 font-semibold text-primary-700 dark:bg-primary-600/15 dark:text-primary-500"
          : "text-ink2-soft hover:translate-x-0.5 hover:bg-slate-100 hover:text-ink2 dark:hover:bg-white/5"
      }`;

      const href = item.href;
      const content = (
        <>
          {active ? (
            <span
              className="absolute inset-y-1 left-0 w-1 rounded-full bg-primary-600"
              aria-hidden="true"
            />
          ) : null}
          <Icon className="shrink-0" size={18} aria-hidden="true" />
          {collapsed ? null : <span className="min-w-0 truncate">{item.label}</span>}
        </>
      );

      if (href) {
        return (
          <Link
            key={item.label}
            className={className}
            href={href}
            prefetch={false}
            title={collapsed ? item.label : undefined}
            aria-current={active ? "page" : undefined}
            onFocus={() => prefetchRoute(href)}
            onPointerDown={() => prefetchRoute(href)}
            onPointerEnter={() => prefetchRoute(href)}
            onClick={() => {
              rememberNavScroll();
              setPendingHref(href);
              prefetchRoute(href);
              setIsMobileNavOpen(false);
            }}
          >
            {content}
          </Link>
        );
      }

      return (
        <button key={item.label} className={className} type="button" title={collapsed ? item.label : undefined} disabled>
          {content}
        </button>
      );
    });
  }

  function renderNavSections(collapsed = false) {
    if (filteredNavSections.length === 0) {
      return (
        <p className="px-3 text-sm text-ink2-soft">No matching menu items.</p>
      );
    }

    return filteredNavSections.map((section) => {
      return (
        <div className="space-y-1.5" key={section.label}>
          {collapsed ? (
            <div className="mx-3 h-px bg-edge dark:bg-white/10" aria-hidden="true" />
          ) : (
            <p className="px-3 text-xs font-semibold uppercase tracking-wide text-ink2-soft">
              {section.label}
            </p>
          )}
          <div className="space-y-1">{renderNavItems(section.items, collapsed)}</div>
        </div>
      );
    });
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-canvas text-ink2 dark:bg-[#070c16]">
      <aside
        className={`fixed inset-y-3 left-3 hidden flex-col overflow-hidden rounded-2xl border border-edge bg-white shadow-elevated transition-[width] duration-200 ease-out dark:border-white/10 dark:bg-[#0c1424] lg:flex ${
          isSidebarCollapsed ? "w-[76px]" : "w-[248px]"
        }`}
      >
        <div className="flex items-center gap-2 p-3">
          <Link
            href="/dashboard"
            className={`flex h-12 min-w-0 flex-1 items-center gap-3 rounded-xl bg-primary-600 px-3 text-white shadow-glow transition hover:bg-primary-700 ${
              isSidebarCollapsed ? "justify-center px-0" : ""
            }`}
            prefetch={false}
            onFocus={() => prefetchRoute("/dashboard")}
            onPointerDown={() => prefetchRoute("/dashboard")}
            onPointerEnter={() => prefetchRoute("/dashboard")}
            onClick={() => {
              rememberNavScroll();
              setPendingHref("/dashboard");
            }}
            aria-label="Go to dashboard"
          >
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/15">
              <LayoutDashboard size={18} aria-hidden="true" />
            </div>
            {isSidebarCollapsed ? null : (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold leading-tight">HRMS</p>
                <p className="truncate text-[11px] leading-tight text-white/70">
                  {user.companyName ?? "Organization"}
                </p>
              </div>
            )}
          </Link>
        </div>

        {isSidebarCollapsed ? null : (
          <div className="px-3 pb-2">
            <label className="relative block">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink2-soft"
                size={15}
                aria-hidden="true"
              />
              <input
                type="search"
                value={navFilter}
                onChange={(event) => setNavFilter(event.target.value)}
                placeholder="Search menu..."
                aria-label="Search navigation menu"
                className="w-full rounded-lg border border-edge bg-canvas py-1.5 pl-8 pr-2 text-xs text-ink2 outline-none transition placeholder:text-ink2-soft focus-visible:border-primary-600 focus-visible:ring-2 focus-visible:ring-primary-600/20 dark:border-white/10 dark:bg-white/5"
              />
            </label>
          </div>
        )}

        <nav
          ref={desktopNavRef}
          className="flex-1 space-y-5 overflow-y-auto px-2 pb-3 pt-1 animate-fade-in"
        >
          {renderNavSections(isSidebarCollapsed)}
        </nav>

        <div className="border-t border-edge p-2 dark:border-white/10">
          <button
            type="button"
            onClick={toggleSidebar}
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={`mb-1 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-ink2-soft transition hover:bg-slate-100 hover:text-ink2 dark:hover:bg-white/5 ${
              isSidebarCollapsed ? "justify-center" : ""
            }`}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen size={16} aria-hidden="true" />
            ) : (
              <>
                <PanelLeftClose size={16} aria-hidden="true" />
                <span>Collapse</span>
              </>
            )}
          </button>

          <Link
            href="/profile"
            className={`flex min-w-0 items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-slate-100 dark:hover:bg-white/5 ${
              isSidebarCollapsed ? "justify-center" : ""
            }`}
            prefetch={false}
            title={isSidebarCollapsed ? user.name : undefined}
            onFocus={() => prefetchRoute("/profile")}
            onPointerDown={() => prefetchRoute("/profile")}
            onPointerEnter={() => prefetchRoute("/profile")}
            onClick={() => {
              rememberNavScroll();
              setPendingHref("/profile");
            }}
          >
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-50 text-primary-700 dark:bg-primary-600/20 dark:text-primary-500">
              <UserCircle size={20} aria-hidden="true" />
            </div>
            {isSidebarCollapsed ? null : (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink2">{user.name}</p>
                <p className="truncate text-xs text-ink2-soft">{user.email}</p>
              </div>
            )}
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
          <aside className="relative flex h-full w-[min(20rem,calc(100vw-1rem))] max-w-[92vw] flex-col rounded-r-2xl border-r border-edge bg-white shadow-elevated dark:border-white/10 dark:bg-[#0c1424]">
            <div className="flex min-h-14 items-center justify-between gap-3 border-b border-edge px-4 dark:border-white/10">
              <Link
                href="/dashboard"
                className="flex min-w-0 items-center gap-3 rounded-lg"
                prefetch={false}
                onFocus={() => prefetchRoute("/dashboard")}
                onPointerDown={() => prefetchRoute("/dashboard")}
                onPointerEnter={() => prefetchRoute("/dashboard")}
                onClick={() => {
                  rememberNavScroll();
                  setPendingHref("/dashboard");
                  setIsMobileNavOpen(false);
                }}
                aria-label="Go to dashboard"
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-600 text-white">
                  <LayoutDashboard size={19} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink2">HRMS</p>
                  <p className="text-xs text-ink2-soft">{user.companyName ?? "Organization"}</p>
                </div>
              </Link>
              <button
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-edge text-ink2-soft transition hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/5"
                type="button"
                onClick={() => setIsMobileNavOpen(false)}
                aria-label="Close navigation"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="px-3 pt-3">
              <label className="relative block">
                <Search
                  className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink2-soft"
                  size={15}
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={navFilter}
                  onChange={(event) => setNavFilter(event.target.value)}
                  placeholder="Search menu..."
                  aria-label="Search navigation menu"
                  className="w-full rounded-lg border border-edge bg-canvas py-1.5 pl-8 pr-2 text-xs text-ink2 outline-none transition placeholder:text-ink2-soft focus-visible:border-primary-600 focus-visible:ring-2 focus-visible:ring-primary-600/20 dark:border-white/10 dark:bg-white/5"
                />
              </label>
            </div>
            <nav ref={mobileNavRef} className="space-y-5 overflow-y-auto p-3">{renderNavSections()}</nav>
          </aside>
        </div>
      ) : null}

      <section className={`min-w-0 transition-[padding] duration-200 ease-out ${isSidebarCollapsed ? "lg:pl-[92px]" : "lg:pl-[264px]"}`}>
        <header className="sticky top-0 z-20 border-b border-edge bg-canvas/92 px-3 py-2 backdrop-blur sm:px-5 sm:py-3 dark:border-white/10 dark:bg-[#070c16]/92">
          <div className="flex min-h-12 items-center justify-between gap-2 rounded-2xl border border-edge bg-white px-2 py-2 shadow-card sm:gap-3 sm:px-4 dark:border-white/10 dark:bg-[#0c1424]">
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              <button
                className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-edge text-ink2-soft transition hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/5 lg:hidden"
                type="button"
                onClick={() => setIsMobileNavOpen(true)}
                aria-label="Open navigation"
              >
                <Menu size={18} aria-hidden="true" />
              </button>

              <div className="min-w-0">
                <nav aria-label="Breadcrumb" className="hidden items-center gap-1 text-xs text-ink2-soft sm:flex">
                  {breadcrumbSegments.map((segment, index) => (
                    <span className="flex items-center gap-1" key={`${segment}-${index}`}>
                      {index > 0 ? <ChevronRight size={12} aria-hidden="true" /> : null}
                      <span className={index === breadcrumbSegments.length - 1 ? "font-medium text-ink2" : ""}>
                        {segment}
                      </span>
                    </span>
                  ))}
                </nav>
                <p className="truncate text-sm font-semibold text-ink2 sm:hidden">
                  {user.companyName ?? "Company Workspace"}
                </p>
              </div>

              <div className="relative ml-1 hidden max-w-sm flex-1 sm:block" ref={headerSearchRef}>
                <label className="relative block">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink2-soft"
                    size={15}
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={headerSearch}
                    onFocus={() => setIsHeaderSearchOpen(true)}
                    onChange={(event) => {
                      setHeaderSearch(event.target.value);
                      setIsHeaderSearchOpen(true);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && headerSearchResults[0]?.href) {
                        goToSearchResult(headerSearchResults[0].href);
                      }
                      if (event.key === "Escape") {
                        setIsHeaderSearchOpen(false);
                      }
                    }}
                    placeholder="Search pages..."
                    aria-label="Search pages"
                    className="w-full rounded-lg border border-edge bg-canvas py-2 pl-9 pr-3 text-sm text-ink2 outline-none transition placeholder:text-ink2-soft focus-visible:border-primary-600 focus-visible:ring-2 focus-visible:ring-primary-600/20 dark:border-white/10 dark:bg-white/5"
                  />
                </label>

                {isHeaderSearchOpen && headerSearchResults.length > 0 ? (
                  <div className="absolute left-0 top-full z-30 mt-2 w-full min-w-[16rem] overflow-hidden rounded-xl border border-edge bg-white py-1 shadow-elevated animate-fade-in dark:border-white/10 dark:bg-[#0c1424]">
                    {headerSearchResults.map((item) => {
                      const Icon = item.icon;

                      return (
                        <button
                          key={item.label}
                          type="button"
                          className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-ink2 transition hover:bg-slate-100 dark:hover:bg-white/5"
                          onClick={() => item.href && goToSearchResult(item.href)}
                        >
                          <Icon size={15} className="shrink-0 text-ink2-soft" aria-hidden="true" />
                          <span className="min-w-0 truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <button
                className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-edge bg-white text-ink2-soft shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-slate-100 hover:text-ink2 sm:h-9 sm:w-9 dark:border-white/10 dark:bg-[#0c1424] dark:hover:bg-white/5 dark:hover:text-white"
                type="button"
                onClick={toggleTheme}
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                aria-pressed={theme === "dark"}
                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                <Image
                  src={darkModeIcon}
                  alt=""
                  className="h-[18px] w-[18px] dark:brightness-0 dark:invert"
                  aria-hidden="true"
                />
              </button>
              <Link
                href="/notifications"
                className="relative grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-edge bg-white text-ink2-soft shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-slate-100 hover:text-ink2 sm:h-9 sm:w-9 dark:border-white/10 dark:bg-[#0c1424] dark:hover:bg-white/5 dark:hover:text-white"
                aria-label={
                  hasUnreadNotifications
                    ? `${unreadNotificationCount} unread notifications`
                    : "Notifications"
                }
                prefetch={false}
                onFocus={() => prefetchRoute("/notifications")}
                onPointerDown={() => prefetchRoute("/notifications")}
                onPointerEnter={() => prefetchRoute("/notifications")}
                onClick={() => {
                  rememberNavScroll();
                  setPendingHref("/notifications");
                }}
              >
                <Bell size={18} aria-hidden="true" />
                <span
                  className={`absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-danger px-1 text-[10px] font-semibold leading-none text-white shadow-sm transition-all duration-150 ${
                    hasUnreadNotifications
                      ? "scale-100 opacity-100"
                      : "pointer-events-none scale-50 opacity-0"
                  }`}
                  aria-hidden={!hasUnreadNotifications}
                  aria-live="polite"
                >
                  {hasUnreadNotifications ? unreadNotificationLabel : null}
                </span>
              </Link>

              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                  aria-haspopup="menu"
                  aria-expanded={isProfileMenuOpen}
                  className="flex h-10 shrink-0 items-center gap-2 rounded-lg border border-edge bg-white px-2 text-ink2-soft shadow-sm transition hover:bg-slate-100 hover:text-ink2 sm:h-9 dark:border-white/10 dark:bg-[#0c1424] dark:hover:bg-white/5 dark:hover:text-white"
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-50 text-primary-700 dark:bg-primary-600/20 dark:text-primary-500">
                    <UserCircle size={16} aria-hidden="true" />
                  </span>
                  <span className="hidden max-w-[9rem] truncate text-sm font-medium text-ink2 md:inline">
                    {user.name}
                  </span>
                  <ChevronDown size={14} aria-hidden="true" />
                </button>

                {isProfileMenuOpen ? (
                  <div
                    role="menu"
                    className="absolute right-0 top-full z-30 mt-2 w-60 overflow-hidden rounded-xl border border-edge bg-white py-1 shadow-elevated animate-fade-in dark:border-white/10 dark:bg-[#0c1424]"
                  >
                    <div className="border-b border-edge px-3 py-2.5 dark:border-white/10">
                      <p className="truncate text-sm font-semibold text-ink2">{user.name}</p>
                      <p className="truncate text-xs text-ink2-soft">
                        {primaryRole ? roleLabels[primaryRole] : "User"} · {user.email}
                      </p>
                    </div>
                    <Link
                      href="/profile"
                      role="menuitem"
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-ink2 transition hover:bg-slate-100 dark:hover:bg-white/5"
                      prefetch={false}
                      onClick={() => {
                        rememberNavScroll();
                        setPendingHref("/profile");
                        setIsProfileMenuOpen(false);
                      }}
                    >
                      <UserCircle size={16} className="text-ink2-soft" aria-hidden="true" />
                      View profile
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        signOut();
                      }}
                      disabled={isSigningOut}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-danger transition hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <LogOut size={16} aria-hidden="true" />
                      {isSigningOut ? "Signing out..." : "Sign out"}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-7xl px-3 pb-6 pt-3 sm:px-5 animate-fade-in">
          {children}
        </div>
      </section>

      <RealtimeNotifications token={token} />
      <HrAssistantWidget token={token} />
    </main>
  );
}
