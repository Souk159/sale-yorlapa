import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/superadmin-guard";

export async function GET() {
  const denied = await requireSuperAdmin();
  if (denied) return denied;

  try {
  const [
    totalUsers,
    totalAdmins,
    superAdmins,
    totalProducts,
    activeProducts,
    totalOrders,
    pendingOrders,
    slipUploaded,
    confirmedOrders,
    totalRevenue,
    recentOrders,
    recentUsers,
    activityLogs,
    onlineUsers,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { role: "SUPER_ADMIN" } }),
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "SLIP_UPLOADED" } }),
    prisma.order.count({ where: { status: { in: ["CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED"] } } }),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { in: ["CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED"] } },
    }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
    // Activity logs: last 50 entries
    prisma.activityLog.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
    }),
    // Users active in last 15 minutes (by lastLoginAt is not perfect, but usable)
    prisma.user.findMany({
      where: {
        lastLoginAt: { gte: new Date(Date.now() - 15 * 60 * 1000) },
      },
      select: { id: true, name: true, role: true, lastLoginAt: true },
      orderBy: { lastLoginAt: "desc" },
    }),
  ]);

  return NextResponse.json({
    users: { total: totalUsers, admins: totalAdmins, superAdmins },
    products: { total: totalProducts, active: activeProducts, inactive: totalProducts - activeProducts },
    orders: { total: totalOrders, pending: pendingOrders, slipUploaded, confirmed: confirmedOrders },
    revenue: totalRevenue._sum.totalAmount ?? 0,
    recentOrders,
    recentUsers,
    activityLogs,
    onlineUsers,
  });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[superadmin/stats]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
