"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatPrice, formatGrams } from "@/lib/utils";
import {
  Package, Clock, CheckCircle, Truck, XCircle, Upload,
  MapPin, Calendar, ChevronDown, ChevronUp, Loader2,
} from "lucide-react";
import Link from "next/link";

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  address?: string;
  googleMapsLink?: string;
  note?: string;
  deliveryDate?: string;
  createdAt: string;
  slipImage?: string;
  items: { id: string; gramsPerBag: number; quantity: number; grams: number; totalPrice: number; product: { name: string } }[];
}

const STEPS = [
  { key: "PENDING",       label: "ຮັບ Order",       icon: Clock },
  { key: "CONFIRMED",     label: "ຢືນຢັນຊຳລະ",     icon: CheckCircle },
  { key: "PREPARING",     label: "ກຳລັງອັດສິນຄ້າ",  icon: Package },
  { key: "SHIPPED",       label: "ກຳລັງຈັດສົ່ງ",    icon: Truck },
  { key: "DELIVERED",     label: "ຮອດແລ້ວ ✓",       icon: CheckCircle },
] as const;

const STATUS_ORDER: Record<string, number> = {
  PENDING: 0, SLIP_UPLOADED: 0,
  CONFIRMED: 1, PREPARING: 2, SHIPPED: 3, DELIVERED: 4,
};

function OrderTimeline({ status }: { status: string }) {
  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-2 px-5 py-4 bg-red-50 border-t border-red-100">
        <XCircle size={16} className="text-red-500" />
        <span className="text-sm font-medium text-red-600">ຍົກເລີກແລ້ວ</span>
      </div>
    );
  }

  const currentIdx = STATUS_ORDER[status] ?? 0;
  const showPaymentNote = status === "PENDING" || status === "SLIP_UPLOADED";

  return (
    <div className="px-5 py-4 border-t border-gray-50">
      {showPaymentNote && (
        <div className="mb-4 flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2.5 text-sm text-yellow-700">
          <Clock size={14} className="flex-shrink-0" />
          {status === "PENDING" ? "ລໍຖ້າການຊຳລະ — ກະລຸນາໂອນ ແລະ ສົ່ງ slip" : "ຮັບ slip ແລ້ວ · ກຳລັງລໍຖ້າຢືນຢັນ"}
        </div>
      )}
      <div className="flex items-center">
        {STEPS.map((step, i) => {
          const done = i <= currentIdx;
          const active = i === currentIdx;
          const Icon = step.icon;
          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                  done
                    ? active
                      ? "bg-green-600 border-green-600 shadow-lg shadow-green-200"
                      : "bg-green-100 border-green-300"
                    : "bg-white border-gray-200"
                }`}>
                  <Icon size={14} className={done ? active ? "text-white" : "text-green-600" : "text-gray-300"} />
                </div>
                <p className={`text-[10px] mt-1.5 text-center w-16 leading-tight ${
                  active ? "text-green-700 font-semibold" : done ? "text-green-600" : "text-gray-400"
                }`}>{step.label}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 mb-4 rounded-full ${i < currentIdx ? "bg-green-300" : "bg-gray-100"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const { status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") {
      fetch("/api/orders").then((r) => r.json()).then((d) => { setOrders(d); setLoading(false); });
    }
  }, [status, router]);

  const handleSlipUpload = async (orderId: string, file: File) => {
    setUploadingId(orderId);
    const fd = new FormData();
    fd.append("slip", file);
    await fetch(`/api/orders/${orderId}/slip`, { method: "POST", body: fd });
    const updated = await fetch("/api/orders").then((r) => r.json());
    setOrders(updated);
    setUploadingId("");
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-green-100 h-40 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">ການສັ່ງຂອງຂ້ອຍ</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Package size={48} className="mx-auto mb-3 text-green-200" />
          <p className="mb-4">ຍັງບໍ່ມີການສັ່ງ</p>
          <Link href="/shop" className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-medium text-sm">
            ໄປເລືອກສິນຄ້າ
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isOpen = expanded === order.id;
            return (
              <div key={order.id} className="bg-white rounded-2xl border border-green-100 overflow-hidden shadow-sm">
                {/* Header */}
                <button
                  className="w-full px-5 py-4 text-left hover:bg-gray-50/50 transition-colors"
                  onClick={() => setExpanded(isOpen ? null : order.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-gray-800">#{order.orderNumber}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString("lo-LA", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-green-600 text-sm">{formatPrice(order.totalAmount)}</span>
                      {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </div>
                  </div>
                </button>

                {/* Timeline always visible */}
                <OrderTimeline status={order.status} />

                {/* Expanded detail */}
                {isOpen && (
                  <div className="border-t border-gray-50 px-5 py-4 space-y-4">
                    {/* Items */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">ລາຍການ</p>
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {item.product.name} · {formatGrams(item.gramsPerBag)} × {item.quantity} ຖົງ
                            <span className="text-gray-400"> = {formatGrams(item.grams)}</span>
                          </span>
                          <span className="text-green-600 font-medium flex-shrink-0 ml-2">{formatPrice(item.totalPrice)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between font-bold text-gray-800 pt-1 border-t border-gray-50">
                        <span>ລວມ</span>
                        <span className="text-green-600">{formatPrice(order.totalAmount)}</span>
                      </div>
                    </div>

                    {/* Address + Maps */}
                    {(order.address || order.googleMapsLink) && (
                      <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">ທີ່ຢູ່ຈັດສົ່ງ</p>
                        {order.address && (
                          <p className="text-sm text-gray-700">{order.address}</p>
                        )}
                        {order.googleMapsLink && (
                          <a href={order.googleMapsLink} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-green-600 hover:text-green-700 font-medium hover:underline">
                            <MapPin size={12} /> ເບິ່ງໃນ Google Maps
                          </a>
                        )}
                      </div>
                    )}

                    {/* Delivery date */}
                    {order.deliveryDate && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={14} className="text-green-500" />
                        <span>ຄາດໄດ້ຮັບ: <span className="font-semibold text-gray-800">
                          {new Date(order.deliveryDate).toLocaleDateString("lo-LA", { weekday: "long", day: "numeric", month: "long" })}
                        </span></span>
                      </div>
                    )}

                    {/* Note */}
                    {order.note && (
                      <p className="text-sm text-gray-500 italic">"{order.note}"</p>
                    )}

                    {/* Upload slip */}
                    {order.status === "PENDING" && (
                      <label className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-green-200 hover:border-green-400 hover:bg-green-50 rounded-xl py-3 cursor-pointer transition-colors text-sm text-green-600 font-medium">
                        {uploadingId === order.id
                          ? <><Loader2 size={15} className="animate-spin" /> ກຳລັງສົ່ງ...</>
                          : <><Upload size={15} /> ສົ່ງໃບໂອນ</>
                        }
                        <input type="file" accept="image/*" className="hidden"
                          disabled={uploadingId === order.id}
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleSlipUpload(order.id, f); }}
                        />
                      </label>
                    )}

                    {order.slipImage && (
                      <a href={order.slipImage} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-500 hover:underline">
                        ເບິ່ງໃບໂອນທີ່ສົ່ງ
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
