import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.email().optional(),
  password: z.string().min(6).optional(),
  roleId: z.number().optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const userId = parseInt(params.id);
  const body = await req.json();
  const parsed = updateUserSchema.safeParse(body);
  
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid data" }, { status: 400 });
  }

  const updateData: any = { ...parsed.data };
  
  if (parsed.data.password) {
    updateData.password = await bcrypt.hash(parsed.data.password, 12);
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    include: { role: true },
  });

  const { password: _, ...userWithoutPassword } = user;
  return NextResponse.json(userWithoutPassword);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const userId = parseInt(params.id);
  await prisma.user.delete({ where: { id: userId } });
  
  return NextResponse.json({ message: "User deleted" });
}
