"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import {
  Users, Shield, Package, ShoppingBag, CheckCircle, TrendingUp,
  AlertCircle, RefreshCw, Edit2, X, Loader2, ChevronDown,
  LogIn, Plus, Pencil, Trash2, ToggleLeft, Tag, QrCode, Upload,
  Activity, Wifi, User,
} from "lucide-react";

interface RecentUser { id: string; name: string; email: string; role: string; createdAt: string }
interface ActivityLog {
  id: string; userName: string; userRole: string; action: string;
  target?: string; detail?: string; ip?: string; createdAt: string;
}
interface OnlineUser { id: string; name: string; role: string; lastLoginAt: string }
interface Stats {
  users: { total: number; admins: number; superAdmins: number };
  products: { total: number; active: number; inactive: number };
  orders: { total: number; pending: number; slipUploaded: number; confirmed: number };
  revenue: number;
  recentOrders: { id: string; orderNumber: string; totalAmount: number; status: string; createdAt: string; user: { name: string } }[];
  recentUsers: RecentUser[];
  activityLogs: ActivityLog[];
  onlineUsers: OnlineUser[];
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  PENDING:       { label: "ລໍຖ້າ",    color: "bg-yellow-100 text-yellow-700" },
  SLIP_UPLOADED: { label: "ສົ່ງ Slip", color: "bg-blue-100 text-blue-700" },
  CONFIRMED:     { label: "ຢືນຢັນ",   color: "bg-green-100 text-green-700" },
  PREPARING:     { label: "ກຳລັງອັດ", color: "bg-purple-100 text-purple-700" },
  SHIPPED:       { label: "ຈັດສົ່ງ",  color: "bg-indigo-100 text-indigo-700" },
  DELIVERED:     { label: "ຮອດ",      color: "bg-emerald-100 text-emerald-700" },
  CANCELLED:     { label: "ຍົກເລີກ",  color: "bg-red-100 text-red-600" },
};

const ROLE_COLOR: Record<string, string> = {
  SUPER_ADMIN: "bg-green-100 text-green-700 border-green-200",
  ADMIN:       "bg-blue-100 text-blue-700 border-blue-200",
  CUSTOMER:    "bg-gray-100 text-gray-600 border-gray-200",
};
const ROLE_LABEL: Record<string, string> = { SUPER_ADMIN: "SA", ADMIN: "Admin", CUSTOMER: "User" };
const ROLE_FULL: Record<string, string>  = { SUPER_ADMIN: "Super Admin", ADMIN: "Admin", CUSTOMER: "ລູກຄ້າ" };

const ACTION_META: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  LOGIN:           { icon: <LogIn size={11} />,      color: "text-green-600 bg-green-100",   label: "Login" },
  PRODUCT_CREATE:  { icon: <Plus size={11} />,        color: "text-blue-600 bg-blue-100",     label: "ເພີ່ມສິນຄ້າ" },
  PRODUCT_UPDATE:  { icon: <Pencil size={11} />,      color: "text-yellow-600 bg-yellow-100", label: "ແກ້ໄຂສິນຄ້າ" },
  PRODUCT_DELETE:  { icon: <Trash2 size={11} />,      color: "text-red-500 bg-red-100",       label: "ລຶບສິນຄ້າ" },
  PRODUCT_TOGGLE:  { icon: <ToggleLeft size={11} />,  color: "text-gray-500 bg-gray-100",     label: "Toggle" },
  ORDER_CREATE:    { icon: <ShoppingBag size={11} />, color: "text-purple-600 bg-purple-100", label: "ສ້າງ Order" },
  ORDER_STATUS:    { icon: <CheckCircle size={11} />, color: "text-indigo-600 bg-indigo-100", label: "Order Status" },
  USER_ROLE:       { icon: <Shield size={11} />,      color: "text-orange-600 bg-orange-100", label: "ປ່ຽນ Role" },
  USER_DELETE:     { icon: <Trash2 size={11} />,      color: "text-red-500 bg-red-100",       label: "ລຶບ User" },
  USER_UPDATE:     { icon: <Pencil size={11} />,      color: "text-yellow-600 bg-yellow-100", label: "ແກ້ໄຂ User" },
  CATEGORY_CREATE: { icon: <Tag size={11} />,         color: "text-teal-600 bg-teal-100",     label: "ເພີ່ມໝວດ" },
  CATEGORY_UPDATE: { icon: <Tag size={11} />,         color: "text-teal-600 bg-teal-100",     label: "ແກ້ໄຂໝວດ" },
  CATEGORY_DELETE: { icon: <Trash2 size={11} />,      color: "text-red-500 bg-red-100",       label: "ລຶບໝວດ" },
  QR_UPDATE:       { icon: <QrCode size={11} />,      color: "text-pink-600 bg-pink-100",     label: "ອັບ QR" },
  SLIP_UPLOAD:     { icon: <Upload size={11} />,      color: "text-blue-600 bg-blue-100",     label: "Slip" },
};

