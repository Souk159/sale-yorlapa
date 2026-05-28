"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  id: string;
  productId: string;
  gramsPerBag: number;
  quantity: number;
  product: {
    id: string;
    name: string;
    image: string | null;
    pricePerGram: number;
    unit: string;
    isVacuum: boolean;
  };
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => { isUpdate: boolean };
  removeItem: (productId: string) => void;
  updateItem: (productId: string, gramsPerBag: number, quantity: number) => void;
  clearCart: () => void;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const existing = get().items.find((i) => i.productId === item.productId);
        if (existing) {
          set((state) => ({
            items: state.items.map((i) =>
              i.productId === item.productId
                ? { ...i, gramsPerBag: item.gramsPerBag, quantity: item.quantity }
                : i
            ),
          }));
          return { isUpdate: true };
        }
        set((state) => ({ items: [...state.items, item] }));
        return { isUpdate: false };
      },

      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),

      updateItem: (productId, gramsPerBag, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, gramsPerBag, quantity } : i
          ),
        })),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "yorlapa-cart-v2",   // ← version ໃໝ່ = clear cache ເກົ່າໂດຍອັດຕະໂນມັດ
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);

// Reactive selectors
export const useCartItems = () => useCart((s) => s.items);
export const useCartCount = () => useCart((s) => s.items.length);
export const useCartTotal = () =>
  useCart((s) =>
    s.items.reduce(
      (sum, item) => sum + item.product.pricePerGram * item.gramsPerBag * item.quantity,
      0
    )
  );
