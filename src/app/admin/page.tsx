import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Package, ShoppingBag, Users, Settings } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default async function AdminPage() {
  const [totalOrders, pendingOrders, totalProducts, totalRevenue] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "SLIP_UPLOADED" } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { in: ["CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED"] } },
    }),
  ]);

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
  });

  const stats = [
    { label: "ທັງໝົດ Order", value: totalOrders, icon: <Package size={22} />, color: "text-blue-600 bg-blue-50" },
    { label: "ລໍຖ້າຢືນຢັນ", value: pendingOrders, icon: <ShoppingBag size={22} />, color: "text-yellow-600 bg-yellow-50" },
    { label: "ສິນຄ້າທັງໝົດ", value: totalProducts, icon: <Users size={22} />, color: "text-green-600 bg-green-50" },
    { label: "ຍອດຮັບທັງໝົດ", value: formatPrice(totalRevenue._sum.totalAmount ?? 0), icon: <Settings size={22} />, color: "text-purple-600 bg-purple-50" },
  ];

  const statusLabel: Record<string, string> = {
    PENDING: "ລໍຖ້າ", SLIP_UPLOADED: "ສົ່ງ slip", CONFIRMED: "ຢືນຢັນ",
    PREPARING: "ກຳລັງອັດ", SHIPPED: "ຈັດສົ່ງ", DELIVERED: "ຮອດ", CANCELLED: "ຍົກເລີກ",
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800">🌿 Admin Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/admin/products" className="text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-medium">ສິນຄ້າ</Link>
          <Link href="/admin/orders" className="text-sm bg-white border border-green-200 hover:bg-green-50 text-green-700 px-4 py-2 rounded-xl font-medium">Order</Link>
          <Link href="/admin/settings" className="text-sm bg-white border border-green-200 hover:bg-green-50 text-green-700 px-4 py-2 rounded-xl font-medium">ຕັ້ງຄ່າ QR</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-green-100 p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>{s.icon}</div>
            <p className="text-2xl font-bold text-gray-800">{s.value}</p>
            <p className="text-sm text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-green-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex justify-between items-center">
          <h2 className="font-bold text-gray-700">Order ຫຼ້າສຸດ</h2>
          <Link href="/admin/orders" className="text-sm text-green-600 hover:text-green-700">ເຫັນທັງໝົດ →</Link>
        </div>
        <div className="divide-y divide-gray-50">
          {recentOrders.map((o) => (
            <div key={o.id} className="px-5 py-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700 text-sm">#{o.orderNumber}</p>
                <p className="text-xs text-gray-400">{o.user.name}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600 text-sm">{formatPrice(o.totalAmount)}</p>
                <span className="text-xs text-gray-400">{statusLabel[o.status]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
