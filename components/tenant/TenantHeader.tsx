"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { TenantWithCMS } from "@/types/schema-contract";
import MainBar from "./header/MainBar";
import SearchOverlay from "./header/SearchOverlay";
import MobileMenu from "./header/MobileMenu";
import type { NavLink } from "./header/types";

interface Props {
  tenant: TenantWithCMS;
  categories?: string[];
}

function buildNavLinks(categories: string[]): NavLink[] {
  return [
    { label: "Semua Produk", href: "/produk" },
    ...categories.map((c) => ({
      label: c,
      href: `/kategori/${encodeURIComponent(c.toLowerCase().replace(/\s+/g, "-"))}`,
    })),
  ];
}

export default function TenantHeader({ tenant, categories = [] }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const handleSearch = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;
    router.push(`/produk?q=${encodeURIComponent(q)}`);
    setSearch("");
    setSearchOpen(false);
    setMenuOpen(false);
  };

  const navLinks = buildNavLinks(categories);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[var(--tenant-primary)] text-[var(--tenant-primary-contrast)] shadow-sm">
        <MainBar
          tenant={tenant}
          navLinks={navLinks}
          mounted={mounted}
          search={search}
          onSearchChange={setSearch}
          onSearchSubmit={handleSearch}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenMenu={() => setMenuOpen(true)}
        />
      </header>

      {searchOpen && (
        <SearchOverlay
          search={search}
          onSearchChange={setSearch}
          onSubmit={handleSearch}
          onClose={() => setSearchOpen(false)}
        />
      )}

      {menuOpen && (
        <MobileMenu
          tenant={tenant}
          navLinks={navLinks}
          mounted={mounted}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </>
  );
}
