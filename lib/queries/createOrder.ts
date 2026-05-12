import type { CartItem, OrderItem } from "@/types/schema-contract";

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
): Promise<{ orderId: string }> {
  const subtotal = payload.items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );
  const total_amount = subtotal + payload.shipping_cost;

  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
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
    .select("id")
    .single();

  if (orderError || !order) {
    throw new Error(orderError?.message ?? "Failed to create order");
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

  return { orderId: order.id };
}
