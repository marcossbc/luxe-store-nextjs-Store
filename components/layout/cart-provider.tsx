"use client";

import { parseCart } from "@/lib/security/storage";
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { Product, CartItem } from "@/lib/types";

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
}

const TAX_RATE = 0.08;
const FREE_SHIPPING = 100;
const SHIPPING_COST = 9.99;

function calculateTotals(items: CartItem[]) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING ? 0 : SHIPPING_COST;
  const tax = subtotal * TAX_RATE;
  return { subtotal, totalItems, shipping, tax, total: subtotal + shipping + tax };
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("luxe-cart");
    if (saved) {
      setItems(parseCart(saved)); // validated: malformed or tampered data is discarded
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) localStorage.setItem("luxe-cart", JSON.stringify(items));
  }, [items, isLoaded]);

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, item.maxQuantity) }
            : item
        );
      }
      return [...prev, {
        id: product.id, productId: product.id, name: product.name, slug: product.slug,
        price: product.price, originalPrice: product.originalPrice, image: product.images[0],
        category: product.category, quantity, maxQuantity: product.stockCount || 99,
        source: product.source, variantId: product.variantId,
      }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, Math.min(quantity, item.maxQuantity)) } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const isInCart = useCallback((id: string) => items.some((item) => item.id === id), [items]);

  const totals = calculateTotals(items);

  return (
    <CartContext.Provider value={{ items, totalItems: totals.totalItems, subtotal: totals.subtotal, tax: totals.tax, shipping: totals.shipping, total: totals.total, addItem, removeItem, updateQuantity, clearCart, isInCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCartContext must be used within CartProvider");
  return context;
}
