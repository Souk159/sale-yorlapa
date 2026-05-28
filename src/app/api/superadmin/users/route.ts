import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/superadmin-guard";

export async function GET() {
  const denied = await requireSuperAdmin();
  if (denied) return denied;

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(users);
}
