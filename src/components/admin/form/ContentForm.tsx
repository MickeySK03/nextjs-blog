"use client";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/components/providers/ToastProvider";
import ImageUpload from "@/components/admin/ImageUpload";
import { createContent, editContent } from "@/app/admin/contents/actions";
import RichTextEditor from "@/components/text-editor/Quill";

const contentSchema = z.object({
  title: z.string().min(1, "Title is required").max(300, "Title must be 300 characters or less"),
  slug: z.string().min(1, "Slug is required").max(300, "Slug must be 300 characters or less"),
  excerpt: z.string().max(1000, "Excerpt must be 1000 characters or less").optional().nullable(),
  body: z.string().min(1, "Content body is required"),
  coverImage: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  isFeatured: z.boolean(),
  categoryId: z.number().nullable(),
  publishedAt: z.date().optional().nullable(),
});

type ContentFormValues = z.infer<typeof contentSchema>;

interface ContentFormProps {
  defaultValues?: Partial<ContentFormValues> & { id?: number };
  categories: { id: number; name: string }[];
}

export default function ContentForm({ defaultValues, categories }: ContentFormProps) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const isEdit = !!defaultValues?.id;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ContentFormValues>({
    resolver: zodResolver(contentSchema),
    mode: "onChange",
    defaultValues: {
      title: defaultValues?.title ?? "",
      slug: defaultValues?.slug ?? "",
      excerpt: defaultValues?.excerpt ?? null,
      body: defaultValues?.body ?? "",
      coverImage: defaultValues?.coverImage ?? null,
      status: defaultValues?.status ?? "DRAFT",
      isFeatured: defaultValues?.isFeatured ?? false,
      categoryId: defaultValues?.categoryId ?? null,
      publishedAt: defaultValues?.publishedAt ? new Date(defaultValues.publishedAt) : null,
    },
  });



  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  }

  async function onSubmit(values: ContentFormValues) {
    try {
      if (isEdit) {
        await editContent(values, Number(defaultValues.id));
      } else {
        await createContent(values);
      }
      success(
        isEdit ? "Content updated!" : "Content created!",
        `"${values.title}" has been ${isEdit ? "updated" : "created"} successfully.`
      );
      router.push("/admin/contents");
    } catch (err) {
      const error = err as { message?: string };
      console.error(err);
      toastError(
        isEdit ? "Failed to update content" : "Failed to create content",
        error.message || "Something went wrong. Please try again."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl space-y-5" noValidate>
      <section className="card space-y-3">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Cover Image</h2>
        <Controller
          control={control}
          name="coverImage"
          render={({ field }) => (
            <ImageUpload value={field.value || ""} onChange={field.onChange} error={errors.coverImage?.message} />
          )}
        />
      </section>

      <section className="card space-y-5">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Basic Information</h2>

        <div>
          <label className="label">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            {...register("title")}
            className={`input ${errors.title ? "border-red-500" : ""}`}
            placeholder="e.g. Getting Started with Next.js"
            onBlur={(e) => {
              if (!isEdit && !watch("slug")) {
                setValue("slug", generateSlug(e.target.value));
              }
            }}
          />
          {errors.title && <FieldError message={errors.title.message} />}
        </div>

        <div>
          <label className="label">
            Slug <span className="text-red-400">*</span>
          </label>
          <input
            {...register("slug")}
            className={`input ${errors.slug ? "border-red-500" : ""}`}
            placeholder="e.g. getting-started-with-nextjs"
          />
          {errors.slug ? (
            <FieldError message={errors.slug.message} />
          ) : (
            <p className="text-xs text-slate-500 mt-1">URL-friendly version of the title</p>
          )}
        </div>

        <div>
          <label className="label">Excerpt</label>
          <textarea
            {...register("excerpt")}
            className={`input min-h-20 resize-none ${errors.excerpt ? "border-red-500" : ""}`}
            placeholder="Brief summary shown in listings..."
          />
          {errors.excerpt && <FieldError message={errors.excerpt.message} />}
        </div>

        <div>
          <label className="label">
            Body <span className="text-red-400">*</span>
          </label>
          <Controller
            control={control}
            name="body"
            render={({ field }) => (
              <RichTextEditor
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  trigger("body");
                }}
                placeholder="Write your content here..."
                error={errors.body?.message}
              />
            )}
          />
        </div>
      </section>

      <section className="card space-y-5">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Settings</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Status</label>
            <select {...register("status")} className="input">
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div>
            <label className="label">Category</label>
            <select {...register("categoryId", { valueAsNumber: true, setValueAs: v => v === "" ? null : Number(v) })} className="input">
              <option value="">None</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Published Date</label>
          <input {...register("publishedAt")} type="datetime-local" className="input" />
          <p className="text-xs text-slate-500 mt-1">Leave empty to use current date when publishing</p>
        </div>

        <div>
          <Controller
            control={control}
            name="isFeatured"
            render={({ field }) => (
              <button
                type="button"
                role="switch"
                aria-checked={field.value}
                onClick={() => field.onChange(!field.value)}
                className="flex items-center gap-3 group"
              >
                <div className={`relative w-11 h-6 rounded-full transition-colors ${field.value ? "bg-sky-500" : "bg-slate-700"}`}>
                  <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${field.value ? "translate-x-5" : "translate-x-0"}`} />
                </div>
                <span className="text-sm text-slate-300 group-hover:text-slate-100 transition-colors">
                  {field.value ? "Featured — shown on homepage" : "Not featured"}
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
          {isSubmitting ? "Saving..." : isEdit ? "Update Content" : "Create Content"}
        </button>

        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Cancel
        </button>

        {isDirty && !isSubmitting && <span className="text-xs text-amber-400 ml-1">● Unsaved changes</span>}
      </div>
    </form>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1.5">
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {message}
    </p>
  );
}
