export async function getStorageClient() {
  const { createClient: createSupabaseClient } = await import("@/lib/supabase/server");
  const supabase = await createSupabaseClient();

  return supabase.storage;
}
