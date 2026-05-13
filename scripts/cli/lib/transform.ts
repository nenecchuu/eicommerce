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
  shopee_url: string;
  is_active: boolean;
  display_order: number;
}

export interface VariantRow {
  tenant_id: string;
  attr1_val: string;
  attr2_val: string;
  attr3_val: string;
  price: number;
  available_qty: number;
  is_active: boolean;
  images: string[];
}

function normalizeVariantText(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function isDefaultOnlyVariation(product: ShopeeProduct): boolean {
  const tierVariations = product.tier_variations ?? [];
  const models = product.models ?? [];

  if (tierVariations.length !== 1 || models.length > 1) return false;

  const variation = tierVariations[0];
  const model = models[0];
  const variationName = normalizeVariantText(variation.name);
  const options = variation.options.map(normalizeVariantText).filter(Boolean);
  const modelName = normalizeVariantText(model?.name);

  return (
    variationName === "default" &&
    options.length === 1 &&
    options[0] === "default" &&
    (!model || modelName === "" || modelName === "default")
  );
}

function resolveVariantName(
  model: ShopeeModel,
  tierVariations: ShopeeTierVariation[]
): { attr1: string; attr2: string; attr3: string; images: string[] } {
  // 1. Get attribute values first
  let attrValues: [string, string, string] = ["", "", ""];

  if (model.name && model.name.trim()) {
    const parts = model.name.split(",").map((p) => p.trim());
    attrValues = [parts[0] ?? "", parts[1] ?? "", parts[2] ?? ""];
  } else {
    const idx = model.tier_index ?? [];
    attrValues[0] = tierVariations[0]?.options[idx[0]] ?? "";
    attrValues[1] = tierVariations[1]?.options[idx[1]] ?? "";
    attrValues[2] = tierVariations[2]?.options[idx[2]] ?? "";
  }

  // 2. Find images by searching attr_value in options, then get from option_images
  const images: string[] = [];
  for (let i = 0; i < tierVariations.length; i++) {
    const val = attrValues[i];
    const variation = tierVariations[i];

    if (!variation || !val || !variation.options) continue;

    const optionIndex = variation.options.indexOf(val);

    if (optionIndex !== -1 && variation.option_images && variation.option_images[optionIndex]) {
      images.push(variation.option_images[optionIndex]);
    }
  }

  return {
    attr1: attrValues[0],
    attr2: attrValues[1],
    attr3: attrValues[2],
    images: images,
  };
}

export function transformProduct(
  product: ShopeeProduct,
  tenantId: string,
  slug: string,
  displayOrder: number
): ProductRow {
  const tierVariations = product.tier_variations ?? [];
  const effectiveTierVariations = isDefaultOnlyVariation(product) ? [] : tierVariations;
  const hasVariant = effectiveTierVariations.length > 0 && (product.models?.length ?? 0) > 1;

  return {
    tenant_id: tenantId,
    slug,
    name: product.name,
    description: product.description || '',
    category: '',
    images: (product.images ?? []).map((url, i) => ({
      url,
      alt: `${product.name} - gambar ${i + 1}`,
    })),
    attr1_name: effectiveTierVariations[0]?.name ?? "",
    attr2_name: effectiveTierVariations[1]?.name ?? "",
    attr3_name: effectiveTierVariations[2]?.name ?? "",
    has_variant: hasVariant,
    shopee_url: product.product_url,
    is_active: true,
    display_order: displayOrder,
  };
}

export function transformVariants(
  product: ShopeeProduct,
  tenantId: string,
  ignoreStock = false
): VariantRow[] {
  const stock = ignoreStock ? 1000 : 0;
  const defaultOnlyModel = isDefaultOnlyVariation(product)
    ? product.models?.[0]
    : undefined;

  if (!product.models || product.models.length === 0 || defaultOnlyModel) {
    return [
      {
        tenant_id: tenantId,
        attr1_val: "",
        attr2_val: "",
        attr3_val: "",
        price: defaultOnlyModel?.price ?? product.price,
        available_qty: ignoreStock ? 1000 : (defaultOnlyModel?.stock ?? stock),
        is_active: defaultOnlyModel?.has_stock !== false,
        images: product.images ?? [],
      },
    ];
  }

  return product.models.map((model) => {
    const { attr1, attr2, attr3, images } = resolveVariantName(model, product.tier_variations ?? []);
    return {
      tenant_id: tenantId,
      attr1_val: attr1,
      attr2_val: attr2,
      attr3_val: attr3,
      price: model.price,
      available_qty: ignoreStock ? 1000 : (model.stock ?? 0),
      is_active: model.has_stock !== false,
      images: images.length > 0 ? images : (product.images ?? []),
    };
  });
}
