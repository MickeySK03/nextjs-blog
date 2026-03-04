// src/components/admin/AdminHeader.tsx
"use client";
import { useSession, signOut } from "next-auth/react";

export default function AdminHeader() {
  const { data: session } = useSession();

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-200">
            {session?.user?.name}
          </p>
          <p className="text-xs text-slate-500 capitalize">
            {(session?.user as any)?.role}
          </p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="text-sm text-slate-400 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}
