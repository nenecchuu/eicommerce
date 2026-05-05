"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Props {
  categories: string[];
  active?: string;
}

export default function CategoryFilter({ categories, active }: Props) {
  const router = useRouter();

  const go = (cat?: string) => {
    const url = cat ? `/?category=${encodeURIComponent(cat)}` : "/";
    router.push(url);
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={() => go()}
        className={cn(
          "px-3 py-1 rounded-full text-xs border transition-colors",
          !active
            ? "border-[var(--tenant-primary)] bg-[var(--tenant-primary)] text-[var(--tenant-primary-contrast)]"
            : "border-gray-300 text-gray-600 hover:border-[var(--tenant-primary)] hover:text-[var(--tenant-primary)]"
        )}
      >
        Semua
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => go(cat)}
          className={cn(
            "px-3 py-1 rounded-full text-xs border transition-colors",
            active === cat
              ? "border-[var(--tenant-primary)] bg-[var(--tenant-primary)] text-[var(--tenant-primary-contrast)]"
              : "border-gray-300 text-gray-600 hover:border-[var(--tenant-primary)] hover:text-[var(--tenant-primary)]"
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
