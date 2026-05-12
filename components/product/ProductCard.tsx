"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ProductWithVariants } from "@/types/schema-contract";
import { formatRupiah } from "@/lib/utils/price";
import { getProductPrice, getProductPriceRange } from "@/lib/utils/product";
import { useFontScale } from "@/lib/context/font-scale-context";
import { productToGtmItem, useGoogleTagManager } from "@/lib/hooks/useGoogleTagManager";

interface Props {
  product: ProductWithVariants;
  index?: number;
  itemListId?: string;
  itemListName?: string;
}

export default function ProductCard({
  product,
  index,
  itemListId,
  itemListName,
}: Props) {
  const fs = useFontScale();
  const gtm = useGoogleTagManager();
  const image = product.images?.[0];
  const hasVariants = product.variants.length > 0;
  const priceRange = hasVariants ? getProductPriceRange(product, product.variants) : null;
  const { price, original, discount } = getProductPrice(product);
  const handleSelectItem = () => {
    if (!itemListId || !itemListName) return;
    const item = productToGtmItem({
      product,
      index,
      itemListId,
      itemListName,
    });
    if (priceRange) item.price = priceRange.min;
    gtm.selectItem(item);
  };

  return (
    <Link href={`/produk/${product.slug}`} onClick={handleSelectItem}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <div className="relative aspect-square w-full overflow-hidden rounded-t-lg bg-gray-100">
          {image ? (
            <Image
              src={image.url}
              alt={image.alt}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
              No image
            </div>
          )}
          {discount > 0 && (
            <Badge className={`absolute top-2 left-2 bg-red-500 text-white ${fs.badge} px-1.5 py-0.5`}>
              -{discount}%
            </Badge>
          )}
        </div>
        <CardContent className="pt-3 pb-3 space-y-1">
          <p className={`${fs.body} font-medium text-gray-800 line-clamp-2 leading-snug`}>
            {product.name}
          </p>
          {product.category && (
            <p className={`${fs.category} text-gray-400`}>{product.category}</p>
          )}
          <div className="pt-1">
            {hasVariants && priceRange ? (
              <p className={`${fs.price} text-[var(--tenant-primary)]`}>
                {priceRange.min === priceRange.max
                  ? formatRupiah(priceRange.min)
                  : `Mulai ${formatRupiah(priceRange.min)}`}
              </p>
            ) : (
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className={`${fs.price} text-[var(--tenant-primary)]`}>
                  {formatRupiah(price)}
                </p>
                {original && original > price && (
                  <p className={`${fs.priceStrike} text-gray-400 line-through`}>
                    {formatRupiah(original)}
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
