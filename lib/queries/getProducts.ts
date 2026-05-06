import type { ProductWithVariants } from "@/types/schema-contract";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export async function getProducts(tenantId: string): Promise<ProductWithVariants[]> {
  if (USE_MOCK) {
    const { mockProducts, mockVariants } = await import("@/lib/mock/sample-tenant");
    return mockProducts
      .filter((p) => p.is_active)
      .sort((a, b) => a.display_order - b.display_order)
      .map((p) => ({
        ...p,
        variants: mockVariants.filter((v) => v.product_id === p.id),
      }));
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

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
    .in(
      "product_id",
      products.map((p) => p.id)
    );

  return products.map((p) => ({
    ...p,
    variants: (variants ?? []).filter((v) => v.product_id === p.id),
  }));
}

export async function getProduct(
  tenantId: string,
  slug: string
): Promise<ProductWithVariants | null> {
  if (USE_MOCK) {
    const { mockProducts, mockVariants } = await import("@/lib/mock/sample-tenant");
    const product = mockProducts.find(
      (p) => p.slug === slug && p.tenant_id === tenantId && p.is_active
    );
    if (!product) return null;
    return {
      ...product,
      variants: mockVariants.filter((v) => v.product_id === product.id),
    };
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

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

export async function getFilteredProducts(
  tenantId: string,
  filters: ProductsFilters = {}
): Promise<ProductsResult> {
  if (USE_MOCK) {
    const { mockProducts, mockVariants } = await import("@/lib/mock/sample-tenant");
    let filtered = mockProducts.filter((p) => p.is_active);

    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(q));
    }

    if (filters.category) {
      filtered = filtered.filter((p) => p.category === filters.category);
    }

    const withVariants = filtered.map((p) => ({
      ...p,
      variants: mockVariants.filter((v) => v.product_id === p.id),
    }));

    if (filters.minPrice || filters.maxPrice) {
      withVariants.filter((p) => {
        const prices = p.variants.map((v) => v.price);
        if (prices.length === 0) return true;
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        if (filters.minPrice && max < filters.minPrice) return false;
        if (filters.maxPrice && min > filters.maxPrice) return false;
        return true;
      });
    }

    switch (filters.sort) {
      case "terbaru":
        withVariants.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "termurah":
        withVariants.sort((a, b) => {
          const minA = Math.min(...a.variants.map((v) => v.price));
          const minB = Math.min(...b.variants.map((v) => v.price));
          return minA - minB;
        });
        break;
      case "termahal":
        withVariants.sort((a, b) => {
          const maxA = Math.max(...a.variants.map((v) => v.price));
          const maxB = Math.max(...b.variants.map((v) => v.price));
          return maxB - maxA;
        });
        break;
      case "terlaris":
        break;
    }

    const page = filters.page ?? 1;
    const perPage = filters.perPage ?? 12;
    const total = withVariants.length;
    const totalPages = Math.ceil(total / perPage);
    const paginated = withVariants.slice((page - 1) * perPage, page * perPage);

    return { products: paginated, total, page, perPage, totalPages };
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

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
      const prices = p.variants.map((v) => v.price);
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
      const pricesA = a.variants.map((v) => v.price);
      const pricesB = b.variants.map((v) => v.price);

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

export async function getProductCategories(tenantId: string): Promise<string[]> {
  if (USE_MOCK) {
    const { mockProducts } = await import("@/lib/mock/sample-tenant");
    const categories = new Set(
      mockProducts.filter((p) => p.is_active && p.category).map((p) => p.category!)
    );
    return Array.from(categories).sort();
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { data } = await supabase
    .from("products")
    .select("category")
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .not("category", "is", null);

  const categories = new Set(data?.map((p) => p.category).filter(Boolean) ?? []);
  return Array.from(categories).sort();
}
