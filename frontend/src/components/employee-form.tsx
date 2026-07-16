"use client";

import { Briefcase, IdCard, Save, ShieldAlert, X } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import type { EmployeeInput } from "@/lib/api";
import { employmentStatusLabels } from "@/lib/employee-format";
import type { Department, Designation, Employee, EmploymentStatus } from "@/types";

const labelClass = "block text-sm font-medium text-ink2-soft";
const fieldClass =
  "mt-2 h-11 w-full rounded-xl border border-edge bg-white px-3 text-sm text-ink2 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10";
const sectionClass = "rounded-2xl border border-edge bg-white p-5 shadow-card";
const sectionHeaderClass = "flex items-center gap-2 text-lg font-semibold tracking-tight text-ink2";

export type EmployeeFormValues = {
  employeeCode: string;
  firstName: string;
  lastName: string;
  workEmail: string;
  personalEmail: string;
  phone: string;
  dateOfBirth: string;
  dateOfJoining: string;
  dateOfExit: string;
  status: EmploymentStatus;
  location: string;
  departmentId: string;
  designationId: string;
  managerId: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  emergencyContactEmail: string;
};

type EmployeeFormProps = {
  departments: Department[];
  designations: Designation[];
  managers: Employee[];
  initialValues: EmployeeFormValues;
  submitLabel: string;
  cancelHref: string;
  error: string | null;
  onSubmit: (input: EmployeeInput) => Promise<void>;
};

const statuses: EmploymentStatus[] = [
  "ONBOARDING",
  "ACTIVE",
  "PROBATION",
  "INACTIVE",
  "TERMINATED"
];

export const emptyEmployeeFormValues: EmployeeFormValues = {
  employeeCode: "",
  firstName: "",
  lastName: "",
  workEmail: "",
  personalEmail: "",
  phone: "",
  dateOfBirth: "",
  dateOfJoining: new Date().toISOString().slice(0, 10),
  dateOfExit: "",
  status: "ACTIVE",
  location: "",
  departmentId: "",
  designationId: "",
  managerId: "",
  emergencyContactName: "",
  emergencyContactRelationship: "",
  emergencyContactPhone: "",
  emergencyContactEmail: ""
};

function emptyToNull(value: string): string | null {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  return trimmedValue;
}

function toEmployeeInput(values: EmployeeFormValues): EmployeeInput {
  const emergencyContacts =
    values.emergencyContactName.trim() && values.emergencyContactPhone.trim()
      ? [
          {
            name: values.emergencyContactName.trim(),
            relationship: values.emergencyContactRelationship.trim(),
            phone: values.emergencyContactPhone.trim(),
            email: emptyToNull(values.emergencyContactEmail),
            isPrimary: true
          }
        ]
      : [];

  return {
    employeeCode: values.employeeCode.trim(),
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    workEmail: values.workEmail.trim().toLowerCase(),
    personalEmail: emptyToNull(values.personalEmail),
    phone: emptyToNull(values.phone),
    dateOfBirth: values.dateOfBirth || null,
    dateOfJoining: values.dateOfJoining,
    dateOfExit: values.dateOfExit || null,
    status: values.status,
    location: emptyToNull(values.location),
    departmentId: values.departmentId || null,
    designationId: values.designationId || null,
    managerId: values.managerId || null,
    emergencyContacts
  };
}

export function EmployeeForm({
  departments,
  designations,
  managers,
  initialValues,
  submitLabel,
  cancelHref,
  error,
  onSubmit
}: EmployeeFormProps) {
  const {
    formState: { isSubmitting },
    handleSubmit,
    register,
    watch
  } = useForm<EmployeeFormValues>({
    defaultValues: initialValues
  });
  const selectedDepartmentId = watch("departmentId");
  const filteredDesignations = useMemo(() => {
    if (!selectedDepartmentId) {
      return designations;
    }

    return designations.filter(
      (designation) => designation.departmentId === selectedDepartmentId
    );
  }, [designations, selectedDepartmentId]);

  async function submit(values: EmployeeFormValues) {
    await onSubmit(toEmployeeInput(values));
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit(submit)}>
      {error ? (
        <div className="rounded-2xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      ) : null}

      <section className={sectionClass}>
        <h2 className={sectionHeaderClass}>
          <IdCard size={18} className="text-primary" aria-hidden="true" />
          Employee
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label className={labelClass}>
            Employee code
            <input
              className={fieldClass}
              {...register("employeeCode", { required: true })}
            />
          </label>
          <label className={labelClass}>
            First name
            <input
              className={fieldClass}
              {...register("firstName", { required: true })}
            />
          </label>
          <label className={labelClass}>
            Last name
            <input
              className={fieldClass}
              {...register("lastName", { required: true })}
            />
          </label>
          <label className={labelClass}>
            Work email
            <input
              className={fieldClass}
              type="email"
              {...register("workEmail", { required: true })}
            />
          </label>
          <label className={labelClass}>
            Personal email
            <input
              className={fieldClass}
              type="email"
              {...register("personalEmail")}
            />
          </label>
          <label className={labelClass}>
            Phone
            <input className={fieldClass} {...register("phone")} />
          </label>
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className={sectionHeaderClass}>
          <Briefcase size={18} className="text-primary" aria-hidden="true" />
          Employment
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label className={labelClass}>
            Department
            <select className={fieldClass} {...register("departmentId")}>
              <option value="">Unassigned</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Designation
            <select className={fieldClass} {...register("designationId")}>
              <option value="">Unassigned</option>
              {filteredDesignations.map((designation) => (
                <option key={designation.id} value={designation.id}>
                  {designation.title}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Manager
            <select className={fieldClass} {...register("managerId")}>
              <option value="">Unassigned</option>
              {managers.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.firstName} {manager.lastName}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Status
            <select className={fieldClass} {...register("status")}>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {employmentStatusLabels[status]}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Joining date
            <input
              className={fieldClass}
              type="date"
              {...register("dateOfJoining", { required: true })}
            />
          </label>
          <label className={labelClass}>
            Exit date
            <input className={fieldClass} type="date" {...register("dateOfExit")} />
          </label>
          <label className={labelClass}>
            Date of birth
            <input className={fieldClass} type="date" {...register("dateOfBirth")} />
          </label>
          <label className={`${labelClass} xl:col-span-2`}>
            Location
            <input className={fieldClass} {...register("location")} />
          </label>
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className={sectionHeaderClass}>
          <ShieldAlert size={18} className="text-primary" aria-hidden="true" />
          Emergency Contact
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className={labelClass}>
            Name
            <input className={fieldClass} {...register("emergencyContactName")} />
          </label>
          <label className={labelClass}>
            Relationship
            <input
              className={fieldClass}
              {...register("emergencyContactRelationship")}
            />
          </label>
          <label className={labelClass}>
            Phone
            <input className={fieldClass} {...register("emergencyContactPhone")} />
          </label>
          <label className={labelClass}>
            Email
            <input
              className={fieldClass}
              type="email"
              {...register("emergencyContactEmail")}
            />
          </label>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-edge bg-white px-4 text-sm font-semibold text-ink2-soft transition hover:border-primary/40 hover:bg-primary-50 hover:text-primary"
          href={cancelHref}
        >
          <X size={17} aria-hidden="true" />
          Cancel
        </Link>
        <button
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-glow transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={isSubmitting}
        >
          <Save size={17} aria-hidden="true" />
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
