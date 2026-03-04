// src/app/api/admin/roles/route.ts
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
  name: z.string().min(1, "Name is required").max(50),
  description: z.string().optional(),
  permissions: z.array(permissionSchema),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const roles = await prisma.role.findMany({
    include: {
      permissions: true,
      _count: { select: { users: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(roles);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = roleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid data", errors: parsed.error }, { status: 400 });
  }

  const existing = await prisma.role.findUnique({ where: { name: parsed.data.name } });
  if (existing) {
    return NextResponse.json({ message: "Role name already exists" }, { status: 409 });
  }

  const role = await prisma.role.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      permissions: {
        create: parsed.data.permissions,
      },
    },
    include: { permissions: true, _count: { select: { users: true } } },
  });

  return NextResponse.json(role, { status: 201 });
}
