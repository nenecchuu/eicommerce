import type { Order, OrderItem } from "@/types/schema-contract";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export async function getOrderByIdAndEmail(
  tenantId: string,
  orderId: string,
  customerEmail: string
): Promise<OrderWithItems | null> {
  if (USE_MOCK) {
    const { mockOrders, mockOrderItems } = await import("@/lib/mock/sample-tenant");
    const order = mockOrders.find(
      (o) => o.id === orderId && o.tenant_id === tenantId && o.customer_email?.toLowerCase() === customerEmail.toLowerCase()
    );
    if (!order) return null;
    return {
      ...order,
      items: mockOrderItems.filter((i) => i.order_id === orderId),
    };
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("id", orderId)
    .ilike("customer_email", customerEmail)
    .single();

  if (orderError || !order) return null;

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  return { ...order, items: items ?? [] };
}

export function getOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending_payment: "Menunggu Pembayaran",
    paid: "Sudah Dibayar",
    shipped: "Dikirim",
    completed: "Selesai",
    cancelled: "Dibatalkan",
  };
  return labels[status] || status;
}

export function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending_payment: "text-yellow-600 bg-yellow-50",
    paid: "text-blue-600 bg-blue-50",
    shipped: "text-purple-600 bg-purple-50",
    completed: "text-green-600 bg-green-50",
    cancelled: "text-red-600 bg-red-50",
  };
  return colors[status] || "text-gray-600 bg-gray-50";
}
