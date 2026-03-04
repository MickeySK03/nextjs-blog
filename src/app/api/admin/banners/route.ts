// src/app/api/admin/banners/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const bannerSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().min(1),
  linkUrl: z.string().optional(),
  position: z.enum(["HOME_TOP", "HOME_MIDDLE", "HOME_BOTTOM", "SIDEBAR"]),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

export async function GET() {
  const banners = await prisma.banner.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(banners);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = bannerSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { message: "Invalid data", errors: parsed.error },
      { status: 400 },
    );

  const banner = await prisma.banner.create({ data: parsed.data });
  return NextResponse.json(banner, { status: 201 });
}
