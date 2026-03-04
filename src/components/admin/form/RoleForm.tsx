"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Define all available subjects and actions
const SUBJECTS = [
  { key: "user",    label: "Users",      icon: "👤" },
  { key: "role",    label: "Roles",      icon: "🔑" },
  { key: "banner",  label: "Banners",    icon: "🖼️" },
  { key: "content", label: "Contents",   icon: "📄" },
  { key: "category",label: "Categories", icon: "🗂️" },
  { key: "media",   label: "Media",      icon: "📁" },
];

const ACTIONS = [
  { key: "create", label: "Create", color: "emerald" },
  { key: "read",   label: "Read",   color: "sky" },
  { key: "update", label: "Update", color: "amber" },
  { key: "delete", label: "Delete", color: "red" },
];

type Permission = { action: string; subject: string };

interface RoleFormProps {
  defaultValues?: {
    id?: number;
    name: string;
    description?: string;
    permissions: Permission[];
  };
  isAdminRole?: boolean;
}

function buildPermSet(permissions: Permission[]): Set<string> {
  return new Set(permissions.map((p) => `${p.action}:${p.subject}`));
}

export default function RoleForm({ defaultValues, isAdminRole }: RoleFormProps) {
  const router = useRouter();
  const isEdit = !!defaultValues?.id;

  const [name, setName] = useState(defaultValues?.name ?? "");
  const [description, setDescription] = useState(defaultValues?.description ?? "");
  const [permSet, setPermSet] = useState<Set<string>>(
    buildPermSet(defaultValues?.permissions ?? [])
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function togglePerm(action: string, subject: string) {
    const key = `${action}:${subject}`;
    setPermSet((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleSubjectAll(subject: string) {
    const allKeys = ACTIONS.map((a) => `${a.key}:${subject}`);
    const allChecked = allKeys.every((k) => permSet.has(k));
    setPermSet((prev) => {
      const next = new Set(prev);
      if (allChecked) allKeys.forEach((k) => next.delete(k));
      else allKeys.forEach((k) => next.add(k));
      return next;
    });
  }

  function toggleActionAll(action: string) {
    const allKeys = SUBJECTS.map((s) => `${action}:${s.key}`);
    const allChecked = allKeys.every((k) => permSet.has(k));
    setPermSet((prev) => {
      const next = new Set(prev);
      if (allChecked) allKeys.forEach((k) => next.delete(k));
      else allKeys.forEach((k) => next.add(k));
      return next;
    });
  }

  function toggleAll() {
    const total = ACTIONS.length * SUBJECTS.length;
    if (permSet.size === total) {
      setPermSet(new Set());
    } else {
      const all = new Set<string>();
      ACTIONS.forEach((a) => SUBJECTS.forEach((s) => all.add(`${a.key}:${s.key}`)));
      setPermSet(all);
    }
  }

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const permissions: Permission[] = [];
    permSet.forEach((key) => {
      const [action, subject] = key.split(":");
      permissions.push({ action, subject });
    });

    const url = isEdit ? `/api/admin/roles/${defaultValues?.id}` : "/api/admin/roles";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, permissions }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.message ?? "Something went wrong");
    } else {
      router.push("/admin/roles");
      router.refresh();
    }
  }

  const totalChecked = permSet.size;
  const totalPossible = ACTIONS.length * SUBJECTS.length;
  const allChecked = totalChecked === totalPossible;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="card space-y-5">
        <h2 className="text-base font-semibold text-white border-b border-slate-700 pb-3">
          Role Information
        </h2>
        <div>
          <label className="label">Role Name *</label>
          <input
            className="input"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. editor, moderator"
            disabled={isAdminRole}
          />
          {isAdminRole && (
            <p className="text-xs text-slate-500 mt-1">Admin role name cannot be changed.</p>
          )}
        </div>
        <div>
          <label className="label">Description</label>
          <textarea
            className="input min-h-20"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this role..."
          />
        </div>
      </div>

      {/* Permission Matrix */}
      <div className="card">
        <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-5">
          <div>
            <h2 className="text-base font-semibold text-white">Permissions</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {totalChecked} / {totalPossible} permissions selected
            </p>
          </div>
          <button
            type="button"
            onClick={toggleAll}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              allChecked
                ? "border-sky-500/40 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20"
                : "border-slate-600 text-slate-400 hover:text-slate-200 hover:border-slate-500"
            }`}
          >
            {allChecked ? "Deselect All" : "Select All"}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left pb-4 pr-4 w-40">
                  <span className="text-xs font-medium text-slate-500 uppercase">Resource</span>
                </th>
                {ACTIONS.map((action) => (
                  <th key={action.key} className="pb-4 text-center min-w-22.5">
                    <button
                      type="button"
                      onClick={() => toggleActionAll(action.key)}
                      className="group flex flex-col items-center gap-1 mx-auto hover:opacity-80 transition-opacity"
                      title={`Toggle all ${action.label}`}
                    >
                      <span
                        className={`text-xs font-semibold uppercase tracking-wide ${
                          action.color === "emerald"
                            ? "text-emerald-400"
                            : action.color === "sky"
                            ? "text-sky-400"
                            : action.color === "amber"
                            ? "text-amber-400"
                            : "text-red-400"
                        }`}
                      >
                        {action.label}
                      </span>
                      <span className="text-[10px] text-slate-600 group-hover:text-slate-400 transition-colors">
                        click to toggle all
                      </span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {SUBJECTS.map((subject) => {
                const rowChecked = ACTIONS.every((a) =>
                  permSet.has(`${a.key}:${subject.key}`)
                );
                const rowPartial =
                  !rowChecked &&
                  ACTIONS.some((a) => permSet.has(`${a.key}:${subject.key}`));

                return (
                  <tr key={subject.key} className="group hover:bg-slate-800/30 transition-colors rounded-lg">
                    <td className="py-3.5 pr-4">
                      <button
                        type="button"
                        onClick={() => toggleSubjectAll(subject.key)}
                        className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
                        title={`Toggle all for ${subject.label}`}
                      >
                        {/* Row toggle indicator */}
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                            rowChecked
                              ? "bg-sky-500 border-sky-500"
                              : rowPartial
                              ? "bg-sky-500/30 border-sky-500/50"
                              : "border-slate-600"
                          }`}
                        >
                          {rowChecked && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          {rowPartial && <div className="w-2 h-0.5 bg-sky-400 rounded" />}
                        </div>
                        <span className="text-sm font-medium text-slate-200">
                          {subject.icon} {subject.label}
                        </span>
                      </button>
                    </td>
                    {ACTIONS.map((action) => {
                      const key = `${action.key}:${subject.key}`;
                      const checked = permSet.has(key);
                      return (
                        <td key={action.key} className="py-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => togglePerm(action.key, subject.key)}
                            className={`w-7 h-7 rounded-lg border mx-auto flex items-center justify-center transition-all hover:scale-110 ${
                              checked
                                ? action.color === "emerald"
                                  ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                                  : action.color === "sky"
                                  ? "bg-sky-500/20 border-sky-500/50 text-sky-400"
                                  : action.color === "amber"
                                  ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                                  : "bg-red-500/20 border-red-500/50 text-red-400"
                                : "border-slate-700 text-transparent hover:border-slate-500"
                            }`}
                            title={`${action.label} ${subject.label}`}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center gap-6 flex-wrap">
          <span className="text-xs text-slate-500">Legend:</span>
          {ACTIONS.map((action) => (
            <div key={action.key} className="flex items-center gap-1.5">
              <div
                className={`w-3 h-3 rounded ${
                  action.color === "emerald"
                    ? "bg-emerald-500/40"
                    : action.color === "sky"
                    ? "bg-sky-500/40"
                    : action.color === "amber"
                    ? "bg-amber-500/40"
                    : "bg-red-500/40"
                }`}
              />
              <span
                className={`text-xs ${
                  action.color === "emerald"
                    ? "text-emerald-400"
                    : action.color === "sky"
                    ? "text-sky-400"
                    : action.color === "amber"
                    ? "text-amber-400"
                    : "text-red-400"
                }`}
              >
                {action.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : isEdit ? "Update Role" : "Create Role"}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
