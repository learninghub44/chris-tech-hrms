"use client";

import { Clock3, LogIn, LogOut } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { PaginationControls } from "@/components/pagination-controls";
import { ProtectedPage } from "@/components/protected-page";
import {
  clockIn,
  clockOut,
  getApiErrorMessage,
  getPaginationMeta,
  getMyAttendance
} from "@/lib/api";
import { formatDate } from "@/lib/employee-format";
import {
  attendanceStatusLabels,
  attendanceWorkModeLabels,
  formatDateTime,
  getMonthStartInputValue,
  getTodayInputValue
} from "@/lib/time-format";
import type { AttendanceWorkMode, AuthUser } from "@/types";

type AttendanceContentProps = {
  user: AuthUser;
  token: string;
};

type AttendanceFormValues = {
  workMode: AttendanceWorkMode;
  notes: string;
};

const pageSize = 25;

function AttendanceContent({ user, token }: AttendanceContentProps) {
  const [error, setError] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState(getMonthStartInputValue());
  const [dateTo, setDateTo] = useState(getTodayInputValue());
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [dateFrom, dateTo]);

  const attendanceQuery = useQuery({
    queryKey: ["my-attendance", token, dateFrom, dateTo, page],
    queryFn: () => getMyAttendance(token, { dateFrom, dateTo, page, pageSize }),
    retry: false
  });
  const {
    formState: { isSubmitting },
    handleSubmit,
    register
  } = useForm<AttendanceFormValues>({
    defaultValues: {
      workMode: "OFFICE",
      notes: ""
    }
  });
  const attendance = attendanceQuery.data?.success
    ? attendanceQuery.data.data.attendance
    : [];
  const todayAttendance = attendanceQuery.data?.success
    ? attendanceQuery.data.data.todayAttendance
    : null;
  const pagination = useMemo(
    () => (attendanceQuery.data ? getPaginationMeta(attendanceQuery.data) : null),
    [attendanceQuery.data]
  );

  async function submitClockIn(values: AttendanceFormValues) {
    setError(null);
    const response = await clockIn(token, {
      workMode: values.workMode,
      notes: values.notes.trim() || null
    }).catch(() => null);

    if (!response) {
      setError("Unable to reach the API");
      return;
    }

    if (!response.success) {
      setError(getApiErrorMessage(response));
      return;
    }

    void attendanceQuery.refetch();
  }

  async function submitClockOut() {
    setError(null);
    const response = await clockOut(token, { notes: null }).catch(() => null);

    if (!response) {
      setError("Unable to reach the API");
      return;
    }

    if (!response.success) {
      setError(getApiErrorMessage(response));
      return;
    }

    void attendanceQuery.refetch();
  }

  return (
    <AppShell user={user} token={token}>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-primary">Attendance</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink2">
            My Attendance
          </h1>
        </div>

        <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <form
            className="rounded-2xl border border-edge bg-white p-5 shadow-card"
            onSubmit={handleSubmit(submitClockIn)}
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-50 text-primary-700">
                <Clock3 size={20} aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-ink2">Today</h2>
                <p className="text-sm text-ink2-soft">{formatDate(getTodayInputValue())}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-canvas px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-ink2-soft">Clock in</p>
                <p className="mt-1 text-sm font-medium text-ink2">
                  {formatDateTime(todayAttendance?.clockInAt ?? null)}
                </p>
              </div>
              <div className="rounded-xl bg-canvas px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-ink2-soft">Clock out</p>
                <p className="mt-1 text-sm font-medium text-ink2">
                  {formatDateTime(todayAttendance?.clockOutAt ?? null)}
                </p>
              </div>
              <div className="rounded-xl bg-canvas px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-ink2-soft">Status</p>
                <p className="mt-1 text-sm font-medium text-ink2">
                  {todayAttendance
                    ? attendanceStatusLabels[todayAttendance.status]
                    : "Not marked"}
                </p>
              </div>
              <div className="rounded-xl bg-canvas px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-ink2-soft">Mode</p>
                <p className="mt-1 text-sm font-medium text-ink2">
                  {todayAttendance
                    ? attendanceWorkModeLabels[todayAttendance.workMode]
                    : "Not set"}
                </p>
              </div>
            </div>

            {error ? (
              <div className="mt-5 rounded-2xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
                {error}
              </div>
            ) : null}

            <div className="mt-5 grid gap-3 sm:grid-cols-[180px_1fr]">
              <select
                className="h-11 rounded-xl border border-edge bg-white px-3 text-sm text-ink2 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                disabled={Boolean(todayAttendance?.clockInAt)}
                {...register("workMode")}
              >
                <option value="OFFICE">Office</option>
                <option value="WORK_FROM_HOME">Work from home</option>
              </select>
              <input
                className="h-11 rounded-xl border border-edge bg-white px-3 text-sm text-ink2 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                placeholder="Notes"
                disabled={Boolean(todayAttendance?.clockInAt)}
                {...register("notes")}
              />
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-glow transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={isSubmitting || Boolean(todayAttendance?.clockInAt)}
              >
                <LogIn size={17} aria-hidden="true" />
                Clock in
              </button>
              <button
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-edge bg-white px-4 text-sm font-semibold text-ink2-soft transition hover:border-primary/40 hover:bg-primary-50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                onClick={submitClockOut}
                disabled={!todayAttendance?.clockInAt || Boolean(todayAttendance.clockOutAt)}
              >
                <LogOut size={17} aria-hidden="true" />
                Clock out
              </button>
            </div>
          </form>

          <div className="rounded-2xl border border-edge bg-white p-5 shadow-card">
            <h2 className="text-lg font-semibold tracking-tight text-ink2">History</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <input
                className="h-11 rounded-xl border border-edge bg-white px-3 text-sm text-ink2 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                type="date"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
              />
              <input
                className="h-11 rounded-xl border border-edge bg-white px-3 text-sm text-ink2 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                type="date"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
              />
            </div>
            <div className="mt-5 overflow-x-auto rounded-2xl border border-edge">
              <table className="min-w-[760px] w-full text-left text-sm">
                <thead className="border-b border-edge bg-canvas text-xs uppercase tracking-wide text-ink2-soft">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Clock in</th>
                    <th className="px-4 py-3 font-semibold">Clock out</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-edge">
                  {attendance.map((record) => (
                    <tr key={record.id} className="text-ink2 transition hover:bg-canvas/60">
                      <td className="px-4 py-3">{formatDate(record.date)}</td>
                      <td className="px-4 py-3">{attendanceStatusLabels[record.status]}</td>
                      <td className="px-4 py-3">{formatDateTime(record.clockInAt)}</td>
                      <td className="px-4 py-3">{formatDateTime(record.clockOutAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <PaginationControls
              pagination={pagination}
              onPageChange={setPage}
              isFetching={attendanceQuery.isFetching}
            />
          </div>
        </section>
      </div>
    </AppShell>
  );
}

export default function AttendancePage() {
  return (
    <ProtectedPage requiredPermissions={["attendance:write"]}>
      {({ user, token }) => <AttendanceContent user={user} token={token} />}
    </ProtectedPage>
  );
}
