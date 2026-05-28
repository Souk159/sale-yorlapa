"use client";

import { useEffect, useState } from "react";
import {
  Users, Shield, User, Trash2, ShoppingBag, Calendar,
  Edit2, X, Check, Search, ChevronDown,
} from "lucide-react";

interface UserRow {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "SUPER_ADMIN" | "ADMIN" | "CUSTOMER";
  createdAt: string;
  _count: { orders: number };
}

const ROLES = ["SUPER_ADMIN", "ADMIN", "CUSTOMER"] as const;
const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  CUSTOMER: "ລູກຄ້າ",
};
const ROLE_COLOR: Record<string, string> = {
  SUPER_ADMIN: "bg-green-100 text-green-800 border-green-300",
  ADMIN:       "bg-blue-100 text-blue-700 border-blue-200",
  CUSTOMER:    "bg-gray-100 text-gray-600 border-gray-200",
};

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "SUPER_ADMIN" | "ADMIN" | "CUSTOMER">("ALL");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", role: "" });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/superadmin/users")
      .then((r) => r.json())
      .then((d) => { setUsers(d); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const startEdit = (u: UserRow) => {
    setEditingId(u.id);
    setEditForm({ name: u.name, email: u.email, phone: u.phone ?? "", role: u.role });
  };

  const cancelEdit = () => { setEditingId(null); };

  const saveEdit = async (id: string) => {
    setSaving(true);
    const res = await fetch(`/api/superadmin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone || null,
        role: editForm.role,
      }),
    });
    if (!res.ok) {
      const d = await res.json();
      alert(d.error);
    }
    setSaving(false);
    setEditingId(null);
    load();
  };

  const handleDelete = async (u: UserRow) => {
    const msg = u._count.orders > 0
      ? `${u.name} ມີ ${u._count.orders} orders — ລຶບ user ຈະລຶບ orders ທັງໝົດ. ຢືນຢັນ?`
      : `ຢືນຢັນລຶບ ${u.name}?`;
    if (!confirm(msg)) return;
    const res = await fetch(`/api/superadmin/users/${u.id}`, { method: "DELETE" });
    if (!res.ok) { const d = await res.json(); alert(d.error); return; }
    load();
  };

  const filtered = users
    .filter((u) => filter === "ALL" || u.role === filter)
    .filter((u) =>
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    );

  const counts = {
    ALL: users.length,
    SUPER_ADMIN: users.filter((u) => u.role === "SUPER_ADMIN").length,
    ADMIN: users.filter((u) => u.role === "ADMIN").length,
    CUSTOMER: users.filter((u) => u.role === "CUSTOMER").length,
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Users size={20} className="text-green-600" /> ຈັດການ Users ທັງໝົດ
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">{users.length} ຜູ້ໃຊ້ / ແກ້ໄຂໄດ້ທຸກ role</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 mb-5">
        {/* Filter tabs */}
        <div className="flex gap-1.5">
          {(["ALL", "SUPER_ADMIN", "ADMIN", "CUSTOMER"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-gray-900 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {f === "ALL" ? "ທັງໝົດ" : ROLE_LABEL[f]}{" "}
              <span className="opacity-60">({counts[f as keyof typeof counts]})</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative ml-auto">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ຄົ້ນຫາຊື່ / email"
            className="pl-8 pr-4 py-1.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-300 w-52"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-14 border-b border-gray-50 animate-pulse bg-gray-50/40" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Users size={40} className="mx-auto mb-3 text-gray-200" />
            <p>ບໍ່ພົບຜູ້ໃຊ້</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">ຜູ້ໃຊ້</th>
                <th className="px-4 py-3 text-left">ເບີໂທ</th>
                <th className="px-4 py-3 text-center">Role</th>
                <th className="px-4 py-3 text-center">Orders</th>
                <th className="px-4 py-3 text-center">ສະໝັກ</th>
                <th className="px-4 py-3 text-center">ຈັດການ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((u) => {
                const isEditing = editingId === u.id;
                return (
                  <tr key={u.id} className={`transition-colors ${isEditing ? "bg-green-50/30" : "hover:bg-gray-50/50"}`}>
                    {isEditing ? (
                      /* Edit row */
                      <>
                        <td className="px-4 py-2" colSpan={2}>
                          <div className="flex gap-2">
                            <input
                              value={editForm.name}
                              onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                              placeholder="ຊື່"
                              className="border border-green-300 rounded-lg px-2 py-1 text-sm w-36 focus:outline-none focus:ring-1 focus:ring-green-400"
                            />
                            <input
                              value={editForm.email}
                              onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                              placeholder="email"
                              className="border border-green-300 rounded-lg px-2 py-1 text-sm w-48 focus:outline-none focus:ring-1 focus:ring-green-400"
                            />
                            <input
                              value={editForm.phone}
                              onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                              placeholder="ເບີໂທ"
                              className="border border-green-300 rounded-lg px-2 py-1 text-sm w-28 focus:outline-none focus:ring-1 focus:ring-green-400"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <div className="relative inline-block">
                            <select
                              value={editForm.role}
                              onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
                              className="appearance-none border border-green-300 rounded-lg px-3 py-1 text-sm pr-7 focus:outline-none focus:ring-1 focus:ring-green-400 bg-white"
                            >
                              {ROLES.map((r) => (
                                <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                              ))}
                            </select>
                            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                          </div>
                        </td>
                        <td className="px-4 py-2 text-center text-gray-400">{u._count.orders}</td>
                        <td className="px-4 py-2 text-center text-gray-400 text-xs">
                          {new Date(u.createdAt).toLocaleDateString("lo-LA")}
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => saveEdit(u.id)}
                              disabled={saving}
                              className="p-1.5 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                              title="ບັນທຶກ"
                            >
                              <Check size={14} className="text-white" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                              title="ຍົກເລີກ"
                            >
                              <X size={14} className="text-gray-500" />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      /* View row */
                      <>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              u.role === "SUPER_ADMIN" ? "bg-green-100" : u.role === "ADMIN" ? "bg-blue-100" : "bg-gray-100"
                            }`}>
                              {u.role === "SUPER_ADMIN" || u.role === "ADMIN"
                                ? <Shield size={13} className={u.role === "SUPER_ADMIN" ? "text-green-600" : "text-blue-500"} />
                                : <User size={13} className="text-gray-500" />
                              }
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{u.name}</p>
                              <p className="text-xs text-gray-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-sm">{u.phone ?? "—"}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border font-medium ${ROLE_COLOR[u.role]}`}>
                            {u.role === "CUSTOMER" ? <User size={10} /> : <Shield size={10} />}
                            {ROLE_LABEL[u.role]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                            <ShoppingBag size={11} /> {u._count.orders}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                            <Calendar size={11} />
                            {new Date(u.createdAt).toLocaleDateString("lo-LA")}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => startEdit(u)}
                              title="ແກ້ໄຂ"
                              className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit2 size={14} className="text-blue-500" />
                            </button>
                            <button
                              onClick={() => handleDelete(u)}
                              title="ລຶບ"
                              className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={14} className="text-red-400" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
