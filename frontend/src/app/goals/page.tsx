"use client";

import { Plus, Target } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { PaginationControls } from "@/components/pagination-controls";
import { ProtectedPage } from "@/components/protected-page";
import { QueryState } from "@/components/query-state";
import {
  createGoal,
  getApiErrorMessage,
  getPaginationMeta,
  listGoals,
  listPerformanceEmployees,
  updateGoal
} from "@/lib/api";
import { formatDate, getEmployeeName } from "@/lib/employee-format";
import { hasEveryPermission } from "@/lib/permissions";
import { goalStatusLabels } from "@/lib/performance-format";
import type { AuthUser, GoalStatus } from "@/types";

type GoalsContentProps = {
  user: AuthUser;
  token: string;
};

type GoalFormValues = {
  employeeId: string;
  title: string;
  description: string;
  status: GoalStatus;
  progress: number;
  startDate: string;
  dueDate: string;
};

const goalStatuses: GoalStatus[] = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "COMPLETED",
  "BLOCKED"
];
const pageSize = 25;

function emptyToNull(value: string): string | null {
  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
}

function GoalsContent({ user, token }: GoalsContentProps) {
  const canManagePerformance = hasEveryPermission(user, ["performance:manage"]);
  const [employeeId, setEmployeeId] = useState("");
  const [status, setStatus] = useState<GoalStatus | "">("");
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [employeeId, status]);

  const employeesQuery = useQuery({
    queryKey: ["performance-employees", token, "goals"],
    queryFn: () => listPerformanceEmployees(token, { pageSize: 100 }),
    retry: false
  });
  const goalsQuery = useQuery({
    queryKey: ["goals", token, employeeId, status, page],
    queryFn: () =>
      listGoals(token, {
        employeeId,
        status,
        page,
        pageSize
      }),
    retry: false
  });
  const employees = useMemo(
    () => (employeesQuery.data?.success ? employeesQuery.data.data.employees : []),
    [employeesQuery.data]
  );
  const goals = useMemo(
    () => (goalsQuery.data?.success ? goalsQuery.data.data.goals : []),
    [goalsQuery.data]
  );
  const pagination = useMemo(
    () => (goalsQuery.data ? getPaginationMeta(goalsQuery.data) : null),
    [goalsQuery.data]
  );
  const {
    formState: { isSubmitting },
    handleSubmit,
    register,
    reset
  } = useForm<GoalFormValues>({
    defaultValues: {
      employeeId: "",
      title: "",
      description: "",
      status: "NOT_STARTED",
      progress: 0,
      startDate: "",
      dueDate: ""
    }
  });

  async function submit(values: GoalFormValues) {
    setMessage(null);
    const response = await createGoal(token, {
      employeeId: values.employeeId,
      title: values.title.trim(),
      description: emptyToNull(values.description),
      status: values.status,
      progress: Number(values.progress),
      startDate: values.startDate || null,
      dueDate: values.dueDate || null
    }).catch(() => null);

    if (!response) {
      setMessage("Unable to reach the API");
      return;
    }

    if (!response.success) {
      setMessage(getApiErrorMessage(response));
      return;
    }

    setMessage("Goal saved");
    reset();
    await goalsQuery.refetch();
  }

  async function changeGoalStatus(goalId: string, nextStatus: GoalStatus) {
    setMessage(null);
    const response = await updateGoal(token, goalId, {
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

    await goalsQuery.refetch();
  }

  async function changeGoalProgress(goalId: string, nextProgress: number) {
    setMessage(null);
    const response = await updateGoal(token, goalId, {
      progress: Math.max(0, Math.min(100, nextProgress))
    }).catch(() => null);

    if (!response) {
      setMessage("Unable to reach the API");
      return;
    }

    if (!response.success) {
      setMessage(getApiErrorMessage(response));
      return;
    }

    await goalsQuery.refetch();
  }

  return (
    <AppShell user={user} token={token}>
      <div className="space-y-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-md bg-brand-50 text-brand-700">
            <Target size={22} aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-brand-700">Performance</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-ink">
              Goals
            </h1>
          </div>
        </div>

        <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
          {canManagePerformance ? (
            <form
              className="rounded-lg border border-line bg-white p-5 shadow-soft"
              onSubmit={handleSubmit(submit)}
            >
              <h2 className="text-lg font-semibold tracking-normal">Create Goal</h2>
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
                Title
                <input
                  className="mt-2 h-11 w-full rounded-md border border-line px-3 text-sm outline-none transition focus:border-brand-600"
                  {...register("title", { required: true })}
                />
              </label>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Status
                  <select
                    className="mt-2 h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-brand-600"
                    {...register("status")}
                  >
                    {goalStatuses.map((goalStatus) => (
                      <option key={goalStatus} value={goalStatus}>
                        {goalStatusLabels[goalStatus]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Progress
                  <input
                    className="mt-2 h-11 w-full rounded-md border border-line px-3 text-sm outline-none transition focus:border-brand-600"
                    max="100"
                    min="0"
                    type="number"
                    {...register("progress", { valueAsNumber: true })}
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Start date
                  <input
                    className="mt-2 h-11 w-full rounded-md border border-line px-3 text-sm outline-none transition focus:border-brand-600"
                    type="date"
                    {...register("startDate")}
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Due date
                  <input
                    className="mt-2 h-11 w-full rounded-md border border-line px-3 text-sm outline-none transition focus:border-brand-600"
                    type="date"
                    {...register("dueDate")}
                  />
                </label>
              </div>
              <label className="mt-5 block text-sm font-medium text-slate-700">
                Description
                <textarea
                  className="mt-2 min-h-24 w-full rounded-md border border-line px-3 py-3 text-sm outline-none transition focus:border-brand-600"
                  {...register("description")}
                />
              </label>
              <button
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={isSubmitting}
              >
                <Plus size={17} aria-hidden="true" />
                Save goal
              </button>
            </form>
          ) : null}

          <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                className="h-11 rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-brand-600"
                value={employeeId}
                onChange={(event) => setEmployeeId(event.target.value)}
                aria-label="Filter goals by employee"
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
                value={status}
                onChange={(event) => setStatus(event.target.value as GoalStatus | "")}
                aria-label="Filter goals by status"
              >
                <option value="">All statuses</option>
                {goalStatuses.map((goalStatus) => (
                  <option key={goalStatus} value={goalStatus}>
                    {goalStatusLabels[goalStatus]}
                  </option>
                ))}
              </select>
            </div>

            {goalsQuery.isLoading || goalsQuery.isError || goals.length === 0 ? (
              <div className="mt-5">
                <QueryState
                  isLoading={goalsQuery.isLoading}
                  isError={goalsQuery.isError}
                  isEmpty={goals.length === 0}
                  loadingLabel="Loading goals..."
                  errorLabel="Unable to load goals."
                  emptyLabel="No goals found."
                />
              </div>
            ) : (
              <div className="mt-5 overflow-x-auto">
                <table className="min-w-[760px] w-full text-left text-sm">
                  <thead className="border-b border-line bg-surface text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Goal</th>
                      <th className="px-4 py-3 font-semibold">Employee</th>
                      <th className="px-4 py-3 font-semibold">Due</th>
                      <th className="px-4 py-3 font-semibold">Progress</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {goals.map((goal) => (
                      <tr key={goal.id}>
                        <td className="px-4 py-4">
                          <div className="font-medium text-ink">{goal.title}</div>
                          <div className="mt-1 text-xs text-slate-500">
                            {goal.description ?? "No description"}
                          </div>
                        </td>
                        <td className="px-4 py-4">{getEmployeeName(goal.employee)}</td>
                        <td className="px-4 py-4">{formatDate(goal.dueDate)}</td>
                        <td className="px-4 py-4">
                          {canManagePerformance ? (
                            <input
                              className="h-9 w-20 rounded-md border border-line px-2 text-sm outline-none"
                              defaultValue={goal.progress}
                              max="100"
                              min="0"
                              type="number"
                              onBlur={(event) =>
                                changeGoalProgress(goal.id, Number(event.target.value))
                              }
                              aria-label="Update goal progress"
                            />
                          ) : (
                            `${goal.progress}%`
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <select
                            className="h-9 rounded-md border border-line bg-white px-2 text-sm outline-none"
                            value={goal.status}
                            disabled={!canManagePerformance}
                            onChange={(event) =>
                              changeGoalStatus(goal.id, event.target.value as GoalStatus)
                            }
                          >
                            {goalStatuses.map((goalStatus) => (
                              <option key={goalStatus} value={goalStatus}>
                                {goalStatusLabels[goalStatus]}
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
                  isFetching={goalsQuery.isFetching}
                />
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

export default function GoalsPage() {
  return (
    <ProtectedPage requiredPermissions={["performance:read"]}>
      {({ user, token }) => <GoalsContent user={user} token={token} />}
    </ProtectedPage>
  );
}
