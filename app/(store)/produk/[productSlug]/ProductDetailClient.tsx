"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingCart, ChevronLeft, Minus, Plus, Check } from "lucide-react";
import type { ProductWithVariants, ProductVariant } from "@/types/schema-contract";
import { formatRupiah } from "@/lib/utils/price";
import { getProductPrice, isProductInStock } from "@/lib/utils/product";
import { getCartStore } from "@/lib/cart/store";

interface Props {
  product: ProductWithVariants;
  tenantSlug: string;
}

function buildAttrOptions(variants: ProductVariant[]) {
  const attr1Set = new Set<string>();
  const attr2Set = new Set<string>();
  variants.forEach((v) => {
    if (v.attr1_val) attr1Set.add(v.attr1_val);
    if (v.attr2_val) attr2Set.add(v.attr2_val);
  });
  return {
    attr1: Array.from(attr1Set),
    attr2: Array.from(attr2Set),
  };
}

function findVariant(
  variants: ProductVariant[],
  attr1: string | null,
  attr2: string | null
): ProductVariant | null {
  return (
    variants.find(
      (v) =>
        (attr1 === null || v.attr1_val === attr1) &&
        (attr2 === null || v.attr2_val === attr2)
    ) ?? null
  );
}

export default function ProductDetailClient({ product, tenantSlug }: Props) {
  const router = useRouter();
  const useCart = getCartStore(tenantSlug);
  const addItem = useCart((s) => s.addItem);

  const hasVariants = product.variants.length > 0;
  const attrOptions = buildAttrOptions(product.variants);

  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedAttr1, setSelectedAttr1] = useState<string | null>(
    attrOptions.attr1[0] ?? null
  );
  const [selectedAttr2, setSelectedAttr2] = useState<string | null>(
    attrOptions.attr2[0] ?? null
  );
  const [added, setAdded] = useState(false);

  const selectedVariant = hasVariants
    ? findVariant(product.variants, selectedAttr1, selectedAttr2)
    : null;

  const { price, original, discount } = getProductPrice(product, selectedVariant);
  const inStock = isProductInStock(product, selectedVariant);

  const isVariantAvailable = (attr: "attr1" | "attr2", val: string) => {
    if (attr === "attr1") {
      return product.variants.some(
        (v) =>
          v.attr1_val === val &&
          (selectedAttr2 === null || v.attr2_val === selectedAttr2) &&
          v.available_qty > 0
      );
    }
    return product.variants.some(
      (v) =>
        v.attr2_val === val &&
        (selectedAttr1 === null || v.attr1_val === selectedAttr1) &&
        v.available_qty > 0
    );
  };

  const handleAddToCart = () => {
    if (!inStock) return;
    addItem({
      product_id: product.id,
      variant_id: selectedVariant?.id ?? null,
      product_name: product.name,
      variant_label: [selectedAttr1, selectedAttr2].filter(Boolean).join(" / ") || null,
      price: price,
      quantity: qty,
      image_url: product.images?.[0]?.url ?? null,
      slug: product.slug,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/keranjang");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4 transition-colors"
      >
        <ChevronLeft size={16} />
        Kembali
      </button>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Image gallery */}
        <div className="flex flex-col gap-3 md:w-[420px] flex-shrink-0">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-100">
            {product.images?.[activeImg] ? (
              <Image
                src={product.images[activeImg].url}
                alt={product.images[activeImg].alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 420px"
                unoptimized
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
                No image
              </div>
            )}
            {discount > 0 && (
              <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                -{discount}%
              </span>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    i === activeImg
                      ? "border-[var(--tenant-primary)]"
                      : "border-transparent"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={img.alt}
                    fill
                    className="object-cover"
                    sizes="64px"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail */}
        <div className="flex-1 space-y-5">
          {product.category && (
            <span className="text-xs text-[var(--tenant-primary)] font-semibold uppercase tracking-wide">
              {product.category}
            </span>
          )}
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-extrabold text-[var(--tenant-primary)]">
              {formatRupiah(price)}
            </span>
            {original && original > price && (
              <span className="text-sm text-gray-400 line-through">
                {formatRupiah(original)}
              </span>
            )}
          </div>

          {/* Variant selector */}
          {hasVariants && (
            <div className="space-y-4">
              {attrOptions.attr1.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    {selectedAttr1 ? (
                      <>Ukuran: <span className="text-[var(--tenant-primary)]">{selectedAttr1}</span></>
                    ) : "Pilih Ukuran"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {attrOptions.attr1.map((val) => {
                      const available = isVariantAvailable("attr1", val);
                      return (
                        <button
                          key={val}
                          onClick={() => setSelectedAttr1(val)}
                          disabled={!available}
                          className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                            selectedAttr1 === val
                              ? "border-[var(--tenant-primary)] bg-[var(--tenant-primary-tint)] text-[var(--tenant-primary)]"
                              : available
                              ? "border-gray-200 text-gray-700 hover:border-gray-400"
                              : "border-gray-100 text-gray-300 cursor-not-allowed line-through"
                          }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {attrOptions.attr2.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    {selectedAttr2 ? (
                      <>Roast: <span className="text-[var(--tenant-primary)]">{selectedAttr2}</span></>
                    ) : "Pilih Roast"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {attrOptions.attr2.map((val) => {
                      const available = isVariantAvailable("attr2", val);
                      return (
                        <button
                          key={val}
                          onClick={() => setSelectedAttr2(val)}
                          disabled={!available}
                          className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                            selectedAttr2 === val
                              ? "border-[var(--tenant-primary)] bg-[var(--tenant-primary-tint)] text-[var(--tenant-primary)]"
                              : available
                              ? "border-gray-200 text-gray-700 hover:border-gray-400"
                              : "border-gray-100 text-gray-300 cursor-not-allowed line-through"
                          }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedVariant && (
                <p className="text-xs text-gray-400">
                  Stok: {selectedVariant.available_qty > 0 ? `${selectedVariant.available_qty} tersisa` : "Habis"}
                </p>
              )}
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-700">Jumlah:</span>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-3 py-2 hover:bg-gray-50 transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="w-10 text-center text-sm font-semibold">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="px-3 py-2 hover:bg-gray-50 transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* CTA */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm border-2 transition-all ${
                inStock
                  ? added
                    ? "border-green-500 bg-green-50 text-green-600"
                    : "border-[var(--tenant-primary)] text-[var(--tenant-primary)] hover:bg-[var(--tenant-primary-tint)]"
                  : "border-gray-200 text-gray-300 cursor-not-allowed"
              }`}
            >
              {added ? <Check size={16} /> : <ShoppingCart size={16} />}
              {added ? "Ditambahkan!" : "Keranjang"}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={!inStock}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
                inStock
                  ? "bg-[var(--tenant-primary)] text-[var(--tenant-primary-contrast)] hover:opacity-90 shadow-md"
                  : "bg-gray-100 text-gray-300 cursor-not-allowed"
              }`}
            >
              {inStock ? "Beli Sekarang" : "Stok Habis"}
            </button>
          </div>

          {/* Description */}
          {product.description && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-sm font-semibold text-gray-700 mb-2">Deskripsi Produk</p>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
