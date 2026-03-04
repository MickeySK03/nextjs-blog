// src/components/admin/AdminSidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "⊞" },
  { href: "/admin/user", label: "Users", icon: "👤" },
  { href: "/admin/roles", label: "Roles", icon: "🔑" },
  { href: "/admin/banners", label: "Banners", icon: "🖼️" },
  { href: "/admin/contents", label: "Contents", icon: "📄" },
  { href: "/admin/categories", label: "Categories", icon: "🗂️" },
  { href: "/admin/media", label: "Media", icon: "📁" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            C
          </div>
          <span
            className="text-white font-semibold text-lg"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            CMS Admin
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* View site link */}
      <div className="p-4 border-t border-slate-800">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors px-3 py-2"
        >
          <span>↗</span> View Website
        </Link>
      </div>
    </aside>
  );
}
