// src/app/api/public/banners/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const position = searchParams.get("position");

  const now = new Date();
  const banners = await prisma.banner.findMany({
    where: {
      isActive: true,
      ...(position ? { position: position as any } : {}),
      OR: [
        { startDate: null },
        { startDate: { lte: now } },
      ],
      AND: [
        {
          OR: [
            { endDate: null },
            { endDate: { gte: now } },
          ],
        },
      ],
    },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(banners);
}
