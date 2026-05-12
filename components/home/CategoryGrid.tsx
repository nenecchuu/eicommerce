"use client";

import Link from "next/link";
import { useFontScale } from "@/lib/context/font-scale-context";

interface Props {
  categories: string[];
}

const FALLBACK_ICONS: Record<string, string> = {
  fashion: "👗",
  baju: "👕",
  celana: "👖",
  sepatu: "👟",
  tas: "👜",
  aksesoris: "💍",
  elektronik: "📱",
  rumah: "🏠",
  dapur: "🍳",
  makanan: "🍜",
  minuman: "🥤",
  kecantikan: "💄",
  kesehatan: "💊",
  olahraga: "⚽",
  mainan: "🧸",
  buku: "📚",
  otomotif: "🚗",
};

function getIcon(cat: string): string {
  const lower = cat.toLowerCase();
  for (const [key, icon] of Object.entries(FALLBACK_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return "🏷️";
}

export default function CategoryGrid({ categories }: Props) {
  const fs = useFontScale();
  if (categories.length === 0) return null;

  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h2 className={`${fs.sectionHeading} text-gray-800 mb-4`}>Kategori Produk</h2>
        <div className="flex gap-4 overflow-x-auto scrollbar-none pb-1">
          <Link
            href="/"
            className="flex flex-col items-center gap-2 flex-shrink-0 group"
          >
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl group-hover:bg-[var(--tenant-primary-tint)] transition-colors">
              🏪
            </div>
            <span className={`${fs.category} font-medium text-gray-600 text-center w-16 truncate`}>
              Semua
            </span>
          </Link>

          {categories.map((cat) => (
            <Link
              key={cat}
              href={`?category=${encodeURIComponent(cat)}`}
              className="flex flex-col items-center gap-2 flex-shrink-0 group"
            >
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl group-hover:bg-[var(--tenant-primary-tint)] transition-colors">
                {getIcon(cat)}
              </div>
              <span className={`${fs.category} font-medium text-gray-600 text-center w-16 truncate`}>
                {cat}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
