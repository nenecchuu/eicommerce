"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { PromoBannerItem, PromoBannerProps } from "@/lib/types/homepage";

export default function PromoBannerSection({ props }: { props: PromoBannerProps }) {
  const banners = props.banners.filter((banner) => Boolean(banner.image_url));
  const [activeIndex, setActiveIndex] = useState(0);
  const isCarousel = props.display === "carousel";
  const hasMultipleBanners = banners.length > 1;
  const safeActiveIndex = Math.min(activeIndex, Math.max(banners.length - 1, 0));

  useEffect(() => {
    if (!isCarousel || !hasMultipleBanners) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % banners.length);
    }, props.autoplay_ms ?? 4500);

    return () => window.clearInterval(interval);
  }, [banners.length, hasMultipleBanners, isCarousel, props.autoplay_ms]);

  if (banners.length === 0) return null;

  if (isCarousel) {
    return (
      <section className="bg-gray-50 border-b border-gray-100 py-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="relative overflow-hidden rounded-lg bg-gray-200">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${safeActiveIndex * 100}%)` }}
            >
              {banners.map((banner, index) => (
                <div key={`${banner.image_url}-${index}`} className="w-full flex-none">
                  <PromoBannerCard banner={banner} index={index} size="100vw" />
                </div>
              ))}
            </div>

            {hasMultipleBanners && (
              <>
                <button
                  type="button"
                  aria-label="Promo sebelumnya"
                  onClick={() => setActiveIndex((current) => (current === 0 ? banners.length - 1 : current - 1))}
                  className="absolute left-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-gray-900 shadow-md transition hover:bg-white"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  aria-label="Promo berikutnya"
                  onClick={() => setActiveIndex((current) => (current + 1) % banners.length)}
                  className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-gray-900 shadow-md transition hover:bg-white"
                >
                  <ChevronRight size={18} />
                </button>
                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
                  {banners.map((banner, index) => (
                    <button
                      key={`${banner.image_url}-dot-${index}`}
                      type="button"
                      aria-label={`Tampilkan promo ${index + 1}`}
                      onClick={() => setActiveIndex(index)}
                      className={`h-2 rounded-full transition-all ${
                        safeActiveIndex === index ? "w-6 bg-white" : "w-2 bg-white/60 hover:bg-white/80"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-50 border-b border-gray-100 py-6">
      <div className="max-w-6xl mx-auto px-4">
        <div
          className={`grid gap-4 ${
            banners.length === 1
              ? "grid-cols-1"
              : banners.length === 2
              ? "grid-cols-1 sm:grid-cols-2"
              : "grid-cols-1 sm:grid-cols-3"
          }`}
        >
          {banners.slice(0, 3).map((banner, i) => (
            <PromoBannerCard key={`${banner.image_url}-${i}`} banner={banner} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PromoBannerCard({
  banner,
  index,
  size = "(max-width: 640px) 100vw, 33vw",
}: {
  banner: PromoBannerItem;
  index: number;
  size?: string;
}) {
  const inner = (
    <div className="relative aspect-[2/1] overflow-hidden rounded-lg bg-gray-200 shadow-md transition-transform hover:scale-[1.01]">
      <Image
        src={banner.image_url}
        alt={banner.alt ?? `Promo ${index + 1}`}
        fill
        className="object-cover"
        sizes={size}
      />
    </div>
  );

  return banner.link_url ? (
    <Link href={banner.link_url} aria-label={banner.alt ?? `Promo ${index + 1}`}>
      {inner}
    </Link>
  ) : (
    <div>{inner}</div>
  );
}
