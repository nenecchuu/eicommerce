import { Command } from "commander";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { supabase } from "../lib/supabase.js";
import { log } from "../lib/logger.js";

function abortOnCancel(val: unknown) {
  if (p.isCancel(val)) {
    p.cancel("Dibatalkan.");
    process.exit(0);
  }
}

export function registerProductsList(program: Command) {
  program
    .command("products:list")
    .description("Tampilkan daftar produk untuk tenant tertentu")
    .action(async () => {
      p.intro(pc.bold("Vei CLI — Daftar Produk"));

      const slugVal = await p.text({
        message: "Slug tenant",
        placeholder: "wormhole",
        validate(v) { if (!v?.trim()) return "Slug tidak boleh kosong"; },
      });
      abortOnCancel(slugVal);

      const { data: tenant, error: tenantErr } = await supabase
        .from("tenants")
        .select("id, slug")
        .eq("slug", slugVal as string)
        .single();

      if (tenantErr || !tenant) {
        log.error(`Tenant '${slugVal}' tidak ditemukan.`);
        process.exit(1);
      }

      const searchVal = await p.text({
        message: "Filter nama produk (opsional, Enter untuk skip)",
        placeholder: "kemeja",
      });
      abortOnCancel(searchVal);

      const limitVal = await p.text({
        message: "Jumlah produk ditampilkan",
        defaultValue: "20",
        validate(v) { if (isNaN(Number(v)) || Number(v) < 1) return "Harus angka positif"; },
      });
      abortOnCancel(limitVal);
      const limit = parseInt(limitVal as string, 10);

      let query = supabase
        .from("products")
        .select("id, slug, name, base_price, has_variant, is_active, created_at")
        .eq("tenant_id", tenant.id)
        .order("display_order", { ascending: true })
        .limit(limit);

      const search = (searchVal as string).trim();
      if (search) query = query.ilike("name", `%${search}%`);

      const { data: products, error } = await query;

      if (error) {
        log.error(`Gagal mengambil produk: ${error.message}`);
        process.exit(1);
      }

      log.blank();

      if (!products || products.length === 0) {
        log.info(`Tidak ada produk${search ? ` dengan kata kunci '${search}'` : ""} untuk tenant '${tenant.slug}'.`);
        return;
      }

      log.table(
        products.map((p) => ({
          Slug: p.slug,
          Nama: p.name.slice(0, 40) + (p.name.length > 40 ? "…" : ""),
          Harga: `Rp ${Number(p.base_price).toLocaleString("id-ID")}`,
          Varian: p.has_variant ? "ya" : "tidak",
          Status: p.is_active ? "aktif" : "nonaktif",
        }))
      );

      if (products.length === limit) {
        log.dim(`\nMenunjukkan ${limit} produk. Jalankan ulang dengan jumlah lebih besar untuk melihat lebih banyak.`);
      }
    });
}
