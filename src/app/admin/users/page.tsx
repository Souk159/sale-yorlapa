"use client";

import { useEffect, useState } from "react";
import { Users, Shield, User, Trash2, ShoppingBag, Calendar } from "lucide-react";

interface UserRow {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "SUPER_ADMIN" | "ADMIN" | "CUSTOMER";
  createdAt: string;
  _count: { orders: number };
}

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  CUSTOMER: "ລູກຄ້າ",
};

const ROLE_BADGE: Record<string, string> = {
  SUPER_ADMIN: "bg-purple-100 text-purple-700",
  ADMIN:       "bg-green-100 text-green-700",
  CUSTOMER:    "bg-gray-100 text-gray-600",
};

const ROLE_AVATAR: Record<string, string> = {
  SUPER_ADMIN: "bg-purple-100",
  ADMIN:       "bg-green-100",
  CUSTOMER:    "bg-gray-100",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "SUPER_ADMIN" | "ADMIN" | "CUSTOMER">("ALL");

  const load = () => {
    setLoading(true);
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => { setUsers(Array.isArray(d) ? d : []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const toggleRole = async (user: UserRow) => {
    // Admin panel cannot touch SUPER_ADMIN — redirect to superadmin panel
    if (user.role === "SUPER_ADMIN") {
      alert("Super Admin ຈັດການໄດ້ທີ່ /superadmin/users ເທົ່ານັ້ນ");
      return;
    }
    const newRole = user.role === "ADMIN" ? "CUSTOMER" : "ADMIN";
    const label = newRole === "ADMIN" ? "ຕັ້ງເປັນ Admin" : "ຖອດຈາກ Admin";
    if (!confirm(`${label}: ${user.name}?`)) return;
    await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    load();
  };

  const handleDelete = async (user: UserRow) => {
    if (user.role === "SUPER_ADMIN") {
      alert("Super Admin ຈັດການໄດ້ທີ່ /superadmin/users ເທົ່ານັ້ນ");
      return;
    }
    if (user._count.orders > 0) {
      if (!confirm(`${user.name} ມີ ${user._count.orders} order — ຢືນຢັນລຶບ?`)) return;
    } else {
      if (!confirm(`ຢືນຢັນລຶບ ${user.name}?`)) return;
    }
    const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json();
      alert(d.error);
      return;
    }
    load();
  };

  const counts = {
    ALL: users.length,
    SUPER_ADMIN: users.filter((u) => u.role === "SUPER_ADMIN").length,
    ADMIN: users.filter((u) => u.role === "ADMIN").length,
    CUSTOMER: users.filter((u) => u.role === "CUSTOMER").length,
  };

  const filtered = filter === "ALL" ? users : users.filter((u) => u.role === filter);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Users size={20} className="text-green-600" /> ຈັດການ Users
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">{users.length} ຜູ້ໃຊ້ທັງໝົດ</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {(["ALL", "CUSTOMER", "ADMIN", "SUPER_ADMIN"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-green-600 text-white"
                  : "bg-white border border-green-200 text-green-700 hover:bg-green-50"
              }`}
            >
              {f === "ALL" ? "ທັງໝົດ" : ROLE_LABEL[f]}
              <span className="ml-1 opacity-70">({counts[f]})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-green-100 overflow-hidden">
        {loading ? (
          <div className="space-y-0">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 border-b border-gray-50 animate-pulse bg-gray-50/50" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Users size={40} className="mx-auto mb-3 text-green-200" />
            <p>ບໍ່ມີຜູ້ໃຊ້</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-green-50 text-green-700 text-xs uppercase">
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
              {filtered.map((u) => (
                <tr key={u.id} className={`hover:bg-green-50/30 transition-colors ${u.role === "SUPER_ADMIN" ? "bg-purple-50/20" : ""}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${ROLE_AVATAR[u.role]}`}>
                        {u.role === "CUSTOMER"
                          ? <User size={14} className="text-gray-500" />
                          : <Shield size={14} className={u.role === "SUPER_ADMIN" ? "text-purple-600" : "text-green-600"} />
                        }
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{u.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${ROLE_BADGE[u.role]}`}>
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
                      {u.role !== "SUPER_ADMIN" ? (
                        <>
                          <button
                            onClick={() => toggleRole(u)}
                            title={u.role === "ADMIN" ? "ຖອດ Admin" : "ຕັ້ງເປັນ Admin"}
                            className={`p-1.5 rounded-lg transition-colors ${
                              u.role === "ADMIN"
                                ? "hover:bg-orange-50 text-orange-500"
                                : "hover:bg-green-100 text-green-600"
                            }`}
                          >
                            <Shield size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(u)}
                            title="ລຶບ"
                            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={15} className="text-red-400" />
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-purple-400 px-2">SA only</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
