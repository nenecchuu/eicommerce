import { headers } from "next/headers";

export async function getTenantDomain(): Promise<string | null> {
  const h = await headers();
  return h.get("x-tenant-host");
}

export async function requireTenantDomain(): Promise<string> {
  const domain = await getTenantDomain();
  if (!domain) {
    throw new Error("Tenant domain not found in headers. Make sure middleware is configured and you're accessing via a subdomain.");
  }
  return domain;
}
