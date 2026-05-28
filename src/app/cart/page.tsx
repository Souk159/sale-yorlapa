"use client";

import { useCart, useCartTotal } from "@/hooks/useCart";
import { formatPrice, formatGrams } from "@/lib/utils";
import { Trash2, ShoppingBag, ArrowRight, Wind, Minus, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
  const { items, removeItem, updateItem } = useCart();
  const totalAmount = useCartTotal();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <p className="text-6xl mb-4">🛒</p>
        <h2 className="text-xl font-semibold text-gray-600 mb-2">ຕະກ້າຫວ່າງ</h2>
        <p className="text-gray-400 mb-6">ຍັງບໍ່ໄດ້ເລືອກສິນຄ້າ</p>
        <Link href="/shop" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
          <ShoppingBag size={18} /> ໄປເລືອກສິນຄ້າ
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">ຕະກ້າສິນຄ້າ</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Items */}
        <div className="md:col-span-2 space-y-4">
          {items.map((item) => {
            const totalGrams = item.gramsPerBag * item.quantity;
            const itemTotal = item.product.pricePerGram * totalGrams;

            return (
              <div key={item.productId} className="bg-white rounded-2xl border border-green-100 p-4">
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="w-16 h-16 rounded-xl bg-green-50 flex-shrink-0 overflow-hidden relative">
                    {item.product.image ? (
                      <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🌿</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-800">{item.product.name}</h3>
                        {item.product.isVacuum && (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full mt-1">
                            <Wind size={10} /> ອັດສູນຍາກາດ
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                      >
                        <Trash2 size={16} className="text-red-400" />
                      </button>
                    </div>

                    {/* Price per gram */}
                    <p className="text-xs text-gray-400 mt-1">
                      {formatPrice(item.product.pricePerGram)} / ກຣາມ
                    </p>
                  </div>
                </div>

                {/* Gram & Quantity controls */}
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {/* Grams per bag */}
                  <div className="bg-green-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-2">⚖️ ກຣາມ/ຖົງ</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={item.gramsPerBag}
                        min={50}
                        step={50}
                        onChange={(e) => updateItem(item.productId, Number(e.target.value), item.quantity)}
                        className="w-full border border-green-200 rounded-lg px-2 py-1.5 text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-green-300 bg-white"
                      />
                      <span className="text-xs text-gray-400 flex-shrink-0">ກຣາມ</span>
                    </div>
                  </div>

                  {/* Number of bags */}
                  <div className="bg-green-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-2">📦 ຈຳນວນຖົງ</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateItem(item.productId, item.gramsPerBag, Math.max(1, item.quantity - 1))}
                        className="w-7 h-7 rounded-full border border-green-300 bg-white hover:bg-green-100 flex items-center justify-center flex-shrink-0"
                      >
                        <Minus size={12} className="text-green-600" />
                      </button>
                      <span className="flex-1 text-center font-bold text-green-700 text-lg">{item.quantity}</span>
                      <button
                        onClick={() => updateItem(item.productId, item.gramsPerBag, item.quantity + 1)}
                        className="w-7 h-7 rounded-full border border-green-300 bg-white hover:bg-green-100 flex items-center justify-center flex-shrink-0"
                      >
                        <Plus size={12} className="text-green-600" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Item summary */}
                <div className="mt-3 flex items-center justify-between bg-green-50 rounded-xl px-4 py-2.5">
                  <span className="text-xs text-gray-500">
                    {formatGrams(item.gramsPerBag)} × {item.quantity} ຖົງ = {formatGrams(totalGrams)}
                  </span>
                  <span className="font-bold text-green-600">{formatPrice(itemTotal)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl border border-green-100 p-5 sticky top-20 space-y-4">
            <h2 className="font-bold text-gray-800 text-lg">ສະຫຼຸບ</h2>

            <div className="space-y-2 text-sm">
              {items.map((item) => {
                const totalGrams = item.gramsPerBag * item.quantity;
                return (
                  <div key={item.productId} className="flex justify-between text-gray-500">
                    <div className="mr-2">
                      <p className="font-medium text-gray-700 truncate">{item.product.name}</p>
                      <p className="text-xs text-gray-400">{formatGrams(item.gramsPerBag)} × {item.quantity} ຖົງ</p>
                    </div>
                    <span className="flex-shrink-0 font-medium">
                      {formatPrice(item.product.pricePerGram * totalGrams)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-green-100 pt-3 flex justify-between font-bold text-gray-800">
              <span>ລວມທັງໝົດ</span>
              <span className="text-green-600 text-lg">{formatPrice(totalAmount)}</span>
            </div>

            <Link
              href="/checkout"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              ດຳເນີນການຊຳລະ <ArrowRight size={16} />
            </Link>
            <Link href="/shop" className="w-full text-center text-sm text-green-600 hover:text-green-700 block">
              ← ເລືອກສິນຄ້າຕໍ່
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
