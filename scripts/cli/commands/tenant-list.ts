import { Command } from "commander";
import { supabase } from "../lib/supabase.js";
import { log } from "../lib/logger.js";

export function registerTenantList(program: Command) {
  program
    .command("tenant:list")
    .description("Tampilkan daftar semua tenant")
    .action(async () => {
      const { data: tenants, error } = await supabase
        .from("tenants")
        .select("id, slug, name, is_active, is_demo, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        log.error(`Gagal mengambil data tenant: ${error.message}`);
        process.exit(1);
      }

      if (!tenants || tenants.length === 0) {
        log.info("Belum ada tenant.");
        return;
      }

      // get product counts per tenant
      const { data: counts } = await supabase
        .from("products")
        .select("tenant_id")
        .in("tenant_id", tenants.map((t) => t.id));

      const countMap: Record<string, number> = {};
      for (const row of counts ?? []) {
        countMap[row.tenant_id] = (countMap[row.tenant_id] ?? 0) + 1;
      }

      log.table(
        tenants.map((t) => ({
          Slug: t.slug,
          Nama: t.name,
          Status: t.is_active ? "aktif" : "nonaktif",
          Demo: t.is_demo ? "ya" : "tidak",
          Produk: String(countMap[t.id] ?? 0),
          Dibuat: t.created_at.slice(0, 10),
        }))
      );
    });
}
