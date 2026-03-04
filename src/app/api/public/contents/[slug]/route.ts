// src/app/api/public/contents/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const slug = (await params).slug;
  const content = await prisma.content.findUnique({
    where: { slug: slug, status: "PUBLISHED" },
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
  });

  if (!content)
    return NextResponse.json({ message: "Not found" }, { status: 404 });

  // Increment view count
  await prisma.content.update({
    where: { id: content.id },
    data: { viewCount: { increment: 1 } },
  });

  return NextResponse.json(content);
}
