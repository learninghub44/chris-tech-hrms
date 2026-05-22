"use client";

import { CalendarDays, Plus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { PaginationControls } from "@/components/pagination-controls";
import { ProtectedPage } from "@/components/protected-page";
import { QueryState } from "@/components/query-state";
import {
  createInterview,
  getApiErrorMessage,
  getPaginationMeta,
  listApplications,
  listEmployees,
  listInterviews,
  updateInterviewStatus
} from "@/lib/api";
import { getEmployeeName } from "@/lib/employee-format";
import { hasEveryPermission } from "@/lib/permissions";
import {
  applicationStatusLabels,
  getCandidateName,
  interviewModeLabels,
  interviewStatusLabels
} from "@/lib/recruitment-format";
import { formatDateTime } from "@/lib/time-format";
import type { AuthUser, InterviewMode, InterviewStatus } from "@/types";

type InterviewsContentProps = {
  user: AuthUser;
  token: string;
};

type InterviewFormValues = {
  applicationId: string;
  interviewerId: string;
  scheduledAt: string;
  mode: InterviewMode;
  location: string;
  status: InterviewStatus;
  feedback: string;
};

const interviewModes: InterviewMode[] = ["PHONE", "VIDEO", "IN_PERSON"];
const interviewStatuses: InterviewStatus[] = ["SCHEDULED", "COMPLETED", "CANCELLED"];
const pageSize = 25;

function emptyToNull(value: string): string | null {
  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
}

function getDefaultScheduledAt(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const timezoneOffsetMs = tomorrow.getTimezoneOffset() * 60_000;

  return new Date(tomorrow.getTime() - timezoneOffsetMs).toISOString().slice(0, 16);
}

function InterviewsContent({ user, token }: InterviewsContentProps) {
  const canManageRecruitment = hasEveryPermission(user, ["recruitment:manage"]);
  const [message, setMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const interviewsQuery = useQuery({
    queryKey: ["interviews", token, page],
    queryFn: () => listInterviews(token, { page, pageSize }),
    retry: false
  });
  const applicationsQuery = useQuery({
    queryKey: ["applications", token, "interview-form"],
    queryFn: () => listApplications(token, { pageSize: 100 }),
    retry: false
  });
  const employeesQuery = useQuery({
    queryKey: ["employees", token, "interviewers"],
    queryFn: () => listEmployees(token, { status: "ACTIVE", pageSize: 100 }),
    retry: false
  });
  const interviews = useMemo(
    () => (interviewsQuery.data?.success ? interviewsQuery.data.data.interviews : []),
    [interviewsQuery.data]
  );
  const applications = useMemo(
    () => (applicationsQuery.data?.success ? applicationsQuery.data.data.applications : []),
    [applicationsQuery.data]
  );
  const activeApplications = useMemo(
    () =>
      applications.filter(
        (application) => application.status !== "REJECTED" && application.status !== "HIRED"
      ),
    [applications]
  );
  const employees = useMemo(
    () => (employeesQuery.data?.success ? employeesQuery.data.data.employees : []),
    [employeesQuery.data]
  );
  const pagination = useMemo(
    () => (interviewsQuery.data ? getPaginationMeta(interviewsQuery.data) : null),
    [interviewsQuery.data]
  );
  const {
    formState: { isSubmitting },
    handleSubmit,
    register,
    reset
  } = useForm<InterviewFormValues>({
    defaultValues: {
      applicationId: "",
      interviewerId: "",
      scheduledAt: getDefaultScheduledAt(),
      mode: "VIDEO",
      location: "",
      status: "SCHEDULED",
      feedback: ""
    }
  });

  async function submit(values: InterviewFormValues) {
    setMessage(null);
    const response = await createInterview(token, {
      applicationId: values.applicationId,
      interviewerId: values.interviewerId || null,
      scheduledAt: new Date(values.scheduledAt).toISOString(),
      mode: values.mode,
      location: emptyToNull(values.location),
      status: values.status,
      feedback: emptyToNull(values.feedback)
    }).catch(() => null);

    if (!response) {
      setMessage("Unable to reach the API");
      return;
    }

    if (!response.success) {
      setMessage(getApiErrorMessage(response));
      return;
    }

    setMessage("Interview scheduled");
    reset({
      applicationId: "",
      interviewerId: "",
      scheduledAt: getDefaultScheduledAt(),
      mode: "VIDEO",
      location: "",
      status: "SCHEDULED",
      feedback: ""
    });
    await Promise.all([interviewsQuery.refetch(), applicationsQuery.refetch()]);
  }

  async function changeStatus(
    id: string,
    status: InterviewStatus,
    currentFeedback: string | null
  ) {
    setMessage(null);
    const feedbackInput =
      status === "COMPLETED" ? window.prompt("Interview feedback", currentFeedback ?? "") : null;
    const feedback = feedbackInput === null ? currentFeedback : emptyToNull(feedbackInput);
    const response = await updateInterviewStatus(token, id, {
      status,
      feedback
    }).catch(() => null);

    if (!response) {
      setMessage("Unable to reach the API");
      return;
    }

    if (!response.success) {
      setMessage(getApiErrorMessage(response));
      return;
    }

    await interviewsQuery.refetch();
  }

  return (
    <AppShell user={user} token={token}>
      <div className="space-y-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-md bg-brand-50 text-brand-700">
            <CalendarDays size={22} aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-brand-700">Recruitment</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-ink">
              Interviews
            </h1>
          </div>
        </div>

        <section className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
          {canManageRecruitment ? (
            <form
              className="rounded-lg border border-line bg-white p-5 shadow-soft"
              onSubmit={handleSubmit(submit)}
            >
              <h2 className="text-lg font-semibold tracking-normal">Schedule Interview</h2>
              {message ? (
                <div className="mt-5 rounded-md border border-line bg-surface px-3 py-2 text-sm text-slate-700">
                  {message}
                </div>
              ) : null}
              <label className="mt-5 block text-sm font-medium text-slate-700">
                Application
                <select
                  className="mt-2 h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-brand-600"
                  {...register("applicationId", { required: true })}
                >
                  <option value="">Select application</option>
                  {activeApplications.map((application) => (
                    <option key={application.id} value={application.id}>
                      {getCandidateName(application.candidate)} - {application.job.title}
                    </option>
                  ))}
                </select>
              </label>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Interviewer
                  <select
                    className="mt-2 h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-brand-600"
                    {...register("interviewerId")}
                  >
                    <option value="">Unassigned</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {getEmployeeName(employee)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Scheduled at
                  <input
                    className="mt-2 h-11 w-full rounded-md border border-line px-3 text-sm outline-none transition focus:border-brand-600"
                    type="datetime-local"
                    {...register("scheduledAt", { required: true })}
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Mode
                  <select
                    className="mt-2 h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-brand-600"
                    {...register("mode")}
                  >
                    {interviewModes.map((mode) => (
                      <option key={mode} value={mode}>
                        {interviewModeLabels[mode]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Status
                  <select
                    className="mt-2 h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-brand-600"
                    {...register("status")}
                  >
                    {interviewStatuses.map((status) => (
                      <option key={status} value={status}>
                        {interviewStatusLabels[status]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="mt-5 block text-sm font-medium text-slate-700">
                Location or link
                <input
                  className="mt-2 h-11 w-full rounded-md border border-line px-3 text-sm outline-none transition focus:border-brand-600"
                  {...register("location")}
                />
              </label>
              <label className="mt-5 block text-sm font-medium text-slate-700">
                Feedback
                <textarea
                  className="mt-2 min-h-24 w-full rounded-md border border-line px-3 py-3 text-sm outline-none transition focus:border-brand-600"
                  {...register("feedback")}
                />
              </label>
              <button
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={isSubmitting || activeApplications.length === 0}
              >
                <Plus size={17} aria-hidden="true" />
                Schedule interview
              </button>
            </form>
          ) : null}

          <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
            <h2 className="text-lg font-semibold tracking-normal">Interview Pipeline</h2>
            {interviewsQuery.isLoading || interviewsQuery.isError || interviews.length === 0 ? (
              <div className="mt-5">
                <QueryState
                  isLoading={interviewsQuery.isLoading}
                  isError={interviewsQuery.isError}
                  isEmpty={interviews.length === 0}
                  loadingLabel="Loading interviews..."
                  errorLabel="Unable to load interviews."
                  emptyLabel="No interviews found."
                />
              </div>
            ) : (
              <div className="mt-5 overflow-x-auto">
                <table className="min-w-[760px] w-full text-left text-sm">
                  <thead className="border-b border-line bg-surface text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Candidate</th>
                      <th className="px-4 py-3 font-semibold">Job</th>
                      <th className="px-4 py-3 font-semibold">Schedule</th>
                      <th className="px-4 py-3 font-semibold">Interviewer</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {interviews.map((interview) => (
                      <tr key={interview.id}>
                        <td className="px-4 py-4">
                          <Link
                            className="font-medium text-brand-700 hover:underline"
                            href={`/candidates/${interview.candidate.id}`}
                          >
                            {getCandidateName(interview.candidate)}
                          </Link>
                          <div className="mt-1 text-xs text-slate-500">
                            {interview.candidate.email}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Link
                            className="font-medium text-brand-700 hover:underline"
                            href={`/jobs/${interview.application.job.id}`}
                          >
                            {interview.application.job.title}
                          </Link>
                          <div className="mt-1 text-xs text-slate-500">
                            {applicationStatusLabels[interview.application.status]} |{" "}
                            {interviewModeLabels[interview.mode]}
                          </div>
                        </td>
                        <td className="px-4 py-4">{formatDateTime(interview.scheduledAt)}</td>
                        <td className="px-4 py-4">
                          {interview.interviewer ? getEmployeeName(interview.interviewer) : "Unassigned"}
                        </td>
                        <td className="px-4 py-4">
                          <select
                            className="h-9 rounded-md border border-line bg-white px-2 text-sm outline-none"
                            value={interview.status}
                            disabled={!canManageRecruitment}
                            onChange={(event) =>
                              changeStatus(
                                interview.id,
                                event.target.value as InterviewStatus,
                                interview.feedback
                              )
                            }
                          >
                            {interviewStatuses.map((status) => (
                              <option key={status} value={status}>
                                {interviewStatusLabels[status]}
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
                  isFetching={interviewsQuery.isFetching}
                />
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

export default function InterviewsPage() {
  return (
    <ProtectedPage requiredPermissions={["recruitment:read"]}>
      {({ user, token }) => <InterviewsContent user={user} token={token} />}
    </ProtectedPage>
  );
}
