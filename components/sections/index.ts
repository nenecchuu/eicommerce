import type { SectionType } from "@/lib/types/homepage";

// Registry: section type → component file path (lazy-loaded in HomepageRenderer)
// Kept as string keys so the renderer can check membership without importing all components.
export const SECTION_TYPES = new Set<SectionType>([
  "product_list",
  "hero_banner",
  "wide_banner",
  "promo_banner",
  "trust_badges",
  "category_list",
  "testimonial",
  "sticky_top_message",
]);
