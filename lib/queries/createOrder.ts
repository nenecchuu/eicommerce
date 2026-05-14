import type { CartItem, OrderItem } from "@/types/schema-contract";
import { generateReadableOrderNumber } from "@/lib/utils/order";

export interface CreateOrderPayload {
  tenant_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  shipping_address: string;
  shipping_courier: string;
  shipping_service: string;
  shipping_cost: number;
  payment_method: "bank_transfer" | "qris";
  notes: string;
  items: CartItem[];
}

export async function createOrder(
  payload: CreateOrderPayload
): Promise<{ orderId: string; orderNumber: string | null }> {
  const subtotal = payload.items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );
  const total_amount = subtotal + payload.shipping_cost;

  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();

  let order: { id: string; order_number: string | null } | null = null;
  let lastOrderError: { code?: string; message?: string } | null = null;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const orderNumber = generateReadableOrderNumber();
    const { data, error } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        tenant_id: payload.tenant_id,
        customer_name: payload.customer_name,
        customer_phone: payload.customer_phone,
        customer_email: payload.customer_email || null,
        shipping_address: payload.shipping_address,
        shipping_courier: payload.shipping_courier,
        shipping_service: payload.shipping_service,
        shipping_cost: payload.shipping_cost,
        payment_method: payload.payment_method,
        subtotal,
        total_amount,
        notes: payload.notes || null,
        status_text: "pending_payment",
      })
      .select("id, order_number")
      .single();

    if (!error && data) {
      order = data;
      break;
    }

    lastOrderError = error;
    if (error?.code === "23505" && error.message?.includes("order_number")) {
      continue;
    }
    break;
  }

  if (!order) {
    throw new Error(lastOrderError?.message ?? "Failed to create order");
  }

  const orderItems: Omit<OrderItem, "id">[] = payload.items.map((i) => ({
    tenant_id: payload.tenant_id,
    order_id: order.id,
    product_id: i.product_id,
    variant_id: i.variant_id ?? "",
    product_name: i.product_name,
    variant_label: i.variant_label ?? "",
    price: i.price,
    quantity: i.quantity,
    subtotal: i.price * i.quantity,
    discount_amount: 0,
    tax_amount: 0,
    total: i.price * i.quantity,
    created_at: new Date().toISOString(),
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    throw new Error(itemsError.message);
  }

  return { orderId: order.id, orderNumber: order.order_number };
}
