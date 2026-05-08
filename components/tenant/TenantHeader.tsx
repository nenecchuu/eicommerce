"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ShoppingCart, Bell, User, MapPin, Search, X } from "lucide-react";
import type { TenantWithCMS } from "@/types/schema-contract";
import { getCartStore } from "@/lib/cart/store";
import { useRouter } from "next/navigation";

interface Props {
  tenant: TenantWithCMS;
}

const CITIES = [
  "Jakarta", "Surabaya", "Bandung", "Medan", "Semarang",
  "Makassar", "Palembang", "Tangerang", "Depok", "Bekasi",
];

export default function TenantHeader({ tenant }: Props) {
  const router = useRouter();
  const slug = tenant.slug;
  const useCart = getCartStore(slug);
  const itemCount = useCart((s) => s.itemCount());

  const [mounted, setMounted] = useState(false);
  const [city, setCity] = useState("Pilih Kota");
  const [showCities, setShowCities] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => setMounted(true), []);

  const handleSearch = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/${slug}?q=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 shadow-sm">
      {/* Main header */}
      <div
        className="bg-[var(--tenant-primary)] text-[var(--tenant-primary-contrast)]"
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          {/* Logo */}
          <Link
            href={`/${slug}`}
            className="flex items-center gap-2 font-bold text-base flex-shrink-0"
          >
            {tenant.cms.logo_url ? (
              <Image
                src={tenant.cms.logo_url}
                alt={tenant.name}
                width={32}
                height={32}
                className="rounded object-contain"
              />
            ) : null}
            <span className="hidden sm:block">{tenant.name}</span>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-auto">
            <div className="flex items-center bg-white rounded-full overflow-hidden shadow-inner">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari produk..."
                className="flex-1 px-4 py-2 text-sm text-gray-800 outline-none bg-transparent placeholder:text-gray-400"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="px-2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
              <button
                type="submit"
                className="bg-[var(--tenant-primary)] hover:bg-[var(--tenant-primary-hover)] text-[var(--tenant-primary-contrast)] px-4 py-2 flex items-center gap-1 transition-colors"
              >
                <Search size={16} />
              </button>
            </div>
          </form>

          {/* Right icons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Lokasi */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setShowCities((v) => !v)}
                className="flex items-center gap-1 opacity-90 hover:opacity-100 transition-opacity text-xs"
              >
                <MapPin size={14} />
                <span className="max-w-[80px] truncate">{city}</span>
              </button>
              {showCities && (
                <div className="absolute top-8 right-0 w-44 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                  <p className="text-[10px] font-bold text-gray-400 uppercase px-3 pt-2 pb-1">
                    Pilih Kota
                  </p>
                  {CITIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => { setCity(c); setShowCities(false); }}
                      className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notif */}
            <button className="relative opacity-90 hover:opacity-100 transition-opacity">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                1
              </span>
            </button>

            {/* Akun */}
            <button className="opacity-90 hover:opacity-100 transition-opacity">
              <User size={20} />
            </button>

            {/* Cart */}
            <Link
              href={`/cart`}
              className="relative flex items-center gap-1 opacity-90 hover:opacity-100 transition-opacity"
            >
              <ShoppingCart size={22} />
              {mounted && itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-[var(--tenant-primary)] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
