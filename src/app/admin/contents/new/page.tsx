import { prisma } from "@/lib/prisma";
import ContentForm from "@/components/admin/form/ContentForm";

export default async function NewContentPage() {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-heading)" }}>
        Create New Content
      </h1>
      <ContentForm categories={categories} />
    </div>
  );
}
