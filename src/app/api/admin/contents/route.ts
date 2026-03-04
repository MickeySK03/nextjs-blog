// src/app/api/admin/contents/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const contentSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().optional(),
  body: z.string().min(1),
  coverImage: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  isFeatured: z.boolean().default(false),
  categoryId: z.number().optional().nullable(),
  publishedAt: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 20);

  const where = status ? { status: status as any } : {};
  const [contents, total] = await Promise.all([
    prisma.content.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.content.count({ where }),
  ]);

  return NextResponse.json({ contents, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = contentSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { message: "Invalid data", errors: parsed.error },
      { status: 400 },
    );

  const content = await prisma.content.create({
    data: {
      ...parsed.data,
      publishedAt: parsed.data.publishedAt
        ? new Date(parsed.data.publishedAt)
        : null,
    },
  });
  return NextResponse.json(content, { status: 201 });
}
