// src/app/admin/roles/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DeleteRoleButton from "@/components/admin/DeleteRoleButton";

const ACTIONS = ["create", "read", "update", "delete"];
const SUBJECTS = ["user", "role", "banner", "content", "category", "media"];

export default async function RolesPage() {
  const roles = await prisma.role.findMany({
    include: {
      permissions: true,
      _count: { select: { users: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
            Roles & Permissions
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage what each role can do in the system</p>
        </div>
        <Link href="/admin/roles/new" className="btn-primary text-sm">
          + New Role
        </Link>
      </div>

      <div className="space-y-4">
        {roles.map((role) => {
          const permSet = new Set(role.permissions.map((p) => `${p.action}:${p.subject}`));
          const isAdmin = role.name === "admin";

          return (
            <div key={role.id} className="card">
              {/* Role Header */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold ${
                    isAdmin
                      ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                      : "bg-slate-700 text-slate-300"
                  }`}>
                    {role.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-white font-semibold capitalize">{role.name}</h2>
                      {isAdmin && (
                        <span className="badge bg-sky-500/10 text-sky-400 text-[10px]">System</span>
                      )}
                    </div>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {role.description ?? "No description"} · {role._count.users} user{role._count.users !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/roles/${role.id}/edit`}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    Edit
                  </Link>
                  {!isAdmin && (
                    <DeleteRoleButton
                      id={role.id}
                      name={role.name}
                      userCount={role._count.users}
                    />
                  )}
                </div>
              </div>

              {/* Permission Grid */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr>
                      <th className="text-left text-slate-500 font-medium pb-2 pr-3 w-28">Resource</th>
                      {ACTIONS.map((a) => (
                        <th key={a} className="text-center text-slate-500 font-medium pb-2 px-2 capitalize min-w-15">
                          {a}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {SUBJECTS.map((subject) => (
                      <tr key={subject}>
                        <td className="py-2 pr-3 text-slate-400 capitalize font-medium">{subject}</td>
                        {ACTIONS.map((action) => {
                          const has = permSet.has(`${action}:${subject}`);
                          return (
                            <td key={action} className="py-2 px-2 text-center">
                              {has ? (
                                <span className={`inline-flex items-center justify-center w-5 h-5 rounded ${
                                  action === "create" ? "bg-emerald-500/20 text-emerald-400" :
                                  action === "read" ? "bg-sky-500/20 text-sky-400" :
                                  action === "update" ? "bg-amber-500/20 text-amber-400" :
                                  "bg-red-500/20 text-red-400"
                                }`}>
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded text-slate-700">
                                  —
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Permission count summary */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-3">
                <span className="text-xs text-slate-500">
                  {role.permissions.length} / {ACTIONS.length * SUBJECTS.length} permissions granted
                </span>
                <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-sky-500 to-sky-400 rounded-full transition-all"
                    style={{ width: `${(role.permissions.length / (ACTIONS.length * SUBJECTS.length)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
