// src/app/api/admin/roles/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const permissionSchema = z.object({
  action: z.string(),
  subject: z.string(),
});

const roleSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().optional(),
  permissions: z.array(permissionSchema),
});

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const role = await prisma.role.findUnique({
    where: { id: Number(params.id) },
    include: { permissions: true, _count: { select: { users: true } } },
  });

  if (!role) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(role);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = roleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid data", errors: parsed.error.errors }, { status: 400 });
  }

  const id = Number(params.id);

  // Check name conflict (exclude current)
  const conflict = await prisma.role.findFirst({
    where: { name: parsed.data.name, NOT: { id } },
  });
  if (conflict) {
    return NextResponse.json({ message: "Role name already exists" }, { status: 409 });
  }

  // Replace permissions: delete all then recreate
  const role = await prisma.$transaction(async (tx) => {
    await tx.permission.deleteMany({ where: { roleId: id } });
    return tx.role.update({
      where: { id },
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        permissions: { create: parsed.data.permissions },
      },
      include: { permissions: true, _count: { select: { users: true } } },
    });
  });

  return NextResponse.json(role);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const id = Number(params.id);

  // Prevent deleting admin role
  const role = await prisma.role.findUnique({ where: { id }, include: { _count: { select: { users: true } } } });
  if (!role) return NextResponse.json({ message: "Not found" }, { status: 404 });
  if (role.name === "admin") return NextResponse.json({ message: "Cannot delete admin role" }, { status: 400 });
  if (role._count.users > 0) {
    return NextResponse.json({ message: `Cannot delete: ${role._count.users} user(s) use this role` }, { status: 400 });
  }

  await prisma.role.delete({ where: { id } });
  return NextResponse.json({ message: "Deleted" });
}
