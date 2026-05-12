"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingBag, ChevronRight } from "lucide-react";
import { getCartStore } from "@/lib/cart/store";
import { formatRupiah } from "@/lib/utils/price";
import { SHIPPING_OPTIONS } from "@/types/schema-contract";
import { useTenantSlug } from "@/lib/hooks/useTenantSlug";
import { useFontScale } from "@/lib/context/font-scale-context";
import { cartItemToGtmItem, useGoogleTagManager } from "@/lib/hooks/useGoogleTagManager";

export default function CartPage() {
  const fs = useFontScale();
  const router = useRouter();
  const slug = useTenantSlug();
  const gtm = useGoogleTagManager();
  const trackedCartView = useRef(false);
  const useCart = getCartStore(slug ?? "");
  const items = useCart((s) => s.items);
  const removeItem = useCart((s) => s.removeItem);
  const updateQuantity = useCart((s) => s.updateQuantity);
  const subtotal = useCart((s) => s.subtotal());

  const minShipping = Math.min(...SHIPPING_OPTIONS.map((o) => o.cost));

  useEffect(() => {
    if (trackedCartView.current || items.length === 0) return;
    trackedCartView.current = true;
    gtm.viewCart(items);
  }, [gtm, items]);

  const handleQuantityChange = (
    item: (typeof items)[number],
    nextQuantity: number
  ) => {
    const quantityDiff = nextQuantity - item.quantity;
    if (quantityDiff > 0) {
      gtm.addToCart(cartItemToGtmItem({ ...item, quantity: quantityDiff }));
    } else if (quantityDiff < 0) {
      gtm.removeFromCart(cartItemToGtmItem({ ...item, quantity: Math.abs(quantityDiff) }));
    }
    updateQuantity(item.product_id, item.variant_id, nextQuantity);
  };

  const handleRemoveItem = (item: (typeof items)[number]) => {
    gtm.removeFromCart(cartItemToGtmItem(item));
    removeItem(item.product_id, item.variant_id);
  };

  if (!slug) {
    router.replace("/");
    return null;
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 flex flex-col items-center gap-4 text-center">
        <ShoppingBag size={56} className="text-gray-200" />
        <p className={`${fs.body} text-gray-500 font-medium`}>Keranjang kamu masih kosong</p>
        <Link
          href="/"
          className={`mt-2 inline-block bg-[var(--tenant-primary)] text-[var(--tenant-primary-contrast)] font-semibold px-6 py-3 rounded-xl ${fs.body} hover:opacity-90 transition-opacity`}
        >
          Mulai Belanja
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className={`${fs.pageTitle} text-gray-900 mb-5`}>
        Keranjang ({items.length} produk)
      </h1>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={`${item.product_id}::${item.variant_id}`}
            className="flex gap-3 bg-white border border-gray-100 rounded-2xl p-3 shadow-sm"
          >
            {/* Image */}
            <Link href={`/produk/${item.slug}`}>
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.product_name}
                    fill
                    className="object-cover"
                    sizes="80px"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">
                    No img
                  </div>
                )}
              </div>
            </Link>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className={`${fs.body} font-medium text-gray-800 line-clamp-2 leading-snug`}>
                {item.product_name}
              </p>
              {item.variant_label && (
                <p className={`${fs.meta} text-gray-400 mt-0.5`}>{item.variant_label}</p>
              )}
              <p className={`${fs.price} text-[var(--tenant-primary)] mt-1`}>
                {formatRupiah(item.price)}
              </p>

              {/* Qty + delete */}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => handleQuantityChange(item, item.quantity - 1)}
                    className="px-2.5 py-1.5 hover:bg-gray-50 transition-colors"
                  >
                    <Minus size={12} />
                  </button>
                  <span className={`w-8 text-center ${fs.body} font-semibold`}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(item, item.quantity + 1)}
                    className="px-2.5 py-1.5 hover:bg-gray-50 transition-colors"
                  >
                    <Plus size={12} />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <p className={`${fs.body} font-semibold text-gray-600`}>
                    {formatRupiah(item.price * item.quantity)}
                  </p>
                  <button
                    onClick={() => handleRemoveItem(item)}
                    className="text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className={`mt-6 bg-gray-50 rounded-2xl p-4 space-y-2 ${fs.body}`}>
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span className="font-semibold">{formatRupiah(subtotal)}</span>
        </div>
        <div className={`flex justify-between text-gray-400 ${fs.meta}`}>
          <span>Ongkir (belum dipilih)</span>
          <span>mulai {formatRupiah(minShipping)}</span>
        </div>
        <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900">
          <span>Total</span>
          <span className="text-[var(--tenant-primary)]">{formatRupiah(subtotal)}</span>
        </div>
      </div>

      <button
        onClick={() => router.push("/checkout")}
        className={`mt-4 w-full flex items-center justify-center gap-2 bg-[var(--tenant-primary)] text-[var(--tenant-primary-contrast)] font-bold py-4 rounded-xl shadow-md hover:opacity-90 transition-opacity ${fs.body}`}
      >
        Lanjut ke Checkout
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
