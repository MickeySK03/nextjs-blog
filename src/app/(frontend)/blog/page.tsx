// src/app/(frontend)/blog/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function BlogPage() {
  const contents = await prisma.content.findMany({
    where: { status: "PUBLISHED" },
    include: { category: true },
    orderBy: { publishedAt: "desc" },
    take: 20,
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200" style={{ fontFamily: "var(--font-body)" }}>
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-white font-bold text-xl" style={{ fontFamily: "var(--font-heading)" }}>CMS Site</Link>
          <Link href="/blog" className="text-sky-400 text-sm">Blog</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-10" style={{ fontFamily: "var(--font-heading)" }}>Blog</h1>
        <div className="space-y-4">
          {contents.map((content) => (
            <Link key={content.id} href={`/blog/${content.slug}`}>
              <article className="card hover:border-slate-600 transition-colors flex items-start justify-between gap-4">
                <div>
                  {content.category && (
                    <span className="badge bg-slate-700 text-slate-300 mb-2 inline-block text-xs">{content.category.name}</span>
                  )}
                  <h2 className="text-white font-semibold">{content.title}</h2>
                  {content.excerpt && <p className="text-slate-400 text-sm mt-1 line-clamp-2">{content.excerpt}</p>}
                </div>
                <p className="text-slate-500 text-xs whitespace-nowrap shrink-0">
                  {content.publishedAt ? new Date(content.publishedAt).toLocaleDateString("th-TH") : ""}
                </p>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
