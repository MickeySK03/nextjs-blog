// src/app/(frontend)/blog/[slug]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const content = await prisma.content.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: { category: true, tags: { include: { tag: true } } },
  });

  if (!content) notFound();

  // Increment views
  await prisma.content.update({
    where: { id: content.id },
    data: { viewCount: { increment: 1 } },
  });

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-200"
      style={{ fontFamily: "var(--font-body)" }}
    >
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center">
          <Link
            href="/"
            className="text-white font-bold text-xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            CMS Site
          </Link>
          <span className="text-slate-700 mx-3">/</span>
          <Link
            href="/blog"
            className="text-slate-400 hover:text-white text-sm"
          >
            Blog
          </Link>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-6 py-12">
        <header className="mb-10">
          {content.category && (
            <span className="badge bg-sky-500/10 text-sky-400 mb-4 inline-block">
              {content.category.name}
            </span>
          )}
          <h1
            className="text-4xl font-bold text-white leading-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {content.title}
          </h1>
          <div className="flex items-center gap-4 mt-4 text-slate-400 text-sm">
            {content.publishedAt && (
              <time>
                {new Date(content.publishedAt).toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            )}
            <span>{content.viewCount} views</span>
          </div>
          {content.excerpt && (
            <p className="text-slate-300 text-lg mt-4 border-l-2 border-sky-500 pl-4">
              {content.excerpt}
            </p>
          )}
        </header>

        {/* Content Body */}
        <div
          className="prose prose-invert prose-slate max-w-none"
          dangerouslySetInnerHTML={{ __html: content.body }}
        />

        {/* Tags */}
        {content.tags.length > 0 && (
          <div className="mt-10 pt-6 border-t border-slate-800">
            <div className="flex flex-wrap gap-2">
              {content.tags.map(({ tag }) => (
                <span
                  key={tag.id}
                  className="badge bg-slate-800 text-slate-300"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-slate-800">
          <Link
            href="/blog"
            className="text-sky-400 hover:text-sky-300 text-sm"
          >
            ← Back to Blog
          </Link>
        </div>
      </article>
    </div>
  );
}
