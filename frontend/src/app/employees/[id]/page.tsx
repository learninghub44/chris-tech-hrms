"use client";

import {
  BriefcaseBusiness,
  FileUp,
  Mail,
  Pencil,
  Phone,
  ShieldCheck,
  UserCircle
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { ProtectedPage } from "@/components/protected-page";
import {
  getApiErrorMessage,
  getEmployee,
  uploadEmployeeDocument
} from "@/lib/api";
import {
  employmentStatusLabels,
  formatDate,
  getEmployeeName
} from "@/lib/employee-format";
import type { AuthUser, Employee } from "@/types";

type EmployeeProfileContentProps = {
  user: AuthUser;
  token: string;
};

type DocumentFormValues = {
  documentType: string;
  notes: string;
  file: FileList;
};

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("File could not be read"));
        return;
      }

      resolve(reader.result);
    };
    reader.onerror = () => reject(reader.error ?? new Error("File could not be read"));
    reader.readAsDataURL(file);
  });
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-surface px-4 py-3">
      <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-ink">{value}</p>
    </div>
  );
}

function EmployeeProfile({ employee }: { employee: Employee }) {
  return (
    <section className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
      <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-md bg-brand-50 text-brand-700">
            <UserCircle size={32} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-normal">
              {getEmployeeName(employee)}
            </h2>
            <p className="text-sm text-slate-500">{employee.employeeCode}</p>
          </div>
        </div>
        <div className="mt-6 space-y-3 text-sm">
          <div className="flex items-center gap-3 rounded-md bg-surface px-4 py-3">
            <Mail size={17} className="text-slate-500" aria-hidden="true" />
            <span>{employee.workEmail}</span>
          </div>
          <div className="flex items-center gap-3 rounded-md bg-surface px-4 py-3">
            <Phone size={17} className="text-slate-500" aria-hidden="true" />
            <span>{employee.phone ?? "Not set"}</span>
          </div>
          <div className="flex items-center gap-3 rounded-md bg-surface px-4 py-3">
            <ShieldCheck size={17} className="text-slate-500" aria-hidden="true" />
            <span>{employmentStatusLabels[employee.status]}</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <h2 className="text-lg font-semibold tracking-normal">Employment</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <DetailRow label="Department" value={employee.department?.name ?? "Unassigned"} />
          <DetailRow label="Designation" value={employee.designation?.title ?? "Unassigned"} />
          <DetailRow label="Manager" value={employee.manager ? getEmployeeName(employee.manager) : "Unassigned"} />
          <DetailRow label="Joining" value={formatDate(employee.dateOfJoining)} />
          <DetailRow label="Exit" value={formatDate(employee.dateOfExit)} />
          <DetailRow label="Location" value={employee.location ?? "Not set"} />
        </div>
      </div>
    </section>
  );
}

