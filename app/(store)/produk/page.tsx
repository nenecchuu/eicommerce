import { notFound } from "next/navigation";
import { getTenantByDomain } from "@/lib/queries/getTenant";
import { getFilteredProducts, getProductCategories, type ProductsFilters } from "@/lib/queries/getProducts";
import { requireTenantDomain } from "@/lib/utils/tenant";
import ProductListingClient from "./ProductListingClient";

interface Props {
  searchParams: Promise<{ q?: string; category?: string; minPrice?: string; maxPrice?: string; sort?: string; page?: string }>;
}

export async function generateMetadata() {
  return {
    title: "Produk",
    description: "Daftar produk kami",
  };
}

export default async function ProductsPage({ searchParams }: Props) {
  const domain = await requireTenantDomain();
  const tenantData = await getTenantByDomain(domain);

  if (!tenantData) notFound();

  const params = await searchParams;

  const filters: ProductsFilters = {
    search: params.q,
    category: params.category,
    minPrice: params.minPrice ? parseInt(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? parseInt(params.maxPrice) : undefined,
    sort: params.sort as ProductsFilters["sort"] || "terbaru",
    page: params.page ? parseInt(params.page) : 1,
    perPage: 12,
  };

  const [productsResult, categories] = await Promise.all([
    getFilteredProducts(tenantData.id, filters),
    getProductCategories(tenantData.id),
  ]);

  return (
    <ProductListingClient
      tenantId={tenantData.id}
      tenantName={tenantData.name}
      productsResult={productsResult}
      categories={categories}
      initialFilters={filters}
    />
  );
}
