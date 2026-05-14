"use client";

type MetaPixelParams = Record<string, unknown>;
type MetaPixelCommand = "track" | "trackCustom";
type MetaPixelQueueItem = [
  command: MetaPixelCommand,
  event: string,
  params?: MetaPixelParams,
];

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    _fbq: unknown;
    __metaPixelQueue?: MetaPixelQueueItem[];
  }
}

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

function hasFbq() {
  return typeof window !== "undefined" && typeof window.fbq === "function";
}

export function flushMetaPixelQueue() {
  if (!hasFbq()) return;

  const queue = window.__metaPixelQueue;
  if (!queue?.length) return;

  window.__metaPixelQueue = [];
  queue.forEach(([command, event, params]) => {
    window.fbq(command, event, params);
  });
}

function sendMetaPixel(
  command: MetaPixelCommand,
  event: string,
  params?: MetaPixelParams
) {
  if (typeof window === "undefined") return;

  if (hasFbq()) {
    window.fbq(command, event, params);
    return;
  }

  window.__metaPixelQueue = window.__metaPixelQueue ?? [];
  window.__metaPixelQueue.push([command, event, params]);
}

export function trackMetaPixel(event: string, params?: MetaPixelParams) {
  sendMetaPixel("track", event, params);
}

export function trackCustomMetaPixel(event: string, params?: MetaPixelParams) {
  sendMetaPixel("trackCustom", event, params);
}

function fire<E extends PixelEventName>(event: E, params: PixelEventMap[E]) {
  trackMetaPixel(event, params as unknown as MetaPixelParams);
}

const metaPixel = {
  track: fire,
  trackCustom: trackCustomMetaPixel,
};

export function useMetaPixel() {
  return metaPixel;
}
