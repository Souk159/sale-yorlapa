import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logActivity, getIP } from "@/lib/activity";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "ບໍ່ມີສິດ" }, { status: 403 });
  }
  const { id } = await params;
  if (id === session.user.id) {
    return NextResponse.json({ error: "ບໍ່ສາມາດແກ້ໄຂຕົວເອງໄດ້" }, { status: 400 });
  }
  const { role } = await req.json();
  const user = await prisma.user.update({
    where: { id }, data: { role },
    select: { id: true, name: true, email: true, role: true },
  });
  await logActivity({
    userId: session.user.id, userName: session.user.name!, userRole: session.user.role,
    action: "USER_ROLE", target: user.name, targetId: id,
    detail: `→ ${role}`, ip: getIP(req),
  });
  return NextResponse.json(user);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "ບໍ່ມີສິດ" }, { status: 403 });
  }
  const { id } = await params;
  if (id === session.user.id) {
    return NextResponse.json({ error: "ບໍ່ສາມາດລຶບຕົວເອງໄດ້" }, { status: 400 });
  }
  const target = await prisma.user.findUnique({ where: { id }, select: { name: true } });
  await prisma.user.delete({ where: { id } });
  await logActivity({
    userId: session.user.id, userName: session.user.name!, userRole: session.user.role,
    action: "USER_DELETE", target: target?.name ?? id, targetId: id, ip: getIP(req),
  });
  return NextResponse.json({ ok: true });
}
