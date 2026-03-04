// src/app/api/admin/banners/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const bannerSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  linkUrl: z.string().optional(),
  position: z
    .enum(["HOME_TOP", "HOME_MIDDLE", "HOME_BOTTOM", "SIDEBAR"])
    .optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = (await params).id;
  const banner = await prisma.banner.findUnique({
    where: { id: Number(id) },
  });
  if (!banner)
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(banner);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = (await params).id;
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = bannerSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ message: "Invalid data" }, { status: 400 });

  const banner = await prisma.banner.update({
    where: { id: Number(id) },
    data: parsed.data,
  });
  return NextResponse.json(banner);
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = (await params).id;
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await prisma.banner.delete({ where: { id: Number(id) } });
  return NextResponse.json({ message: "Deleted" });
}
