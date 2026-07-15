import { Users, Clock, Wallet, TrendingUp, Bell, Search } from "lucide-react";

const stats = [
  { label: "Active employees", value: "248", change: "+12 this month", icon: Users },
  { label: "On time today", value: "96%", change: "+2.1%", icon: Clock },
  { label: "Payroll processed", value: "KES 4.2M", change: "On schedule", icon: Wallet }
];

const attendanceBars = [62, 74, 58, 88, 71, 95, 40];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const recentActivity = [
  { name: "Amina Chege", action: "submitted a leave request", time: "2m ago" },
  { name: "David Otieno", action: "clocked in — Nairobi HQ", time: "14m ago" },
  { name: "Grace Wafula", action: "payslip approved", time: "1h ago" }
];

export function DashboardPreview() {
  return (
    <div className="relative">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft">
        {/* window chrome */}
        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <div className="ml-3 flex items-center gap-2 rounded-md bg-white px-3 py-1 text-xs text-ink/40 ring-1 ring-slate-200">
            <Search className="h-3 w-3" aria-hidden />
            app.christech.co.ke/dashboard
          </div>
          <Bell className="ml-auto h-4 w-4 text-ink/30" aria-hidden />
        </div>

        <div className="flex">
          {/* sidebar */}
          <div className="hidden w-36 shrink-0 border-r border-slate-200 bg-slate-50/60 p-3 sm:block">
            <div className="space-y-1">
              {["Dashboard", "Employees", "Attendance", "Leave", "Payroll", "Reports"].map((item, i) => (
                <div
                  key={item}
                  className={`rounded-md px-2.5 py-1.5 text-[11px] font-medium ${
                    i === 0 ? "bg-ct-blue/10 text-ct-blue" : "text-ink/45"
                  }`}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* main panel */}
          <div className="flex-1 p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-ct-graphite">Overview</p>
              <span className="rounded-md border border-slate-200 px-2 py-1 text-[10px] font-medium text-ink/50">
                This week
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center justify-between">
                    <stat.icon className="h-3.5 w-3.5 text-ct-blue" aria-hidden />
                  </div>
                  <p className="mt-2 text-lg font-semibold text-ct-graphite">{stat.value}</p>
                  <p className="text-[11px] text-ink/45">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-lg border border-slate-200 p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-ct-graphite">Attendance trend</p>
                <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                  <TrendingUp className="h-3 w-3" aria-hidden />
                  Stable
                </span>
              </div>
              <div className="mt-3 flex h-16 items-end gap-2">
                {attendanceBars.map((h, i) => (
                  <div key={days[i]} className="flex flex-1 flex-col items-center gap-1">
                    <div className="w-full rounded-t bg-ct-blue/70" style={{ height: `${h}%` }} />
                    <span className="text-[9px] text-ink/35">{days[i]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-slate-200 p-3">
              <p className="text-xs font-semibold text-ct-graphite">Recent activity</p>
              <div className="mt-2 space-y-2">
                {recentActivity.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-[11px]">
                    <p className="text-ink/60">
                      <span className="font-medium text-ct-graphite">{item.name}</span> {item.action}
                    </p>
                    <span className="shrink-0 text-ink/35">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* small floating status chip, understated */}
      <div className="absolute -bottom-4 -left-4 hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 shadow-soft sm:flex">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        <p className="text-xs font-medium text-ct-graphite">Payroll run completed</p>
      </div>
    </div>
  );
}
