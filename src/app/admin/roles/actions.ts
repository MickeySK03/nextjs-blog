"use server";
import { Permission } from "@/components/admin/form/RoleForm";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createRole(data: {
  name: string;
  description?: string | null;
  permissions: Permission[];
}) {
  // Check name conflict (exclude current)
  const conflict = await prisma.role.findFirst({
    where: { name: data.name },
  });
  if (conflict) throw new Error("Role already exists");

  await prisma.role.create({
    data: {
      name: data.name,
      description: data?.description,
      permissions: { create: data.permissions },
    },
  });

  revalidatePath("/admin/roles");
}

export async function editRole(
  data: {
    name: string;
    description?: string | null;
    permissions: Permission[];
  },
  id: number,
) {
  // Check name conflict (exclude current)
  const conflict = await prisma.role.findFirst({
    where: { name: data.name, id: { not: id } },
  });
  if (conflict) throw new Error("Role already exists");

  await prisma.$transaction(async (tx) => {
    await tx.permission.deleteMany({ where: { roleId: id } });
    return tx.role.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        permissions: { create: data.permissions },
      },
    });
  });

  revalidatePath("/admin/roles");
}

export async function deleteUser(id: number) {
  // Prevent deleting admin role
  const role = await prisma.role.findUnique({
    where: { id },
    include: { _count: { select: { users: true } } },
  });
  if (!role) throw new Error("Role Not Found");
  if (role.name === "admin") throw new Error("Cannot delete admin role");
  if (role._count.users > 0) {
    throw new Error(
      `Cannot delete: ${role._count.users} user(s) use this role`,
    );
  }

  await prisma.role.delete({ where: { id } });
  revalidatePath("/admin/roles");
}
