"use client";

import Link from "next/link";
import Image from "next/image";
import type { CategoryListProps } from "@/lib/types/homepage";
import { useFontScale } from "@/lib/context/font-scale-context";

const FALLBACK_ICONS: Record<string, string> = {
  fashion: "👗", baju: "👕", celana: "👖", sepatu: "👟", tas: "👜",
  aksesoris: "💍", elektronik: "📱", rumah: "🏠", dapur: "🍳",
  makanan: "🍜", minuman: "🥤", kecantikan: "💄", kesehatan: "💊",
  olahraga: "⚽", mainan: "🧸", buku: "📚", otomotif: "🚗",
};

function getIcon(name: string) {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(FALLBACK_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return "🏷️";
}

export default function CategoryListSection({ props }: { props: CategoryListProps }) {
  const fs = useFontScale();
  if (props.categories.length === 0) return null;

  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {props.title && (
          <h2 className={`${fs.sectionHeading} text-gray-800 mb-4`}>{props.title}</h2>
        )}
        <div className="flex gap-4 overflow-x-auto scrollbar-none pb-1">
          {props.categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/kategori/${cat.slug}`}
              className="flex flex-col items-center gap-2 flex-shrink-0 group"
            >
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl group-hover:bg-[var(--tenant-primary-tint)] transition-colors overflow-hidden relative">
                {cat.image_url ? (
                  <Image
                    src={cat.image_url}
                    alt={cat.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                    unoptimized
                  />
                ) : (
                  getIcon(cat.name)
                )}
              </div>
              <span className={`${fs.category} font-medium text-gray-600 text-center w-16 truncate`}>
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
