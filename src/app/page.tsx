import Link from "next/link";
import React from "react";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/products/ProductCard";
import { ArrowRight, Wind, Leaf, Truck, Star } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      include: { category: true },
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      include: { _count: { select: { products: true } } },
    }),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-700 via-green-600 to-green-500 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 space-y-5">
            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full">
              <Wind size={14} /> ອັດສູນຍາກາດ · ສົດໃໝ່ · ຄຸນນະພາບສູງ
            </span>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              ວັດຖຸດິບສົດໃໝ່<br />
              <span className="text-green-200">ສຳລັບຣ້ານອາຫານ</span>
            </h1>
            <p className="text-green-100 text-lg leading-relaxed">
              ສັ່ງໄດ້ຕາມກຣາມ · ອັດສູນຍາກາດ · ຮັກສາຄວາມສົດໄດ້ດົນ<br />
              ຈັດສົ່ງຮອດຣ້ານ ດ້ວຍຄວາມສົດໃໝ່
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/shop"
                className="bg-white text-green-700 hover:bg-green-50 font-bold px-6 py-3 rounded-xl transition-colors flex items-center gap-2"
              >
                ເລືອກສິນຄ້າ <ArrowRight size={16} />
              </Link>
              <Link
                href="/register"
                className="border border-white/50 text-white hover:bg-white/10 font-medium px-6 py-3 rounded-xl transition-colors"
              >
                ສະໝັກສະມາຊິກ
              </Link>
            </div>
          </div>
          <div className="text-8xl md:text-9xl select-none">🫙</div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Wind size={24} />, title: "ອັດສູນຍາກາດ", desc: "ຮັກສາຄວາມສົດ" },
            { icon: <Leaf size={24} />, title: "ສົດໃໝ່ 100%", desc: "ຄັດສິນຄ້າທຸກມື້" },
            { icon: <Star size={24} />, title: "ສັ່ງເປັນກຣາມ", desc: "Custom ໄດ້ຕາມຕ້ອງການ" },
            { icon: <Truck size={24} />, title: "ຈັດສົ່ງໄວ", desc: "ຮອດຮ້ານທ່ານ" },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl p-5 border border-green-100 text-center space-y-2"
            >
              <div className="text-green-600 flex justify-center">{f.icon}</div>
              <p className="font-semibold text-gray-800 text-sm">{f.title}</p>
              <p className="text-xs text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-8">
          <h2 className="text-xl font-bold text-gray-700 mb-4">ໝວດໝູ່ສິນຄ້າ</h2>
          <div className="flex gap-3 flex-wrap">
            <Link href="/shop" className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium">
              ທັງໝົດ
            </Link>
            {categories.map((cat: { id: string; icon: string | null; name: string; _count: { products: number } }) => (
              <Link
                key={cat.id}
                href={`/shop?categoryId=${cat.id}`}
                className="bg-white border border-green-200 text-green-700 hover:bg-green-50 px-4 py-2 rounded-full text-sm font-medium transition-colors"
              >
                {cat.icon && <span className="mr-1">{cat.icon}</span>}
                {cat.name}
                <span className="ml-1.5 text-green-400 text-xs">({cat._count.products})</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Products */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-700">ສິນຄ້າຫຼ້າສຸດ</h2>
          <Link href="/shop" className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1">
            ເຫັນທັງໝົດ <ArrowRight size={14} />
          </Link>
        </div>
        {products.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🌱</p>
            <p>ຍັງບໍ່ມີສິນຄ້າ</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((p: React.ComponentProps<typeof ProductCard>["product"]) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
