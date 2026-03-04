// src/app/admin/roles/new/page.tsx
import RoleForm from "@/components/admin/form/RoleForm";

export default function NewRolePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
          New Role
        </h1>
        <p className="text-slate-500 text-sm mt-1">Create a new role and assign permissions</p>
      </div>
      <RoleForm />
    </div>
  );
}
