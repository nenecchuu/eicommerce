import type { Product, ProductVariant } from "@/types/schema-contract";

export function getProductPrice(
  _product: Product,
  selectedVariant?: ProductVariant | null
): { price: number; original: number | null; discount: number } {
  if (selectedVariant) {
    return { price: selectedVariant.price, original: null, discount: 0 };
  }
  // Non-variant products: price lives on the variant row with empty attr vals.
  // Callers should always pass a resolved variant; fallback to 0.
  return { price: 0, original: null, discount: 0 };
}

export function isProductInStock(
  _product: Product,
  selectedVariant?: ProductVariant | null
): boolean {
  if (selectedVariant) return selectedVariant.available_qty > 0;
  return false;
}

export function getProductPriceRange(
  product: Product,
  variants: ProductVariant[]
): { min: number; max: number } | null {
  if (!variants || variants.length === 0) return null;
  const prices = variants.map((v) => v.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}
