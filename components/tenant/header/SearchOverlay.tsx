"use client";

import { useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  onSubmit: (e: React.SyntheticEvent<HTMLFormElement>) => void;
  onClose: () => void;
}

export default function SearchOverlay({ search, onSearchChange, onSubmit, onClose }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div
        className="bg-[var(--tenant-primary)] px-4 pt-3 pb-4"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={onSubmit} className="flex items-center gap-2">
          <div className="flex-1 flex items-center bg-white rounded-lg overflow-hidden">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari produk..."
              className="flex-1 px-3.5 py-2.5 text-sm text-gray-800 outline-none bg-transparent placeholder:text-gray-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="px-2 text-gray-400"
                aria-label="Hapus"
              >
                <X size={14} />
              </button>
            )}
            <button
              type="submit"
              className="bg-[var(--tenant-primary)] text-[var(--tenant-primary-contrast)] px-3.5 py-2.5 flex items-center"
              aria-label="Cari"
            >
              <Search size={16} />
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--tenant-primary-contrast)] text-sm font-medium opacity-90 hover:opacity-100 whitespace-nowrap"
          >
            Batal
          </button>
        </form>
      </div>
    </div>
  );
}
