"use client";

import { History, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { PaginationControls } from "@/components/pagination-controls";
import { ProtectedPage } from "@/components/protected-page";
import { QueryState } from "@/components/query-state";
import { StatusCard } from "@/components/status-card";
import {
  getPaginationMeta,
  listPerformanceEmployees,
  listPerformanceReviews
} from "@/lib/api";
import { formatDate, getEmployeeName } from "@/lib/employee-format";
import {
  formatRating,
  performanceReviewStatusLabels
} from "@/lib/performance-format";
import type { AuthUser } from "@/types";

type AppraisalsContentProps = {
  user: AuthUser;
  token: string;
};

const pageSize = 25;

function AppraisalsContent({ user, token }: AppraisalsContentProps) {
  const [employeeId, setEmployeeId] = useState("");
  const [cycle, setCycle] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [employeeId, cycle]);

  const employeesQuery = useQuery({
    queryKey: ["performance-employees", token, "appraisals"],
    queryFn: () => listPerformanceEmployees(token, { pageSize: 100 }),
    retry: false
  });
  const reviewsQuery = useQuery({
    queryKey: ["appraisals", token, employeeId, cycle, page],
    queryFn: () =>
      listPerformanceReviews(token, {
        employeeId,
        cycle: cycle.trim(),
        page,
        pageSize
      }),
    retry: false
  });
  const employees = useMemo(
    () => (employeesQuery.data?.success ? employeesQuery.data.data.employees : []),
    [employeesQuery.data]
  );
  const reviews = useMemo(
    () => (reviewsQuery.data?.success ? reviewsQuery.data.data.reviews : []),
    [reviewsQuery.data]
  );
  const pagination = useMemo(
    () => (reviewsQuery.data ? getPaginationMeta(reviewsQuery.data) : null),
    [reviewsQuery.data]
  );
  const averageRating = useMemo(() => {
    if (reviews.length === 0) {
      return "0/5";
    }

    const totalRating = reviews.reduce((total, review) => total + review.rating, 0);

    return `${(totalRating / reviews.length).toFixed(1)}/5`;
  }, [reviews]);
  const submittedReviews = reviews.filter((review) => review.status !== "DRAFT");

  return (
    <AppShell user={user} token={token}>
      <div className="space-y-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-md bg-brand-50 text-brand-700">
            <History size={22} aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-brand-700">Performance</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-ink">
              Appraisal History
            </h1>
          </div>
        </div>

        <section className="grid gap-4 sm:grid-cols-3">
          <StatusCard
            label="Reviews"
            value={String(reviews.length)}
            detail="Matching records"
            icon={History}
            tone="brand"
          />
          <StatusCard
            label="Submitted"
            value={String(submittedReviews.length)}
            detail="Ready for appraisal history"
            icon={Star}
            tone="blue"
          />
          <StatusCard
            label="Average Rating"
            value={averageRating}
            detail="Across matching reviews"
            icon={Star}
            tone="amber"
          />
        </section>

        <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              className="h-11 rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-brand-600"
              value={employeeId}
              onChange={(event) => setEmployeeId(event.target.value)}
              aria-label="Filter appraisals by employee"
            >
              <option value="">All employees</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {getEmployeeName(employee)}
                </option>
              ))}
            </select>
            <input
              className="h-11 rounded-md border border-line px-3 text-sm outline-none transition focus:border-brand-600"
              value={cycle}
              onChange={(event) => setCycle(event.target.value)}
              placeholder="Cycle"
              aria-label="Filter appraisals by cycle"
            />
          </div>

          {reviewsQuery.isLoading || reviewsQuery.isError || reviews.length === 0 ? (
            <div className="mt-5">
              <QueryState
                isLoading={reviewsQuery.isLoading}
                isError={reviewsQuery.isError}
                isEmpty={reviews.length === 0}
                loadingLabel="Loading appraisals..."
                errorLabel="Unable to load appraisals."
                emptyLabel="No appraisal records found."
              />
            </div>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-[760px] w-full text-left text-sm">
                <thead className="border-b border-line bg-surface text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Employee</th>
                    <th className="px-4 py-3 font-semibold">Cycle</th>
                    <th className="px-4 py-3 font-semibold">Period</th>
                    <th className="px-4 py-3 font-semibold">Rating</th>
                    <th className="px-4 py-3 font-semibold">Summary</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {reviews.map((review) => (
                    <tr key={review.id}>
                      <td className="px-4 py-4">
                        <div className="font-medium text-ink">
                          {getEmployeeName(review.employee)}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {review.reviewer ? getEmployeeName(review.reviewer) : "Unassigned reviewer"}
                        </div>
                      </td>
                      <td className="px-4 py-4">{review.cycle}</td>
                      <td className="px-4 py-4">
                        {formatDate(review.reviewPeriodStart)} to{" "}
                        {formatDate(review.reviewPeriodEnd)}
                      </td>
                      <td className="px-4 py-4">{formatRating(review.rating)}</td>
                      <td className="px-4 py-4">{review.summary}</td>
                      <td className="px-4 py-4">
                        {performanceReviewStatusLabels[review.status]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <PaginationControls
                pagination={pagination}
                onPageChange={setPage}
                isFetching={reviewsQuery.isFetching}
              />
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

export default function AppraisalsPage() {
  return (
    <ProtectedPage requiredPermissions={["performance:read"]}>
      {({ user, token }) => <AppraisalsContent user={user} token={token} />}
    </ProtectedPage>
  );
}
