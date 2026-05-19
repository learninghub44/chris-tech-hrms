"use client";

import { BriefcaseBusiness, Check } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { ProtectedPage } from "@/components/protected-page";
import { getApiErrorMessage, getJob, updateApplicationStatus } from "@/lib/api";
import { formatDate } from "@/lib/employee-format";
import { hasEveryPermission } from "@/lib/permissions";
import {
  applicationStatusLabels,
  getCandidateName,
  jobStatusLabels
} from "@/lib/recruitment-format";
import type { ApplicationStatus, AuthUser } from "@/types";

type JobDetailContentProps = {
  user: AuthUser;
  token: string;
};

const nextStatuses: ApplicationStatus[] = [
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFERED",
  "HIRED",
  "REJECTED"
];

function JobDetailContent({ user, token }: JobDetailContentProps) {
  const params = useParams<{ id: string }>();
  const canManageRecruitment = hasEveryPermission(user, ["recruitment:manage"]);
  const [error, setError] = useState<string | null>(null);
  const jobQuery = useQuery({
    queryKey: ["job", token, params.id],
    queryFn: () => getJob(token, params.id),
    retry: false
  });
  const job = jobQuery.data?.success ? jobQuery.data.data.job : null;

  async function updateStatus(applicationId: string, status: ApplicationStatus) {
    setError(null);
    const response = await updateApplicationStatus(token, applicationId, {
      status,
      notes: null
    }).catch(() => null);

    if (!response) {
      setError("Unable to reach the API");
      return;
    }

    if (!response.success) {
      setError(getApiErrorMessage(response));
      return;
    }

    await jobQuery.refetch();
  }

  return (
    <AppShell user={user} token={token}>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-md bg-brand-50 text-brand-700">
            <BriefcaseBusiness size={22} aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-brand-700">Recruitment</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-ink">
              {job?.title ?? "Job Detail"}
            </h1>
          </div>
        </div>

        {job ? (
          <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-md bg-surface px-4 py-3">
                <p className="text-xs font-medium uppercase text-slate-500">Status</p>
                <p className="mt-2 font-semibold text-ink">{jobStatusLabels[job.status]}</p>
              </div>
              <div className="rounded-md bg-surface px-4 py-3">
                <p className="text-xs font-medium uppercase text-slate-500">Department</p>
                <p className="mt-2 font-semibold text-ink">
                  {job.department?.name ?? "Unassigned"}
                </p>
              </div>
              <div className="rounded-md bg-surface px-4 py-3">
                <p className="text-xs font-medium uppercase text-slate-500">Location</p>
                <p className="mt-2 font-semibold text-ink">{job.location ?? "Not set"}</p>
              </div>
              <div className="rounded-md bg-surface px-4 py-3">
                <p className="text-xs font-medium uppercase text-slate-500">Applications</p>
                <p className="mt-2 font-semibold text-ink">{job.applications.length}</p>
              </div>
            </div>
            <p className="mt-5 whitespace-pre-line text-sm leading-6 text-slate-700">
              {job.description}
            </p>
          </section>
        ) : null}

        <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-lg font-semibold tracking-normal">Applications</h2>
            {error ? <p className="text-sm text-red-700">{error}</p> : null}
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-line bg-surface text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Candidate</th>
                  <th className="px-4 py-3 font-semibold">Applied</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Move</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {(job?.applications ?? []).map((application) => (
                  <tr key={application.id}>
                    <td className="px-4 py-4">
                      <Link
                        className="font-medium text-brand-700 hover:underline"
                        href={`/candidates/${application.candidate.id}`}
                      >
                        {getCandidateName(application.candidate)}
                      </Link>
                      <div className="mt-1 text-xs text-slate-500">
                        {application.candidate.email}
                      </div>
                    </td>
                    <td className="px-4 py-4">{formatDate(application.appliedAt)}</td>
                    <td className="px-4 py-4">
                      {applicationStatusLabels[application.status]}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <select
                          className="h-9 rounded-md border border-line bg-white px-2 text-sm outline-none"
                          defaultValue={application.status}
                          disabled={!canManageRecruitment}
                          onChange={(event) =>
                            updateStatus(application.id, event.target.value as ApplicationStatus)
                          }
                        >
                          {nextStatuses.map((status) => (
                            <option key={status} value={status}>
                              {applicationStatusLabels[status]}
                            </option>
                          ))}
                        </select>
                        <Check size={16} className="text-slate-400" aria-hidden="true" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

export default function JobDetailPage() {
  return (
    <ProtectedPage requiredPermissions={["recruitment:read"]}>
      {({ user, token }) => <JobDetailContent user={user} token={token} />}
    </ProtectedPage>
  );
}
