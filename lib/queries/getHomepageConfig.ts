import type { HomepageConfig } from "@/lib/types/homepage";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export async function getHomepageConfig(tenantId: string): Promise<HomepageConfig | null> {
  if (USE_MOCK) {
    const { mockHomepageConfig } = await import("@/lib/mock/sample-tenant");
    return mockHomepageConfig;
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("homepage_configs")
    .select("*")
    .eq("tenant_id", tenantId)
    .single();

  if (error || !data) return null;

  return data as HomepageConfig;
}
