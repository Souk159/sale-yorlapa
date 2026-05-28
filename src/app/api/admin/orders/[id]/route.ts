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
  const { status, deliveryDate } = await req.json();
  const order = await prisma.order.update({
    where: { id },
    data: { status, ...(deliveryDate ? { deliveryDate: new Date(deliveryDate) } : {}) },
  });
  await logActivity({
    userId: session.user.id, userName: session.user.name!, userRole: session.user.role,
    action: "ORDER_STATUS", target: order.orderNumber, targetId: id,
    detail: status, ip: getIP(req),
  });
  return NextResponse.json(order);
}
