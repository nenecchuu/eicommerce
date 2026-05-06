"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface Props {
  categories: string[];
  active?: string;
}

export default function CategoryFilter({ categories, active }: Props) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Link
        href="/"
        prefetch={true}
        className={cn(
          "px-3 py-1 rounded-full text-xs border transition-colors active:scale-95",
          !active
            ? "border-[var(--tenant-primary)] bg-[var(--tenant-primary)] text-[var(--tenant-primary-contrast)]"
            : "border-gray-300 text-gray-600 hover:border-[var(--tenant-primary)] hover:text-[var(--tenant-primary)]"
        )}
      >
        Semua
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat}
          href={`/?category=${encodeURIComponent(cat)}`}
          prefetch={true}
          className={cn(
            "px-3 py-1 rounded-full text-xs border transition-colors active:scale-95",
            active === cat
              ? "border-[var(--tenant-primary)] bg-[var(--tenant-primary)] text-[var(--tenant-primary-contrast)]"
              : "border-gray-300 text-gray-600 hover:border-[var(--tenant-primary)] hover:text-[var(--tenant-primary)]"
          )}
        >
          {cat}
        </Link>
      ))}
    </div>
  );
}
