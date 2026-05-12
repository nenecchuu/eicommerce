"use client";

import Link from "next/link";
import Image from "next/image";
import type { ProductListProps } from "@/lib/types/homepage";
import type { ProductWithVariants } from "@/types/schema-contract";
import { formatRupiah } from "@/lib/utils/price";
import { getProductPriceRange } from "@/lib/utils/product";
import { useFontScale } from "@/lib/context/font-scale-context";

interface Props {
  props: ProductListProps;
  tenantId: string;
  allProducts: ProductWithVariants[];
}

function resolveProducts(allProducts: ProductWithVariants[], props: ProductListProps) {
  let list = allProducts;

  if (props.source === "category" && props.source_param) {
    list = list.filter((p) => p.category === props.source_param);
  } else if (props.source === "custom_selection" && props.custom_product_ids?.length) {
    const ids = new Set(props.custom_product_ids);
    list = list.filter((p) => ids.has(p.id));
  }

  return list.slice(0, props.item_limit);
}

function ProductCard({ product, layout }: { product: ProductWithVariants; layout: "card" | "full_image" }) {
  const fs = useFontScale();
  const image = product.images?.[0];
  const priceRange = getProductPriceRange(product, product.variants);
  const minPrice = priceRange?.min ?? product.variants[0]?.price ?? 0;

  if (layout === "full_image") {
    return (
      <Link href={`/produk/${product.slug}`} className="group relative block aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100">
        {image && (
          <Image
            src={image.url}
            alt={image.alt}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, 25vw"
            unoptimized
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
          <p className={`${fs.body} font-semibold line-clamp-2 leading-snug`}>{product.name}</p>
          <p className={`${fs.price} mt-1`}>{formatRupiah(minPrice)}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/produk/${product.slug}`} className="group block">
      <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
            No image
          </div>
        )}
      </div>
      <div className="mt-2 space-y-0.5">
        <p className={`${fs.body} font-medium text-gray-800 line-clamp-2 leading-snug`}>{product.name}</p>
        <p className={`${fs.price} text-[var(--tenant-primary)]`}>
          {priceRange && priceRange.min !== priceRange.max
            ? `Mulai ${formatRupiah(priceRange.min)}`
            : formatRupiah(minPrice)}
        </p>
      </div>
    </Link>
  );
}

export default function ProductListSection({ props, allProducts }: Props) {
  const fs = useFontScale();
  const products = resolveProducts(allProducts, props);
  if (products.length === 0) return null;

  return (
    <section className="bg-white border-b border-gray-100 py-6">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`${fs.sectionHeading} text-gray-800`}>{props.title}</h2>
          {props.show_view_all && (
            <Link
              href="/produk"
              prefetch={true}
              className={`${fs.viewAll} text-[var(--tenant-primary)] hover:opacity-70 hover:underline active:opacity-50 transition-opacity`}
            >
              Lihat Semua →
            </Link>
          )}
        </div>

        {props.layout === "full_image" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} layout="full_image" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} layout="card" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
