"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingBag, ChevronRight, ShoppingCart } from "lucide-react";
import { getCartStore } from "@/lib/cart/store";
import { formatRupiah } from "@/lib/utils/price";
import { useTenantSlug } from "@/lib/hooks/useTenantSlug";
import { useFontScale } from "@/lib/context/font-scale-context";
import { useMetaPixel } from "@/lib/hooks/useMetaPixel";
import {
  cartItemToGtmItem,
  productToGtmItem,
  productsToGtmItems,
  useGoogleTagManager,
} from "@/lib/hooks/useGoogleTagManager";
import type { ProductVariant, ProductWithVariants } from "@/types/schema-contract";

interface Props {
  recommendedProducts: ProductWithVariants[];
}

const RECOMMENDATION_LIST_ID = "cart_upsell";
const RECOMMENDATION_LIST_NAME = "Rekomendasi Keranjang";

function getUpsellVariant(product: ProductWithVariants): ProductVariant | null {
  return (
    product.variants.find((variant) => variant.is_active && variant.available_qty > 0) ??
    product.variants.find((variant) => variant.available_qty > 0) ??
    product.variants[0] ??
    null
  );
}

function getVariantLabel(variant: ProductVariant | null) {
  return [variant?.attr1_val, variant?.attr2_val, variant?.attr3_val]
    .filter(Boolean)
    .join(" / ");
}

export default function CartPageClient({ recommendedProducts }: Props) {
  const fs = useFontScale();
  const router = useRouter();
  const slug = useTenantSlug();
  const gtm = useGoogleTagManager();
  const pixel = useMetaPixel();
  const trackedCartView = useRef(false);
  const trackedRecommendationView = useRef("");
  const useCart = getCartStore(slug ?? "");
  const items = useCart((s) => s.items);
  const removeItem = useCart((s) => s.removeItem);
  const updateQuantity = useCart((s) => s.updateQuantity);
  const subtotal = useCart((s) => s.subtotal());

  const cartProductIds = new Set(items.map((item) => item.product_id));
  const recommendations = recommendedProducts
    .filter((product) => !cartProductIds.has(product.id))
    .slice(0, 2);

  useEffect(() => {
    if (trackedCartView.current || items.length === 0) return;
    trackedCartView.current = true;
    gtm.viewCart(items);
    pixel.trackCustom("ViewCart", {
      content_ids: items.map((item) => item.variant_id ?? item.product_id),
      contents: items.map((item) => ({
        id: item.variant_id ?? item.product_id,
        quantity: item.quantity,
        item_price: item.price,
      })),
      num_items: items.reduce((sum, item) => sum + item.quantity, 0),
      value: subtotal,
      currency: "IDR",
    });
  }, [gtm, items, pixel, subtotal]);

  useEffect(() => {
    const key = recommendations.map((product) => product.id).join(",");
    if (!key || trackedRecommendationView.current === key) return;
    trackedRecommendationView.current = key;
    gtm.viewItemList({
      item_list_id: RECOMMENDATION_LIST_ID,
      item_list_name: RECOMMENDATION_LIST_NAME,
      items: productsToGtmItems({
        products: recommendations,
        itemListId: RECOMMENDATION_LIST_ID,
        itemListName: RECOMMENDATION_LIST_NAME,
      }),
    });
  }, [gtm, recommendations]);

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

  const handleAddRecommendation = (product: ProductWithVariants) => {
    const variant = getUpsellVariant(product);
    if (!variant || variant.available_qty <= 0) return;

    const variantLabel = getVariantLabel(variant);
    const imageUrl = product.images?.[0]?.url ?? variant.images?.[0] ?? null;

    useCart.getState().addItem({
      product_id: product.id,
      variant_id: variant.id,
      product_name: product.name,
      variant_label: variantLabel || null,
      price: variant.price,
      quantity: 1,
      image_url: imageUrl,
      slug: product.slug,
    });

    gtm.addToCart(productToGtmItem({ product, variant }));
    pixel.track("AddToCart", {
      content_name: product.name,
      content_category: product.category ?? undefined,
      content_ids: [variant.id],
      content_type: "product",
      contents: [{ id: variant.id, quantity: 1, item_price: variant.price }],
      value: variant.price,
      currency: "IDR",
      num_items: 1,
    });
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
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-40">
      <h1 className={`${fs.pageTitle} text-gray-900 mb-5`}>
        Keranjang ({items.length} produk)
      </h1>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={`${item.product_id}::${item.variant_id}`}
            className="flex gap-3 bg-white border border-gray-100 rounded-2xl p-3 shadow-sm"
          >
            <Link href={`/produk/${item.slug}`}>
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.product_name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">
                    No img
                  </div>
                )}
              </div>
            </Link>

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

      {recommendations.length > 0 && (
        <section className="mt-6">
          <h2 className={`${fs.body} font-bold text-gray-900 mb-3`}>
            Lengkapi Belanjamu
          </h2>
          <div className="space-y-2">
            {recommendations.map((product) => {
              const variant = getUpsellVariant(product);
              const variantLabel = getVariantLabel(variant);
              const imageUrl = product.images?.[0]?.url ?? variant?.images?.[0] ?? null;
              const isAvailable = Boolean(variant && variant.available_qty > 0);

              return (
                <div
                  key={product.id}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-2 shadow-sm"
                >
                  <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-300">
                        No img
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`${fs.meta} font-semibold text-gray-800 line-clamp-1`}>
                      {product.name}
                    </p>
                    {variantLabel && (
                      <p className={`${fs.meta} text-gray-400 line-clamp-1`}>
                        {variantLabel}
                      </p>
                    )}
                    <p className={`${fs.meta} font-bold text-[var(--tenant-primary)]`}>
                      {variant ? formatRupiah(variant.price) : "-"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddRecommendation(product)}
                    disabled={!isAvailable}
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--tenant-primary)] text-[var(--tenant-primary-contrast)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                    aria-label={`Tambah ${product.name} ke keranjang`}
                  >
                    <ShoppingCart size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-100 bg-white/95 px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className={`mx-auto max-w-2xl space-y-3 ${fs.body}`}>
          <div className="rounded-xl bg-gray-50 px-4 py-3 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold">{formatRupiah(subtotal)}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900">
              <span>Total</span>
              <span className="text-[var(--tenant-primary)]">{formatRupiah(subtotal)}</span>
            </div>
          </div>

          <button
            onClick={() => router.push("/checkout")}
            className={`w-full flex items-center justify-center gap-2 bg-[var(--tenant-primary)] text-[var(--tenant-primary-contrast)] font-bold py-4 rounded-xl shadow-md hover:opacity-90 transition-opacity ${fs.body}`}
          >
            Lanjut ke Checkout
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
