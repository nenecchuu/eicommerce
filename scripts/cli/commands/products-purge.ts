import { Command } from "commander";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { supabase } from "../lib/supabase.js";
import { log } from "../lib/logger.js";

export function registerProductsPurge(program: Command) {
  program
    .command("products:purge")
    .description("Hapus semua produk untuk tenant tertentu (untuk re-import bersih)")
    .action(async () => {
      p.intro(pc.bold("Vei CLI — Purge Produk"));

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

      const { count } = await supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", tenant.id);

      const total = count ?? 0;

      if (total === 0) {
        log.info(`Tidak ada produk untuk tenant '${tenant.slug}'.`);
        process.exit(0);
      }

      log.blank();
      log.warn(`Ini akan menghapus ${pc.bold(String(total))} produk (beserta semua variant) dari tenant '${pc.bold(tenant.slug)}'.`);
      log.warn("Aksi ini tidak dapat dibatalkan.");
      log.blank();

      const confirmVal = await p.text({
        message: `Ketik slug '${tenant.slug}' untuk konfirmasi:`,
        validate(v) { if (v !== tenant.slug) return `Harus mengetik '${tenant.slug}' persis`; },
      });
      abortOnCancel(confirmVal);

      const spinner = p.spinner();
      spinner.start(`Menghapus ${total} produk...`);

      const { data: productIds } = await supabase
        .from("products")
        .select("id")
        .eq("tenant_id", tenant.id);

      if (productIds && productIds.length > 0) {
        const ids = productIds.map((r) => r.id);

        const { error: variantErr } = await supabase
          .from("product_variants")
          .delete()
          .in("product_id", ids);

        if (variantErr) {
          spinner.stop("Gagal");
          log.error(`Gagal hapus variant: ${variantErr.message}`);
          process.exit(1);
        }

        const { error: prodErr } = await supabase
          .from("products")
          .delete()
          .eq("tenant_id", tenant.id);

        if (prodErr) {
          spinner.stop("Gagal");
          log.error(`Gagal hapus produk: ${prodErr.message}`);
          process.exit(1);
        }
      }

      spinner.stop("Selesai");
      p.outro(
        [
          pc.green(`✓ ${total} produk dari tenant '${tenant.slug}' berhasil dihapus`),
          `  Re-import: ${pc.dim(`make cli products:import`)}`,
        ].join("\n")
      );
    });
}

function abortOnCancel(val: unknown) {
  if (p.isCancel(val)) {
    p.cancel("Dibatalkan.");
    process.exit(0);
  }
}
