import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logActivity, getIP } from "@/lib/activity";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id }, include: { category: true } });
  if (!product) return NextResponse.json({ error: "ບໍ່ພົບສິນຄ້າ" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "ບໍ່ມີສິດ" }, { status: 403 });
  }
  const { id } = await params;
  const data = await req.json();
  const product = await prisma.product.update({ where: { id }, data });
  const action = "isActive" in data && Object.keys(data).length === 1
    ? "PRODUCT_TOGGLE" : "PRODUCT_UPDATE";
  await logActivity({
    userId: session.user.id, userName: session.user.name!, userRole: session.user.role,
    action, target: product.name, targetId: id,
    detail: action === "PRODUCT_TOGGLE" ? (data.isActive ? "ເປີດໃຊ້ງານ" : "ປິດໃຊ້ງານ") : undefined,
    ip: getIP(req),
  });
  return NextResponse.json(product);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "ບໍ່ມີສິດ" }, { status: 403 });
  }
  const { id } = await params;
  let productName = id;
  try {
    const p = await prisma.product.findUnique({ where: { id }, select: { name: true } });
    productName = p?.name ?? id;
    await prisma.product.delete({ where: { id } });
  } catch {
    await prisma.product.update({ where: { id }, data: { isActive: false } });
  }
  await logActivity({
    userId: session.user.id, userName: session.user.name!, userRole: session.user.role,
    action: "PRODUCT_DELETE", target: productName, targetId: id, ip: getIP(req),
  });
  return NextResponse.json({ ok: true });
}
