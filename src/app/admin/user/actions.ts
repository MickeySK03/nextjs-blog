"use server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  roleId: number;
  isActive: boolean;
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new Error("Email already exists");

  const hashed = await bcrypt.hash(data.password, 12);
  await prisma.user.create({
    data: { ...data, password: hashed },
  });

  revalidatePath("/admin/user");
}

export async function editUser(
  data: {
    name: string;
    email: string;
    password?: string;
    roleId: number;
    isActive: boolean;
  },
  id: number
) {
  const updateData: any = {
    name: data.name,
    email: data.email,
    roleId: data.roleId,
    isActive: data.isActive,
  };

  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 12);
  }

  await prisma.user.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/admin/user");
}

export async function deleteUser(id: number) {
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/user");
}
