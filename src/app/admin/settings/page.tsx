"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Upload, Loader2, CheckCircle, QrCode } from "lucide-react";

interface QRData {
  id: string;
  image: string;
  bankName: string;
  accountName: string;
  accountNumber?: string;
}

export default function AdminSettingsPage() {
  const [current, setCurrent] = useState<QRData | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings/qr")
      .then((r) => r.json())
      .then((d) => {
        if (d?.id) {
          setCurrent(d);
          setBankName(d.bankName);
          setAccountName(d.accountName);
          setAccountNumber(d.accountNumber ?? "");
        }
      });
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setPreview(URL.createObjectURL(f)); }
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file && !current) return;
    setLoading(true);
    setSuccess(false);

    const fd = new FormData();
    if (file) fd.append("qr", file);
    else if (current) fd.append("keepExisting", "true");
    fd.append("bankName", bankName);
    fd.append("accountName", accountName);
    fd.append("accountNumber", accountNumber);

    const res = await fetch("/api/admin/settings/qr", { method: "POST", body: fd });
    if (res.ok) {
      const data = await res.json();
      setCurrent(data);
      setSuccess(true);
      setFile(null);
      setPreview("");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <QrCode className="text-green-600" /> ຕັ້ງຄ່າ QR ຊຳລະເງິນ
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current QR */}
        <div className="bg-white rounded-2xl border border-green-100 p-5 space-y-3">
          <h2 className="font-semibold text-gray-700">QR ປັດຈຸບັນ</h2>
          {current ? (
            <>
              <div className="relative h-56 rounded-xl overflow-hidden border border-green-100">
                <Image src={current.image} alt="QR" fill className="object-contain p-2" />
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-sm space-y-1">
                <p><span className="text-gray-400">ທະນາຄານ:</span> <span className="font-medium">{current.bankName}</span></p>
                <p><span className="text-gray-400">ຊື່ບັນຊີ:</span> <span className="font-medium">{current.accountName}</span></p>
                {current.accountNumber && <p><span className="text-gray-400">ເລກບັນຊີ:</span> <span className="font-medium">{current.accountNumber}</span></p>}
              </div>
            </>
          ) : (
            <div className="h-40 bg-green-50 rounded-xl flex items-center justify-center text-gray-400">
              <p className="text-sm">ຍັງບໍ່ມີ QR</p>
            </div>
          )}
        </div>

        {/* Upload form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-green-100 p-5 space-y-4">
          <h2 className="font-semibold text-gray-700">ອັບເດດ QR ໃໝ່</h2>

          {success && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-xl text-sm">
              <CheckCircle size={16} /> ບັນທຶກສຳເລັດ
            </div>
          )}

          {/* QR upload zone */}
          <label className="block border-2 border-dashed border-green-200 rounded-xl p-4 text-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors">
            {preview ? (
              <div className="relative h-40">
                <Image src={preview} alt="preview" fill className="object-contain rounded-lg" />
              </div>
            ) : (
              <div className="space-y-2 py-4">
                <Upload size={28} className="text-green-400 mx-auto" />
                <p className="text-sm text-gray-400">ກົດເພື່ອອັບໂຫລດ QR</p>
                <p className="text-xs text-gray-300">PNG, JPG</p>
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </label>

          <div>
            <label className="text-sm text-gray-500 mb-1 block">ທະນາຄານ *</label>
            <input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="BCEL, LDB, ..." required
              className="w-full border border-green-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300" />
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">ຊື່ບັນຊີ *</label>
            <input value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="ຊື່ - ນາມສະກຸນ" required
              className="w-full border border-green-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300" />
          </div>
          <div>
            <label className="text-sm text-gray-500 mb-1 block">ເລກບັນຊີ</label>
            <input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="xxx-xxx-xxx"
              className="w-full border border-green-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300" />
          </div>

          <button type="submit" disabled={loading || (!file && !current)}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-200 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            {loading ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກ QR"}
          </button>
        </form>
      </div>
    </div>
  );
}
