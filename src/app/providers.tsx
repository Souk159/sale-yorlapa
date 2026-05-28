"use client";

import { useEffect, useRef } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { useCart } from "@/hooks/useCart";

function CartManager() {
  const { status } = useSession();
  const { clearCart } = useCart();
  const prevStatus = useRef(status);

  useEffect(() => {
    // Clear old cache key
    if (typeof window !== "undefined") {
      localStorage.removeItem("yorlapa-cart");
    }
    // Rehydrate new cart
    useCart.persist.rehydrate();
  }, []);

  useEffect(() => {
    // Clear cart when user logs out
    if (prevStatus.current === "authenticated" && status === "unauthenticated") {
      clearCart();
    }
    prevStatus.current = status;
  }, [status, clearCart]);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartManager />
      {children}
    </SessionProvider>
  );
}
