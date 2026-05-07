import { NextResponse } from "next/server";
import { requireTenantDomain } from "@/lib/utils/tenant";
import { getTenantByDomain } from "@/lib/queries/getTenant";

export async function GET() {
  try {
    const domain = await requireTenantDomain();
    const tenant = await getTenantByDomain(domain);

    if (!tenant) {
      return NextResponse.json({ success: false, error: "Tenant not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: tenant });
  } catch (error) {
    console.error("[API Tenant] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch tenant" },
      { status: 500 }
    );
  }
}
