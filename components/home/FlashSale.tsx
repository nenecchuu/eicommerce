"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { ProductWithVariants } from "@/types/schema-contract";
import { formatRupiah } from "@/lib/utils/price";
import { getProductPrice } from "@/lib/utils/product";

interface Props {
  products: ProductWithVariants[];
}

function getFlashSaleEnd(): Date {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 0);
  return end;
}

function useCountdown(target: Date) {
  const [ms, setMs] = useState<number | null>(null);

  useEffect(() => {
    const calc = () => Math.max(0, target.getTime() - Date.now());
    setMs(calc());
    const t = setInterval(() => setMs(calc()), 1000);
    return () => clearInterval(t);
  }, [target]);

  if (ms === null) return { h: "--", m: "--", s: "--" };

  const s = Math.floor(ms / 1000);
  return {
    h: String(Math.floor(s / 3600)).padStart(2, "0"),
    m: String(Math.floor((s % 3600) / 60)).padStart(2, "0"),
    s: String(s % 60).padStart(2, "0"),
  };
}

function TimeBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="bg-gray-900 text-white text-base sm:text-lg font-bold w-10 h-10 flex items-center justify-center rounded-lg tabular-nums">
        {value}
      </span>
      <span className="text-[9px] text-gray-500 mt-0.5">{label}</span>
    </div>
  );
}

export default function FlashSale({ products }: Props) {
  const flashProducts = products
    .filter((p) => {
      const { price, original } = getProductPrice(p);
      return original && original > price;
    })
    .slice(0, 6);

  // useMemo so the Date object is stable across re-renders but created client-side
  const [endTime] = useState(() => getFlashSaleEnd());
  const time = useCountdown(endTime);

  if (flashProducts.length === 0) return null;

  return (
    <section className="bg-white border-b border-gray-100 py-6">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-1.5">
              <span className="text-red-500">⚡</span> Flash Sale
            </h2>
            <div className="flex items-center gap-1">
              <TimeBox value={time.h} label="JAM" />
              <span className="font-bold text-gray-400 mb-4">:</span>
              <TimeBox value={time.m} label="MNT" />
              <span className="font-bold text-gray-400 mb-4">:</span>
              <TimeBox value={time.s} label="DTK" />
            </div>
          </div>
          <Link
            href="#products"
            className="text-xs font-semibold text-[var(--tenant-primary)] hover:underline"
          >
            Lihat Semua →
          </Link>
        </div>

        {/* Products */}
        <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
          {flashProducts.map((product) => {
            const { price, original, discount } = getProductPrice(product);
            const image = product.images?.[0];
            return (
              <Link
                key={product.id}
                href={`/produk/${product.slug}`}
                className="flex-shrink-0 w-36"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                  {image ? (
                    <Image
                      src={image.url}
                      alt={image.alt}
                      fill
                      className="object-cover"
                      sizes="144px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                      No image
                    </div>
                  )}
                  {discount > 0 && (
                    <Badge className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[10px] px-1.5 py-0.5">
                      -{discount}%
                    </Badge>
                  )}
                </div>
                <div className="mt-1.5 space-y-0.5">
                  <p className="text-xs font-semibold text-[var(--tenant-primary)]">
                    {formatRupiah(price)}
                  </p>
                  {original && original > price && (
                    <p className="text-[10px] text-gray-400 line-through">
                      {formatRupiah(original)}
                    </p>
                  )}
                  <p className="text-[11px] text-gray-700 line-clamp-2 leading-snug">
                    {product.name}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
