import type { Order } from "@/types/schema-contract";

const ORDER_NUMBER_TIME_ZONE = "Asia/Jakarta";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getJakartaDateCode(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: ORDER_NUMBER_TIME_ZONE,
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.year}${byType.month}${byType.day}`;
}

export function generateReadableOrderNumber(date = new Date()) {
  const randomPart = crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase();
  return `ORD-${getJakartaDateCode(date)}-${randomPart}`;
}

export function isUuid(value: string) {
  return UUID_PATTERN.test(value.trim());
}

export function normalizeOrderNumber(value: string) {
  return value.trim().toUpperCase();
}

export function getOrderDisplayId(order: Pick<Order, "id" | "order_number">) {
  return order.order_number || `ORD-${order.id.slice(0, 8).toUpperCase()}`;
}
