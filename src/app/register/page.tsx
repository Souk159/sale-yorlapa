"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("ລະຫັດຜ່ານບໍ່ຕົງກັນ");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, password: form.password }),
    });
    if (res.ok) {
      await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      router.push("/");
    } else {
      const data = await res.json();
      setError(data.error ?? "ເກີດຂໍ້ຜິດພາດ");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-4xl mb-2">🌿</p>
          <h1 className="text-2xl font-bold text-gray-800">ສະໝັກສະມາຊິກ</h1>
          <p className="text-gray-400 text-sm mt-1">ສ້າງບັນຊີໃໝ່</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-green-100 p-6 space-y-4 shadow-sm">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-xl">
              {error}
            </div>
          )}

          {[
            { key: "name", label: "ຊື່ - ນາມສະກຸນ", type: "text", placeholder: "ທ. ສົມໃຈ" },
            { key: "email", label: "ອີເມວ", type: "email", placeholder: "your@email.com" },
            { key: "phone", label: "ເບີໂທ (ບໍ່ຈຳເປັນ)", type: "tel", placeholder: "020 xxxx xxxx" },
            { key: "password", label: "ລະຫັດຜ່ານ", type: "password", placeholder: "••••••••" },
            { key: "confirm", label: "ຢືນຢັນລະຫັດຜ່ານ", type: "password", placeholder: "••••••••" },
          ].map((f) => (
            <div key={f.key}>
              <label className="text-sm text-gray-500 mb-1 block">{f.label}</label>
              <input
                type={f.type}
                value={form[f.key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                placeholder={f.placeholder}
                required={f.key !== "phone"}
                className="w-full border border-green-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-200 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
            {loading ? "ກຳລັງສ້າງບັນຊີ..." : "ສ້າງບັນຊີ"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          ມີບັນຊີແລ້ວ?{" "}
          <Link href="/login" className="text-green-600 hover:text-green-700 font-medium">
            ເຂົ້າສູ່ລະບົບ
          </Link>
        </p>
      </div>
    </div>
  );
}
