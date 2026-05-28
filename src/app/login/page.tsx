"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, LogIn } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.ok) {
      router.push(redirect);
    } else {
      setError("ອີເມວ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ");
    }
    setLoading(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-green-100 p-6 space-y-4 shadow-sm">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-xl">
            {error}
          </div>
        )}
        <div>
          <label className="text-sm text-gray-500 mb-1 block">ອີເມວ</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com" required
            className="w-full border border-green-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300" />
        </div>
        <div>
          <label className="text-sm text-gray-500 mb-1 block">ລະຫັດຜ່ານ</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••" required
            className="w-full border border-green-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-200 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
          {loading ? "ກຳລັງເຂົ້າ..." : "ເຂົ້າສູ່ລະບົບ"}
        </button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-4">
        ຍັງບໍ່ມີບັນຊີ?{" "}
        <Link href="/register" className="text-green-600 hover:text-green-700 font-medium">ສະໝັກໃໝ່</Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-4xl mb-2">🌿</p>
          <h1 className="text-2xl font-bold text-gray-800">ເຂົ້າສູ່ລະບົບ</h1>
          <p className="text-gray-400 text-sm mt-1">ຢໍລະປາ · ວັດຖຸດິບສົດໃໝ່</p>
        </div>
        <Suspense fallback={<div className="h-64 bg-white rounded-2xl border border-green-100 animate-pulse" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
