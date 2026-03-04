// src/app/admin/roles/[id]/edit/page.tsx

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import RoleForm from "@/components/admin/form/RoleForm";

export default async function EditRolePage({ params }: { params: Promise<{ id: string }> }) {
  const roleId = (await params).id

  if(!roleId) notFound()
  const role = await prisma.role.findUnique({
    where: { id: Number(roleId) },
    include: { permissions: true },
  });

  if (!role) notFound();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
          Edit Role: <span className="text-sky-400 capitalize">{role.name}</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">Update role information and permissions</p>
      </div>
      <RoleForm
        defaultValues={{
          id: role.id,
          name: role.name,
          description: role.description ?? "",
          permissions: role.permissions.map((p) => ({ action: p.action, subject: p.subject })),
        }}
        isAdminRole={role.name === "admin"}
      />
    </div>
  );
}
