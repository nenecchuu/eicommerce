"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import ProductCard from "@/components/product/ProductCard";
import { formatRupiah } from "@/lib/utils/price";
import type { ProductsResult, ProductsFilters } from "@/lib/queries/getProducts";
import { productsToGtmItems, useGoogleTagManager } from "@/lib/hooks/useGoogleTagManager";

interface Props {
  tenantId: string;
  tenantName: string;
  productsResult: ProductsResult;
  categories: string[];
  initialFilters: ProductsFilters;
}

function currentListName(filters: ProductsFilters) {
  if (filters.search) return `Search: ${filters.search}`;
  if (filters.category) return `Category: ${filters.category}`;
  return "All products";
}

export default function ProductListingClient({
  tenantName,
  productsResult,
  categories,
  initialFilters,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gtm = useGoogleTagManager();
  const itemListId = "product_listing";

  const [searchInput, setSearchInput] = useState(initialFilters.search ?? "");
  const [showFilters, setShowFilters] = useState(false);

  const currentFilters = {
    search: searchParams.get("q") || "",
    category: searchParams.get("category") || "",
    minPrice: searchParams.get("minPrice") ? parseInt(searchParams.get("minPrice")!) : undefined,
    maxPrice: searchParams.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!) : undefined,
    sort: (searchParams.get("sort") as ProductsFilters["sort"]) || "terbaru",
    page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
  };
  const itemListName = currentListName(currentFilters);

  const updateURL = (updates: Partial<ProductsFilters>) => {
    const params = new URLSearchParams();

    if (currentFilters.search) params.set("q", currentFilters.search);
    if (currentFilters.category) params.set("category", currentFilters.category);
    if (currentFilters.minPrice) params.set("minPrice", currentFilters.minPrice.toString());
    if (currentFilters.maxPrice) params.set("maxPrice", currentFilters.maxPrice.toString());
    if (currentFilters.sort) params.set("sort", currentFilters.sort);
    if ((updates.page ?? currentFilters.page) > 1) params.set("page", (updates.page ?? currentFilters.page).toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, value.toString());
      }
    });

    const queryString = params.toString();
    router.push(queryString ? `/produk?${queryString}` : "/produk");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL({ search: searchInput || undefined, page: 1 });
  };

  const clearFilters = () => {
    setSearchInput("");
    updateURL({
      search: undefined,
      category: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      page: 1,
    });
  };

  const hasActiveFilters =
    currentFilters.search ||
    currentFilters.category ||
    currentFilters.minPrice ||
    currentFilters.maxPrice ||
    currentFilters.sort !== "terbaru";

  useEffect(() => {
    gtm.viewItemList({
      item_list_id: itemListId,
      item_list_name: itemListName,
      items: productsToGtmItems({
        products: productsResult.products,
        itemListId,
        itemListName,
      }),
    });
  }, [gtm, itemListId, itemListName, productsResult.products]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Produk {tenantName}</h1>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari produk..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--tenant-primary)] focus:border-transparent text-sm"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[var(--tenant-primary)] text-white rounded-md text-sm font-medium hover:opacity-90"
          >
            Cari
          </button>
        </div>
      </form>

      {/* Filter & Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Category filter */}
        <div className="relative">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:border-[var(--tenant-primary)] transition-colors"
          >
            <SlidersHorizontal size={16} />
            Filter
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showFilters && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Kategori</label>
                  <select
                    value={currentFilters.category}
                    onChange={(e) => updateURL({ category: e.target.value || undefined, page: 1 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tenant-primary)]"
                  >
                    <option value="">Semua</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Harga</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={currentFilters.minPrice || ""}
                      onChange={(e) =>
                        updateURL({
                          minPrice: e.target.value ? parseInt(e.target.value) : undefined,
                          page: 1,
                        })
                      }
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tenant-primary)]"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={currentFilters.maxPrice || ""}
                      onChange={(e) =>
                        updateURL({
                          maxPrice: e.target.value ? parseInt(e.target.value) : undefined,
                          page: 1,
                        })
                      }
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tenant-primary)]"
                    />
                  </div>
                </div>

                <button
                  onClick={clearFilters}
                  className="w-full py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Reset Filter
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="relative">
          <select
            value={currentFilters.sort}
            onChange={(e) => updateURL({ sort: e.target.value as ProductsFilters["sort"], page: 1 })}
            className="appearance-none pl-4 pr-10 py-2 border border-gray-200 rounded-lg text-sm font-medium bg-white hover:border-[var(--tenant-primary)] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--tenant-primary)]"
          >
            <option value="terbaru">Terbaru</option>
            <option value="termurah">Termurah</option>
            <option value="termahal">Termahal</option>
            <option value="terlaris">Terlaris</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-600 ml-auto">
          {productsResult.total} produk ditemukan
        </p>
      </div>

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {currentFilters.search && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
              &quot;{currentFilters.search}&quot;
              <button
                onClick={() => updateURL({ search: undefined, page: 1 })}
                className="ml-1 hover:text-gray-900"
              >
                ×
              </button>
            </span>
          )}
          {currentFilters.category && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
              {currentFilters.category}
              <button
                onClick={() => updateURL({ category: undefined, page: 1 })}
                className="ml-1 hover:text-gray-900"
              >
                ×
              </button>
            </span>
          )}
          {(currentFilters.minPrice || currentFilters.maxPrice) && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
              {currentFilters.minPrice && formatRupiah(currentFilters.minPrice)}
              {currentFilters.minPrice && currentFilters.maxPrice && " - "}
              {currentFilters.maxPrice && formatRupiah(currentFilters.maxPrice)}
              <button
                onClick={() => updateURL({ minPrice: undefined, maxPrice: undefined, page: 1 })}
                className="ml-1 hover:text-gray-900"
              >
                ×
              </button>
            </span>
          )}
          <button
            onClick={clearFilters}
            className="text-xs text-[var(--tenant-primary)] hover:underline"
          >
            Hapus semua filter
          </button>
        </div>
      )}

      {/* Products grid */}
      {productsResult.products.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 mb-2">Tidak ada produk yang ditemukan</p>
          <p className="text-sm text-gray-400">Coba ubah filter atau kata kunci pencarian</p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {productsResult.products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              itemListId={itemListId}
              itemListName={itemListName}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {productsResult.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Link
            href={{
              pathname: "/produk",
              query: {
                ...Object.fromEntries(searchParams.entries()),
                page: Math.max(1, currentFilters.page - 1).toString(),
              },
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              currentFilters.page === 1
                ? "border-gray-200 text-gray-300 cursor-not-allowed"
                : "border-gray-200 text-gray-700 hover:border-[var(--tenant-primary)] hover:text-[var(--tenant-primary)]"
            }`}
          >
            ← Prev
          </Link>

          {Array.from({ length: Math.min(5, productsResult.totalPages) }, (_, i) => {
            let pageNum;
            if (productsResult.totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentFilters.page <= 3) {
              pageNum = i + 1;
            } else if (currentFilters.page >= productsResult.totalPages - 2) {
              pageNum = productsResult.totalPages - 4 + i;
            } else {
              pageNum = currentFilters.page - 2 + i;
            }

            return (
              <Link
                key={pageNum}
                href={{
                  pathname: "/produk",
                  query: {
                    ...Object.fromEntries(searchParams.entries()),
                    page: pageNum.toString(),
                  },
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  pageNum === currentFilters.page
                    ? "border-[var(--tenant-primary)] bg-[var(--tenant-primary)] text-[var(--tenant-primary-contrast)]"
                    : "border-gray-200 text-gray-700 hover:border-[var(--tenant-primary)] hover:text-[var(--tenant-primary)]"
                }`}
              >
                {pageNum}
              </Link>
            );
          })}

          <Link
            href={{
              pathname: "/produk",
              query: {
                ...Object.fromEntries(searchParams.entries()),
                page: Math.min(productsResult.totalPages, currentFilters.page + 1).toString(),
              },
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              currentFilters.page === productsResult.totalPages
                ? "border-gray-200 text-gray-300 cursor-not-allowed"
                : "border-gray-200 text-gray-700 hover:border-[var(--tenant-primary)] hover:text-[var(--tenant-primary)]"
            }`}
          >
            Next →
          </Link>
        </div>
      )}
    </div>
  );
}
