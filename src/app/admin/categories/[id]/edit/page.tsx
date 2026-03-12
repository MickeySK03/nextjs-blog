import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CategoryForm from "@/components/admin/form/CategoryForm";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const category = await prisma.category.findUnique({
    where: { id: Number((await params).id) },
  });

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Edit Category</h1>
        <p className="text-sm text-slate-400 mt-1">
          Update category information
        </p>
      </div>

      <CategoryForm
        defaultValues={{
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
        }}
      />
    </div>
  );
}
