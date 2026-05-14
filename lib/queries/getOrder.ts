import type { OrderWithItems } from "@/lib/queries/orderTypes";
import { isUuid, normalizeOrderNumber } from "@/lib/utils/order";

export async function getOrderById(
  tenantId: string,
  orderIdentifier: string
): Promise<OrderWithItems | null> {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select("*")
    .eq("tenant_id", tenantId);

  query = isUuid(orderIdentifier)
    ? query.eq("id", orderIdentifier)
    : query.eq("order_number", normalizeOrderNumber(orderIdentifier));

  const { data: order, error: orderError } = await query.single();

  if (orderError || !order) return null;

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", order.id)
    .order("created_at", { ascending: true });

  return { ...order, items: items ?? [] };
}

export async function getOrderByIdAndEmail(
  tenantId: string,
  orderIdentifier: string,
  customerEmail: string
): Promise<OrderWithItems | null> {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select("*")
    .eq("tenant_id", tenantId)
    .ilike("customer_email", customerEmail);

  query = isUuid(orderIdentifier)
    ? query.eq("id", orderIdentifier)
    : query.eq("order_number", normalizeOrderNumber(orderIdentifier));

  const { data: order, error: orderError } = await query.single();

  if (orderError || !order) return null;

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", order.id)
    .order("created_at", { ascending: true });

  return { ...order, items: items ?? [] };
}
