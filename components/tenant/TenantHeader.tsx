"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { TenantWithCMS } from "@/types/schema-contract";
import MainBar from "./header/MainBar";
import SearchOverlay from "./header/SearchOverlay";
import MobileMenu from "./header/MobileMenu";
import type { NavLink } from "./header/types";
import { useMetaPixel } from "@/lib/hooks/useMetaPixel";

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

function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export default function TenantHeader({ tenant, categories = [] }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const pixel = useMetaPixel();

  const mounted = useMounted();
  const [search, setSearch] = useState("");
  const [searchOpenState, setSearchOpenState] = useState({
    open: false,
    pathname,
  });
  const [menuOpenState, setMenuOpenState] = useState({
    open: false,
    pathname,
  });
  const searchOpen = searchOpenState.open && searchOpenState.pathname === pathname;
  const menuOpen = menuOpenState.open && menuOpenState.pathname === pathname;

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const handleSearch = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;
    pixel.track("Search", { search_string: q });
    router.push(`/produk?q=${encodeURIComponent(q)}`);
    setSearch("");
    setSearchOpenState({ open: false, pathname });
    setMenuOpenState({ open: false, pathname });
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
          onOpenSearch={() => setSearchOpenState({ open: true, pathname })}
          onOpenMenu={() => setMenuOpenState({ open: true, pathname })}
        />
      </header>

      {searchOpen && (
        <SearchOverlay
          search={search}
          onSearchChange={setSearch}
          onSubmit={handleSearch}
          onClose={() => setSearchOpenState({ open: false, pathname })}
        />
      )}

      {menuOpen && (
        <MobileMenu
          tenant={tenant}
          navLinks={navLinks}
          mounted={mounted}
          onClose={() => setMenuOpenState({ open: false, pathname })}
        />
      )}
    </>
  );
}
