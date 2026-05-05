import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ProductWithVariants } from "@/types/schema-contract";
import { formatRupiah, calculateDiscount } from "@/lib/utils/price";
import { getProductPrice, getProductPriceRange } from "@/lib/utils/product";

interface Props {
  product: ProductWithVariants;
}

export default function ProductCard({ product }: Props) {
  const image = product.images?.[0];
  const hasVariants = product.variants.length > 0;
  const priceRange = hasVariants ? getProductPriceRange(product, product.variants) : null;
  const { price, original, discount } = getProductPrice(product);

  return (
    <Link href={`/produk/${product.slug}`}>
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
            <Badge className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5">
              -{discount}%
            </Badge>
          )}
        </div>
        <CardContent className="pt-3 pb-3 space-y-1">
          <p className="text-xs font-medium text-gray-800 line-clamp-2 leading-snug">
            {product.name}
          </p>
          {product.category && (
            <p className="text-[10px] text-gray-400">{product.category}</p>
          )}
          <div className="pt-1">
            {hasVariants && priceRange ? (
              <p className="text-xs font-semibold text-[var(--tenant-primary)]">
                {priceRange.min === priceRange.max
                  ? formatRupiah(priceRange.min)
                  : `Mulai ${formatRupiah(priceRange.min)}`}
              </p>
            ) : (
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-xs font-semibold text-[var(--tenant-primary)]">
                  {formatRupiah(price)}
                </p>
                {original && original > price && (
                  <p className="text-[10px] text-gray-400 line-through">
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
