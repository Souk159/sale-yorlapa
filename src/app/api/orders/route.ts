import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";
import { logActivity, getIP } from "@/lib/activity";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "ກະລຸນາເຂົ້າສູ່ລະບົບ" }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "ກະລຸນາເຂົ້າສູ່ລະບົບ" }, { status: 401 });

  const { address, googleMapsLink, note, deliveryDate, items } = await req.json();

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "ຕະກ້າຫວ່າງ" }, { status: 400 });
  }

  // Verify products & calculate total from DB prices (ປ້ອງກັນ client ແຕ່ງລາຄາ)
  const productIds = items.map((i: { productId: string }) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

  const orderItems = items.map((item: { productId: string; gramsPerBag: number; quantity: number }) => {
    const product = productMap[item.productId];
    const totalGrams = item.gramsPerBag * item.quantity;
    return {
      productId: item.productId,
      gramsPerBag: item.gramsPerBag,
      quantity: item.quantity,
      grams: totalGrams,
      pricePerGram: product.pricePerGram,
      totalPrice: product.pricePerGram * totalGrams,
    };
  });

  const totalAmount = orderItems.reduce((s: number, i: { totalPrice: number }) => s + i.totalPrice, 0);

  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId: session.user.id,
      totalAmount,
      address,
      googleMapsLink: googleMapsLink ?? null,
      note,
      deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
      items: { create: orderItems },
    },
    include: { items: { include: { product: true } } },
  });

  await logActivity({
    userId: session.user.id, userName: session.user.name!, userRole: session.user.role,
    action: "ORDER_CREATE", target: order.orderNumber, targetId: order.id, ip: getIP(req),
  });

  return NextResponse.json(order);
}
