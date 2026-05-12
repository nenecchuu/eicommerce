export type FontScale = "regular" | "large" | "xl";

export interface FontClasses {
  /** product name, body copy */
  body: string;
  /** section/card price — bold included */
  price: string;
  /** harga coret / secondary number */
  priceStrike: string;
  /** section heading (Terlaris, Baru Masuk, dll) */
  sectionHeading: string;
  /** "Lihat Semua →" links */
  viewAll: string;
  /** page-level h1 (Keranjang, Checkout, dll) */
  pageTitle: string;
  /** product detail h1 */
  productTitle: string;
  /** product detail price */
  productPrice: string;
  /** helper labels, meta text, timestamps */
  meta: string;
  /** form field labels */
  label: string;
  /** badge/tag text */
  badge: string;
  /** category pill names */
  category: string;
}

const SCALES: Record<FontScale, FontClasses> = {
  regular: {
    body: "text-sm",
    price: "text-sm font-bold",
    priceStrike: "text-xs",
    sectionHeading: "text-xl font-bold",
    viewAll: "text-sm font-semibold",
    pageTitle: "text-xl font-bold",
    productTitle: "text-2xl sm:text-3xl font-bold",
    productPrice: "text-3xl font-extrabold",
    meta: "text-xs",
    label: "text-sm font-semibold",
    badge: "text-xs",
    category: "text-xs",
  },
  large: {
    body: "text-base",
    price: "text-base font-bold",
    priceStrike: "text-sm",
    sectionHeading: "text-2xl font-bold",
    viewAll: "text-base font-semibold",
    pageTitle: "text-2xl font-bold",
    productTitle: "text-3xl sm:text-4xl font-bold",
    productPrice: "text-4xl font-extrabold",
    meta: "text-sm",
    label: "text-base font-semibold",
    badge: "text-sm",
    category: "text-sm",
  },
  xl: {
    body: "text-lg",
    price: "text-lg font-bold",
    priceStrike: "text-base",
    sectionHeading: "text-3xl font-bold",
    viewAll: "text-lg font-semibold",
    pageTitle: "text-3xl font-bold",
    productTitle: "text-4xl sm:text-5xl font-bold",
    productPrice: "text-5xl font-extrabold",
    meta: "text-base",
    label: "text-lg font-semibold",
    badge: "text-base",
    category: "text-base",
  },
};

export function getFontClasses(scale: FontScale = "regular"): FontClasses {
  return SCALES[scale];
}
