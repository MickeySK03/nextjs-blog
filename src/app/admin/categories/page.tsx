import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteCategoryButton from "@/components/admin/DeleteCategoryButton";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { contents: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Categories</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage content categories
          </p>
        </div>
        <Link href="/admin/categories/new" className="btn-primary">
          + New Category
        </Link>
      </div>

      <div className="card overflow-hidden">
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-slate-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-300 mb-1">
              No categories yet
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Get started by creating your first category
            </p>
            <Link href="/admin/categories/new" className="btn-primary">
              Create Category
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">
                    Slug
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase">
                    Description
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-slate-500 uppercase">
                    Contents
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {categories.map((category) => (
                  <tr
                    key={category.id}
                    className="hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium text-slate-200">
                        {category.name}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <code className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">
                        {category.slug}
                      </code>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-slate-400 line-clamp-1">
                        {category.description || "—"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-sm text-slate-300">
                        {category._count.contents}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/categories/${category.id}/edit`}
                          className="text-sky-400 hover:text-sky-300 text-sm"
                        >
                          Edit
                        </Link>
                        <DeleteCategoryButton
                          categoryId={category.id}
                          categoryName={category.name}
                          contentCount={category._count.contents}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
