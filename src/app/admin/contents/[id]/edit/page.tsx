import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ContentForm from "@/components/admin/form/ContentForm";
import DeleteContentButton from "@/components/admin/DeleteContentButton";

export default async function EditContentPage({ params }: { params: Promise< { id: string } >}) {
  const contentId = parseInt((await params).id);

  const [content, categories] = await Promise.all([
    prisma.content.findUnique({
      where: { id: contentId },
      include: { category: true },
    }),
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!content) notFound();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
          Edit Content
        </h1>
        <DeleteContentButton contentId={content.id} contentTitle={content.title} />
      </div>
      <ContentForm
        defaultValues={{
          id: content.id,
          title: content.title,
          slug: content.slug,
          excerpt: content.excerpt,
          body: content.body,
          coverImage: content.coverImage,
          status: content.status,
          isFeatured: content.isFeatured,
          categoryId: content.categoryId,
          publishedAt: content.publishedAt,
        }}
        categories={categories}
      />
    </div>
  );
}
