import Image from "next/image";
import Link from "next/link";
import type { PromoBannerProps } from "@/lib/types/homepage";

export default function PromoBannerSection({ props }: { props: PromoBannerProps }) {
  return (
    <section className="bg-gray-50 border-b border-gray-100 py-6">
      <div className="max-w-6xl mx-auto px-4">
        <div
          className={`grid gap-4 ${
            props.banners.length === 1
              ? "grid-cols-1"
              : props.banners.length === 2
              ? "grid-cols-1 sm:grid-cols-2"
              : "grid-cols-1 sm:grid-cols-3"
          }`}
        >
          {props.banners.map((banner, i) => {
            const inner = (
              <div className="relative aspect-[2/1] rounded-2xl overflow-hidden bg-gray-200 shadow-md hover:scale-[1.02] transition-transform">
                <Image
                  src={banner.image_url}
                  alt={`Promo ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 33vw"
                  unoptimized
                />
              </div>
            );

            return banner.link_url ? (
              <Link key={i} href={banner.link_url}>
                {inner}
              </Link>
            ) : (
              <div key={i}>{inner}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
