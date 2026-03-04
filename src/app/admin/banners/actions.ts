"use server";

import { prisma } from "@/lib/prisma";
import {
  BannerUncheckedCreateInput,
  BannerUncheckedUpdateInput,
} from "../../../../generated/prisma/models";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createBanner(
  data: Omit<BannerUncheckedCreateInput, "createdAt" | "updatedAt">,
) {
  //   const title = formData.get("title") as string;
  //   const image = formData.get("image") as string;
  //   const isActive = formData.get("isActive") === "on";

  if (!data?.title) {
    throw new Error("Title is required");
  }

  const result = await prisma.banner.create({
    data,
  });
  return result;
  //   if (result) {
  //     revalidatePath("/admin/banners");
  //     redirect("/admin/banners");
  //   }
}

export async function editBanner(
  data: BannerUncheckedUpdateInput,
  bannerId: number,
) {
  const result = await prisma.banner.update({
    where: { id: bannerId },
    data,
  });
  return result;
}

export async function deleteBanner(bannerId: number) {
  await prisma.banner.delete({ where: { id: bannerId } });
  revalidatePath("/admin/banners");
}
