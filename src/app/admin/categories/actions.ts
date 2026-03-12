"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCategory(data: {
  name: string;
  slug: string;
  description?: string | null;
}) {
  const existing = await prisma.category.findUnique({
    where: { slug: data.slug },
  });

  if (existing) {
    throw new Error("Slug already exists");
  }

  await prisma.category.create({
    data,
  });

  revalidatePath("/admin/categories");
}

export async function editCategory(
  data: {
    name: string;
    slug: string;
    description?: string | null;
  },
  id: number
) {
  const existing = await prisma.category.findFirst({
    where: {
      slug: data.slug,
      NOT: { id },
    },
  });

  if (existing) {
    throw new Error("Slug already exists");
  }

  await prisma.category.update({
    where: { id },
    data,
  });

  revalidatePath("/admin/categories");
}

export async function deleteCategory(id: number) {
  const contentCount = await prisma.content.count({
    where: { categoryId: id },
  });

  if (contentCount > 0) {
    throw new Error(`Cannot delete category with ${contentCount} content(s) assigned`);
  }

  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
}
