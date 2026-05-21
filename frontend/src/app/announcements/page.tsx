"use client";

import { Megaphone, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { PaginationControls } from "@/components/pagination-controls";
import { ProtectedPage } from "@/components/protected-page";
import {
  createAnnouncement,
  getApiErrorMessage,
  getPaginationMeta,
  listAnnouncements
} from "@/lib/api";
import { formatDateTime } from "@/lib/time-format";
import { hasEveryPermission } from "@/lib/permissions";
import type { AnnouncementAudience, AuthUser } from "@/types";

type AnnouncementsContentProps = {
  user: AuthUser;
  token: string;
};

type AnnouncementFormValues = {
  title: string;
  message: string;
  audience: AnnouncementAudience;
  isPublished: boolean;
};

const audienceLabels: Record<AnnouncementAudience, string> = {
  ALL: "All users",
  SUPER_ADMIN: "Super admins",
  HR_ADMIN: "HR admins",
  MANAGER: "Managers",
  EMPLOYEE: "Employees"
};
const pageSize = 25;

function AnnouncementsContent({ user, token }: AnnouncementsContentProps) {
  const canManageAnnouncements = hasEveryPermission(user, ["announcements:manage"]);
  const [message, setMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const announcementsQuery = useQuery({
    queryKey: ["announcements", token, page],
    queryFn: () => listAnnouncements(token, { page, pageSize }),
    retry: false
  });
  const {
    formState: { isSubmitting },
    handleSubmit,
    register,
    reset
  } = useForm<AnnouncementFormValues>({
    defaultValues: {
      title: "",
      message: "",
      audience: "ALL",
      isPublished: true
    }
  });
  const announcements = announcementsQuery.data?.success
    ? announcementsQuery.data.data.announcements
    : [];
  const pagination = useMemo(
    () => (announcementsQuery.data ? getPaginationMeta(announcementsQuery.data) : null),
    [announcementsQuery.data]
  );

  async function submit(values: AnnouncementFormValues) {
    setMessage(null);
    const response = await createAnnouncement(token, {
      title: values.title.trim(),
      message: values.message.trim(),
      audience: values.audience,
      isPublished: values.isPublished
    }).catch(() => null);

    if (!response) {
      setMessage("Unable to reach the API");
      return;
    }

    if (!response.success) {
      setMessage(getApiErrorMessage(response));
      return;
    }

    setMessage("Announcement saved");
    reset();
    await announcementsQuery.refetch();
  }

  return (
    <AppShell user={user} token={token}>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-md bg-brand-50 text-brand-700">
            <Megaphone size={22} aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-brand-700">Announcements</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-ink">
              Company Updates
            </h1>
          </div>
        </div>

        <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          {canManageAnnouncements ? (
            <form
              className="rounded-lg border border-line bg-white p-5 shadow-soft"
              onSubmit={handleSubmit(submit)}
            >
              <h2 className="text-lg font-semibold tracking-normal">New Announcement</h2>
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
              <label className="mt-5 block text-sm font-medium text-slate-700">
                Audience
                <select
                  className="mt-2 h-11 w-full rounded-md border border-line bg-white px-3 text-sm outline-none transition focus:border-brand-600"
                  {...register("audience")}
                >
                  {Object.entries(audienceLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
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
                <input type="checkbox" {...register("isPublished")} />
                Publish now
              </label>
              <button
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={isSubmitting}
              >
                <Plus size={17} aria-hidden="true" />
                Save announcement
              </button>
            </form>
          ) : null}

          <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
            <h2 className="text-lg font-semibold tracking-normal">Published Updates</h2>
            <div className="mt-5 divide-y divide-line">
              {announcements.map((announcement) => (
                <article key={announcement.id} className="py-4">
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                    <div>
                      <p className="font-semibold text-ink">{announcement.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{announcement.message}</p>
                    </div>
                    <span className="rounded-md bg-surface px-2 py-1 text-xs font-medium text-slate-600">
                      {audienceLabels[announcement.audience]}
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">
                    {formatDateTime(announcement.publishedAt)}
                  </p>
                </article>
              ))}
            </div>
            {!announcementsQuery.isLoading && announcements.length === 0 ? (
              <div className="mt-5 rounded-md border border-dashed border-line px-4 py-8 text-center text-sm text-slate-500">
                No announcements found.
              </div>
            ) : null}
            <PaginationControls
              pagination={pagination}
              onPageChange={setPage}
              isFetching={announcementsQuery.isFetching}
            />
          </div>
        </section>
      </div>
    </AppShell>
  );
}

export default function AnnouncementsPage() {
  return (
    <ProtectedPage requiredPermissions={["announcements:read"]}>
      {({ user, token }) => <AnnouncementsContent user={user} token={token} />}
    </ProtectedPage>
  );
}
