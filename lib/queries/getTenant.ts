import type { TenantWithCMS } from "@/types/schema-contract";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

/**
 * Extracts the tenant slug from a full domain
 * e.g., "warung-kopi-nusantara.lvh.me:3000" -> "warung-kopi-nusantara"
 */
function extractSlugFromDomain(domain: string): string | null {
  // Remove port if present
  const withoutPort = domain.split(":")[0];

  // Handle various wildcard DNS formats
  if (withoutPort.includes("lvh.me") || withoutPort.includes("nip.io") || withoutPort.includes("sslip.io")) {
    // Extract first subdomain (the tenant slug)
    const parts = withoutPort.split(".");
    if (parts.length > 0) {
      return parts[0];
    }
  } else if (withoutPort.includes("localhost")) {
    // Handle subdomain.localhost format
    const match = withoutPort.match(/^([^.]+)\.localhost/);
    if (match) {
      return match[1];
    }
  } else {
    // Production: assume first subdomain is the tenant
    const parts = withoutPort.split(".");
    if (parts.length > 2) {
      return parts[0];
    }
  }

  return null;
}

export async function getTenantByDomain(domain: string): Promise<TenantWithCMS | null> {
  const slug = extractSlugFromDomain(domain);

  // Special case: localhost access - return null to trigger fallback page
  if (domain === "localhost" || domain === "localhost:3000") {
    return null;
  }

  if (!slug) {
    return null;
  }

  const tenant = await getTenant(slug);

  return tenant;
}

export async function getTenant(slug: string): Promise<TenantWithCMS | null> {
  if (USE_MOCK) {
    const { mockTenant, mockCMS } = await import("@/lib/mock/sample-tenant");
    if (mockTenant.slug !== slug) return null;
    return { ...mockTenant, cms: mockCMS };
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select("*")
    .eq("slug", slug)
    .single();

  if (tenantError || !tenant) return null;

  const { data: cms } = await supabase
    .from("tenant_cms")
    .select("*")
    .eq("tenant_id", tenant.id)
    .single();

  if (!cms) return null;

  return { ...tenant, cms };
}
