"use client";

import { Building2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { ProtectedPage } from "@/components/protected-page";
import {
  createDepartment,
  deleteDepartment,
  getApiErrorMessage,
  listDepartments
} from "@/lib/api";
import type { AuthUser } from "@/types";

type DepartmentsContentProps = {
  user: AuthUser;
  token: string;
};

type DepartmentFormValues = {
  name: string;
  description: string;
};

function DepartmentsContent({ user, token }: DepartmentsContentProps) {
  const [error, setError] = useState<string | null>(null);
  const [deletingDepartmentId, setDeletingDepartmentId] = useState<string | null>(null);
  const departmentsQuery = useQuery({
    queryKey: ["departments", token],
    queryFn: () => listDepartments(token),
    retry: false
  });
  const {
    formState: { isSubmitting },
    handleSubmit,
    register,
    reset
  } = useForm<DepartmentFormValues>({
    defaultValues: {
      name: "",
      description: ""
    }
  });
  const departments = departmentsQuery.data?.success
    ? departmentsQuery.data.data.departments
    : [];

  async function submit(values: DepartmentFormValues) {
    setError(null);
    const response = await createDepartment(token, {
      name: values.name.trim(),
      description: values.description.trim() || null
    }).catch(() => null);

    if (!response) {
      setError("Unable to reach the API");
      return;
    }

    if (!response.success) {
      setError(getApiErrorMessage(response));
      return;
    }

    reset();
    void departmentsQuery.refetch();
  }

  async function removeDepartment(id: string, name: string) {
    if (!window.confirm(`Delete department \"${name}\"?`)) {
      return;
    }

    setError(null);
    setDeletingDepartmentId(id);

    const response = await deleteDepartment(token, id).catch(() => null);

    setDeletingDepartmentId(null);

    if (!response) {
      setError("Unable to reach the API");
      return;
    }

    if (!response.success) {
      setError(getApiErrorMessage(response));
      return;
    }

    void departmentsQuery.refetch();
  }

  return (
    <AppShell user={user} token={token}>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-primary">Employees</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink2">
            Departments
          </h1>
        </div>

        <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <form
            className="rounded-2xl border border-edge bg-white p-5 shadow-card"
            onSubmit={handleSubmit(submit)}
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-50 text-primary-700">
                <Building2 size={20} aria-hidden="true" />
              </div>
              <h2 className="text-lg font-semibold tracking-tight text-ink2">Add Department</h2>
            </div>

            {error ? (
              <div className="mt-5 rounded-2xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
                {error}
              </div>
            ) : null}

            <label className="mt-5 block text-sm font-medium text-ink2-soft">
              Name
              <input
                className="mt-2 h-11 w-full rounded-xl border border-edge bg-white px-3 text-sm text-ink2 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                {...register("name", { required: true })}
              />
            </label>
            <label className="mt-5 block text-sm font-medium text-ink2-soft">
              Description
              <textarea
                className="mt-2 min-h-28 w-full rounded-xl border border-edge bg-white px-3 py-3 text-sm text-ink2 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                {...register("description")}
              />
            </label>
            <button
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-glow transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={isSubmitting}
            >
              <Plus size={17} aria-hidden="true" />
              Create department
            </button>
          </form>

          <div className="rounded-2xl border border-edge bg-white p-5 shadow-card">
            <h2 className="text-lg font-semibold tracking-tight text-ink2">Department List</h2>
            <div className="mt-5 overflow-hidden rounded-2xl border border-edge">
              {departments.map((department) => (
                <div
                  key={department.id}
                  className="grid gap-3 border-b border-edge px-4 py-4 transition last:border-0 hover:bg-canvas/60 sm:grid-cols-[1fr_auto]"
                >
                  <div>
                    <p className="font-medium text-ink2">{department.name}</p>
                    <p className="mt-1 text-sm text-ink2-soft">
                      {department.description ?? "No description"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-ink2-soft">
                    <span className="rounded-lg bg-canvas px-2 py-1">
                      {department._count?.employees ?? 0} employees
                    </span>
                    <span className="rounded-lg bg-canvas px-2 py-1">
                      {department._count?.designations ?? 0} designations
                    </span>
                    <button
                      className="inline-flex h-8 items-center gap-1.5 rounded-full border border-danger/20 bg-danger/5 px-3 py-1 text-danger shadow-sm transition hover:border-danger/40 hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-60"
                      type="button"
                      onClick={() => removeDepartment(department.id, department.name)}
                      disabled={deletingDepartmentId === department.id}
                      aria-label={`Delete department ${department.name}`}
                    >
                      <Trash2 size={13} aria-hidden="true" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {!departmentsQuery.isLoading && departments.length === 0 ? (
              <p className="mt-5 rounded-2xl border border-dashed border-edge bg-canvas px-4 py-5 text-sm text-ink2-soft">
                No departments found.
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

export default function DepartmentsPage() {
  return (
    <ProtectedPage requiredPermissions={["employees:manage"]}>
      {({ user, token }) => <DepartmentsContent user={user} token={token} />}
    </ProtectedPage>
  );
}
