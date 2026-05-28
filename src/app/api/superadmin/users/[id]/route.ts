import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/superadmin-guard";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logActivity, getIP } from "@/lib/activity";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireSuperAdmin();
  if (denied) return denied;

  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (id === session!.user.id) {
    return NextResponse.json({ error: "ບໍ່ສາມາດແກ້ໄຂຕົວເອງໄດ້" }, { status: 400 });
  }

  const body = await req.json();
  const allowed = ["role", "name", "email", "phone"];
  const data = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));

  const user = await prisma.user.update({
    where: { id }, data,
    select: { id: true, name: true, email: true, phone: true, role: true },
  });

  const action = "role" in data ? "USER_ROLE" : "USER_UPDATE";
  await logActivity({
    userId: session!.user.id, userName: session!.user.name!, userRole: session!.user.role,
    action, target: user.name, targetId: id,
    detail: "role" in data ? `→ ${data.role}` : undefined,
    ip: getIP(req),
  });

  return NextResponse.json(user);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireSuperAdmin();
  if (denied) return denied;

  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (id === session!.user.id) {
    return NextResponse.json({ error: "ບໍ່ສາມາດລຶບຕົວເອງໄດ້" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id }, select: { name: true } });
  await prisma.user.delete({ where: { id } });

  await logActivity({
    userId: session!.user.id, userName: session!.user.name!, userRole: session!.user.role,
    action: "USER_DELETE", target: target?.name ?? id, targetId: id, ip: getIP(req),
  });

  return NextResponse.json({ ok: true });
}
