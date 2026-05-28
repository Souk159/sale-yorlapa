"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Loader2, Tag } from "lucide-react";

interface Category {
  id: string;
  name: string;
  nameEn?: string;
  _count?: { products: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () =>
    fetch("/api/categories").then((r) => r.json()).then(setCategories);

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null); setName(""); setNameEn(""); setShowForm(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c); setName(c.name); setNameEn(c.nameEn ?? ""); setShowForm(true);
  };

  const handleSave = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const payload = { name, nameEn: nameEn || undefined };
    if (editing) {
      await fetch(`/api/categories/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    setSaving(false);
    setShowForm(false);
    load();
  };

  const handleDelete = async (id: string, productCount: number) => {
    if (productCount > 0) {
      alert(`ບໍ່ສາມາດລຶບໄດ້ — ມີ ${productCount} ສິນຄ້າໃນໝວດນີ້`);
      return;
    }
    if (!confirm("ຢືນຢັນລຶບໝວດນີ້?")) return;
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">ໝວດໝູ່ສິນຄ້າ</h1>
          <p className="text-sm text-gray-400">{categories.length} ໝວດ</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2.5 rounded-xl transition-colors text-sm"
        >
          <Plus size={17} /> ເພີ່ມໝວດ
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-green-100 overflow-hidden">
        {categories.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Tag size={40} className="mx-auto mb-3 text-green-200" />
            <p>ຍັງບໍ່ມີໝວດ — ກົດ &quot;ເພີ່ມໝວດ&quot; ໄດ້ເລີຍ</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-green-50 text-green-700 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">ຊື່ໝວດ</th>
                <th className="px-4 py-3 text-left">ຊື່ ENG</th>
                <th className="px-4 py-3 text-center">ສິນຄ້າ</th>
                <th className="px-4 py-3 text-center">ຈັດການ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-green-50/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Tag size={14} className="text-green-500 flex-shrink-0" />
                      <span className="font-medium text-gray-800">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{c.nameEn ?? "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium">
                      {c._count?.products ?? 0} ລາຍການ
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => openEdit(c)}
                        className="p-1.5 hover:bg-green-100 rounded-lg transition-colors"
                        title="ແກ້ໄຂ"
                      >
                        <Edit2 size={15} className="text-green-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c._count?.products ?? 0)}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        title="ລຶບ"
                      >
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
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-gray-800">{editing ? "✏️ ແກ້ໄຂໝວດ" : "➕ ເພີ່ມໝວດໃໝ່"}</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block font-medium">ຊື່ໝວດ (ລາວ) *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ເຊັ່ນ: ຜັກ, ຊີ້ນ, ເຄື່ອງເທດ"
                  required
                  className="w-full border border-green-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block font-medium">ຊື່ ENG (ໃຊ້ໃນ URL)</label>
                <input
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="e.g. vegetables, meat, spices"
                  className="w-full border border-green-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-200 text-gray-500 hover:bg-gray-50 font-medium py-2.5 rounded-xl text-sm transition-colors"
                >
                  ຍົກເລີກ
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {saving ? "ກຳລັງບັນທຶກ..." : (editing ? "ບັນທຶກ" : "ເພີ່ມໝວດ")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
