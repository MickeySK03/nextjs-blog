"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/components/providers/ToastProvider";
import { createCategory, editCategory } from "@/app/admin/categories/actions";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  slug: z.string().min(1, "Slug is required").max(100, "Slug must be 100 characters or less"),
  description: z.string().max(500, "Description must be 500 characters or less").optional().nullable(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  defaultValues?: Partial<CategoryFormValues> & { id?: number };
}

export default function CategoryForm({ defaultValues }: CategoryFormProps) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const isEdit = !!defaultValues?.id;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      slug: defaultValues?.slug ?? "",
      description: defaultValues?.description ?? "",
    },
  });

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }

  async function onSubmit(values: CategoryFormValues) {
    try {
      if (isEdit) {
        await editCategory(values, Number(defaultValues.id));
      } else {
        await createCategory(values);
      }
      success(
        isEdit ? "Category updated!" : "Category created!",
        `"${values.name}" has been ${isEdit ? "updated" : "created"} successfully.`
      );
      router.push("/admin/categories");
    } catch (err) {
      const error = err as { message?: string };
      console.error(err);
      toastError(
        isEdit ? "Failed to update category" : "Failed to create category",
        error.message || "Something went wrong. Please try again."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-5" noValidate>
      <section className="card space-y-5">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
          Category Information
        </h2>

        <div>
          <label className="label">
            Name <span className="text-red-400">*</span>
          </label>
          <input
            {...register("name")}
            className={`input ${errors.name ? "border-red-500" : ""}`}
            placeholder="e.g. Technology, Lifestyle"
            onBlur={(e) => {
              if (!isEdit && !watch("slug")) {
                setValue("slug", generateSlug(e.target.value));
              }
            }}
          />
          {errors.name && <FieldError message={errors.name.message} />}
        </div>

        <div>
          <label className="label">
            Slug <span className="text-red-400">*</span>
          </label>
          <input
            {...register("slug")}
            className={`input ${errors.slug ? "border-red-500" : ""}`}
            placeholder="e.g. technology, lifestyle"
          />
          {errors.slug ? (
            <FieldError message={errors.slug.message} />
          ) : (
            <p className="text-xs text-slate-500 mt-1">
              URL-friendly version of the name
            </p>
          )}
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            {...register("description")}
            className={`input min-h-20 resize-none ${errors.description ? "border-red-500" : ""}`}
            placeholder="Brief description of this category..."
          />
          {errors.description && <FieldError message={errors.description.message} />}
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
          {isSubmitting ? "Saving..." : isEdit ? "Update Category" : "Create Category"}
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
