import { NextRequest, NextResponse } from "next/server";
import { getOrderById } from "@/lib/queries/getOrder";
import { getTenantByDomain } from "@/lib/queries/getTenant";
import { getTenantDomain } from "@/lib/utils/tenant";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const domain = await getTenantDomain();
    if (!domain) {
      return NextResponse.json({ error: "Tenant tidak ditemukan" }, { status: 404 });
    }

    const tenant = await getTenantByDomain(domain);
    if (!tenant) {
      return NextResponse.json({ error: "Tenant tidak ditemukan" }, { status: 404 });
    }

    const { id } = await context.params;
    const order = await getOrderById(tenant.id, id);

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("[Orders API] Failed to fetch order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
