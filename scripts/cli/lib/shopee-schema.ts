import { z } from "zod";

const AttributeSchema = z.object({
  name: z.string(),
  value: z.string(),
});

const TierVariationSchema = z.object({
  name: z.string().nullish(),
  options: z.array(z.string()),
  option_images: z.array(z.string().nullable()).optional().default([]),
});

const ModelSchema = z.object({
  name: z.string().nullish(),
  price: z.number(),
  price_original: z.number().nullable().optional(),
  discount_percent: z.any().optional(),
  stock: z.any().optional(),
  sold: z.number().optional().default(0),
  tier_index: z.array(z.number()).optional().default([]),
  model_id: z.number().optional(),
  sku: z.any().optional(),
  has_stock: z.boolean().optional().default(true),
});

export const ShopeeProductSchema = z.object({
  name: z.string(),
  price: z.number(),
  price_original: z.any().optional(),
  discount_percent: z.any().optional(),
  images: z.array(z.string()).default([]),
  rating: z.number().optional().default(0),
  rating_count: z.number().optional().default(0),
  sold_count: z.any().optional(),
  sold_display: z.string().optional().default(""),
  location: z.string().optional().default(""),
  description: z.string().optional().default(""),
  attributes: z.array(AttributeSchema).nullable().optional().default([]),
  tier_variations: z.array(TierVariationSchema).nullable().default([]),
  models: z.array(ModelSchema).nullable().default([]),
  product_url: z.string().url(),
});

export const ShopeeExportSchema = z.object({
  source: z.string().optional(),
  scraper_version: z.string().optional(),
  scraped_at: z.string().optional(),
  source_url: z.string().optional(),
  product_count: z.number().optional(),
  products: z.array(ShopeeProductSchema),
});

export type ShopeeProduct = z.infer<typeof ShopeeProductSchema>;
export type ShopeeExport = z.infer<typeof ShopeeExportSchema>;
export type ShopeeAttribute = z.infer<typeof AttributeSchema>;
export type ShopeeTierVariation = z.infer<typeof TierVariationSchema>;
export type ShopeeModel = z.infer<typeof ModelSchema>;
