"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { HeroBannerItem, HeroBannerProps } from "@/lib/types/homepage";

export default function HeroBannerSection({ props }: { props: HeroBannerProps }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = getHeroSlides(props);
  const hasMultipleSlides = slides.length > 1;
  const safeActiveIndex = Math.min(activeIndex, Math.max(slides.length - 1, 0));

  useEffect(() => {
    if (!hasMultipleSlides) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, props.autoplay_ms ?? 5000);

    return () => window.clearInterval(interval);
  }, [hasMultipleSlides, props.autoplay_ms, slides.length]);

  if (slides.length === 0) return null;

  const goToPrevious = () => {
    setActiveIndex((current) => (current === 0 ? slides.length - 1 : current - 1));
  };

  const goToNext = () => {
    setActiveIndex((current) => (current + 1) % slides.length);
  };

  return (
    <section className="relative overflow-hidden">
      <div className="relative w-full aspect-[16/7] bg-gray-100">
        <div
          className="flex h-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${safeActiveIndex * 100}%)` }}
        >
          {slides.map((slide, index) => {
            const hasContent = Boolean(slide.title || slide.subtitle || slide.cta_label);
            const ctaUrl = slide.cta_url ?? slide.link_url;

            return (
              <div key={`${slide.image_url}-${index}`} className="relative h-full w-full flex-none">
                <Image
                  src={slide.image_url}
                  alt={slide.alt ?? slide.title ?? `Hero banner ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority={index === 0}
                />
                {hasContent && <div className="absolute inset-0 bg-black/30" />}

                {hasContent && (
                  <div className="absolute inset-0 flex items-center">
                    <div className="max-w-6xl mx-auto px-6 w-full">
                      <div
                        className="max-w-lg text-white space-y-2 sm:space-y-3"
                        style={{
                          opacity: index === safeActiveIndex ? 1 : 0,
                          transform: index === safeActiveIndex ? "translateY(0)" : "translateY(12px)",
                          transition: "opacity 600ms ease 100ms, transform 600ms ease 100ms",
                        }}
                      >
                        {slide.title && (
                          <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold leading-tight drop-shadow-lg">
                            {slide.title}
                          </h2>
                        )}
                        {slide.subtitle && (
                          <p className="text-white/90 text-sm md:text-base drop-shadow">
                            {slide.subtitle}
                          </p>
                        )}
                        {slide.cta_label && ctaUrl && (
                          <Link
                            href={ctaUrl}
                            className="inline-block mt-2 bg-white text-gray-900 font-bold px-7 py-3 rounded-full text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                          >
                            {slide.cta_label}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {hasMultipleSlides && (
          <>
            <button
              type="button"
              aria-label="Banner sebelumnya"
              onClick={goToPrevious}
              className="absolute left-3 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-white/85 text-gray-900 shadow-md transition hover:bg-white"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              aria-label="Banner berikutnya"
              onClick={goToNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-white/85 text-gray-900 shadow-md transition hover:bg-white"
            >
              <ChevronRight size={20} />
            </button>
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
              {slides.map((slide, index) => (
                <button
                  key={`${slide.image_url}-dot-${index}`}
                  type="button"
                  aria-label={`Tampilkan banner ${index + 1}`}
                  onClick={() => setActiveIndex(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    safeActiveIndex === index ? "w-7 bg-white" : "w-2.5 bg-white/60 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function getHeroSlides(props: HeroBannerProps): HeroBannerItem[] {
  const legacyProps = props as HeroBannerProps & Partial<HeroBannerItem>;
  const slides = props.banners?.length
    ? props.banners
    : legacyProps.image_url
    ? [{
        image_url: legacyProps.image_url,
        image_url_mobile: legacyProps.image_url_mobile,
        link_url: legacyProps.link_url,
        alt: legacyProps.alt,
        title: legacyProps.title,
        subtitle: legacyProps.subtitle,
        cta_label: legacyProps.cta_label,
        cta_url: legacyProps.cta_url,
      }]
    : [];

  return slides.filter((slide) => Boolean(slide.image_url));
}
