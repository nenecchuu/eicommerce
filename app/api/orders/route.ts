import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getTenantByDomain } from "@/lib/queries/getTenant";
import { getTenantDomain } from "@/lib/utils/tenant";
import { generateReadableOrderNumber } from "@/lib/utils/order";

interface CreateOrderRequest {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  shipping_address: string;
  shipping_courier: string;
  shipping_service: string;
  shipping_cost: number;
  payment_method: "bank_transfer" | "qris";
  notes?: string;
  items: Array<{
    product_id: string;
    variant_id?: string | null;
    product_name: string;
    variant_label?: string | null;
    price: number;
    quantity: number;
    slug: string;
  }>;
}

const MAX_ORDER_NUMBER_ATTEMPTS = 5;

// Validation schema
const createOrderSchema = z.object({
  customer_name: z.string().min(2, "Nama minimal 2 karakter"),
  customer_phone: z.string().min(10, "No. telepon minimal 10 digit").regex(/^[0-9+]+$/, "Hanya angka diperbolehkan"),
  customer_email: z.string().email().optional().or(z.literal("")),
  shipping_address: z.string().min(10, "Alamat minimal 10 karakter"),
  shipping_courier: z.string().min(1, "Kurir harus dipilih"),
  shipping_service: z.string().min(1, "Layanan harus dipilih"),
  shipping_cost: z.number().min(0, "Ongkir tidak boleh negatif"),
  payment_method: z.enum(["bank_transfer", "qris"]),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      product_id: z.string().uuid(),
      variant_id: z.string().uuid().nullish(),
      product_name: z.string().min(1),
      variant_label: z.string().nullish(),
      price: z.number().min(0),
      quantity: z.number().min(1, "Minimal 1 barang"),
      slug: z.string(),
    })
  ).min(1, "Minimal 1 item"),
});

export async function POST(request: NextRequest) {
  try {
    const body: CreateOrderRequest = await request.json();

    // Validate input
    const validation = createOrderSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validasi gagal",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const validated = validation.data;

    const domain = await getTenantDomain();
    if (!domain) {
      return NextResponse.json({ error: "Tenant tidak ditemukan" }, { status: 404 });
    }

    const tenant = await getTenantByDomain(domain);
    if (!tenant) {
      return NextResponse.json({ error: "Tenant tidak ditemukan" }, { status: 404 });
    }

    if (!tenant.is_active) {
      return NextResponse.json({ error: "Tenant tidak aktif" }, { status: 403 });
    }

    // Calculate totals
    const subtotal = validated.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total_amount = subtotal + validated.shipping_cost;

    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    // Insert order. Retry only if the readable order number hits the unique index.
    let order: { id: string; order_number: string | null } | null = null;
    let lastOrderError: { code?: string; message?: string } | null = null;

    for (let attempt = 0; attempt < MAX_ORDER_NUMBER_ATTEMPTS; attempt += 1) {
      const orderNumber = generateReadableOrderNumber();
      const { data, error } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          tenant_id: tenant.id,
          customer_name: validated.customer_name,
          customer_phone: validated.customer_phone,
          customer_email: validated.customer_email || "",
          shipping_address: validated.shipping_address,
          shipping_courier: validated.shipping_courier,
          shipping_service: validated.shipping_service,
          shipping_cost: validated.shipping_cost,
          payment_method: validated.payment_method,
          subtotal,
          discount_amount: 0,
          tax_amount: 0,
          total_amount,
          notes: validated.notes || "",
          status: 0, // pending_payment
          status_text: "pending_payment",
          payment_proof_url: "",
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
      console.error("[Orders API] Error creating order:", lastOrderError);
      return NextResponse.json(
        { error: "Gagal membuat pesanan" },
        { status: 500 }
      );
    }

    // Insert order items (snapshot data)
    const orderItems = validated.items.map((item) => ({
      tenant_id: tenant.id,
      order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id || "",
      product_name: item.product_name,
      variant_label: item.variant_label || "",
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
      discount_amount: 0,
      tax_amount: 0,
      total: item.price * item.quantity,
      created_at: new Date().toISOString(),
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("[Orders API] Error creating order items:", itemsError);
      // Try to rollback order (best effort)
      await supabase.from("orders").delete().eq("id", order.id);
      return NextResponse.json(
        { error: "Gagal menyimpan item pesanan" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order_id: order.id,
      order_number: order.order_number,
      total_amount,
      status: "pending_payment",
    }, { status: 201 });

  } catch (error) {
    console.error("[Orders API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
