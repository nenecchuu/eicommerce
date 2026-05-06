"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import ProductCard from "@/components/product/ProductCard";
import type { ProductsResult } from "@/lib/queries/getProducts";

interface Props {
  tenantId: string;
  tenantName: string;
  categoryName: string;
  productsResult: ProductsResult;
  categories: string[];
}

export default function CategoryPageClient({
  tenantName,
  categoryName,
  productsResult,
  categories,
}: Props) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{categoryName}</h1>
      <p className="text-sm text-gray-600 mb-6">
        {productsResult.total} produk di kategori ini
      </p>

      {/* Quick category navigation */}
      <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-gray-200">
        <Link
          href="/produk"
          prefetch={true}
          className="px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 text-gray-600 hover:border-[var(--tenant-primary)] hover:text-[var(--tenant-primary)] active:scale-95 transition-all"
        >
          Semua Produk
        </Link>
        {categories
          .filter((cat) => cat.toLowerCase() !== categoryName.toLowerCase())
          .slice(0, 6)
          .map((cat) => (
            <Link
              key={cat}
              href={`/kategori/${cat.toLowerCase().replace(/\s+/g, "-")}`}
              className="px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 text-gray-600 hover:border-[var(--tenant-primary)] hover:text-[var(--tenant-primary)] transition-colors"
            >
              {cat}
            </Link>
          ))}
      </div>

      {/* Sort dropdown */}
      <div className="flex justify-end mb-4">
        <Link
          href="/produk"
          prefetch={true}
          className="text-sm text-[var(--tenant-primary)] hover:opacity-70 hover:underline active:scale-95 transition-all"
        >
          ← Kembali ke semua produk
        </Link>
      </div>

      {/* Products grid */}
      {productsResult.products.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 mb-2">Tidak ada produk di kategori ini</p>
          <p className="text-sm text-gray-400">Coba kategori lain</p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {productsResult.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {productsResult.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Link
            href={{
              pathname: `/kategori/${categoryName.toLowerCase().replace(/\s+/g, "-")}`,
              query: {
                page: Math.max(1, productsResult.page - 1).toString(),
              },
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              productsResult.page === 1
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
            } else if (productsResult.page <= 3) {
              pageNum = i + 1;
            } else if (productsResult.page >= productsResult.totalPages - 2) {
              pageNum = productsResult.totalPages - 4 + i;
            } else {
              pageNum = productsResult.page - 2 + i;
            }

            return (
              <Link
                key={pageNum}
                href={{
                  pathname: `/kategori/${categoryName.toLowerCase().replace(/\s+/g, "-")}`,
                  query: {
                    page: pageNum.toString(),
                  },
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  pageNum === productsResult.page
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
              pathname: `/kategori/${categoryName.toLowerCase().replace(/\s+/g, "-")}`,
              query: {
                page: Math.min(productsResult.totalPages, productsResult.page + 1).toString(),
              },
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              productsResult.page === productsResult.totalPages
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
