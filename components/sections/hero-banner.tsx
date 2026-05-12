"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import type { HeroBannerProps } from "@/lib/types/homepage";

export default function HeroBannerSection({ props }: { props: HeroBannerProps }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="relative overflow-hidden">
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/7] bg-gray-100">
        <Image
          src={props.image_url}
          alt={props.title ?? "Banner"}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-black/30" />

        {(props.title || props.subtitle || props.cta_label) && (
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-6xl mx-auto px-6 w-full">
              <div
                className="max-w-lg text-white space-y-2 sm:space-y-3"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "translateY(0)" : "translateY(12px)",
                  transition: "opacity 600ms ease 100ms, transform 600ms ease 100ms",
                }}
              >
                {props.title && (
                  <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold leading-tight drop-shadow-lg">
                    {props.title}
                  </h2>
                )}
                {props.subtitle && (
                  <p className="text-white/90 text-sm md:text-base drop-shadow">
                    {props.subtitle}
                  </p>
                )}
                {props.cta_label && props.cta_url && (
                  <Link
                    href={props.cta_url}
                    className="inline-block mt-2 bg-white text-gray-900 font-bold px-7 py-3 rounded-full text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  >
                    {props.cta_label}
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
