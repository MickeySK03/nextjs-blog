// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const userSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  password: z.string().min(6),
  roleId: z.number(),
  isActive: z.boolean().default(true),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const users = await prisma.user.findMany({
    include: { role: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = userSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "Invalid data" }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return NextResponse.json({ message: "Email already exists" }, { status: 409 });

  const hashed = await bcrypt.hash(parsed.data.password, 12);
  const user = await prisma.user.create({
    data: { ...parsed.data, password: hashed },
    include: { role: true },
  });

  const { password: _, ...userWithoutPassword } = user;
  return NextResponse.json(userWithoutPassword, { status: 201 });
}
