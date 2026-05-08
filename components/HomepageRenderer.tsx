import type { HomepageConfig, Section } from "@/lib/types/homepage";
import type { ProductWithVariants } from "@/types/schema-contract";
import { SECTION_TYPES } from "@/components/sections/index";

import HeroBannerSection from "@/components/sections/hero-banner";
import PromoBannerSection from "@/components/sections/promo-banner";
import TrustBadgesSection from "@/components/sections/trust-badges";
import CategoryListSection from "@/components/sections/category-list";
import TestimonialSection from "@/components/sections/testimonial";
import StickyTopMessageSection from "@/components/sections/sticky-top-message";
import ProductListSection from "@/components/sections/product-list";

interface Props {
  config: HomepageConfig;
  tenantId: string;
  allProducts: ProductWithVariants[];
}

function renderSection(section: Section, tenantId: string, allProducts: ProductWithVariants[]) {
  if (!section.visible) return null;
  if (section.type === "sticky_top_message") return null;

  switch (section.type) {
    case "hero_banner":
      return <HeroBannerSection props={section.props} />;
    case "promo_banner":
      return <PromoBannerSection props={section.props} />;
    case "trust_badges":
      return <TrustBadgesSection props={section.props} />;
    case "category_list":
      return <CategoryListSection props={section.props} />;
    case "testimonial":
      return <TestimonialSection props={section.props} />;
    case "sticky_top_message":
      return <StickyTopMessageSection props={section.props} />;
    case "product_list":
      return (
        <ProductListSection
          props={section.props}
          tenantId={tenantId}
          allProducts={allProducts}
        />
      );
    default: {
      // unknown type: skip and warn (don't crash)
      const unknownType = (section as { type: string }).type;
      if (!SECTION_TYPES.has(unknownType as never)) {
        console.warn(`[HomepageRenderer] Unknown section type: "${unknownType}" — skipping`);
      }
      return null;
    }
  }
}

export default function HomepageRenderer({ config, tenantId, allProducts }: Props) {
  return (
    <>
      {config.sections.map((section) => (
        <div key={section.id}>{renderSection(section, tenantId, allProducts)}</div>
      ))}
    </>
  );
}
