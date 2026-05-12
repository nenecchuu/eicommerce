"use client";

import { useMemo } from "react";
import type { CartItem, ProductVariant, ProductWithVariants } from "@/types/schema-contract";
import { getProductPrice, getProductPriceRange } from "@/lib/utils/product";

const CURRENCY = "IDR";

type DataLayerValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | DataLayerValue[]
  | { [key: string]: DataLayerValue };

type DataLayerEvent = {
  event?: string;
  ecommerce?: EcommercePayload | null;
  [key: string]: DataLayerValue | EcommercePayload | null | undefined;
};

export interface GtmItem {
  item_id: string;
  item_name: string;
  item_category?: string;
  item_variant?: string;
  item_list_id?: string;
  item_list_name?: string;
  index?: number;
  price?: number;
  quantity?: number;
  google_business_vertical: "retail";
}

interface EcommercePayload {
  currency?: string;
  value?: number;
  items?: GtmItem[];
  item_list_id?: string;
  item_list_name?: string;
  shipping?: number;
  shipping_tier?: string;
  payment_type?: string;
}

type EcommerceEventName =
  | "view_item_list"
  | "select_item"
  | "view_item"
  | "add_to_cart"
  | "remove_from_cart"
  | "view_cart"
  | "begin_checkout"
  | "add_shipping_info"
  | "add_payment_info";

declare global {
  interface Window {
    dataLayer?: DataLayerEvent[];
  }
}

function cleanObject<T extends Record<string, unknown>>(value: T): T {
  Object.keys(value).forEach((key) => {
    if (value[key] === undefined || value[key] === "") {
      delete value[key];
    }
  });
  return value;
}

function pushDataLayer(event: DataLayerEvent) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(event);
}

function pushEcommerceEvent(event: EcommerceEventName, ecommerce: EcommercePayload) {
  pushDataLayer({ ecommerce: null });
  pushDataLayer({ event, ecommerce });
}

export function productToGtmItem({
  product,
  variant,
  quantity = 1,
  index,
  itemListId,
  itemListName,
}: {
  product: ProductWithVariants;
  variant?: ProductVariant | null;
  quantity?: number;
  index?: number;
  itemListId?: string;
  itemListName?: string;
}): GtmItem {
  const { price } = getProductPrice(product, variant ?? null);
  const variantLabel = [variant?.attr1_val, variant?.attr2_val, variant?.attr3_val]
    .filter(Boolean)
    .join(" / ");

  return cleanObject({
    item_id: variant?.id ?? product.id,
    item_name: product.name,
    item_category: product.category ?? undefined,
    item_variant: variantLabel || undefined,
    item_list_id: itemListId,
    item_list_name: itemListName,
    index,
    price,
    quantity,
    google_business_vertical: "retail" as const,
  });
}

export function cartItemToGtmItem(
  item: CartItem,
  index?: number,
  itemListId?: string,
  itemListName?: string
): GtmItem {
  return cleanObject({
    item_id: item.variant_id ?? item.product_id,
    item_name: item.product_name,
    item_variant: item.variant_label ?? undefined,
    item_list_id: itemListId,
    item_list_name: itemListName,
    index,
    price: item.price,
    quantity: item.quantity,
    google_business_vertical: "retail" as const,
  });
}

export function productsToGtmItems({
  products,
  itemListId,
  itemListName,
}: {
  products: ProductWithVariants[];
  itemListId: string;
  itemListName: string;
}) {
  return products.map((product, index) => {
    const priceRange = getProductPriceRange(product, product.variants);
    const item = productToGtmItem({
      product,
      index,
      itemListId,
      itemListName,
    });
    if (priceRange) item.price = priceRange.min;
    return item;
  });
}

function cartValue(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function useGoogleTagManager() {
  return useMemo(() => ({
    pageView(params: {
      page_path: string;
      page_location: string;
      page_title: string;
    }) {
      pushDataLayer({
        event: "page_view",
        ...cleanObject(params),
      });
    },
    viewItemList(params: {
      items: GtmItem[];
      item_list_id: string;
      item_list_name: string;
    }) {
      if (params.items.length === 0) return;
      pushEcommerceEvent("view_item_list", {
        item_list_id: params.item_list_id,
        item_list_name: params.item_list_name,
        items: params.items,
      });
    },
    selectItem(item: GtmItem) {
      pushEcommerceEvent("select_item", {
        item_list_id: item.item_list_id,
        item_list_name: item.item_list_name,
        items: [item],
      });
    },
    viewItem(item: GtmItem) {
      pushEcommerceEvent("view_item", {
        currency: CURRENCY,
        value: (item.price ?? 0) * (item.quantity ?? 1),
        items: [item],
      });
    },
    addToCart(item: GtmItem) {
      pushEcommerceEvent("add_to_cart", {
        currency: CURRENCY,
        value: (item.price ?? 0) * (item.quantity ?? 1),
        items: [item],
      });
    },
    removeFromCart(item: GtmItem) {
      pushEcommerceEvent("remove_from_cart", {
        currency: CURRENCY,
        value: (item.price ?? 0) * (item.quantity ?? 1),
        items: [item],
      });
    },
    viewCart(items: CartItem[]) {
      if (items.length === 0) return;
      pushEcommerceEvent("view_cart", {
        currency: CURRENCY,
        value: cartValue(items),
        items: items.map((item, index) => cartItemToGtmItem(item, index)),
      });
    },
    beginCheckout(items: CartItem[]) {
      if (items.length === 0) return;
      pushEcommerceEvent("begin_checkout", {
        currency: CURRENCY,
        value: cartValue(items),
        items: items.map((item, index) => cartItemToGtmItem(item, index)),
      });
    },
    addShippingInfo(items: CartItem[], shippingTier: string) {
      if (items.length === 0) return;
      pushEcommerceEvent("add_shipping_info", {
        currency: CURRENCY,
        value: cartValue(items),
        shipping_tier: shippingTier,
        items: items.map((item, index) => cartItemToGtmItem(item, index)),
      });
    },
    addPaymentInfo(items: CartItem[], paymentType: string) {
      if (items.length === 0) return;
      pushEcommerceEvent("add_payment_info", {
        currency: CURRENCY,
        value: cartValue(items),
        payment_type: paymentType,
        items: items.map((item, index) => cartItemToGtmItem(item, index)),
      });
    },
  }), []);
}
