"use client";

import { useEffect, useState } from "react";
import { formatPrice, formatGrams } from "@/lib/utils";
import Image from "next/image";
import { MapPin, Calendar } from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  address?: string;
  googleMapsLink?: string;
  note?: string;
  deliveryDate?: string;
  slipImage?: string;
  user: { name: string; email: string; phone?: string };
  items: { id: string; grams: number; totalPrice: number; product: { name: string } }[];
}

const STATUSES = [
  { value: "", label: "ທັງໝົດ" },
  { value: "PENDING", label: "ລໍຖ້າຊຳລະ" },
  { value: "SLIP_UPLOADED", label: "ສົ່ງ slip" },
  { value: "CONFIRMED", label: "ຢືນຢັນ" },
  { value: "PREPARING", label: "ກຳລັງອັດ" },
  { value: "SHIPPED", label: "ຈັດສົ່ງ" },
  { value: "DELIVERED", label: "ຮອດ" },
  { value: "CANCELLED", label: "ຍົກເລີກ" },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  SLIP_UPLOADED: "bg-blue-100 text-blue-700",
  CONFIRMED: "bg-green-100 text-green-700",
  PREPARING: "bg-purple-100 text-purple-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-green-200 text-green-800",
  CANCELLED: "bg-red-100 text-red-600",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = (status: string) => {
    setLoading(true);
    const q = status ? `?status=${status}` : "";
    fetch(`/api/admin/orders${q}`)
      .then((r) => r.json())
      .then((d) => { setOrders(d); setLoading(false); });
  };

  useEffect(() => { load(filterStatus); }, [filterStatus]);

  const [deliveryEstimates, setDeliveryEstimates] = useState<Record<string, string>>({});

  const updateStatus = async (id: string, status: string) => {
    const body: Record<string, string> = { status };
    if (status === "SHIPPED" && deliveryEstimates[id]) {
      body.deliveryDate = deliveryEstimates[id];
    }
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    load(filterStatus);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">ຈັດການ Orders</h1>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => setFilterStatus(s.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filterStatus === s.value ? "bg-green-600 text-white" : "bg-white border border-green-200 text-green-700 hover:bg-green-50"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-20 border border-green-100 animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">ບໍ່ມີ Order</div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl border border-green-100 overflow-hidden">
              <div
                className="px-5 py-4 cursor-pointer hover:bg-green-50/50 transition-colors"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              >
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="font-bold text-gray-800">#{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">{order.user.name} · {order.user.phone ?? order.user.email}</p>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString("lo-LA")}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-green-600">{formatPrice(order.totalAmount)}</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>
                      {STATUSES.find((s) => s.value === order.status)?.label}
                    </span>
                  </div>
                </div>
              </div>

              {expanded === order.id && (
                <div className="border-t border-gray-50 px-5 py-4 space-y-4">
                  {/* Items */}
                  <div className="space-y-1">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.product.name} · {formatGrams(item.grams)}</span>
                        <span className="text-green-600 font-medium">{formatPrice(item.totalPrice)}</span>
                      </div>
                    ))}
                  </div>

                  {order.address && (
                    <p className="text-sm text-gray-500"><span className="font-medium">ທີ່ຢູ່:</span> {order.address}</p>
                  )}
                  {order.googleMapsLink && (
                    <a href={order.googleMapsLink} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-green-600 hover:underline font-medium">
                      <MapPin size={12} /> ເບິ່ງໃນ Google Maps
                    </a>
                  )}
                  {order.deliveryDate && (
                    <p className="text-sm text-gray-500 flex items-center gap-1.5">
                      <Calendar size={13} className="text-green-500" />
                      <span className="font-medium">ຄາດສົ່ງ:</span>{" "}
                      {new Date(order.deliveryDate).toLocaleDateString("lo-LA", { weekday: "long", day: "numeric", month: "long" })}
                    </p>
                  )}
                  {order.note && (
                    <p className="text-sm text-gray-500"><span className="font-medium">ໝາຍເຫດ:</span> {order.note}</p>
                  )}

                  {/* Slip */}
                  {order.slipImage && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">ໃບໂອນ:</p>
                      <a href={order.slipImage} target="_blank" rel="noreferrer">
                        <div className="relative h-40 w-40 rounded-xl overflow-hidden border border-green-100">
                          <Image src={order.slipImage} alt="slip" fill className="object-cover" />
                        </div>
                      </a>
                    </div>
                  )}

                  {/* Status update */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-50">
                    <span className="text-sm text-gray-500">ອັບເດດສະຖານະ:</span>
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="border border-green-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                    >
                      {STATUSES.filter((s) => s.value).map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                    {order.status !== "SHIPPED" && order.status !== "DELIVERED" && (
                      <div className="flex items-center gap-1.5 ml-auto">
                        <Calendar size={13} className="text-gray-400" />
                        <span className="text-xs text-gray-400">ຄາດສົ່ງ:</span>
                        <input
                          type="date"
                          value={deliveryEstimates[order.id] ?? ""}
                          onChange={(e) => setDeliveryEstimates((p) => ({ ...p, [order.id]: e.target.value }))}
                          min={new Date().toISOString().split("T")[0]}
                          className="border border-green-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-green-300"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
