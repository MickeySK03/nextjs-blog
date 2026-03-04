import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import UserForm from "@/components/admin/form/UserForm";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userId = parseInt((await params).id);

  const [user, roles] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    }),
    prisma.role.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!user) notFound();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-2xl font-bold text-white"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Edit User
        </h1>
      </div>
      <UserForm
        defaultValues={{
          id: user.id,
          name: user.name,
          email: user.email,
          roleId: user.roleId,
          isActive: user.isActive,
        }}
        roles={roles}
      />
    </div>
  );
}
