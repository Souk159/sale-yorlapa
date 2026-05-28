"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCart, useCartTotal } from "@/hooks/useCart";
import { formatPrice, formatGrams } from "@/lib/utils";
import Image from "next/image";
import { CheckCircle, Upload, Loader2, QrCode, MapPin, Navigation } from "lucide-react";

interface QRData {
  image: string;
  bankName: string;
  accountName: string;
  accountNumber?: string;
}

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, clearCart } = useCart();
  const totalAmount = useCartTotal();

  const [qr, setQr] = useState<QRData | null>(null);
  const [address, setAddress] = useState("");
  const [googleMapsLink, setGoogleMapsLink] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);
  const [note, setNote] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [step, setStep] = useState<"form" | "qr" | "done">("form");
  const [orderId, setOrderId] = useState("");
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings/qr").then((r) => r.json()).then(setQr);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login?redirect=/checkout");
  }, [status, router]);

  if (items.length === 0 && step === "form") {
    router.push("/cart");
    return null;
  }

  const detectGPS = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setGoogleMapsLink(`https://maps.google.com/?q=${lat},${lng}`);
        setGpsLoading(false);
      },
      () => setGpsLoading(false),
      { timeout: 10000 }
    );
  };

  const handleOrder = async () => {
    setSubmitting(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        address,
        googleMapsLink: googleMapsLink || null,
        note,
        deliveryDate,
        items: items.map((i) => ({
          productId: i.productId,
          gramsPerBag: i.gramsPerBag,
          quantity: i.quantity,
        })),
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setOrderId(data.id);
      clearCart();
      setStep("qr");
    }
    setSubmitting(false);
  };

  const handleSlipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSlipFile(file);
      setSlipPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitSlip = async () => {
    if (!slipFile || !orderId) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("slip", slipFile);
    const res = await fetch(`/api/orders/${orderId}/slip`, { method: "POST", body: fd });
    if (res.ok) setStep("done");
    setUploading(false);
  };

  if (step === "done") {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">ສຳເລັດ!</h2>
        <p className="text-gray-500 mb-6">ສົ່ງໃບໂອນແລ້ວ · ກຳລັງລໍຖ້າການຢືນຢັນ</p>
        <button onClick={() => router.push("/orders")} className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-xl transition-colors">
          ເຫັນ Order ຂອງຂ້ອຍ
        </button>
      </div>
    );
  }

  if (step === "qr") {
    return (
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-green-100 p-6 space-y-5">
          <div className="text-center">
            <QrCode size={32} className="text-green-600 mx-auto mb-2" />
            <h2 className="text-xl font-bold text-gray-800">ສະແກນ QR ໂອນເງິນ</h2>
            <p className="text-green-600 text-xl font-bold mt-1">{formatPrice(totalAmount)}</p>
          </div>

          {qr ? (
            <div className="space-y-3">
              <div className="bg-green-50 rounded-xl p-4 text-center space-y-1">
                <p className="text-sm text-gray-500">{qr.bankName}</p>
                <p className="font-bold text-gray-800">{qr.accountName}</p>
                {qr.accountNumber && <p className="text-sm text-green-600">{qr.accountNumber}</p>}
              </div>
              <div className="relative h-64 w-full rounded-xl overflow-hidden border border-green-100">
                <Image src={qr.image} alt="QR Payment" fill className="object-contain p-2" />
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center text-sm text-yellow-700">
              ⚠️ ຍັງບໍ່ມີ QR — ກະລຸນາຕິດຕໍ່ຮ້ານ
            </div>
          )}

          {/* Upload slip */}
          <div className="space-y-3">
            <p className="font-semibold text-gray-700">ອັບໂຫລດໃບໂອນ</p>
            <label className="block w-full border-2 border-dashed border-green-200 rounded-xl p-6 text-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors">
              {slipPreview ? (
                <div className="relative h-40 w-full">
                  <Image src={slipPreview} alt="slip" fill className="object-contain rounded-lg" />
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload size={32} className="text-green-400 mx-auto" />
                  <p className="text-sm text-gray-400">ກົດເພື່ອເລືອກຮູບ slip</p>
                  <p className="text-xs text-gray-300">PNG, JPG, HEIC</p>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleSlipUpload} className="hidden" />
            </label>

            <button
              onClick={handleSubmitSlip}
              disabled={!slipFile || uploading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
              {uploading ? "ກຳລັງສົ່ງ..." : "ສົ່ງໃບໂອນ"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">ຢືນຢັນການສັ່ງ</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order items */}
        <div className="bg-white rounded-2xl border border-green-100 p-5 space-y-3">
          <h2 className="font-bold text-gray-700">ລາຍການສິນຄ້າ</h2>
          {items.map((item) => {
            const totalGrams = item.gramsPerBag * item.quantity;
            return (
              <div key={item.productId} className="flex justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-medium text-gray-700">{item.product.name}</p>
                  <p className="text-gray-400">{formatGrams(item.gramsPerBag)} × {item.quantity} ຖົງ = {formatGrams(totalGrams)}</p>
                </div>
                <p className="font-bold text-green-600">{formatPrice(item.product.pricePerGram * totalGrams)}</p>
              </div>
            );
          })}
          <div className="flex justify-between font-bold text-gray-800 pt-2">
            <span>ລວມ</span>
            <span className="text-green-600 text-lg">{formatPrice(totalAmount)}</span>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-green-100 p-5 space-y-4">
          <h2 className="font-bold text-gray-700">ຂໍ້ມູນຈັດສົ່ງ</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-500 mb-1 block">ທີ່ຢູ່ຈັດສົ່ງ *</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="ໃສ່ຊື່ຮ້ານ / ບ້ານ / ເຂດ ຫຼື ສະຖານທີ່ຮັບສິນຄ້າ"
                rows={3}
                className="w-full border border-green-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 resize-none"
              />
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block flex items-center gap-1">
                <MapPin size={13} /> Google Maps (ບໍ່ຈຳເປັນ)
              </label>
              <div className="flex gap-2">
                <input
                  value={googleMapsLink}
                  onChange={(e) => setGoogleMapsLink(e.target.value)}
                  placeholder="Paste Google Maps link ຫຼືກົດ GPS"
                  className="flex-1 border border-green-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                />
                <button
                  type="button"
                  onClick={detectGPS}
                  disabled={gpsLoading}
                  title="ໃຊ້ location ປັດຈຸບັນ"
                  className="flex items-center gap-1.5 px-3 py-2.5 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 text-xs font-medium rounded-xl transition-colors disabled:opacity-50 flex-shrink-0"
                >
                  {gpsLoading ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
                  GPS
                </button>
              </div>
              {googleMapsLink && (
                <a href={googleMapsLink} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-green-600 hover:underline mt-1.5">
                  <MapPin size={11} /> ເບິ່ງໃນ Maps
                </a>
              )}
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">ວັນທີ່ຕ້ອງການຮັບ</label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full border border-green-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
              />
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">ໝາຍເຫດ</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="ຂໍ້ຄວາມເພີ່ມເຕີມ (ບໍ່ຈຳເປັນ)"
                rows={2}
                className="w-full border border-green-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 resize-none"
              />
            </div>
          </div>

          <button
            onClick={handleOrder}
            disabled={!address || submitting}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
            {submitting ? "ກຳລັງດຳເນີນການ..." : "ຢືນຢັນ ແລະ ຊຳລະ"}
          </button>
        </div>
      </div>
    </div>
  );
}
