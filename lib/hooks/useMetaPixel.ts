"use client";

export interface PixelContentItem {
  id: string;
  quantity: number;
  item_price: number;
}

export interface PixelViewContentParams {
  content_name: string;
  content_category?: string;
  content_ids: string[];
  content_type: "product";
  contents: PixelContentItem[];
  value: number;
  currency: string;
}

export interface PixelAddToCartParams {
  content_name: string;
  content_category?: string;
  content_ids: string[];
  content_type: "product";
  contents: PixelContentItem[];
  value: number;
  currency: string;
  num_items?: number;
}

export interface PixelInitiateCheckoutParams {
  content_ids: string[];
  contents: PixelContentItem[];
  num_items: number;
  value: number;
  currency: string;
}

export interface PixelAddPaymentInfoParams {
  content_ids: string[];
  contents: PixelContentItem[];
  num_items: number;
  value: number;
  currency: string;
  payment_method?: string;
}

export interface PixelSearchParams {
  search_string: string;
}

type PixelEventMap = {
  ViewContent: PixelViewContentParams;
  Search: PixelSearchParams;
  AddToCart: PixelAddToCartParams;
  InitiateCheckout: PixelInitiateCheckoutParams;
  AddPaymentInfo: PixelAddPaymentInfoParams;
};

export type PixelEventName = keyof PixelEventMap;

function fire<E extends PixelEventName>(event: E, params: PixelEventMap[E]) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  window.fbq("track", event, params);
}

export function useMetaPixel() {
  return {
    track: fire,
  };
}
