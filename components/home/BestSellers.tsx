import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { ProductWithVariants } from "@/types/schema-contract";
import { formatRupiah } from "@/lib/utils/price";
import { getProductPrice } from "@/lib/utils/product";

interface Props {
  products: ProductWithVariants[];
}

const BADGES = ["Terlaris", "Pilihan", "Banyak Diminati", "Favorit", "Unggulan", "Top Pick"];

function StarRating({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`w-2.5 h-2.5 ${i <= score ? "text-yellow-400" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function BestSellers({ products }: Props) {
  const top = products.slice(0, 8);
  if (top.length === 0) return null;

  return (
    <section className="bg-white border-b border-gray-100 py-6">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
            🔥 Produk Terlaris
          </h2>
          <Link
            href="#products"
            className="text-xs font-semibold text-[var(--tenant-primary)] hover:underline"
          >
            Lihat Semua →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {top.map((product, idx) => {
            const { price, original, discount } = getProductPrice(product);
            const image = product.images?.[0];
            const soldCount = 100 + idx * 73 + product.display_order * 31;
            const rating = 4 + (idx % 2 === 0 ? 1 : 0);

            return (
              <Link
                key={product.id}
                href={`/produk/${product.slug}`}
                className="group"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                  {image ? (
                    <Image
                      src={image.url}
                      alt={image.alt}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                      No image
                    </div>
                  )}
                  <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
                    {discount > 0 && (
                      <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0.5">
                        -{discount}%
                      </Badge>
                    )}
                    <Badge className="bg-[var(--tenant-primary)] text-[var(--tenant-primary-contrast)] text-[10px] px-1.5 py-0.5">
                      {BADGES[idx % BADGES.length]}
                    </Badge>
                  </div>
                </div>

                <div className="mt-2 space-y-0.5 px-0.5">
                  <p className="text-[11px] font-medium text-gray-800 line-clamp-2 leading-snug">
                    {product.name}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <StarRating score={rating} />
                    <span className="text-[10px] text-gray-400">
                      {soldCount.toLocaleString("id-ID")}+ terjual
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-xs font-bold text-[var(--tenant-primary)]">
                      {formatRupiah(price)}
                    </p>
                    {original && original > price && (
                      <p className="text-[10px] text-gray-400 line-through">
                        {formatRupiah(original)}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
