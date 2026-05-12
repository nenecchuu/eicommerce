import { unstable_cache } from "next/cache";
import type { HomepageConfig } from "@/lib/types/homepage";

async function fetchHomepageConfig(tenantId: string): Promise<HomepageConfig | null> {
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

const getCachedHomepageConfig = unstable_cache(
  fetchHomepageConfig,
  ["homepage-config"],
  { revalidate: 3600, tags: ["homepage"] }
);

export async function getHomepageConfig(tenantId: string): Promise<HomepageConfig | null> {
  return getCachedHomepageConfig(tenantId);
}
