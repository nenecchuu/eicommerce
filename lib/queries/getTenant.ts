import { unstable_cache } from "next/cache";
import type { TenantWithCMS } from "@/types/schema-contract";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

function extractSlugFromDomain(domain: string): string | null {
  const withoutPort = domain.split(":")[0];

  if (withoutPort.includes("lvh.me") || withoutPort.includes("nip.io") || withoutPort.includes("sslip.io")) {
    const parts = withoutPort.split(".");
    if (parts.length > 0) return parts[0];
  } else if (withoutPort.includes("localhost")) {
    const match = withoutPort.match(/^([^.]+)\.localhost/);
    if (match) return match[1];
  } else {
    const parts = withoutPort.split(".");
    if (parts.length > 2) return parts[0];
  }

  return null;
}

async function fetchTenant(slug: string): Promise<TenantWithCMS | null> {
  if (USE_MOCK) {
    const { mockTenant, mockCMS, mockOriginAddress } = await import("@/lib/mock/sample-tenant");
    if (mockTenant.slug !== slug) return null;
    return { ...mockTenant, cms: mockCMS, origin_address: mockOriginAddress };
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select("*")
    .eq("slug", slug)
    .single();

  if (tenantError || !tenant) return null;

  const [{ data: cms }, { data: origin_address }] = await Promise.all([
    supabase.from("tenant_cms").select("*").eq("tenant_id", tenant.id).single(),
    supabase.from("tenant_origin_addresses").select("*").eq("tenant_id", tenant.id).single(),
  ]);

  if (!cms) return null;

  return { ...tenant, cms, origin_address: origin_address ?? null };
}

const getCachedTenant = unstable_cache(
  fetchTenant,
  ["tenant"],
  { revalidate: 3600, tags: ["tenant"] }
);

export async function getTenant(slug: string): Promise<TenantWithCMS | null> {
  return getCachedTenant(slug);
}

export async function getTenantByDomain(domain: string): Promise<TenantWithCMS | null> {
  if (domain === "localhost" || domain === "localhost:3000") return null;

  const slug = extractSlugFromDomain(domain);
  if (!slug) return null;

  return getCachedTenant(slug);
}
