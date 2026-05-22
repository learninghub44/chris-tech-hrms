"use client";

import { BriefcaseBusiness, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { PaginationControls } from "@/components/pagination-controls";
import { ProtectedPage } from "@/components/protected-page";
import { QueryState } from "@/components/query-state";
import {
  createJob,
  getApiErrorMessage,
  getPaginationMeta,
  listDepartments,
  listDesignations,
  listJobs
} from "@/lib/api";
import { hasEveryPermission } from "@/lib/permissions";
import { jobStatusLabels } from "@/lib/recruitment-format";
import type { AuthUser, JobStatus } from "@/types";

type JobsContentProps = {
  user: AuthUser;
  token: string;
};

const pageSize = 25;

type JobFormValues = {
  title: string;
  description: string;
  departmentId: string;
  designationId: string;
  location: string;
  employmentType: string;
  status: JobStatus;
};

function emptyToNull(value: string): string | null {
  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
}

function JobsContent({ user, token }: JobsContentProps) {
  const canManageRecruitment = hasEveryPermission(user, ["recruitment:manage"]);
  const [status, setStatus] = useState<JobStatus | "">("");
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [status]);

  const jobsQuery = useQuery({
    queryKey: ["jobs", token, status, page],
    queryFn: () => listJobs(token, { status, page, pageSize }),
    retry: false
  });
  const departmentsQuery = useQuery({
    queryKey: ["departments", token, "jobs"],
    queryFn: () => listDepartments(token),
    retry: false
  });
  const designationsQuery = useQuery({
    queryKey: ["designations", token, "jobs"],
    queryFn: () => listDesignations(token),
    retry: false
  });
  const jobs = useMemo(
    () => (jobsQuery.data?.success ? jobsQuery.data.data.jobs : []),
    [jobsQuery.data]
  );
  const pagination = useMemo(
    () => (jobsQuery.data ? getPaginationMeta(jobsQuery.data) : null),
    [jobsQuery.data]
  );
  const departments = useMemo(
    () => (departmentsQuery.data?.success ? departmentsQuery.data.data.departments : []),
    [departmentsQuery.data]
  );
  const designations = useMemo(
    () => (designationsQuery.data?.success ? designationsQuery.data.data.designations : []),
    [designationsQuery.data]
  );
  const {
    formState: { isSubmitting },
    handleSubmit,
    register,
    reset,
    watch
  } = useForm<JobFormValues>({
    defaultValues: {
      title: "",
      description: "",
      departmentId: "",
      designationId: "",
      location: "",
      employmentType: "Full-time",
      status: "OPEN"
    }
  });
  const selectedDepartmentId = watch("departmentId");
  const filteredDesignations = selectedDepartmentId
    ? designations.filter((designation) => designation.departmentId === selectedDepartmentId)
    : designations;

  async function submit(values: JobFormValues) {
    setMessage(null);
    const response = await createJob(token, {
      title: values.title.trim(),
      description: values.description.trim(),
      departmentId: values.departmentId || null,
      designationId: values.designationId || null,
      location: emptyToNull(values.location),
      employmentType: emptyToNull(values.employmentType),
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

    setMessage("Job created");
    reset();
    await jobsQuery.refetch();
  }

  return (
    <AppShell user={user} token={token}>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-md bg-brand-50 text-brand-700">
              <BriefcaseBusiness size={22} aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-brand-700">Recruitment</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-normal text-ink">
                Jobs
              </h1>
            </div>
          </div>
          <select
            className="h-10 rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-brand-600"
            value={status}
            onChange={(event) => setStatus(event.target.value as JobStatus | "")}
            aria-label="Filter jobs by status"
          >
            <option value="">All statuses</option>
            {Object.entries(jobStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <section className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
          {canManageRecruitment ? (
            <form
              className="rounded-lg border border-line bg-white p-5 shadow-soft"
              onSubmit={handleSubmit(submit)}
            >
              <h2 className="text-lg font-semibold tracking-normal">Create Job</h2>
              {message ? (
                <div className="mt-5 rounded-md border border-line bg-surface px-3 py-2 text-sm text-slate-700">
                  {message}
                </div>
              ) : null}
              <label className="mt-5 block text-sm font-medium text-slate-700">
                Title
                <input
                  className="mt-2 h-11 w-full rounded-md border border-line px-3 text-sm outline-none transition focus:border-brand-600"
                  {...register("title", { required: true })}
                />
              </label>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Department
                  <select
                    className="mt-2 h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-brand-600"
                    {...register("departmentId")}
                  >
                    <option value="">Unassigned</option>
                    {departments.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Designation
                  <select
                    className="mt-2 h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-brand-600"
                    {...register("designationId")}
                  >
                    <option value="">Unassigned</option>
                    {filteredDesignations.map((designation) => (
                      <option key={designation.id} value={designation.id}>
                        {designation.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Location
                  <input
                    className="mt-2 h-11 w-full rounded-md border border-line px-3 text-sm outline-none transition focus:border-brand-600"
                    {...register("location")}
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Employment type
                  <input
                    className="mt-2 h-11 w-full rounded-md border border-line px-3 text-sm outline-none transition focus:border-brand-600"
                    {...register("employmentType")}
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Status
                  <select
                    className="mt-2 h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-brand-600"
                    {...register("status")}
                  >
                    {Object.entries(jobStatusLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="mt-5 block text-sm font-medium text-slate-700">
                Description
                <textarea
                  className="mt-2 min-h-32 w-full rounded-md border border-line px-3 py-3 text-sm outline-none transition focus:border-brand-600"
                  {...register("description", { required: true })}
                />
              </label>
              <button
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={isSubmitting}
              >
                <Plus size={17} aria-hidden="true" />
                Create job
              </button>
            </form>
          ) : null}

          <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
            <h2 className="text-lg font-semibold tracking-normal">Openings</h2>
            {jobsQuery.isLoading || jobsQuery.isError || jobs.length === 0 ? (
              <div className="mt-5">
                <QueryState
                  isLoading={jobsQuery.isLoading}
                  isError={jobsQuery.isError}
                  isEmpty={jobs.length === 0}
                  loadingLabel="Loading jobs..."
                  errorLabel="Unable to load jobs."
                  emptyLabel="No jobs found."
                />
              </div>
            ) : (
              <div className="mt-5 overflow-x-auto">
                <table className="min-w-[760px] w-full text-left text-sm">
                  <thead className="border-b border-line bg-surface text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Job</th>
                      <th className="px-4 py-3 font-semibold">Department</th>
                      <th className="px-4 py-3 font-semibold">Applications</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {jobs.map((job) => (
                      <tr key={job.id}>
                        <td className="px-4 py-4">
                          <Link
                            className="font-medium text-brand-700 hover:underline"
                            href={`/jobs/${job.id}`}
                          >
                            {job.title}
                          </Link>
                          <div className="mt-1 text-xs text-slate-500">
                            {job.location ?? "Location not set"}
                          </div>
                        </td>
                        <td className="px-4 py-4">{job.department?.name ?? "Unassigned"}</td>
                        <td className="px-4 py-4">{job.applications.length}</td>
                        <td className="px-4 py-4">{jobStatusLabels[job.status]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <PaginationControls
                  pagination={pagination}
                  onPageChange={setPage}
                  isFetching={jobsQuery.isFetching}
                />
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

export default function JobsPage() {
  return (
    <ProtectedPage requiredPermissions={["recruitment:read"]}>
      {({ user, token }) => <JobsContent user={user} token={token} />}
    </ProtectedPage>
  );
}
