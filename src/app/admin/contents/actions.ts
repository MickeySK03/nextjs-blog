"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createContent(data: {
  title: string;
  slug: string;
  excerpt?: string | null;
  body: string;
  coverImage?: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  isFeatured: boolean;
  categoryId: number | null;
  publishedAt?: Date | null;
}) {
  await prisma.content.create({
    data: {
      ...data,
      publishedAt: data.status === "PUBLISHED" && !data.publishedAt ? new Date() : data.publishedAt,
    },
  });
  revalidatePath("/admin/contents");
}

export async function editContent(
  data: {
    title: string;
    slug: string;
    excerpt?: string | null;
    body: string;
    coverImage?: string | null;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    isFeatured: boolean;
    categoryId: number | null;
    publishedAt?: Date | null;
  },
  id: number
) {
  await prisma.content.update({
    where: { id },
    data: {
      ...data,
      publishedAt: data.status === "PUBLISHED" && !data.publishedAt ? new Date() : data.publishedAt,
    },
  });
  revalidatePath("/admin/contents");
}

export async function deleteContent(id: number) {
  await prisma.content.delete({ where: { id } });
  revalidatePath("/admin/contents");
}
