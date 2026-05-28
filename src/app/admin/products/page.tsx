"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Edit2, Trash2, Loader2, Wind, Eye, EyeOff } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Category { id: string; name: string }
interface Product {
  id: string; name: string; nameEn?: string; description?: string;
  image?: string; pricePerGram: number; minGram: number; maxGram: number;
  stepGram: number; isVacuum: boolean; isActive: boolean; categoryId?: string;
  category?: { name: string };
}

const EMPTY = {
  name: "", nameEn: "", description: "", image: "",
  pricePerGram: 0, minGram: 100, maxGram: 5000, stepGram: 50,
  isVacuum: true, categoryId: "",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const load = () => {
    fetch("/api/products?all=true").then((r) => r.json()).then(setProducts);
    fetch("/api/categories").then((r) => r.json()).then(setCategories);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null); setForm(EMPTY);
    setImageFile(null); setImagePreview(""); setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, nameEn: p.nameEn ?? "", description: p.description ?? "",
      image: p.image ?? "", pricePerGram: p.pricePerGram, minGram: p.minGram,
      maxGram: p.maxGram, stepGram: p.stepGram, isVacuum: p.isVacuum,
      categoryId: p.categoryId ?? "",
    });
    setImagePreview(p.image ?? ""); setImageFile(null); setShowForm(true);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "products");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok || !data.url) {
      alert(`Upload ຜິດພາດ: ${data.error ?? "ບໍ່ຮູ້ສາເຫດ"}`);
      return null;
    }
    return data.url as string;
  };

  const handleSave = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    let imageUrl: string | null = form.image || null;
    if (imageFile) {
      const uploaded = await uploadImage(imageFile);
      if (uploaded === null) { setSaving(false); return; }
      imageUrl = uploaded;
    }
    const payload = {
      name: form.name, nameEn: form.nameEn, description: form.description,
      image: imageUrl,
      pricePerGram: Number(form.pricePerGram),
      minGram: Number(form.minGram),
      maxGram: Number(form.maxGram),
      stepGram: Number(form.stepGram),
      isVacuum: form.isVacuum,
      categoryId: form.categoryId || null,
    };
    const res = editing
      ? await fetch(`/api/products/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(`ບັນທຶກຜິດພາດ: ${d.error ?? res.status}`);
    }
    setSaving(false); setShowForm(false); load();
  };

  const toggleActive = async (p: Product) => {
    await fetch(`/api/products/${p.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !p.isActive }),
    });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ຢືນຢັນລຶບສິນຄ້ານີ້?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" }); load();
  };

  const setF = (key: string, val: unknown) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">ສິນຄ້າທັງໝົດ</h1>
          <p className="text-sm text-gray-400">{products.length} ລາຍການ</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2.5 rounded-xl transition-colors text-sm">
          <Plus size={17} /> ເພີ່ມສິນຄ້າ
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-green-100 overflow-hidden">
        {products.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-2">📦</p>
            <p>ຍັງບໍ່ມີສິນຄ້າ — ກົດ &quot;ເພີ່ມສິນຄ້າ&quot; ໄດ້ເລີຍ</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-green-50 text-green-700 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">ສິນຄ້າ</th>
                <th className="px-4 py-3 text-left">ໝວດ</th>
                <th className="px-4 py-3 text-right">ລາຄາ/ກຣາມ</th>
                <th className="px-4 py-3 text-center">ກຣາມ (min–max)</th>
                <th className="px-4 py-3 text-center">ສະຖານະ</th>
                <th className="px-4 py-3 text-center">ຈັດການ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((p) => (
                <tr key={p.id} className={`hover:bg-green-50/30 transition-colors ${!p.isActive ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-50 flex-shrink-0 overflow-hidden relative">
                        {p.image
                          ? <Image src={p.image} alt={p.name} fill className="object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-lg">🌿</div>
                        }
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 flex items-center gap-1">
                          {p.name}
                          {p.isVacuum && <Wind size={11} className="text-green-500" />}
                        </p>
                        {p.nameEn && <p className="text-xs text-gray-400">{p.nameEn}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.category?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-right font-medium text-green-600">{formatPrice(p.pricePerGram)}</td>
                  <td className="px-4 py-3 text-center text-gray-500">{p.minGram}–{p.maxGram}g</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleActive(p)}
                      className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${p.isActive ? "bg-green-100 text-green-700 hover:bg-red-50 hover:text-red-600" : "bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-700"}`}>
                      {p.isActive ? <><Eye size={11} /> ເປີດ</> : <><EyeOff size={11} /> ປິດ</>}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-green-100 rounded-lg transition-colors" title="ແກ້ໄຂ">
                        <Edit2 size={15} className="text-green-600" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="ລຶບ">
                        <Trash2 size={15} className="text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white rounded-t-2xl">
              <h2 className="font-bold text-gray-800">{editing ? "✏️ ແກ້ໄຂສິນຄ້າ" : "➕ ເພີ່ມສິນຄ້າໃໝ່"}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">✕</button>
            </div>

            <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
              {/* Image upload */}
              <label className="block border-2 border-dashed border-green-200 rounded-xl text-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors overflow-hidden">
                {imagePreview ? (
                  <div className="relative h-36">
                    <Image src={imagePreview} alt="preview" fill className="object-contain" />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <p className="text-white text-sm">ປ່ຽນຮູບ</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-sm text-gray-400 space-y-1">
                    <p className="text-2xl">📷</p>
                    <p>ກົດເພື່ອອັບໂຫລດຮູບ</p>
                    <p className="text-xs text-gray-300">PNG, JPG</p>
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); }
                }} />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 mb-1 block font-medium">ຊື່ສິນຄ້າ *</label>
                  <input value={form.name} onChange={(e) => setF("name", e.target.value)} placeholder="ເຊັ່ນ: ໝາກຫຸ່ງ" required
                    className="w-full border border-green-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 mb-1 block font-medium">ຊື່ພາສາອັງກິດ</label>
                  <input value={form.nameEn} onChange={(e) => setF("nameEn", e.target.value)} placeholder="e.g. Papaya"
                    className="w-full border border-green-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 mb-1 block font-medium">ລາຍລະອຽດ</label>
                  <textarea value={form.description} onChange={(e) => setF("description", e.target.value)} rows={2} placeholder="ລາຍລະອຽດສິນຄ້າ..."
                    className="w-full border border-green-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 resize-none" />
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-1 block font-medium">ລາຄາ/ກຣາມ (ກີບ) *</label>
                  <input type="number" min={0} value={form.pricePerGram} onChange={(e) => setF("pricePerGram", e.target.value)} required
                    className="w-full border border-green-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block font-medium">ໝວດໝູ່</label>
                  <select value={form.categoryId} onChange={(e) => setF("categoryId", e.target.value)}
                    className="w-full border border-green-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 bg-white">
                    <option value="">-- ບໍ່ລະບຸ --</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block font-medium">ກຣາມຂັ້ນຕ່ຳ</label>
                  <input type="number" min={1} value={form.minGram} onChange={(e) => setF("minGram", e.target.value)}
                    className="w-full border border-green-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block font-medium">ກຣາມສູງສຸດ</label>
                  <input type="number" min={1} value={form.maxGram} onChange={(e) => setF("maxGram", e.target.value)}
                    className="w-full border border-green-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block font-medium">Step slider</label>
                  <input type="number" min={1} value={form.stepGram} onChange={(e) => setF("stepGram", e.target.value)}
                    className="w-full border border-green-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300" />
                </div>
                <div className="flex items-center gap-3 col-span-1 pt-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={form.isVacuum} onChange={(e) => setF("isVacuum", e.target.checked)} className="sr-only peer" />
                    <div className="w-10 h-5 bg-gray-200 peer-checked:bg-green-500 rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                  </label>
                  <span className="text-sm text-gray-600 flex items-center gap-1"><Wind size={14} className="text-green-500" /> ອັດສູນຍາກາດ</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-200 text-gray-500 hover:bg-gray-50 font-medium py-2.5 rounded-xl text-sm transition-colors">
                  ຍົກເລີກ
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors">
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {saving ? "ກຳລັງບັນທຶກ..." : (editing ? "ບັນທຶກການແກ້ໄຂ" : "ເພີ່ມສິນຄ້າ")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
