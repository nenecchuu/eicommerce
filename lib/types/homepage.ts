export interface ProductListProps {
  title: string;
  layout: "card" | "full_image";
  source: "category" | "bestseller" | "flash_sale" | "custom_selection";
  source_param?: string;        // category slug / id, etc.
  custom_product_ids?: string[];
  item_limit: number;
  show_view_all: boolean;
}

export interface HeroBannerProps {
  image_url: string;
  image_url_mobile?: string;
  title?: string;
  subtitle?: string;
  cta_label?: string;
  cta_url?: string;
}

export interface PromoBannerItem {
  image_url: string;
  link_url?: string;
}

export interface PromoBannerProps {
  banners: [PromoBannerItem] | [PromoBannerItem, PromoBannerItem] | [PromoBannerItem, PromoBannerItem, PromoBannerItem];
}

export interface TrustBadge {
  key: "secure_transaction" | "free_shipping" | "money_back" | "happy_buyers" | string;
  label: string;
  active: boolean;
}

export interface TrustBadgesProps {
  badges: TrustBadge[];
}

export interface CategoryItem {
  name: string;
  slug: string;
  image_url?: string;
}

export interface CategoryListProps {
  title?: string;
  categories: CategoryItem[];
}

export interface TestimonialItem {
  text: string;
  author: string;
  avatar_url?: string;
  rating?: number; // 1–5
}

export interface TestimonialProps {
  title?: string;
  layout: "carousel" | "grid";
  items: TestimonialItem[];
}

export interface StickyTopMessageProps {
  text: string;
  link_url?: string;
  link_label?: string;
  dismissible: boolean;
}

// Base shape setiap section di array sections[]
interface SectionBase {
  id: string;        // unik per section instance, bukan per type
  visible: boolean;
}

export type Section =
  | (SectionBase & { type: "product_list";      props: ProductListProps })
  | (SectionBase & { type: "hero_banner";        props: HeroBannerProps })
  | (SectionBase & { type: "promo_banner";       props: PromoBannerProps })
  | (SectionBase & { type: "trust_badges";       props: TrustBadgesProps })
  | (SectionBase & { type: "category_list";      props: CategoryListProps })
  | (SectionBase & { type: "testimonial";        props: TestimonialProps })
  | (SectionBase & { type: "sticky_top_message"; props: StickyTopMessageProps });

export type SectionType = Section["type"];

export interface HomepageConfig {
  tenant_id: string;
  version: number;
  sections: Section[];
  updated_at: string;
}
