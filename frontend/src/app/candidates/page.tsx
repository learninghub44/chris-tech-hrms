"use client";

import { Plus, Search, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { PaginationControls } from "@/components/pagination-controls";
import { ProtectedPage } from "@/components/protected-page";
import { QueryState } from "@/components/query-state";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  createCandidate,
  getApiErrorMessage,
  getPaginationMeta,
  listCandidates,
  listJobs
} from "@/lib/api";
import { hasEveryPermission } from "@/lib/permissions";
import { getCandidateName } from "@/lib/recruitment-format";
import type { AuthUser } from "@/types";

type CandidatesContentProps = {
  user: AuthUser;
  token: string;
};

const pageSize = 25;

type CandidateFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  source: string;
  resumeUrl: string;
  currentCompany: string;
  currentTitle: string;
  jobId: string;
  notes: string;
};

function emptyToNull(value: string): string | null {
  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
}

function CandidatesContent({ user, token }: CandidatesContentProps) {
  const canManageRecruitment = hasEveryPermission(user, ["recruitment:manage"]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const candidatesQuery = useQuery({
    queryKey: ["candidates", token, debouncedSearch, page],
    queryFn: () => listCandidates(token, { search: debouncedSearch, page, pageSize }),
    retry: false
  });
  const jobsQuery = useQuery({
    queryKey: ["jobs", token, "candidate-form"],
    queryFn: () => listJobs(token, { status: "OPEN", pageSize: 100 }),
    retry: false
  });
  const candidates = useMemo(
    () => (candidatesQuery.data?.success ? candidatesQuery.data.data.candidates : []),
    [candidatesQuery.data]
  );
  const jobs = useMemo(
    () => (jobsQuery.data?.success ? jobsQuery.data.data.jobs : []),
    [jobsQuery.data]
  );
  const pagination = useMemo(
    () => (candidatesQuery.data ? getPaginationMeta(candidatesQuery.data) : null),
    [candidatesQuery.data]
  );
  const {
    formState: { isSubmitting },
    handleSubmit,
    register,
    reset
  } = useForm<CandidateFormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      source: "",
      resumeUrl: "",
      currentCompany: "",
      currentTitle: "",
      jobId: "",
      notes: ""
    }
  });

  async function submit(values: CandidateFormValues) {
    setMessage(null);
    const response = await createCandidate(token, {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim().toLowerCase(),
      phone: emptyToNull(values.phone),
      source: emptyToNull(values.source),
      resumeUrl: emptyToNull(values.resumeUrl),
      currentCompany: emptyToNull(values.currentCompany),
      currentTitle: emptyToNull(values.currentTitle),
      jobId: values.jobId || null,
      notes: emptyToNull(values.notes)
    }).catch(() => null);

    if (!response) {
      setMessage("Unable to reach the API");
      return;
    }

    if (!response.success) {
      setMessage(getApiErrorMessage(response));
      return;
    }

    setMessage("Candidate created");
    reset();
    await candidatesQuery.refetch();
  }

  return (
    <AppShell user={user} token={token}>
      <div className="space-y-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-md bg-brand-50 text-brand-700">
            <Users size={22} aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-brand-700">Recruitment</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-ink">
              Candidates
            </h1>
          </div>
        </div>

        <section className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
          {canManageRecruitment ? (
            <form
              className="rounded-lg border border-line bg-white p-5 shadow-soft"
              onSubmit={handleSubmit(submit)}
            >
              <h2 className="text-lg font-semibold tracking-normal">Add Candidate</h2>
              {message ? (
                <div className="mt-5 rounded-md border border-line bg-surface px-3 py-2 text-sm text-slate-700">
                  {message}
                </div>
              ) : null}
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  First name
                  <input
                    className="mt-2 h-11 w-full rounded-md border border-line px-3 text-sm outline-none transition focus:border-brand-600"
                    {...register("firstName", { required: true })}
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Last name
                  <input
                    className="mt-2 h-11 w-full rounded-md border border-line px-3 text-sm outline-none transition focus:border-brand-600"
                    {...register("lastName", { required: true })}
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Email
                  <input
                    className="mt-2 h-11 w-full rounded-md border border-line px-3 text-sm outline-none transition focus:border-brand-600"
                    type="email"
                    {...register("email", { required: true })}
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Phone
                  <input
                    className="mt-2 h-11 w-full rounded-md border border-line px-3 text-sm outline-none transition focus:border-brand-600"
                    {...register("phone")}
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Source
                  <input
                    className="mt-2 h-11 w-full rounded-md border border-line px-3 text-sm outline-none transition focus:border-brand-600"
                    {...register("source")}
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Current title
                  <input
                    className="mt-2 h-11 w-full rounded-md border border-line px-3 text-sm outline-none transition focus:border-brand-600"
                    {...register("currentTitle")}
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Current company
                  <input
                    className="mt-2 h-11 w-full rounded-md border border-line px-3 text-sm outline-none transition focus:border-brand-600"
                    {...register("currentCompany")}
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Resume URL
                  <input
                    className="mt-2 h-11 w-full rounded-md border border-line px-3 text-sm outline-none transition focus:border-brand-600"
                    {...register("resumeUrl")}
                  />
                </label>
              </div>
              <label className="mt-5 block text-sm font-medium text-slate-700">
                Apply to job
                <select
                  className="mt-2 h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-brand-600"
                  {...register("jobId")}
                >
                  <option value="">No application</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="mt-5 block text-sm font-medium text-slate-700">
                Notes
                <textarea
                  className="mt-2 min-h-24 w-full rounded-md border border-line px-3 py-3 text-sm outline-none transition focus:border-brand-600"
                  {...register("notes")}
                />
              </label>
              <button
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={isSubmitting}
              >
                <Plus size={17} aria-hidden="true" />
                Create candidate
              </button>
            </form>
          ) : null}

          <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
            <label className="relative block text-sm font-medium text-slate-700">
              <span className="sr-only">Search candidates</span>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 text-slate-400"
                size={17}
                aria-hidden="true"
              />
              <input
                className="h-11 w-full rounded-md border border-line pl-10 pr-3 text-sm outline-none transition focus:border-brand-600"
                placeholder="Search candidates"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            {candidatesQuery.isLoading || candidatesQuery.isError || candidates.length === 0 ? (
              <div className="mt-5">
                <QueryState
                  isLoading={candidatesQuery.isLoading}
                  isError={candidatesQuery.isError}
                  isEmpty={candidates.length === 0}
                  loadingLabel="Loading candidates..."
                  errorLabel="Unable to load candidates."
                  emptyLabel="No candidates found."
                />
              </div>
            ) : (
              <div className="mt-5 overflow-x-auto">
                <table className="min-w-[760px] w-full text-left text-sm">
                  <thead className="border-b border-line bg-surface text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Candidate</th>
                      <th className="px-4 py-3 font-semibold">Current role</th>
                      <th className="px-4 py-3 font-semibold">Applications</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {candidates.map((candidate) => (
                      <tr key={candidate.id}>
                        <td className="px-4 py-4">
                          <Link
                            className="font-medium text-brand-700 hover:underline"
                            href={`/candidates/${candidate.id}`}
                          >
                            {getCandidateName(candidate)}
                          </Link>
                          <div className="mt-1 text-xs text-slate-500">{candidate.email}</div>
                        </td>
                        <td className="px-4 py-4">
                          {candidate.currentTitle ?? "Not set"}
                          <div className="mt-1 text-xs text-slate-500">
                            {candidate.currentCompany ?? "Company not set"}
                          </div>
                        </td>
                        <td className="px-4 py-4">{candidate.applications.length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <PaginationControls
                  pagination={pagination}
                  onPageChange={setPage}
                  isFetching={candidatesQuery.isFetching}
                />
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

export default function CandidatesPage() {
  return (
    <ProtectedPage requiredPermissions={["recruitment:read"]}>
      {({ user, token }) => <CandidatesContent user={user} token={token} />}
    </ProtectedPage>
  );
}
