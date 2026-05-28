"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, User, LogOut, Package, Settings, Shield } from "lucide-react";
import { useCartCount } from "@/hooks/useCart";

export default function Navbar() {
  const { data: session } = useSession();
  const itemCount = useCartCount();

  return (
    <nav className="bg-white border-b border-green-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🌿</span>
          <div>
            <p className="font-bold text-green-700 leading-none text-lg">ຢໍລະປາ</p>
            <p className="text-xs text-green-500 leading-none">ວັດຖຸດິບສົດໃໝ່</p>
          </div>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/shop" className="hover:text-green-600 transition-colors">ສິນຄ້າ</Link>
          <Link href="/shop?cat=spice" className="hover:text-green-600 transition-colors">ເຄື່ອງເທດ</Link>
          <Link href="/shop?cat=meat" className="hover:text-green-600 transition-colors">ຊີ້ນ</Link>
          <Link href="/shop?cat=veg" className="hover:text-green-600 transition-colors">ຜັກ</Link>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Cart */}
          <Link href="/cart" className="relative p-2 hover:bg-green-50 rounded-full transition-colors">
            <ShoppingCart size={22} className="text-gray-600" />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-green-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </Link>

          {session ? (
            <div className="flex items-center gap-2">
              {session.user.role === "SUPER_ADMIN" && (
                <Link href="/superadmin" className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Super Admin">
                  <Shield size={20} className="text-gray-700" />
                </Link>
              )}
              {(session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN") && (
                <Link href="/admin" className="p-2 hover:bg-green-50 rounded-full transition-colors" title="Admin">
                  <Settings size={20} className="text-green-600" />
                </Link>
              )}
              <Link href="/orders" className="p-2 hover:bg-green-50 rounded-full transition-colors" title="ການສັ່ງ">
                <Package size={20} className="text-gray-600" />
              </Link>
              <div className="flex items-center gap-2 bg-green-50 rounded-full px-3 py-1.5">
                <User size={16} className="text-green-600" />
                <span className="text-sm text-green-700 font-medium">{session.user.name}</span>
              </div>
              <button
                onClick={() => signOut()}
                className="p-2 hover:bg-red-50 rounded-full transition-colors"
                title="ອອກ"
              >
                <LogOut size={18} className="text-gray-400 hover:text-red-500" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-sm text-green-700 hover:text-green-800 font-medium px-3 py-1.5 hover:bg-green-50 rounded-lg transition-colors"
              >
                ເຂົ້າສູ່ລະບົບ
              </Link>
              <Link
                href="/register"
                className="text-sm bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-1.5 rounded-lg transition-colors"
              >
                ສະໝັກ
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
