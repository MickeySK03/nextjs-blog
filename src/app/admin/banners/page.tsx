// src/app/admin/banners/page.tsx
import { GET } from "@/app/api/admin/banners/route";
import Link from "next/link";
import { Banner } from "../../../../generated/prisma/client";
import DeleteBannerButton from "@/components/admin/DeleteBannerButton";

export default async function BannersPage() {
  // const banners = await prisma.banner.findMany({
  //   orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  // });

  // const res = await fetch('/api/admin/banners/route', {method:'GET'})
  //  if (!res.ok) {
  //   // Handle non-OK responses
  //   const errorData = await res.json();
  //   console.error('Error fetching data:', errorData.error);
  //   return;
  // }

  // const banners = await res.json()
  const res = await GET()
  const banners: Banner[] = await res.json()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
          Banners
        </h1>
        <Link href="/admin/banners/new" className="btn-primary text-sm">
          + New Banner
        </Link>
      </div>

      <div className="card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left text-xs font-medium text-slate-400 uppercase pb-3">Title</th>
              <th className="text-left text-xs font-medium text-slate-400 uppercase pb-3">Position</th>
              <th className="text-left text-xs font-medium text-slate-400 uppercase pb-3">Status</th>
              <th className="text-left text-xs font-medium text-slate-400 uppercase pb-3">Order</th>
              <th className="text-right text-xs font-medium text-slate-400 uppercase pb-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {banners.map((banner) => (
              <tr key={banner.id}>
                <td className="py-4">
                  <div>
                    <p className="text-slate-200 font-medium text-sm">{banner.title}</p>
                    {banner.linkUrl && (
                      <p className="text-slate-500 text-xs mt-0.5 truncate max-w-xs">{banner.linkUrl}</p>
                    )}
                  </div>
                </td>
                <td className="py-4">
                  <span className="badge bg-slate-700 text-slate-300">{banner.position}</span>
                </td>
                <td className="py-4">
                  <span className={`badge ${banner.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-700 text-slate-400"}`}>
                    {banner.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="py-4 text-slate-400 text-sm">{banner.sortOrder}</td>
                <td className="py-4 text-right">
                  <Link href={`/admin/banners/${banner.id}/edit`} className="text-sky-400 hover:text-sky-300 text-sm mr-4">
                    Edit
                  </Link>
                  <DeleteBannerButton bannerId={banner.id} bannerTitle={banner.title} />
                </td>
              </tr>
            ))}
            {banners.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-slate-500">
                  No banners yet.{" "}
                  <Link href="/admin/banners/new" className="text-sky-400 hover:underline">
                    Create one
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
