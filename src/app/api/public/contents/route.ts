// src/app/api/public/contents/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 10);
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");

  const where: any = { status: "PUBLISHED" };
  if (category) where.category = { slug: category };
  if (featured === "true") where.isFeatured = true;

  const [contents, total] = await Promise.all([
    prisma.content.findMany({
      where,
      include: { category: true, tags: { include: { tag: true } } },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.content.count({ where }),
  ]);

  return NextResponse.json({
    contents,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
