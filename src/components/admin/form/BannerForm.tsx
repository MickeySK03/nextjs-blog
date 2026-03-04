// src/components/admin/BannerForm.tsx
"use client";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/components/providers/ToastProvider";
import ImageUpload from "@/components/admin/ImageUpload";
import { createBanner, editBanner } from "@/app/admin/banners/actions";

/* ── Zod schema ─────────────────────────────────────────────── */
const bannerSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or less"),
  description: z.string().max(500, "Description must be 500 characters or less").optional().nullable(),
  imageUrl: z.string().min(1, "Please upload or enter an image"),
  linkUrl: z
    .url("Must be a valid URL (e.g. https://example.com)")
    .or(z.literal(""))
    .optional().nullable(),
  position: z.enum(["HOME_TOP", "HOME_MIDDLE", "HOME_BOTTOM", "SIDEBAR"]),
  isActive: z.boolean(),
  // sortOrder: z.number().min(0, "Must be 0 or more"),
  sortOrder: z.number().min(0, "Must be 0 or more"),
  startDate: z.date().optional().nullable(),
  endDate: z.date().optional().nullable(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  },
  { message: "End date must be after start date", path: ["endDate"] }
);

type BannerFormValues = z.infer<typeof bannerSchema>;

/* ── Constants ──────────────────────────────────────────────── */
const POSITIONS: { value: BannerFormValues["position"]; label: string }[] = [
  { value: "HOME_TOP", label: "Home — Top" },
  { value: "HOME_MIDDLE", label: "Home — Middle" },
  { value: "HOME_BOTTOM", label: "Home — Bottom" },
  { value: "SIDEBAR", label: "Sidebar" },
];

/* ── Props ──────────────────────────────────────────────────── */
interface BannerFormProps {
  defaultValues?: Partial<BannerFormValues> & { id?: number };
}

/* ── Component ──────────────────────────────────────────────── */
export default function BannerForm({ defaultValues }: BannerFormProps) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const isEdit = !!defaultValues?.id;

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? null,
      imageUrl: defaultValues?.imageUrl ?? "",
      linkUrl: defaultValues?.linkUrl ?? null,
      position: defaultValues?.position ?? "HOME_TOP",
      isActive: defaultValues?.isActive ?? true,
      sortOrder: defaultValues?.sortOrder ? defaultValues.sortOrder : 0,
      startDate: defaultValues?.startDate ? new Date(defaultValues?.startDate) : null,
      endDate: defaultValues?.endDate ? new Date(defaultValues.endDate) : null,
    },
  });

  const titleValue = watch("title");
  console.log(typeof watch('sortOrder'));

  /* ── Submit ──────────────────────────────────────────────── */
  async function onSubmit(values: BannerFormValues) {
    // e.preventDefault();
    // setLoading(true);

    // const url = isEdit ? `/api/admin/banners/${defaultValues?.id}` : "/api/admin/banners";
    // const method = isEdit ? "PUT" : "POST";
    try {
      isEdit ? await editBanner(values, Number(defaultValues.id)) : await createBanner(values)
      success(
        isEdit ? "Banner updated!" : "Banner created!",
        `"${values.title}" has been ${isEdit ? "updated" : "created"} successfully.`
      );
      router.push("/admin/banners");
      // router.refresh();
    } catch (err) {
      console.error(err)
      toastError(
        isEdit ? "Failed to update banner" : "Failed to create banner",
        "Something went wrong. Please try again."
      );
    }
    // setLoading(false);

    // if (!res.ok) {
    //   const data = await res.json();
    //   setError(data.message || "Something went wrong");
    // } else {
    //   router.push("/admin/banners");
    //   router.refresh();
  }

  /* ── UI ──────────────────────────────────────────────────── */
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-5" noValidate>

      {/* ── Image Upload ── */}
      <section className="card space-y-3">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
          Banner Image
        </h2>
        <Controller
          control={control}
          name="imageUrl"
          render={({ field }) => (
            <ImageUpload
              value={field.value}
              onChange={field.onChange}

              // folder="banners"
              error={errors.imageUrl?.message}
            />
          )}
        />
      </section>

      {/* ── Basic Info ── */}
      <section className="card space-y-5">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
          Basic Information
        </h2>

        {/* Title */}
        <div>
          <label className="label">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            {...register("title")}
            className={`input ${errors.title ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
            placeholder="e.g. Summer Promotion 2025"
          />
          {errors.title && <FieldError message={errors.title.message} />}
        </div>

        {/* Description */}
        <div>
          <label className="label">Description</label>
          <textarea
            {...register("description")}
            className={`input min-h-22.5 resize-none ${errors.description ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
            placeholder="Short description shown under the title..."
          />
          {errors.description && <FieldError message={errors.description.message} />}
        </div>

        {/* Link URL */}
        <div>
          <label className="label">Link URL</label>
          <input
            {...register("linkUrl")}
            type="url"
            className={`input ${errors.linkUrl ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
            placeholder="https://example.com/page"
          />
          {errors.linkUrl
            ? <FieldError message={errors.linkUrl.message} />
            : <p className="text-xs text-slate-500 mt-1">Leave empty for no link.</p>
          }
        </div>
      </section>

      {/* ── Display Settings ── */}
      <section className="card space-y-5">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
          Display Settings
        </h2>

        <div className="grid grid-cols-2 gap-4">
          {/* Position */}
          <div>
            <label className="label">
              Position <span className="text-red-400">*</span>
            </label>
            <select
              {...register("position")}
              className={`input ${errors.position ? "border-red-500" : ""}`}
            >
              {POSITIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            {errors.position && <FieldError message={errors.position.message} />}
          </div>

          {/* Sort Order */}
          <div>
            <label className="label">Sort Order</label>
            <input
              {...register("sortOrder", { valueAsNumber: true })}
              type="number"
              min={0}
              className={`input ${errors.sortOrder ? "border-red-500" : ""}`}
              placeholder="0"
            />
            {errors.sortOrder
              ? <FieldError message={errors.sortOrder.message} />
              : <p className="text-xs text-slate-500 mt-1">Lower = shown first.</p>
            }
          </div>
        </div>

        {/* Schedule */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Start Date</label>
            <input
              {...register("startDate")}
              type="datetime-local"
              className="input"
            />
          </div>
          <div>
            <label className="label">End Date</label>
            <input
              {...register("endDate")}
              type="datetime-local"
              className={`input ${errors.endDate ? "border-red-500" : ""}`}
            />
            {errors.endDate && <FieldError message={errors.endDate.message} />}
          </div>
        </div>
        <p className="text-xs text-slate-500 -mt-2">
          Leave empty to show indefinitely.
        </p>

        {/* Active toggle */}
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
                <div className={`relative w-11 h-6 rounded-full transition-colors ${field.value ? "bg-sky-500" : "bg-slate-700"
                  }`}>
                  <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${field.value ? "translate-x-5" : "translate-x-0"
                    }`} />
                </div>
                <span className="text-sm text-slate-300 group-hover:text-slate-100 transition-colors">
                  {field.value ? "Active — visible on site" : "Inactive — hidden from site"}
                </span>
              </button>
            )}
          />
        </div>
      </section>

      {/* ── Actions ── */}
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
          {isSubmitting ? "Saving..." : isEdit ? "Update Banner" : "Create Banner"}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          Cancel
        </button>

        {isDirty && !isSubmitting && (
          <span className="text-xs text-amber-400 ml-1">● Unsaved changes</span>
        )}
      </div>
    </form>
  );
}

/* ── Helper ─────────────────────────────────────────────────── */
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1.5">
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {message}
    </p>
  );
}
