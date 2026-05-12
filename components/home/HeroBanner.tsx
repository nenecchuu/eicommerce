"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const SLIDES = [
  {
    id: 1,
    badge: "FLASH SALE HARI INI",
    headline: "Diskon 50% + Gratis Ongkir!",
    sub: "Belanja sekarang sebelum kehabisan. Stok terbatas!",
    cta: "Belanja Sekarang",
    bg: "from-orange-500 to-red-600",
    img: "https://placehold.co/600x400/FF6B35/ffffff?text=Promo+Banner+1",
  },
  {
    id: 2,
    badge: "BAYAR DI TEMPAT (COD)",
    headline: "Terima Barang Dulu, Baru Bayar!",
    sub: "Aman, terpercaya, bisa bayar tunai saat barang tiba.",
    cta: "Lihat Produk",
    bg: "from-blue-600 to-indigo-700",
    img: "https://placehold.co/600x400/3B82F6/ffffff?text=Promo+Banner+2",
  },
  {
    id: 3,
    badge: "GRATIS ONGKIR SE-INDONESIA",
    headline: "Kirim ke Seluruh Indonesia, Gratis!",
    sub: "Tanpa minimum pembelian. Berlaku untuk semua wilayah.",
    cta: "Order Sekarang",
    bg: "from-green-500 to-emerald-600",
    img: "https://placehold.co/600x400/10B981/ffffff?text=Promo+Banner+3",
  },
];

export default function HeroBanner() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((p) => (p + 1) % SLIDES.length), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative overflow-hidden">
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/7]">
        {SLIDES.map((slide, i) => (
          <div
            key={slide.id}
            className="absolute inset-0"
            style={{
              opacity: i === active ? 1 : 0,
              transition: "opacity 800ms cubic-bezier(0.4, 0, 0.2, 1)",
              zIndex: i === active ? 1 : 0,
            }}
          >
            {/* Background image */}
            <Image
              src={slide.img}
              alt={slide.headline}
              fill
              className="object-cover"
              sizes="100vw"
              priority={i === 0}
            />

            {/* Gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.bg} opacity-70`} />

            {/* Text overlay */}
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-6xl mx-auto px-6 w-full">
                <div
                  className="max-w-lg text-white space-y-2 sm:space-y-3"
                  style={{
                    transform: i === active ? "translateY(0)" : "translateY(12px)",
                    opacity: i === active ? 1 : 0,
                    transition: "opacity 600ms cubic-bezier(0.4, 0, 0.2, 1) 200ms, transform 600ms cubic-bezier(0.4, 0, 0.2, 1) 200ms",
                  }}
                >
                  <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1 rounded-full tracking-wide">
                    {slide.badge}
                  </span>
                  <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold leading-tight drop-shadow-lg">
                    {slide.headline}
                  </h2>
                  <p className="text-white/90 text-sm md:text-base drop-shadow">
                    {slide.sub}
                  </p>
                  <a
                    href="#products"
                    className="inline-block mt-2 bg-white text-gray-900 font-bold px-7 py-3 rounded-full text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  >
                    {slide.cta}
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setActive(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === active ? "bg-white w-5" : "bg-white/50 w-2"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
