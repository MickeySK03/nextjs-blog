// src/app/admin/layout.tsx
import SessionProvider from "@/components/providers/SessionProvider";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { ToastProvider } from "@/components/providers/ToastProvider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <ToastProvider>
        <div className="min-h-screen bg-slate-950 flex">
          <AdminSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <AdminHeader />
            <main className="flex-1 p-6 overflow-auto">{children}</main>
          </div>
        </div>
      </ToastProvider>
    </SessionProvider>
  );
}
