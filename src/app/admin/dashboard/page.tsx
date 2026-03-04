// src/app/admin/dashboard/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";

async function getStats() {
  const [users, banners, contents, categories] = await Promise.all([
    prisma.user.count(),
    prisma.banner.count(),
    prisma.content.count(),
    prisma.category.count(),
  ]);
  return { users, banners, contents, categories };
}

export default async function DashboardPage() {
  const stats = await getStats();

  const cards = [
    { label: "Total Users", value: stats.users, icon: "👤", href: "/admin/user", color: "sky" },
    { label: "Banners", value: stats.banners, icon: "🖼️", href: "/admin/banners", color: "violet" },
    { label: "Contents", value: stats.contents, icon: "📄", href: "/admin/contents", color: "emerald" },
    { label: "Categories", value: stats.categories, icon: "🗂️", href: "/admin/categories", color: "amber" },
  ];

  return (
    <div>
      <h1
        className="text-2xl font-bold text-white mb-6"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Dashboard
      </h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <Link key={card.href} href={card.href}>
            <div className="card hover:border-slate-600 transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{card.icon}</span>
                <span className="text-3xl font-bold text-white">{card.value}</span>
              </div>
              <p className="text-slate-400 text-sm">{card.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: "var(--font-heading)" }}>
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/banners/new" className="btn-primary text-sm">
            + New Banner
          </Link>
          <Link href="/admin/contents/new" className="btn-primary text-sm">
            + New Content
          </Link>
          <Link href="/admin/user/new" className="btn-secondary text-sm">
            + New User
          </Link>
        </div>
      </div>
    </div>
  );
}
