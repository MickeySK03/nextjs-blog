"use client";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/components/providers/ToastProvider";
import { createRole, editRole } from "@/app/admin/roles/actions";

const SUBJECTS = [
  { key: "user", label: "Users", icon: "👤" },
  { key: "role", label: "Roles", icon: "🔑" },
  { key: "banner", label: "Banners", icon: "🖼️" },
  { key: "content", label: "Contents", icon: "📄" },
  { key: "category", label: "Categories", icon: "🗂️" },
  { key: "media", label: "Media", icon: "📁" },
];

const ACTIONS = [
  { key: "create", label: "Create", color: "emerald" },
  { key: "read", label: "Read", color: "sky" },
  { key: "update", label: "Update", color: "amber" },
  { key: "delete", label: "Delete", color: "red" },
];

export type Permission = { action: string; subject: string };

const roleSchema = z.object({
  name: z.string().min(1, "Role name is required").max(50, "Role name must be 50 characters or less"),
  description: z.string().max(500, "Description must be 500 characters or less").optional().nullable(),
  permissions: z.array(z.object({
    action: z.string(),
    subject: z.string(),
  })),
});

type RoleFormValues = z.infer<typeof roleSchema>;

interface RoleFormProps {
  defaultValues?: RoleFormValues & { id?: number };
  isAdminRole?: boolean;
}

export default function RoleForm({ defaultValues, isAdminRole }: RoleFormProps) {
  const router = useRouter();
  const isEdit = !!defaultValues?.id;
  const { success, error: toastError } = useToast();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      permissions: defaultValues?.permissions ?? [],
    },
  });

  const permissions = watch("permissions");

  function buildPermSet(perms: Permission[]): Set<string> {
    return new Set(perms.map((p) => `${p.action}:${p.subject}`));
  }

  const permSet = buildPermSet(permissions);

  function togglePerm(action: string, subject: string) {
    const key = `${action}:${subject}`;
    const current = permissions.filter((p) => `${p.action}:${p.subject}` !== key);
    
    if (permSet.has(key)) {
      setValue("permissions", current, { shouldDirty: true });
    } else {
      setValue("permissions", [...current, { action, subject }], { shouldDirty: true });
    }
  }

  function toggleSubjectAll(subject: string) {
    const allKeys = ACTIONS.map((a) => `${a.key}:${subject}`);
    const allChecked = allKeys.every((k) => permSet.has(k));
    
    if (allChecked) {
      const filtered = permissions.filter((p) => p.subject !== subject);
      setValue("permissions", filtered, { shouldDirty: true });
    } else {
      const filtered = permissions.filter((p) => p.subject !== subject);
      const newPerms = ACTIONS.map((a) => ({ action: a.key, subject }));
      setValue("permissions", [...filtered, ...newPerms], { shouldDirty: true });
    }
  }

  function toggleActionAll(action: string) {
    const allKeys = SUBJECTS.map((s) => `${action}:${s.key}`);
    const allChecked = allKeys.every((k) => permSet.has(k));
    
    if (allChecked) {
      const filtered = permissions.filter((p) => p.action !== action);
      setValue("permissions", filtered, { shouldDirty: true });
    } else {
      const filtered = permissions.filter((p) => p.action !== action);
      const newPerms = SUBJECTS.map((s) => ({ action, subject: s.key }));
      setValue("permissions", [...filtered, ...newPerms], { shouldDirty: true });
    }
  }

  function toggleAll() {
    const total = ACTIONS.length * SUBJECTS.length;
    if (permSet.size === total) {
      setValue("permissions", [], { shouldDirty: true });
    } else {
      const all: Permission[] = [];
      ACTIONS.forEach((a) =>
        SUBJECTS.forEach((s) => all.push({ action: a.key, subject: s.key }))
      );
      setValue("permissions", all, { shouldDirty: true });
    }
  }

  async function onSubmit(values: RoleFormValues) {
    try {
      if (isEdit && defaultValues?.id) {
        await editRole(values, defaultValues.id);
      } else {
        await createRole(values);
      }
      success(
        isEdit ? "Role updated!" : "Role created!",
        `"${values.name}" has been ${isEdit ? "updated" : "created"} successfully.`
      );
      router.push("/admin/roles");
    } catch (err) {
      const error = err as { message?: string };
      console.error(err);
      toastError(
        isEdit ? "Failed to update role" : "Failed to create role",
        error.message || "Something went wrong. Please try again."
      );
    }
  }

  const totalChecked = permSet.size;
  const totalPossible = ACTIONS.length * SUBJECTS.length;
  const allChecked = totalChecked === totalPossible;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl" noValidate>
      <div className="card space-y-5">
        <h2 className="text-base font-semibold text-white border-b border-slate-700 pb-3">
          Role Information
        </h2>
        <div>
          <label className="label">
            Role Name <span className="text-red-400">*</span>
          </label>
          <input
            {...register("name")}
            className={`input ${errors.name ? "border-red-500" : ""}`}
            placeholder="e.g. editor, moderator"
            disabled={isAdminRole}
          />
          {errors.name && <FieldError message={errors.name.message} />}
          {isAdminRole && (
            <p className="text-xs text-slate-500 mt-1">
              Admin role name cannot be changed.
            </p>
          )}
        </div>
        <div>
          <label className="label">Description</label>
          <textarea
            {...register("description")}
            className={`input min-h-20 ${errors.description ? "border-red-500" : ""}`}
            placeholder="Brief description of this role..."
          />
          {errors.description && <FieldError message={errors.description.message} />}
        </div>
      </div>

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
                  <span className="text-xs font-medium text-slate-500 uppercase">
                    Resource
                  </span>
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
                  <tr
                    key={subject.key}
                    className="group hover:bg-slate-800/30 transition-colors rounded-lg"
                  >
                    <td className="py-3.5 pr-4">
                      <button
                        type="button"
                        onClick={() => toggleSubjectAll(subject.key)}
                        className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
                        title={`Toggle all for ${subject.label}`}
                      >
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
                            <svg
                              className="w-2.5 h-2.5 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                          {rowPartial && (
                            <div className="w-2 h-0.5 bg-sky-400 rounded" />
                          )}
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
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
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

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting && (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {isSubmitting ? "Saving..." : isEdit ? "Update Role" : "Create Role"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1.5">
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      {message}
    </p>
  );
}
