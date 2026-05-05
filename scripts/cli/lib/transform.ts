import { generateSlug } from "./slugify.js";
import type { ShopeeProduct, ShopeeModel, ShopeeTierVariation } from "./shopee-schema.js";

export interface ProductRow {
  tenant_id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string | null;
  images: Array<{ url: string; alt: string }>;
  attr1_name: string;
  attr2_name: string;
  attr3_name: string;
  has_variant: boolean;
  is_active: boolean;
  display_order: number;
  source_url: string;
  source_data: unknown;
  rating: number;
  rating_count: number;
  sold_display: string;
  base_price: number;
}

export interface VariantRow {
  tenant_id: string;
  attr1_val: string;
  attr2_val: string;
  attr3_val: string;
  price: number;
  available_qty: number;
  is_active: boolean;
}

function resolveVariantName(
  model: ShopeeModel,
  tierVariations: ShopeeTierVariation[]
): { attr1: string; attr2: string; attr3: string } {
  if (model.name && model.name.trim()) {
    const parts = model.name.split(",").map((p) => p.trim());
    return {
      attr1: parts[0] ?? "",
      attr2: parts[1] ?? "",
      attr3: parts[2] ?? "",
    };
  }

  // derive from tier_index + tier_variations options
  const idx = model.tier_index ?? [];
  const get = (tier: number) => {
    const variation = tierVariations[tier];
    const optionIdx = idx[tier];
    if (!variation || optionIdx === undefined) return "";
    return variation.options[optionIdx] ?? "";
  };

  return {
    attr1: get(0),
    attr2: get(1),
    attr3: get(2),
  };
}

export function transformProduct(
  product: ShopeeProduct,
  tenantId: string,
  slug: string,
  displayOrder: number
): ProductRow {
  const tierVariations = product.tier_variations ?? [];
  const hasVariant = tierVariations.length > 0 && (product.models?.length ?? 0) > 1;

  return {
    tenant_id: tenantId,
    slug,
    name: product.name,
    description: product.description || null,
    category: null,
    images: (product.images ?? []).map((url, i) => ({
      url,
      alt: `${product.name} - gambar ${i + 1}`,
    })),
    attr1_name: tierVariations[0]?.name ?? "",
    attr2_name: tierVariations[1]?.name ?? "",
    attr3_name: tierVariations[2]?.name ?? "",
    has_variant: hasVariant,
    is_active: true,
    display_order: displayOrder,
    source_url: product.product_url,
    source_data: product,
    rating: product.rating ?? 0,
    rating_count: product.rating_count ?? 0,
    sold_display: product.sold_display ?? "",
    base_price: product.price,
  };
}

export function transformVariants(
  product: ShopeeProduct,
  tenantId: string
): VariantRow[] {
  if (!product.models || product.models.length === 0) {
    return [
      {
        tenant_id: tenantId,
        attr1_val: "",
        attr2_val: "",
        attr3_val: "",
        price: product.price,
        available_qty: 0,
        is_active: true,
      },
    ];
  }

  return product.models.map((model) => {
    const { attr1, attr2, attr3 } = resolveVariantName(model, product.tier_variations ?? []);
    return {
      tenant_id: tenantId,
      attr1_val: attr1,
      attr2_val: attr2,
      attr3_val: attr3,
      price: model.price,
      available_qty: model.stock ?? 0,
      is_active: model.has_stock !== false,
    };
  });
}
