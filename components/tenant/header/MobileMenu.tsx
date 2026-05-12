"use client";

import Link from "next/link";
import Image from "next/image";
import { X, ChevronRight, ShoppingCart } from "lucide-react";
import type { HeaderSharedProps } from "./types";
import { getCartStore } from "@/lib/cart/store";

interface Props extends HeaderSharedProps {
  mounted: boolean;
  onClose: () => void;
}

export default function MobileMenu({ tenant, navLinks, mounted, onClose }: Props) {
  const useCart = getCartStore(tenant.slug);
  const itemCount = useCart((s) => s.itemCount());

  return (
    <div
      className="fixed inset-0 z-50 flex"
      role="dialog"
      aria-modal="true"
      aria-label="Menu navigasi"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-72 max-w-[85vw] h-full bg-white flex flex-col shadow-2xl animate-slide-in-left">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 bg-[var(--tenant-primary)] text-[var(--tenant-primary-contrast)]">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-base"
            onClick={onClose}
          >
            {tenant.cms.logo_url && (
              <Image
                src={tenant.cms.logo_url}
                alt={tenant.name}
                width={28}
                height={28}
                className="rounded object-contain"
              />
            )}
            <span className="truncate">{tenant.name}</span>
          </Link>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Tutup menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-2">
          <p className="px-4 pt-2 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Kategori
          </p>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-50"
              onClick={onClose}
            >
              <span>{link.label}</span>
              <ChevronRight size={16} className="text-gray-400" />
            </Link>
          ))}
        </nav>

        {/* Footer CTA */}
        <div className="px-4 py-4 border-t border-gray-100 bg-gray-50">
          <Link
            href="/keranjang"
            onClick={onClose}
            className="flex items-center justify-between w-full bg-[var(--tenant-primary)] text-[var(--tenant-primary-contrast)] rounded-lg px-4 py-2.5 text-sm font-semibold"
          >
            <span className="flex items-center gap-2">
              <ShoppingCart size={18} />
              Keranjang
            </span>
            {mounted && itemCount > 0 && (
              <span className="bg-white text-[var(--tenant-primary)] text-xs font-bold rounded-full px-2 py-0.5">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}
