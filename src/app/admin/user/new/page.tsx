import { prisma } from "@/lib/prisma";
import UserForm from "@/components/admin/form/UserForm";

export default async function NewUserPage() {
  const roles = await prisma.role.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-heading)" }}>
        Create New User
      </h1>
      <UserForm roles={roles} />
    </div>
  );
}
