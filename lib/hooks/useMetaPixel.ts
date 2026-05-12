"use client";

export interface PixelViewContentParams {
  content_name: string;
  content_ids: string[];
  content_type: "product";
  value: number;
  currency: string;
}

export interface PixelAddToCartParams {
  content_name: string;
  content_ids: string[];
  content_type: "product";
  value: number;
  currency: string;
  num_items?: number;
}

export interface PixelInitiateCheckoutParams {
  content_ids: string[];
  num_items: number;
  value: number;
  currency: string;
}

export interface PixelPurchaseParams {
  content_ids: string[];
  num_items: number;
  value: number;
  currency: string;
}

type PixelEventMap = {
  ViewContent: PixelViewContentParams;
  AddToCart: PixelAddToCartParams;
  InitiateCheckout: PixelInitiateCheckoutParams;
  Purchase: PixelPurchaseParams;
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
