"use client";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/components/providers/ToastProvider";
import { createUser, editUser } from "@/app/admin/user/actions";
import Error from "next/error";
import AlertModal from "@/components/ui/AlertModal";
import { useState } from "react";

const userSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  email: z.string().email("Must be a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  roleId: z.number().min(1, "Please select a role"),
  isActive: z.boolean(),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserFormProps {
  defaultValues?: Partial<UserFormValues> & { id?: number };
  roles: { id: number; name: string }[];
}

export default function UserForm({ defaultValues, roles }: UserFormProps) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [showModal, setShowModal] = useState(false);
  const isEdit = !!defaultValues?.id;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      email: defaultValues?.email ?? "",
      password: "",
      roleId: defaultValues?.roleId ?? (roles[0]?.id || 1),
      isActive: defaultValues?.isActive ?? true,
    },
  });

  async function onSubmit(values: UserFormValues) {
    try {
      if (isEdit) {
        const updateData = values.password ? values : { ...values, password: undefined };
        await editUser(updateData, Number(defaultValues.id));
      } else {
        await createUser({...values,password: values?.password || ''});
      }
      success(
        isEdit ? "User updated!" : "User created!",
        `"${values.name}" has been ${isEdit ? "updated" : "created"} successfully.`
      );
      router.push("/admin/user");
    } catch (err) {
      const submitError = err as  {message?: string, options?: ErrorOptions}
      console.error(err);
      setShowModal(true)
      toastError(
        isEdit ? "Failed to update user" : "Failed to create user",
        // "Something went wrong. Please try again."
         submitError.message
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-5" noValidate>
            <AlertModal
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              title="Delete User"
              cancelText="Cancel"
              variant="danger"
            />

      <section className="card space-y-5">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
          User Information
        </h2>

        <div>
          <label className="label">
            Name <span className="text-red-400">*</span>
          </label>
          <input
            {...register("name")}
            className={`input ${errors.name ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
            placeholder="e.g. John Doe"
          />
          {errors.name && <FieldError message={errors.name.message} />}
        </div>

        <div>
          <label className="label">
            Email <span className="text-red-400">*</span>
          </label>
          <input
            {...register("email")}
            type="email"
            className={`input ${errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
            placeholder="user@example.com"
          />
          {errors.email && <FieldError message={errors.email.message} />}
        </div>

        <div>
          <label className="label">
            Password {isEdit ? "(leave empty to keep current)" : <span className="text-red-400">*</span>}
          </label>
          <input
            {...register("password")}
            type="password"
            className={`input ${errors.password ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
            placeholder={isEdit ? "Enter new password to change" : "Minimum 6 characters"}
          />
          {errors.password && <FieldError message={errors.password.message} />}
        </div>

        <div>
          <label className="label">
            Role <span className="text-red-400">*</span>
          </label>
          <select
            {...register("roleId", { valueAsNumber: true })}
            className={`input ${errors.roleId ? "border-red-500" : ""}`}
          >
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          {errors.roleId && <FieldError message={errors.roleId.message} />}
        </div>

        <div>
          <Controller
            control={control}
            name="isActive"
            render={({ field }) => (
              <button
                type="button"
                role="switch"
                aria-checked={field.value}
                onClick={() => field.onChange(!field.value)}
                className="flex items-center gap-3 group"
              >
                <div
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    field.value ? "bg-sky-500" : "bg-slate-700"
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      field.value ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </div>
                <span className="text-sm text-slate-300 group-hover:text-slate-100 transition-colors">
                  {field.value ? "Active — user can login" : "Inactive — user cannot login"}
                </span>
              </button>
            )}
          />
        </div>
      </section>

      <div className="flex items-center gap-3 pt-1">
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
          {isSubmitting ? "Saving..." : isEdit ? "Update User" : "Create User"}
        </button>

        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Cancel
        </button>

        {isDirty && !isSubmitting && (
          <span className="text-xs text-amber-400 ml-1">● Unsaved changes</span>
        )}
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
