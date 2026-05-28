import Link from "next/link";
import { LayoutDashboard, Package, ShoppingBag, Settings, ArrowLeft, Tag, Users } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "ຈັດການສິນຄ້າ", icon: Package },
  { href: "/admin/categories", label: "ໝວດໝູ່", icon: Tag },
  { href: "/admin/orders", label: "ຈັດການ Orders", icon: ShoppingBag },
  { href: "/admin/users", label: "ຈັດການ Users", icon: Users },
  { href: "/admin/settings", label: "ຕັ້ງຄ່າ QR", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-green-100 flex-shrink-0">
        <div className="p-4 border-b border-green-100">
          <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Admin Panel</p>
        </div>
        <nav className="p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors"
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-20 p-3 w-56">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-green-600">
            <ArrowLeft size={15} /> ກັບໜ້າຮ້ານ
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
