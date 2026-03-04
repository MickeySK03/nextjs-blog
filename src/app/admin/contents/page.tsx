// src/app/admin/contents/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ContentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const status = (await searchParams).status;
  const contents = await prisma.content.findMany({
    where: status ? { status: status as any } : {},
    include: { category: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const statusColors: Record<string, string> = {
    DRAFT: "bg-amber-500/10 text-amber-400",
    PUBLISHED: "bg-emerald-500/10 text-emerald-400",
    ARCHIVED: "bg-slate-700 text-slate-400",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
          Contents
        </h1>
        <Link href="/admin/contents/new" className="btn-primary text-sm">
          + New Content
        </Link>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-5">
        {["", "DRAFT", "PUBLISHED", "ARCHIVED"].map((s) => (
          <Link
            key={s}
            href={s ? `/admin/contents?status=${s}` : "/admin/contents"}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              status === s || (!status && !s)
                ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {s || "All"}
          </Link>
        ))}
      </div>

      <div className="card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left text-xs font-medium text-slate-400 uppercase pb-3">Title</th>
              <th className="text-left text-xs font-medium text-slate-400 uppercase pb-3">Category</th>
              <th className="text-left text-xs font-medium text-slate-400 uppercase pb-3">Status</th>
              <th className="text-left text-xs font-medium text-slate-400 uppercase pb-3">Date</th>
              <th className="text-right text-xs font-medium text-slate-400 uppercase pb-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {contents.map((content) => (
              <tr key={content.id}>
                <td className="py-4">
                  <div>
                    <p className="text-slate-200 font-medium text-sm">{content.title}</p>
                    <p className="text-slate-500 text-xs mt-0.5">/{content.slug}</p>
                  </div>
                </td>
                <td className="py-4">
                  <span className="text-slate-400 text-sm">{content.category?.name ?? "—"}</span>
                </td>
                <td className="py-4">
                  <span className={`badge ${statusColors[content.status]}`}>{content.status}</span>
                </td>
                <td className="py-4 text-slate-400 text-sm">
                  {content.publishedAt
                    ? new Date(content.publishedAt).toLocaleDateString("th-TH")
                    : new Date(content.createdAt).toLocaleDateString("th-TH")}
                </td>
                <td className="py-4 text-right">
                  <Link href={`/blog/${content.slug}`} target="_blank" className="text-slate-400 hover:text-slate-200 text-sm mr-4">
                    View
                  </Link>
                  <Link href={`/admin/contents/${content.id}/edit`} className="text-sky-400 hover:text-sky-300 text-sm mr-4">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {contents.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-slate-500">
                  No contents found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
