import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logActivity, getIP } from "@/lib/activity";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("categoryId");
  const search = searchParams.get("search");
  const all = searchParams.get("all") === "true";

  const products = await prisma.product.findMany({
    where: {
      ...(all ? {} : { isActive: true }),
      ...(categoryId && { categoryId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { nameEn: { contains: search, mode: "insensitive" } },
        ],
      }),
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "ບໍ່ມີສິດ" }, { status: 403 });
  }

  try {
    const data = await req.json();
    const product = await prisma.product.create({ data });
    await logActivity({
      userId: session.user.id, userName: session.user.name!, userRole: session.user.role,
      action: "PRODUCT_CREATE", target: product.name, targetId: product.id, ip: getIP(req),
    });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "ເກີດຂໍ້ຜິດພາດ" }, { status: 500 });
  }
}
