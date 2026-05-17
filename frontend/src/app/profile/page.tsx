"use client";

import { Mail, ShieldCheck, UserCircle } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ProtectedPage } from "@/components/protected-page";
import { roleLabels } from "@/lib/permissions";
import type { AuthUser } from "@/types";

type ProfileContentProps = {
  user: AuthUser;
  token: string;
};

function ProfileContent({ user, token }: ProfileContentProps) {
  return (
    <AppShell user={user} token={token}>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-brand-700">Profile</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-normal text-ink">
            {user.name}
          </h1>
        </div>

        <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-md bg-brand-50 text-brand-700">
                <UserCircle size={32} aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-semibold tracking-normal">{user.name}</h2>
                <p className="text-sm text-slate-500">{user.status}</p>
              </div>
            </div>

            <div className="mt-6 space-y-3 text-sm">
              <div className="flex items-center gap-3 rounded-md bg-surface px-4 py-3">
                <Mail size={17} className="text-slate-500" aria-hidden="true" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-3 rounded-md bg-surface px-4 py-3">
                <ShieldCheck size={17} className="text-slate-500" aria-hidden="true" />
                <span>{user.roles.map((role) => roleLabels[role]).join(", ")}</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-line bg-white p-5 shadow-soft">
            <h2 className="text-lg font-semibold tracking-normal">Permissions</h2>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {user.permissions.map((permission) => (
                <div
                  key={permission}
                  className="rounded-md border border-line bg-surface px-3 py-2 text-sm text-slate-700"
                >
                  {permission}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedPage requiredPermissions={["profile:read"]}>
      {({ user, token }) => <ProfileContent user={user} token={token} />}
    </ProtectedPage>
  );
}
