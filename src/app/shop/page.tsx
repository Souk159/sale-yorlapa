"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import ProductCard from "@/components/products/ProductCard";

interface Product {
  id: string;
  name: string;
  nameEn?: string | null;
  description?: string | null;
  image?: string | null;
  pricePerGram: number;
  minGram: number;
  maxGram: number;
  stepGram: number;
  unit: string;
  isVacuum: boolean;
  category?: { id: string; name: string } | null;
}

interface Category {
  id: string;
  name: string;
  icon?: string | null;
  _count: { products: number };
}

function ShopContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState(searchParams.get("categoryId") ?? "");

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCat) params.set("categoryId", activeCat);
    if (search) params.set("search", search);
    fetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then((data) => { setProducts(data); setLoading(false); });
  }, [activeCat, search]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="ຄົ້ນຫາສິນຄ້າ..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-300 text-sm" />
      </div>

      <div className="flex gap-2 flex-wrap mb-8">
        <button onClick={() => setActiveCat("")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCat === "" ? "bg-green-600 text-white" : "bg-white border border-green-200 text-green-700 hover:bg-green-50"}`}>
          ທັງໝົດ
        </button>
        {categories.map((cat) => (
          <button key={cat.id} onClick={() => setActiveCat(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCat === cat.id ? "bg-green-600 text-white" : "bg-white border border-green-200 text-green-700 hover:bg-green-50"}`}>
            {cat.icon && <span className="mr-1">{cat.icon}</span>}
            {cat.name} <span className="opacity-60">({cat._count.products})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-green-100 h-80 animate-pulse" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <p className="text-5xl mb-3">🔍</p>
          <p className="text-lg">ບໍ່ພົບສິນຄ້າ</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-400 mb-4">ພົບ {products.length} ລາຍການ</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-green-100 h-80 animate-pulse" />)}
        </div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
