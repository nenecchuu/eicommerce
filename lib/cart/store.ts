"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types/schema-contract";

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId: string | null) => void;
  updateQuantity: (productId: string, variantId: string | null, quantity: number) => void;
  clearCart: () => void;
  itemCount: () => number;
  subtotal: () => number;
}

function makeKey(productId: string, variantId: string | null) {
  return `${productId}::${variantId ?? "base"}`;
}

export function createCartStore(tenantSlug: string) {
  return create<CartState>()(
    persist(
      (set, get) => ({
        items: [],

        addItem: (newItem) => {
          set((state) => {
            const existing = state.items.find(
              (i) =>
                i.product_id === newItem.product_id &&
                i.variant_id === newItem.variant_id
            );
            if (existing) {
              return {
                items: state.items.map((i) =>
                  i.product_id === newItem.product_id &&
                  i.variant_id === newItem.variant_id
                    ? { ...i, quantity: i.quantity + newItem.quantity }
                    : i
                ),
              };
            }
            return { items: [...state.items, newItem] };
          });
        },

        removeItem: (productId, variantId) => {
          set((state) => ({
            items: state.items.filter(
              (i) =>
                !(i.product_id === productId && i.variant_id === variantId)
            ),
          }));
        },

        updateQuantity: (productId, variantId, quantity) => {
          if (quantity <= 0) {
            get().removeItem(productId, variantId);
            return;
          }
          set((state) => ({
            items: state.items.map((i) =>
              i.product_id === productId && i.variant_id === variantId
                ? { ...i, quantity }
                : i
            ),
          }));
        },

        clearCart: () => set({ items: [] }),

        itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

        subtotal: () =>
          get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      }),
      {
        name: `cart:${tenantSlug}`,
      }
    )
  );
}

// Cache store instances per tenant slug (client-side only)
const storeCache: Record<string, ReturnType<typeof createCartStore>> = {};

export function getCartStore(tenantSlug: string) {
  if (!storeCache[tenantSlug]) {
    storeCache[tenantSlug] = createCartStore(tenantSlug);
  }
  return storeCache[tenantSlug];
}