function EmployeeProfileContent({ user, token }: EmployeeProfileContentProps) {
  const params = useParams<{ id: string }>();
  const employeeId = params.id;
  const [documentError, setDocumentError] = useState<string | null>(null);
  const employeeQuery = useQuery({
    queryKey: ["employee", token, employeeId],
    queryFn: () => getEmployee(token, employeeId),
    retry: false
  });
  const {
    formState: { isSubmitting },
    handleSubmit,
    register,
    reset
  } = useForm<DocumentFormValues>({
    defaultValues: {
      documentType: "Contract",
      notes: ""
    }
  });
  const employee = employeeQuery.data?.success
    ? employeeQuery.data.data.employee
    : null;

  async function submitDocument(values: DocumentFormValues) {
    setDocumentError(null);
    const file = values.file?.[0];

    if (!file) {
      setDocumentError("Choose a file");
      return;
    }

    if (file.size > 3_000_000) {
      setDocumentError("File must be 3 MB or smaller");
      return;
    }

    const fileUrl = await readFileAsDataUrl(file).catch(() => null);

    if (!fileUrl || !employee) {
      setDocumentError("File could not be read");
      return;
    }

    const response = await uploadEmployeeDocument(token, employee.id, {
      documentType: values.documentType,
      fileName: file.name,
      fileUrl,
      mimeType: file.type || null,
      sizeBytes: file.size,
      notes: values.notes.trim() || null
    }).catch(() => null);

    if (!response) {
      setDocumentError("Unable to reach the API");
      return;
    }

    if (!response.success) {
      setDocumentError(getApiErrorMessage(response));
      return;
    }

    reset({
      documentType: "Contract",
      notes: ""
    });
    await employeeQuery.refetch();
  }

  return (
    <AppShell user={user} token={token}>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium text-brand-700">Employees</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-ink">
              {employee ? getEmployeeName(employee) : "Employee Profile"}
            </h1>
          </div>
          {employee ? (
            <Link
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700"
              href={`/employees/${employee.id}/edit`}
            >
              <Pencil size={17} aria-hidden="true" />
              Edit employee
            </Link>
          ) : null}
        </div>

        {employeeQuery.isLoading ? (
          <div className="h-24 animate-pulse rounded-lg bg-brand-50" />
        ) : null}

        {!employeeQuery.isLoading && !employee ? (
          <section className="rounded-lg border border-line bg-white p-6 text-sm text-slate-600 shadow-soft">
            Employee record could not be loaded.
          </section>
        ) : null}

        {employee ? (
          <>
            <EmployeeProfile employee={employee} />

            <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
                <h2 className="text-lg font-semibold tracking-normal">
                  Emergency Contacts
                </h2>
                <div className="mt-5 space-y-3">
                  {employee.emergencyContacts.map((contact) => (
                    <div key={contact.id} className="rounded-md bg-surface px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-ink">{contact.name}</p>
                        {contact.isPrimary ? (
                          <span className="rounded-md bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700">
                            Primary
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {contact.relationship} | {contact.phone}
                      </p>
                    </div>
                  ))}
                  {employee.emergencyContacts.length === 0 ? (
                    <p className="rounded-md border border-dashed border-line px-4 py-5 text-sm text-slate-500">
                      No emergency contacts.
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-md bg-brand-50 text-brand-700">
                    <BriefcaseBusiness size={20} aria-hidden="true" />
                  </div>
                  <h2 className="text-lg font-semibold tracking-normal">Documents</h2>
                </div>

                <form className="mt-5 grid gap-3 sm:grid-cols-[180px_1fr_auto]" onSubmit={handleSubmit(submitDocument)}>
                  <input
                    className="h-11 rounded-md border border-line px-3 text-sm outline-none transition focus:border-brand-600"
                    placeholder="Document type"
                    {...register("documentType", { required: true })}
                  />
                  <input
                    className="h-11 rounded-md border border-line px-3 text-sm outline-none transition focus:border-brand-600"
                    type="file"
                    {...register("file", { required: true })}
                  />
                  <button
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    <FileUp size={17} aria-hidden="true" />
                    Upload
                  </button>
                  <input
                    className="h-11 rounded-md border border-line px-3 text-sm outline-none transition focus:border-brand-600 sm:col-span-3"
                    placeholder="Notes"
                    {...register("notes")}
                  />
                </form>

                {documentError ? (
                  <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {documentError}
                  </div>
                ) : null}

                <div className="mt-5 space-y-3">
                  {employee.documents.map((document) => (
                    <a
                      key={document.id}
                      className="block rounded-md border border-line bg-surface px-4 py-3 transition hover:border-brand-600"
                      href={document.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-ink">{document.fileName}</p>
                        <span className="rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-600">
                          {document.documentType}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {formatDate(document.createdAt)}
                      </p>
                    </a>
                  ))}
                  {employee.documents.length === 0 ? (
                    <p className="rounded-md border border-dashed border-line px-4 py-5 text-sm text-slate-500">
                      No documents uploaded.
                    </p>
                  ) : null}
                </div>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}

export default function EmployeeProfilePage() {
  return (
    <ProtectedPage requiredPermissions={["employees:manage"]}>
      {({ user, token }) => <EmployeeProfileContent user={user} token={token} />}
    </ProtectedPage>
  );
}
