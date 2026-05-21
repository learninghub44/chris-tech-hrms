"use client";

import { Plus, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { PaginationControls } from "@/components/pagination-controls";
import { ProtectedPage } from "@/components/protected-page";
import { QueryState } from "@/components/query-state";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  createPerformanceReview,
  getApiErrorMessage,
  getPaginationMeta,
  listPerformanceEmployees,
  listPerformanceReviews,
  updatePerformanceReviewStatus
} from "@/lib/api";
import { formatDate, getEmployeeName } from "@/lib/employee-format";
import { hasEveryPermission } from "@/lib/permissions";
import {
  formatRating,
  performanceReviewStatusLabels
} from "@/lib/performance-format";
import type { AuthUser, PerformanceReviewStatus } from "@/types";

type ReviewsContentProps = {
  user: AuthUser;
  token: string;
};

type ReviewFormValues = {
  employeeId: string;
  cycle: string;
  reviewPeriodStart: string;
  reviewPeriodEnd: string;
  rating: number;
  summary: string;
  strengths: string;
  improvements: string;
  status: PerformanceReviewStatus;
};

const reviewStatuses: PerformanceReviewStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "ACKNOWLEDGED"
];
const pageSize = 25;

function emptyToNull(value: string): string | null {
  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
}

function ReviewsContent({ user, token }: ReviewsContentProps) {
  const canManagePerformance = hasEveryPermission(user, ["performance:manage"]);
  const [employeeId, setEmployeeId] = useState("");
  const [status, setStatus] = useState<PerformanceReviewStatus | "">("");
  const [cycle, setCycle] = useState("");
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const debouncedCycle = useDebouncedValue(cycle.trim(), 300);

  useEffect(() => {
    setPage(1);
  }, [employeeId, status, debouncedCycle]);

  const employeesQuery = useQuery({
    queryKey: ["performance-employees", token, "reviews"],
    queryFn: () => listPerformanceEmployees(token, { pageSize: 100 }),
    retry: false
  });
  const reviewsQuery = useQuery({
    queryKey: ["performance-reviews", token, employeeId, status, debouncedCycle, page],
    queryFn: () =>
      listPerformanceReviews(token, {
        employeeId,
        status,
        cycle: debouncedCycle,
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
  const {
    formState: { isSubmitting },
    handleSubmit,
    register,
    reset
  } = useForm<ReviewFormValues>({
    defaultValues: {
      employeeId: "",
      cycle: "2026 H1",
      reviewPeriodStart: "2026-01-01",
      reviewPeriodEnd: "2026-06-30",
      rating: 3,
      summary: "",
      strengths: "",
      improvements: "",
      status: "SUBMITTED"
    }
  });

  async function submit(values: ReviewFormValues) {
    setMessage(null);
    const response = await createPerformanceReview(token, {
      employeeId: values.employeeId,
      reviewerId: null,
      cycle: values.cycle.trim(),
      reviewPeriodStart: values.reviewPeriodStart,
      reviewPeriodEnd: values.reviewPeriodEnd,
      rating: Number(values.rating),
      summary: values.summary.trim(),
      strengths: emptyToNull(values.strengths),
      improvements: emptyToNull(values.improvements),
      status: values.status
    }).catch(() => null);

    if (!response) {
      setMessage("Unable to reach the API");
      return;
    }

    if (!response.success) {
      setMessage(getApiErrorMessage(response));
      return;
    }

    setMessage("Performance review saved");
    reset();
    await reviewsQuery.refetch();
  }

  async function changeReviewStatus(
    reviewId: string,
    nextStatus: PerformanceReviewStatus
  ) {
    setMessage(null);
    const response = await updatePerformanceReviewStatus(token, reviewId, {
      status: nextStatus
    }).catch(() => null);

    if (!response) {
      setMessage("Unable to reach the API");
      return;
    }

    if (!response.success) {
      setMessage(getApiErrorMessage(response));
      return;
    }

    await reviewsQuery.refetch();
  }

  return (
    <AppShell user={user} token={token}>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-md bg-brand-50 text-brand-700">
            <Star size={22} aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-brand-700">Performance</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-ink">
              Performance Reviews
            </h1>
          </div>
        </div>

        <section className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
          {canManagePerformance ? (
            <form
              className="rounded-lg border border-line bg-white p-5 shadow-soft"
              onSubmit={handleSubmit(submit)}
            >
              <h2 className="text-lg font-semibold tracking-normal">New Review</h2>
              {message ? (
                <div className="mt-5 rounded-md border border-line bg-surface px-3 py-2 text-sm text-slate-700">
                  {message}
                </div>
              ) : null}
              <label className="mt-5 block text-sm font-medium text-slate-700">
                Employee
                <select
                  className="mt-2 h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-brand-600"
                  {...register("employeeId", { required: true })}
                >
                  <option value="">Select employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.employeeCode} - {getEmployeeName(employee)}
                    </option>
                  ))}
                </select>
              </label>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Cycle
                  <input
                    className="mt-2 h-11 w-full rounded-md border border-line px-3 text-sm outline-none transition focus:border-brand-600"
                    {...register("cycle", { required: true })}
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Rating
                  <input
                    className="mt-2 h-11 w-full rounded-md border border-line px-3 text-sm outline-none transition focus:border-brand-600"
                    max="5"
                    min="1"
                    type="number"
                    {...register("rating", { valueAsNumber: true })}
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Period start
                  <input
                    className="mt-2 h-11 w-full rounded-md border border-line px-3 text-sm outline-none transition focus:border-brand-600"
                    type="date"
                    {...register("reviewPeriodStart", { required: true })}
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Period end
                  <input
                    className="mt-2 h-11 w-full rounded-md border border-line px-3 text-sm outline-none transition focus:border-brand-600"
                    type="date"
                    {...register("reviewPeriodEnd", { required: true })}
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Status
                  <select
                    className="mt-2 h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-brand-600"
                    {...register("status")}
                  >
                    {reviewStatuses.map((reviewStatus) => (
                      <option key={reviewStatus} value={reviewStatus}>
                        {performanceReviewStatusLabels[reviewStatus]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="mt-5 block text-sm font-medium text-slate-700">
                Summary
                <textarea
                  className="mt-2 min-h-24 w-full rounded-md border border-line px-3 py-3 text-sm outline-none transition focus:border-brand-600"
                  {...register("summary", { required: true })}
                />
              </label>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Strengths
                  <textarea
                    className="mt-2 min-h-24 w-full rounded-md border border-line px-3 py-3 text-sm outline-none transition focus:border-brand-600"
                    {...register("strengths")}
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Improvements
                  <textarea
                    className="mt-2 min-h-24 w-full rounded-md border border-line px-3 py-3 text-sm outline-none transition focus:border-brand-600"
                    {...register("improvements")}
                  />
                </label>
              </div>
              <button
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={isSubmitting}
              >
                <Plus size={17} aria-hidden="true" />
                Save review
              </button>
            </form>
          ) : null}

          <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
            <div className="grid gap-3 lg:grid-cols-[1fr_160px_140px]">
              <select
                className="h-11 rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-brand-600"
                value={employeeId}
                onChange={(event) => setEmployeeId(event.target.value)}
                aria-label="Filter reviews by employee"
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
                aria-label="Filter reviews by cycle"
              />
              <select
                className="h-11 rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-brand-600"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as PerformanceReviewStatus | "")
                }
                aria-label="Filter reviews by status"
              >
                <option value="">All statuses</option>
                {reviewStatuses.map((reviewStatus) => (
                  <option key={reviewStatus} value={reviewStatus}>
                    {performanceReviewStatusLabels[reviewStatus]}
                  </option>
                ))}
              </select>
            </div>

            {reviewsQuery.isLoading || reviewsQuery.isError || reviews.length === 0 ? (
              <div className="mt-5">
                <QueryState
                  isLoading={reviewsQuery.isLoading}
                  isError={reviewsQuery.isError}
                  isEmpty={reviews.length === 0}
                  loadingLabel="Loading reviews..."
                  errorLabel="Unable to load reviews."
                  emptyLabel="No reviews found."
                />
              </div>
            ) : (
              <div className="mt-5 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-line bg-surface text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Employee</th>
                      <th className="px-4 py-3 font-semibold">Cycle</th>
                      <th className="px-4 py-3 font-semibold">Rating</th>
                      <th className="px-4 py-3 font-semibold">Reviewer</th>
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
                            {formatDate(review.reviewPeriodStart)} to{" "}
                            {formatDate(review.reviewPeriodEnd)}
                          </div>
                        </td>
                        <td className="px-4 py-4">{review.cycle}</td>
                        <td className="px-4 py-4">{formatRating(review.rating)}</td>
                        <td className="px-4 py-4">
                          {review.reviewer ? getEmployeeName(review.reviewer) : "Unassigned"}
                        </td>
                        <td className="px-4 py-4">
                          <select
                            className="h-9 rounded-md border border-line bg-white px-2 text-sm outline-none"
                            value={review.status}
                            disabled={!canManagePerformance}
                            onChange={(event) =>
                              changeReviewStatus(
                                review.id,
                                event.target.value as PerformanceReviewStatus
                              )
                            }
                          >
                            {reviewStatuses.map((reviewStatus) => (
                              <option key={reviewStatus} value={reviewStatus}>
                                {performanceReviewStatusLabels[reviewStatus]}
                              </option>
                            ))}
                          </select>
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
          </div>
        </section>
      </div>
    </AppShell>
  );
}

export default function PerformanceReviewsPage() {
  return (
    <ProtectedPage requiredPermissions={["performance:read"]}>
      {({ user, token }) => <ReviewsContent user={user} token={token} />}
    </ProtectedPage>
  );
}
