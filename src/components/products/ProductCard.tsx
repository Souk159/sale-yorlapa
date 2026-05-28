"use client";

import { useState } from "react";
import Image from "next/image";
import { ShoppingCart, Wind, RefreshCw, Minus, Plus } from "lucide-react";
import { formatPrice, formatGrams } from "@/lib/utils";
import GramSlider from "./GramSlider";
import { useCart } from "@/hooks/useCart";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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
  category?: { name: string } | null;
}

type AddState = "idle" | "added" | "updated";

export default function ProductCard({ product }: { product: Product }) {
  const [gramsPerBag, setGramsPerBag] = useState(product.minGram);
  const [quantity, setQuantity] = useState(1);
  const [addState, setAddState] = useState<AddState>("idle");
  const { addItem, items } = useCart();
  const { data: session } = useSession();
  const router = useRouter();

  const alreadyInCart = items.some((i) => i.productId === product.id);
  const totalGrams = gramsPerBag * quantity;
  const totalPrice = product.pricePerGram * totalGrams;

  const handleAddToCart = () => {
    if (!session) {
      router.push("/login");
      return;
    }
    const result = addItem({
      id: product.id,
      productId: product.id,
      gramsPerBag,
      quantity,
      product: {
        id: product.id,
        name: product.name,
        image: product.image ?? null,
        pricePerGram: product.pricePerGram,
        unit: product.unit,
        isVacuum: product.isVacuum,
      },
    });
    setAddState(result.isUpdate ? "updated" : "added");
    setTimeout(() => setAddState("idle"), 2500);
  };

  const btnStyle = {
    idle:    alreadyInCart
               ? "bg-green-50 hover:bg-green-100 text-green-700 border border-green-300"
               : "bg-green-600 hover:bg-green-700 text-white",
    added:   "bg-green-100 text-green-700 border border-green-400",
    updated: "bg-orange-50 text-orange-600 border border-orange-300",
  }[addState];

  const btnLabel = {
    idle:    alreadyInCart ? "ອັບເດດຕະກ້າ" : "ໃສ່ຕະກ້າ",
    added:   "ເພີ່ມແລ້ວ ✓",
    updated: "ອັບເດດແລ້ວ ✓",
  }[addState];

  return (
    <div className="bg-white rounded-2xl border border-green-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Image */}
      <div className="relative h-48 bg-green-50">
        {product.image ? (
          <Image src={product.image} alt={product.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">🌿</div>
        )}
        {product.isVacuum && (
          <span className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
            <Wind size={10} /> ອັດສູນຍາກາດ
          </span>
        )}
        {product.category && (
          <span className="absolute top-2 left-2 bg-white/80 backdrop-blur-sm text-green-700 text-xs px-2 py-0.5 rounded-full">
            {product.category.name}
          </span>
        )}
        {alreadyInCart && addState === "idle" && (
          <span className="absolute bottom-2 left-2 bg-green-600/90 text-white text-xs px-2 py-0.5 rounded-full">
            ✓ ຢູ່ໃນຕະກ້າແລ້ວ
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-gray-800 text-lg leading-tight">{product.name}</h3>
          {product.nameEn && <p className="text-xs text-gray-400">{product.nameEn}</p>}
          {product.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-green-600 font-bold">{formatPrice(product.pricePerGram)}</span>
          <span className="text-gray-400">/ ກຣາມ</span>
        </div>

        {/* Gram per bag slider */}
        <div>
          <p className="text-xs text-gray-500 font-medium mb-2">⚖️ ກຣາມຕໍ່ຖົງ</p>
          <GramSlider
            min={product.minGram}
            max={product.maxGram}
            step={product.stepGram}
            pricePerGram={product.pricePerGram}
            defaultValue={product.minGram}
            onChange={setGramsPerBag}
          />
        </div>

        {/* Quantity (number of bags) */}
        <div className="bg-green-50 rounded-xl p-3">
          <p className="text-xs text-gray-500 font-medium mb-2">📦 ຈຳນວນຖົງ</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-full border border-green-300 bg-white hover:bg-green-100 flex items-center justify-center transition-colors"
            >
              <Minus size={14} className="text-green-600" />
            </button>
            <span className="text-xl font-bold text-green-700 w-8 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-8 h-8 rounded-full border border-green-300 bg-white hover:bg-green-100 flex items-center justify-center transition-colors"
            >
              <Plus size={14} className="text-green-600" />
            </button>
            <span className="text-xs text-gray-400 ml-1">ຖົງ</span>
            <div className="ml-auto text-right">
              <p className="text-xs text-gray-400">{formatGrams(gramsPerBag)} × {quantity} ຖົງ</p>
              <p className="text-xs text-gray-400">= {formatGrams(totalGrams)}</p>
            </div>
          </div>
        </div>

        {/* Total price */}
        <div className="flex items-center justify-between bg-white border border-green-200 rounded-xl px-4 py-2.5">
          <span className="text-sm text-gray-500">ລາຄາລວມ</span>
          <span className="text-lg font-bold text-green-600">{formatPrice(totalPrice)}</span>
        </div>

        {/* Notification */}
        {addState === "updated" && (
          <div className="bg-orange-50 border border-orange-200 text-orange-700 text-xs px-3 py-2 rounded-xl flex items-center gap-2">
            <RefreshCw size={12} />
            ອັບເດດ: {quantity} ຖົງ × {formatGrams(gramsPerBag)}
          </div>
        )}

        <button
          onClick={handleAddToCart}
          className={`w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${btnStyle}`}
        >
          {addState === "updated" ? <RefreshCw size={15} /> : <ShoppingCart size={15} />}
          {btnLabel}
        </button>
      </div>
    </div>
  );
}
