import { unstable_cache } from "next/cache";
import { createStaticClient } from "@/lib/supabase/static";
import type { ProductWithVariants } from "@/types/schema-contract";

async function fetchProducts(tenantId: string): Promise<ProductWithVariants[]> {
  const supabase = createStaticClient();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (!products) return [];

  const { data: variants } = await supabase
    .from("product_variants")
    .select("*")
    .in("product_id", products.map((p) => p.id));

  return products.map((p) => ({
    ...p,
    variants: (variants ?? []).filter((v) => v.product_id === p.id),
  }));
}

const getCachedProducts = unstable_cache(
  fetchProducts,
  ["products-all"],
  { revalidate: 300, tags: ["products"] }
);

export async function getProducts(tenantId: string): Promise<ProductWithVariants[]> {
  return getCachedProducts(tenantId);
}

async function fetchProduct(tenantId: string, slug: string): Promise<ProductWithVariants | null> {
  const supabase = createStaticClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!product) return null;

  const { data: variants } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", product.id);

  return { ...product, variants: variants ?? [] };
}

const getCachedProduct = unstable_cache(
  fetchProduct,
  ["product"],
  { revalidate: 300, tags: ["products"] }
);

export async function getProduct(tenantId: string, slug: string): Promise<ProductWithVariants | null> {
  return getCachedProduct(tenantId, slug);
}

export interface ProductsFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "terbaru" | "termurah" | "termahal" | "terlaris";
  page?: number;
  perPage?: number;
}

export interface ProductsResult {
  products: ProductWithVariants[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

async function fetchFilteredProducts(
  tenantId: string,
  filters: ProductsFilters = {}
): Promise<ProductsResult> {
  const supabase = createStaticClient();

  let query = supabase
    .from("products")
    .select("*", { count: "exact" })
    .eq("tenant_id", tenantId)
    .eq("is_active", true);

  if (filters.search) {
    query = query.ilike("name", `%${filters.search}%`);
  }

  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? 12;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data: products, count } = await query.range(from, to);

  if (!products) {
    return { products: [], total: 0, page, perPage, totalPages: 0 };
  }

  const productIds = products.map((p) => p.id);

  const { data: variants } = await supabase
    .from("product_variants")
    .select("*")
    .in("product_id", productIds);

  let results = products.map((p) => ({
    ...p,
    variants: (variants ?? []).filter((v) => v.product_id === p.id),
  }));

  if (filters.minPrice || filters.maxPrice) {
    results = results.filter((p) => {
      const prices = p.variants.map((v: { price: number }) => v.price);
      if (prices.length === 0) return true;
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      if (filters.minPrice && max < filters.minPrice) return false;
      if (filters.maxPrice && min > filters.maxPrice) return false;
      return true;
    });
  }

  if (filters.sort && filters.sort !== "terlaris") {
    results.sort((a, b) => {
      const pricesA = a.variants.map((v: { price: number }) => v.price);
      const pricesB = b.variants.map((v: { price: number }) => v.price);

      switch (filters.sort) {
        case "terbaru":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "termurah":
          return Math.min(...pricesA) - Math.min(...pricesB);
        case "termahal":
          return Math.max(...pricesB) - Math.max(...pricesA);
        default:
          return 0;
      }
    });
  }

  const total = count ?? 0;
  const totalPages = Math.ceil(total / perPage);

  return { products: results, total, page, perPage, totalPages };
}

const getCachedFilteredProducts = unstable_cache(
  fetchFilteredProducts,
  ["products-filtered"],
  { revalidate: 300, tags: ["products"] }
);

export async function getFilteredProducts(
  tenantId: string,
  filters: ProductsFilters = {}
): Promise<ProductsResult> {
  return getCachedFilteredProducts(tenantId, filters);
}

async function fetchProductCategories(tenantId: string): Promise<string[]> {
  const supabase = createStaticClient();

  const { data } = await supabase
    .from("products")
    .select("category")
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .not("category", "is", null);

  const categories = new Set(data?.map((p) => p.category).filter(Boolean) ?? []);
  return Array.from(categories).sort();
}

const getCachedProductCategories = unstable_cache(
  fetchProductCategories,
  ["product-categories"],
  { revalidate: 300, tags: ["products"] }
);

export async function getProductCategories(tenantId: string): Promise<string[]> {
  return getCachedProductCategories(tenantId);
}
