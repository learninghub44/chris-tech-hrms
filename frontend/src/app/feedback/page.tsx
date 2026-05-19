"use client";

import { MessageSquare, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { ProtectedPage } from "@/components/protected-page";
import { QueryState } from "@/components/query-state";
import {
  createFeedbackRecord,
  getApiErrorMessage,
  listFeedbackRecords,
  listPerformanceEmployees
} from "@/lib/api";
import { getEmployeeName } from "@/lib/employee-format";
import { hasEveryPermission } from "@/lib/permissions";
import { feedbackCategoryLabels } from "@/lib/performance-format";
import { formatDateTime } from "@/lib/time-format";
import type { AuthUser, FeedbackCategory } from "@/types";

type FeedbackContentProps = {
  user: AuthUser;
  token: string;
};

type FeedbackFormValues = {
  employeeId: string;
  category: FeedbackCategory;
  message: string;
  isPrivate: boolean;
};

const feedbackCategories: FeedbackCategory[] = ["GENERAL", "PRAISE", "IMPROVEMENT"];

function FeedbackContent({ user, token }: FeedbackContentProps) {
  const canManagePerformance = hasEveryPermission(user, ["performance:manage"]);
  const [employeeId, setEmployeeId] = useState("");
  const [category, setCategory] = useState<FeedbackCategory | "">("");
  const [message, setMessage] = useState<string | null>(null);
  const employeesQuery = useQuery({
    queryKey: ["performance-employees", token, "feedback"],
    queryFn: () => listPerformanceEmployees(token, {}),
    retry: false
  });
  const feedbackQuery = useQuery({
    queryKey: ["feedback", token, employeeId, category],
    queryFn: () =>
      listFeedbackRecords(token, {
        employeeId,
        category
      }),
    retry: false
  });
  const employees = useMemo(
    () => (employeesQuery.data?.success ? employeesQuery.data.data.employees : []),
    [employeesQuery.data]
  );
  const feedbackRecords = useMemo(
    () => (feedbackQuery.data?.success ? feedbackQuery.data.data.feedback : []),
    [feedbackQuery.data]
  );
  const {
    formState: { isSubmitting },
    handleSubmit,
    register,
    reset
  } = useForm<FeedbackFormValues>({
    defaultValues: {
      employeeId: "",
      category: "GENERAL",
      message: "",
      isPrivate: false
    }
  });

  async function submit(values: FeedbackFormValues) {
    setMessage(null);
    const response = await createFeedbackRecord(token, {
      employeeId: values.employeeId,
      category: values.category,
      message: values.message.trim(),
      isPrivate: values.isPrivate
    }).catch(() => null);

    if (!response) {
      setMessage("Unable to reach the API");
      return;
    }

    if (!response.success) {
      setMessage(getApiErrorMessage(response));
      return;
    }

    setMessage("Feedback saved");
    reset();
    await feedbackQuery.refetch();
  }

  return (
    <AppShell user={user} token={token}>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-md bg-brand-50 text-brand-700">
            <MessageSquare size={22} aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-brand-700">Performance</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-ink">
              Feedback
            </h1>
          </div>
        </div>

        <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
          {canManagePerformance ? (
            <form
              className="rounded-lg border border-line bg-white p-5 shadow-soft"
              onSubmit={handleSubmit(submit)}
            >
              <h2 className="text-lg font-semibold tracking-normal">Add Feedback</h2>
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
              <label className="mt-5 block text-sm font-medium text-slate-700">
                Category
                <select
                  className="mt-2 h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-brand-600"
                  {...register("category")}
                >
                  {feedbackCategories.map((feedbackCategory) => (
                    <option key={feedbackCategory} value={feedbackCategory}>
                      {feedbackCategoryLabels[feedbackCategory]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="mt-5 block text-sm font-medium text-slate-700">
                Message
                <textarea
                  className="mt-2 min-h-32 w-full rounded-md border border-line px-3 py-3 text-sm outline-none transition focus:border-brand-600"
                  {...register("message", { required: true })}
                />
              </label>
              <label className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                <input type="checkbox" {...register("isPrivate")} />
                Private feedback
              </label>
              <button
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={isSubmitting}
              >
                <Plus size={17} aria-hidden="true" />
                Save feedback
              </button>
            </form>
          ) : null}

          <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                className="h-11 rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-brand-600"
                value={employeeId}
                onChange={(event) => setEmployeeId(event.target.value)}
                aria-label="Filter feedback by employee"
              >
                <option value="">All employees</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {getEmployeeName(employee)}
                  </option>
                ))}
              </select>
              <select
                className="h-11 rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-brand-600"
                value={category}
                onChange={(event) => setCategory(event.target.value as FeedbackCategory | "")}
                aria-label="Filter feedback by category"
              >
                <option value="">All categories</option>
                {feedbackCategories.map((feedbackCategory) => (
                  <option key={feedbackCategory} value={feedbackCategory}>
                    {feedbackCategoryLabels[feedbackCategory]}
                  </option>
                ))}
              </select>
            </div>

            {feedbackQuery.isLoading || feedbackQuery.isError || feedbackRecords.length === 0 ? (
              <div className="mt-5">
                <QueryState
                  isLoading={feedbackQuery.isLoading}
                  isError={feedbackQuery.isError}
                  isEmpty={feedbackRecords.length === 0}
                  loadingLabel="Loading feedback..."
                  errorLabel="Unable to load feedback."
                  emptyLabel="No feedback found."
                />
              </div>
            ) : (
              <div className="mt-5 divide-y divide-line">
                {feedbackRecords.map((feedback) => (
                  <article key={feedback.id} className="py-4">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                      <div>
                        <p className="font-semibold text-ink">
                          {getEmployeeName(feedback.employee)}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">{feedback.message}</p>
                      </div>
                      <span className="rounded-md bg-surface px-2 py-1 text-xs font-medium text-slate-600">
                        {feedbackCategoryLabels[feedback.category]}
                      </span>
                    </div>
                    <p className="mt-3 text-xs text-slate-500">
                      {feedback.author ? getEmployeeName(feedback.author) : "System"} |{" "}
                      {formatDateTime(feedback.createdAt)}
                      {feedback.isPrivate ? " | Private" : ""}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

export default function FeedbackPage() {
  return (
    <ProtectedPage requiredPermissions={["performance:read"]}>
      {({ user, token }) => <FeedbackContent user={user} token={token} />}
    </ProtectedPage>
  );
}
