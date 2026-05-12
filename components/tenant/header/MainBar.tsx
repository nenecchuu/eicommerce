"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { ShoppingCart, Search, X, Menu } from "lucide-react";
import type { HeaderSharedProps } from "./types";
import { getCartStore } from "@/lib/cart/store";

interface Props extends HeaderSharedProps {
  mounted: boolean;
  search: string;
  onSearchChange: (v: string) => void;
  onSearchSubmit: (e: React.SyntheticEvent<HTMLFormElement>) => void;
  onOpenSearch: () => void;
  onOpenMenu: () => void;
}

export default function MainBar({
  tenant,
  mounted,
  search,
  onSearchChange,
  onSearchSubmit,
  onOpenSearch,
  onOpenMenu,
}: Props) {
  const slug = tenant.slug;
  const useCart = getCartStore(slug);
  const itemCount = useCart((s) => s.itemCount());
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
      {/* Hamburger — mobile only */}
      <button
        onClick={onOpenMenu}
        className="md:hidden flex items-center justify-center w-9 h-9 -ml-1 rounded-lg opacity-90 hover:opacity-100 hover:bg-white/10 transition-colors"
        aria-label="Buka menu"
      >
        <Menu size={22} />
      </button>

      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 font-bold text-base flex-shrink-0 min-w-0"
      >
        {tenant.cms.logo_url ? (
          <Image
            src={tenant.cms.logo_url}
            alt={tenant.name}
            width={36}
            height={36}
            className="rounded object-contain flex-shrink-0"
          />
        ) : null}
        <span className="truncate max-w-[140px] sm:max-w-none">{tenant.name}</span>
      </Link>

      {/* Search bar — desktop */}
      <form
        onSubmit={onSearchSubmit}
        className="hidden md:flex flex-1 max-w-xl mx-auto items-center bg-white rounded-lg overflow-hidden ring-1 ring-white/20 focus-within:ring-white/60 transition-shadow"
      >
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari produk..."
          className="flex-1 px-3.5 py-2 text-sm text-gray-800 outline-none bg-transparent placeholder:text-gray-400"
        />
        {search && (
          <button
            type="button"
            onClick={() => { onSearchChange(""); inputRef.current?.focus(); }}
            className="px-2 text-gray-400 hover:text-gray-600"
            aria-label="Hapus pencarian"
          >
            <X size={14} />
          </button>
        )}
        <button
          type="submit"
          className="px-3.5 py-2 text-gray-400 hover:text-gray-600 flex items-center transition-colors"
          aria-label="Cari"
        >
          <Search size={16} />
        </button>
      </form>

      {/* Right icons */}
      <div className="flex items-center gap-1 ml-auto md:ml-0 flex-shrink-0">
        {/* Search toggle — mobile only */}
        <button
          onClick={onOpenSearch}
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg opacity-90 hover:opacity-100 hover:bg-white/10 transition-colors"
          aria-label="Cari produk"
        >
          <Search size={20} />
        </button>

        {/* Cart */}
        <Link
          href="/keranjang"
          className="relative flex items-center justify-center w-9 h-9 rounded-lg opacity-90 hover:opacity-100 hover:bg-white/10 transition-colors"
          aria-label="Keranjang belanja"
        >
          <ShoppingCart size={22} />
          {mounted && itemCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-0.5 leading-none">
              {itemCount > 9 ? "9+" : itemCount}
            </span>
          )}
        </Link>
      </div>
    </div>
  );
}
