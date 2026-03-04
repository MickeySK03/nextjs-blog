// src/app/admin/banners/new/page.tsx
import BannerForm from "@/components/admin/form/BannerForm";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>
}

export default async function BannerFormPage({ params }: Props) {
  const bannerId = (await params).id
  if (!bannerId) notFound()

  const banner = await prisma.banner.findUnique({
    where: { id: Number(bannerId) }
  })
  if (!banner) notFound()

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-heading)" }}>
        Edit Banner
      </h1>
      <BannerForm defaultValues={banner} />
    </div>
  );
}
