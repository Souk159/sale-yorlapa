"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Shield, Users, BarChart3, ArrowLeft, LayoutDashboard } from "lucide-react";

const navItems = [
  { href: "/superadmin",       label: "Monitor",       icon: BarChart3, exact: true },
  { href: "/superadmin/users", label: "ຈັດການ Users",  icon: Users },
];

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "SUPER_ADMIN") router.push("/");
  }, [session, status, router]);

  if (status === "loading" || !session || session.user.role !== "SUPER_ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">ກຳລັງກວດສິດ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-green-100 flex-shrink-0 flex flex-col">
        <div className="px-4 py-4 border-b border-green-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-green-600 flex items-center justify-center">
              <Shield size={14} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-green-700 uppercase tracking-wider">Super Admin</p>
              <p className="text-xs text-gray-400 truncate max-w-[110px]">{session.user.name}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  active
                    ? "bg-green-50 text-green-700 font-medium"
                    : "text-gray-600 hover:bg-green-50 hover:text-green-700"
                }`}
              >
                <item.icon size={16} className={active ? "text-green-600" : "text-gray-400"} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-green-100 space-y-1">
          <Link href="/admin"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-gray-500 hover:bg-green-50 hover:text-green-700 transition-colors">
            <LayoutDashboard size={13} /> Admin Panel
          </Link>
          <Link href="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-gray-500 hover:bg-green-50 hover:text-green-700 transition-colors">
            <ArrowLeft size={13} /> ໜ້າຮ້ານ
          </Link>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 bg-[#f8fdf8] overflow-auto">
        {children}
      </main>
    </div>
  );
}
