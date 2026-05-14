import type { Order, OrderItem } from "@/types/schema-contract";

export interface OrderWithItems extends Order {
  items: OrderItem[];
}