function timeAgo(d: string) {
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60) return `${Math.floor(s)}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return new Date(d).toLocaleDateString("lo-LA");
}

type ActFilter = "ALL" | "LOGIN" | "PRODUCT" | "ORDER" | "USER";
const ROLES = ["SUPER_ADMIN", "ADMIN", "CUSTOMER"] as const;
interface EditForm { id: string; name: string; email: string; phone: string; role: string }

export default function SuperAdminMonitorPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [actFilter, setActFilter] = useState<ActFilter>("ALL");
  const [editUser, setEditUser] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    setError("");
    fetch("/api/superadmin/stats")
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((d) => { setStats(d); setLastRefresh(new Date()); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openEdit = (u: RecentUser) => {
    setEditUser({ id: u.id, name: u.name, email: u.email, phone: "", role: u.role });
    fetch("/api/superadmin/users").then((r) => r.json())
      .then((users: { id: string; phone?: string }[]) => {
        const f = users.find((x) => x.id === u.id);
        if (f) setEditUser((p) => p ? { ...p, phone: f.phone ?? "" } : p);
      }).catch(() => {});
  };

  const saveEdit = async () => {
    if (!editUser) return;
    setSaving(true);
    await fetch(`/api/superadmin/users/${editUser.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editUser.name, email: editUser.email, phone: editUser.phone || null, role: editUser.role }),
    });
    setSaving(false); setEditUser(null); load();
  };

  const filtered = (stats?.activityLogs ?? []).filter((l) => {
    if (actFilter === "ALL") return true;
    if (actFilter === "LOGIN") return l.action === "LOGIN";
    return l.action.startsWith(actFilter);
  });

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle size={36} className="text-red-400" />
        <p className="text-red-500 text-sm font-medium">{error}</p>
        <button onClick={load}
          className="px-4 py-2 bg-white border border-green-200 hover:bg-green-50 text-green-700 text-sm rounded-xl transition-colors">
          ລອງໃໝ່
        </button>
      </div>
    );
  }

  if (loading && !stats) {
    return (
      <div className="p-6 space-y-4 animate-pulse">
        <div className="h-7 w-48 bg-gray-100 rounded-xl" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-white rounded-2xl border border-green-100" />)}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => <div key={i} className="h-64 bg-white rounded-2xl border border-green-100" />)}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">System Monitor</h1>
          <p className="text-xs text-gray-400 mt-0.5">{lastRefresh.toLocaleString("lo-LA")}</p>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-2 text-sm bg-white border border-green-200 hover:bg-green-50 text-green-700 px-3 py-2 rounded-xl transition-colors disabled:opacity-40">
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Alert */}
      {(stats.orders.pending + stats.orders.slipUploaded) > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertCircle size={16} className="text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-700">
            ມີ <span className="font-bold">{stats.orders.pending + stats.orders.slipUploaded}</span> order ລໍຖ້າ ·{" "}
            <span className="text-amber-500">{stats.orders.pending} ລໍຊຳລະ, {stats.orders.slipUploaded} ລໍຢືນຢັນ</span>
          </p>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Users",   value: stats.users.total,         sub: `Admin ${stats.users.admins} · SA ${stats.users.superAdmins}`, icon: <Users size={20} />,       ic: "text-blue-600 bg-blue-50" },
          { label: "ສິນຄ້າ",  value: stats.products.total,      sub: `ໃຊ້ງານ ${stats.products.active}`,                             icon: <Package size={20} />,     ic: "text-green-600 bg-green-50" },
          { label: "Orders",  value: stats.orders.total,         sub: `ຢືນຢັນ ${stats.orders.confirmed}`,                           icon: <ShoppingBag size={20} />, ic: "text-purple-600 bg-purple-50" },
          { label: "ລາຍໄດ້",  value: formatPrice(stats.revenue), sub: "confirmed+",                                                  icon: <TrendingUp size={20} />,  ic: "text-orange-600 bg-orange-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-green-100 p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.ic}`}>{s.icon}</div>
            <p className="text-2xl font-bold text-gray-800">{s.value}</p>
            <p className="text-sm text-gray-400 mt-1">{s.label}</p>
            <p className="text-xs text-gray-300 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Status strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "ລໍຖ້າຊຳລະ", value: stats.orders.pending,       c: "text-yellow-700 bg-yellow-50 border-yellow-200" },
          { label: "ສົ່ງ Slip",   value: stats.orders.slipUploaded,  c: "text-blue-700 bg-blue-50 border-blue-200" },
          { label: "ຢືນຢັນ+",    value: stats.orders.confirmed,     c: "text-green-700 bg-green-50 border-green-200" },
          { label: "ລາຍໄດ້",     value: formatPrice(stats.revenue), c: "text-orange-700 bg-orange-50 border-orange-200" },
        ].map((s) => (
          <div key={s.label} className={`border rounded-xl px-4 py-3 ${s.c}`}>
            <p className="text-xl font-bold">{s.value}</p>
            <p className="text-xs opacity-60 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Online + Recent orders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Online users */}
        <div className="bg-white rounded-2xl border border-green-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi size={14} className="text-green-600" />
              <span className="font-bold text-gray-700 text-sm">Online (15 ນາທີ)</span>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              stats.onlineUsers.length > 0 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
            }`}>
              {stats.onlineUsers.length} online
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.onlineUsers.length === 0 ? (
              <p className="px-5 py-8 text-sm text-gray-400 text-center">ບໍ່ມີ user active</p>
            ) : stats.onlineUsers.map((u) => (
              <div key={u.id} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-green-50 border border-green-100 flex items-center justify-center">
                      <User size={13} className="text-green-600" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{u.name}</p>
                    <p className="text-xs text-gray-400">{ROLE_FULL[u.role]}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{timeAgo(u.lastLoginAt)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent orders */}
        <div className="bg-white rounded-2xl border border-green-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <span className="font-bold text-gray-700 text-sm">Orders ຫຼ້າສຸດ</span>
            <span className="text-xs text-gray-400">10 ລ່າສຸດ</span>
          </div>
          <div className="divide-y divide-gray-50 max-h-60 overflow-y-auto">
            {stats.recentOrders.length === 0 ? (
              <p className="px-5 py-8 text-sm text-gray-400 text-center">ຍັງບໍ່ມີ order</p>
            ) : stats.recentOrders.map((o) => {
              const s = STATUS_LABEL[o.status] ?? STATUS_LABEL.PENDING;
              return (
                <div key={o.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-700">#{o.orderNumber}</p>
                    <p className="text-xs text-gray-400 truncate">{o.user.name}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.color}`}>{s.label}</span>
                    <span className="text-sm font-bold text-gray-700">{formatPrice(o.totalAmount)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-2xl border border-green-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-green-600" />
            <span className="font-bold text-gray-700 text-sm">ກິດຈະກຳ</span>
            <span className="text-xs text-gray-400">({filtered.length})</span>
          </div>
          <div className="flex gap-1.5">
            {(["ALL","LOGIN","PRODUCT","ORDER","USER"] as const).map((f) => (
              <button key={f} onClick={() => setActFilter(f)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  actFilter === f
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-700"
                }`}>
                {f === "ALL" ? "ທັງໝົດ" : f === "LOGIN" ? "Login" : f === "PRODUCT" ? "ສິນຄ້າ" : f === "ORDER" ? "Order" : "User"}
              </button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="px-5 py-10 text-sm text-gray-400 text-center">ຍັງບໍ່ມີກິດຈະກຳ — ລອງ Login ໃໝ່ຄັ້ງໜຶ່ງ</p>
          ) : filtered.map((log) => {
            const meta = ACTION_META[log.action] ?? { icon: <Activity size={11} />, color: "text-gray-500 bg-gray-100", label: log.action };
            return (
              <div key={log.id} className="px-5 py-3 flex items-start gap-3 hover:bg-gray-50/50 transition-colors">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${meta.color}`}>
                  {meta.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-700">{log.userName}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${ROLE_COLOR[log.userRole] ?? ROLE_COLOR.CUSTOMER}`}>
                      {ROLE_LABEL[log.userRole] ?? log.userRole}
                    </span>
                    <span className="text-xs text-gray-500">{meta.label}</span>
                    {log.target && (
                      <span className="text-xs font-medium text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded truncate max-w-[160px]">
                        {log.target}
                      </span>
                    )}
                    {log.detail && <span className="text-xs text-gray-400">{log.detail}</span>}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(log.createdAt).toLocaleString("lo-LA")}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(log.createdAt)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent users */}
      <div className="bg-white rounded-2xl border border-green-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <span className="font-bold text-gray-700 text-sm">Users ໃໝ່ລ່າສຸດ</span>
          <span className="text-xs text-gray-400">5 ລ່າສຸດ</span>
        </div>
        <div className="divide-y divide-gray-50">
          {stats.recentUsers.map((u) => (
            <div key={u.id} className="px-5 py-3 flex items-center justify-between gap-3 group hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  u.role === "SUPER_ADMIN" ? "bg-green-100" : u.role === "ADMIN" ? "bg-blue-100" : "bg-gray-100"
                }`}>
                  {u.role === "CUSTOMER"
                    ? <User size={13} className="text-gray-500" />
                    : <Shield size={13} className={u.role === "SUPER_ADMIN" ? "text-green-600" : "text-blue-500"} />
                  }
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-700">{u.name}</p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${ROLE_COLOR[u.role] ?? ROLE_COLOR.CUSTOMER}`}>
                  {ROLE_FULL[u.role] ?? u.role}
                </span>
                <span className="text-xs text-gray-400">{new Date(u.createdAt).toLocaleDateString("lo-LA")}</span>
                <button onClick={() => openEdit(u)}
                  className="p-1.5 rounded-lg hover:bg-green-50 transition-colors opacity-0 group-hover:opacity-100"
                  title="ແກ້ໄຂ">
                  <Edit2 size={13} className="text-green-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-green-100 w-full max-w-md shadow-2xl">
            <div className="px-6 py-4 border-b border-green-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield size={15} className="text-green-600" />
                <h2 className="font-bold text-gray-800">ແກ້ໄຂ User</h2>
              </div>
              <button onClick={() => setEditUser(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
                <X size={15} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {[
                { label: "ຊື່", key: "name" },
                { label: "Email", key: "email" },
                { label: "ເບີໂທ", key: "phone" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">{f.label}</label>
                  <input
                    value={editUser[f.key as keyof EditForm]}
                    onChange={(e) => setEditUser({ ...editUser, [f.key]: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-400"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Role</label>
                <div className="relative">
                  <select value={editUser.role} onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                    className="w-full appearance-none border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-300 pr-8 bg-white">
                    {ROLES.map((r) => <option key={r} value={r}>{ROLE_FULL[r]}</option>)}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-green-100 flex gap-3">
              <button onClick={() => setEditUser(null)}
                className="flex-1 border border-gray-200 text-gray-500 hover:bg-gray-50 font-medium py-2.5 rounded-xl text-sm transition-colors">
                ຍົກເລີກ
              </button>
              <button onClick={saveEdit} disabled={saving}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors">
                {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                {saving ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
