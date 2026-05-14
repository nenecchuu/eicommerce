import dynamic from "next/dynamic";
import type { HomepageConfig, Section } from "@/lib/types/homepage";
import type { ProductWithVariants } from "@/types/schema-contract";
import { SECTION_TYPES } from "@/components/sections/index";

// Hero is above-the-fold — load eagerly
import HeroBannerSection from "@/components/sections/hero-banner";

// Everything below the fold — lazy load to reduce initial JS bundle
const WideBannerSection = dynamic(() => import("@/components/sections/wide-banner"));
const PromoBannerSection = dynamic(() => import("@/components/sections/promo-banner"));
const TrustBadgesSection = dynamic(() => import("@/components/sections/trust-badges"));
const CategoryListSection = dynamic(() => import("@/components/sections/category-list"));
const TestimonialSection = dynamic(() => import("@/components/sections/testimonial"));
const ProductListSection = dynamic(() => import("@/components/sections/product-list"));

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
    case "wide_banner":
      return <WideBannerSection props={section.props} />;
    case "promo_banner":
      return <PromoBannerSection props={section.props} />;
    case "trust_badges":
      return <TrustBadgesSection props={section.props} />;
    case "category_list":
      return <CategoryListSection props={section.props} />;
    case "testimonial":
      return <TestimonialSection props={section.props} />;
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
