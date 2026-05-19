"use client";

import { Plus, Send } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { ProtectedPage } from "@/components/protected-page";
import { QueryState } from "@/components/query-state";
import {
  createOffer,
  getApiErrorMessage,
  listApplications,
  listOffers,
  updateOfferStatus
} from "@/lib/api";
import { formatDate } from "@/lib/employee-format";
import { formatMoney } from "@/lib/payroll-format";
import { hasEveryPermission } from "@/lib/permissions";
import {
  applicationStatusLabels,
  getCandidateName,
  offerStatusLabels
} from "@/lib/recruitment-format";
import type { AuthUser, OfferStatus } from "@/types";

type OffersContentProps = {
  user: AuthUser;
  token: string;
};

type OfferFormValues = {
  applicationId: string;
  offeredSalary: string;
  startDate: string;
  status: OfferStatus;
  notes: string;
};

const offerStatuses: OfferStatus[] = ["DRAFT", "SENT", "ACCEPTED", "DECLINED"];

function emptyToNull(value: string): string | null {
  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
}

function toNullableNumber(value: string): number | null {
  const trimmedValue = value.trim();

  if (trimmedValue.length === 0) {
    return null;
  }

  return Number(trimmedValue);
}

function OffersContent({ user, token }: OffersContentProps) {
  const canManageRecruitment = hasEveryPermission(user, ["recruitment:manage"]);
  const [message, setMessage] = useState<string | null>(null);
  const offersQuery = useQuery({
    queryKey: ["offers", token],
    queryFn: () => listOffers(token),
    retry: false
  });
  const applicationsQuery = useQuery({
    queryKey: ["applications", token, "offer-form"],
    queryFn: () => listApplications(token),
    retry: false
  });
  const offers = useMemo(
    () => (offersQuery.data?.success ? offersQuery.data.data.offers : []),
    [offersQuery.data]
  );
  const applications = useMemo(
    () => (applicationsQuery.data?.success ? applicationsQuery.data.data.applications : []),
    [applicationsQuery.data]
  );
  const availableApplications = useMemo(
    () =>
      applications.filter(
        (application) =>
          application.offers.length === 0 &&
          application.status !== "REJECTED" &&
          application.status !== "HIRED"
      ),
    [applications]
  );
  const {
    formState: { isSubmitting },
    handleSubmit,
    register,
    reset
  } = useForm<OfferFormValues>({
    defaultValues: {
      applicationId: "",
      offeredSalary: "",
      startDate: "",
      status: "DRAFT",
      notes: ""
    }
  });

  async function submit(values: OfferFormValues) {
    setMessage(null);
    const offeredSalary = toNullableNumber(values.offeredSalary);

    if (offeredSalary !== null && Number.isNaN(offeredSalary)) {
      setMessage("Offered salary must be a number");
      return;
    }

    const response = await createOffer(token, {
      applicationId: values.applicationId,
      offeredSalary,
      startDate: values.startDate || null,
      status: values.status,
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

    setMessage("Offer created");
    reset();
    await Promise.all([offersQuery.refetch(), applicationsQuery.refetch()]);
  }

  async function changeStatus(id: string, status: OfferStatus, currentNotes: string | null) {
    setMessage(null);
    const notesInput = window.prompt("Offer notes", currentNotes ?? "");
    const response = await updateOfferStatus(token, id, {
      status,
      notes: notesInput === null ? currentNotes : emptyToNull(notesInput)
    }).catch(() => null);

    if (!response) {
      setMessage("Unable to reach the API");
      return;
    }

    if (!response.success) {
      setMessage(getApiErrorMessage(response));
      return;
    }

    await Promise.all([offersQuery.refetch(), applicationsQuery.refetch()]);
  }

  return (
    <AppShell user={user} token={token}>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-md bg-brand-50 text-brand-700">
            <Send size={22} aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-brand-700">Recruitment</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-ink">
              Offers
            </h1>
          </div>
        </div>

        <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
          {canManageRecruitment ? (
            <form
              className="rounded-lg border border-line bg-white p-5 shadow-soft"
              onSubmit={handleSubmit(submit)}
            >
              <h2 className="text-lg font-semibold tracking-normal">Create Offer</h2>
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
                  {availableApplications.map((application) => (
                    <option key={application.id} value={application.id}>
                      {getCandidateName(application.candidate)} - {application.job.title}
                    </option>
                  ))}
                </select>
              </label>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Offered salary
                  <input
                    className="mt-2 h-11 w-full rounded-md border border-line px-3 text-sm outline-none transition focus:border-brand-600"
                    min="0"
                    step="0.01"
                    type="number"
                    {...register("offeredSalary")}
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
                  Status
                  <select
                    className="mt-2 h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-brand-600"
                    {...register("status")}
                  >
                    {offerStatuses.map((status) => (
                      <option key={status} value={status}>
                        {offerStatusLabels[status]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
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
                disabled={isSubmitting || availableApplications.length === 0}
              >
                <Plus size={17} aria-hidden="true" />
                Create offer
              </button>
            </form>
          ) : null}

          <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
            <h2 className="text-lg font-semibold tracking-normal">Offer Pipeline</h2>
            {offersQuery.isLoading || offersQuery.isError || offers.length === 0 ? (
              <div className="mt-5">
                <QueryState
                  isLoading={offersQuery.isLoading}
                  isError={offersQuery.isError}
                  isEmpty={offers.length === 0}
                  loadingLabel="Loading offers..."
                  errorLabel="Unable to load offers."
                  emptyLabel="No offers found."
                />
              </div>
            ) : (
              <div className="mt-5 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-line bg-surface text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Candidate</th>
                      <th className="px-4 py-3 font-semibold">Job</th>
                      <th className="px-4 py-3 font-semibold">Salary</th>
                      <th className="px-4 py-3 font-semibold">Start</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {offers.map((offer) => (
                      <tr key={offer.id}>
                        <td className="px-4 py-4">
                          <Link
                            className="font-medium text-brand-700 hover:underline"
                            href={`/candidates/${offer.candidate.id}`}
                          >
                            {getCandidateName(offer.candidate)}
                          </Link>
                          <div className="mt-1 text-xs text-slate-500">
                            {offer.candidate.email}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Link
                            className="font-medium text-brand-700 hover:underline"
                            href={`/jobs/${offer.job.id}`}
                          >
                            {offer.job.title}
                          </Link>
                          <div className="mt-1 text-xs text-slate-500">
                            {applicationStatusLabels[offer.application.status]}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {offer.offeredSalary === null
                            ? "Not set"
                            : formatMoney(offer.offeredSalary)}
                        </td>
                        <td className="px-4 py-4">{formatDate(offer.startDate)}</td>
                        <td className="px-4 py-4">
                          <select
                            className="h-9 rounded-md border border-line bg-white px-2 text-sm outline-none"
                            value={offer.status}
                            disabled={!canManageRecruitment}
                            onChange={(event) =>
                              changeStatus(
                                offer.id,
                                event.target.value as OfferStatus,
                                offer.notes
                              )
                            }
                          >
                            {offerStatuses.map((status) => (
                              <option key={status} value={status}>
                                {offerStatusLabels[status]}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

export default function OffersPage() {
  return (
    <ProtectedPage requiredPermissions={["recruitment:read"]}>
      {({ user, token }) => <OffersContent user={user} token={token} />}
    </ProtectedPage>
  );
}
