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
