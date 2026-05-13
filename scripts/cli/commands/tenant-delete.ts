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

export function registerTenantDelete(program: Command) {
  program
    .command("tenant:delete")
    .description("Nonaktifkan atau hapus permanen tenant")
    .action(async () => {
      p.intro(pc.bold("Vei CLI — Hapus / Nonaktifkan Tenant"));

      const slugVal = await p.text({
        message: "Slug tenant yang ingin dihapus/dinonaktifkan",
        placeholder: "wormhole",
        validate(v) {
          if (!v?.trim()) return "Slug tidak boleh kosong";
        },
      });
      abortOnCancel(slugVal);
      const slug = slugVal as string;

      const { data: tenant, error } = await supabase
        .from("tenants")
        .select("id, slug, name, is_active, is_demo")
        .eq("slug", slug)
        .single();

      if (error || !tenant) {
        log.error(`Tenant '${slug}' tidak ditemukan.`);
        process.exit(1);
      }

      log.blank();
      console.log(`  Nama:   ${pc.bold(tenant.name)}`);
      console.log(`  Slug:   ${tenant.slug}`);
      console.log(`  Status: ${tenant.is_active ? pc.green("aktif") : pc.yellow("nonaktif")}`);
      console.log(`  Demo:   ${tenant.is_demo ? pc.yellow("ya") : "tidak"}`);
      log.blank();

      const action = await p.select({
        message: "Pilih aksi:",
        options: [
          { value: "inactive", label: "Nonaktifkan — tenant tidak muncul di storefront, data tetap ada" },
          { value: "delete", label: "Hard delete — hapus permanen semua data tenant (tidak bisa dibatalkan)" },
          { value: "cancel", label: "Batal" },
        ],
      });
      abortOnCancel(action);

      if (action === "cancel") {
        p.cancel("Dibatalkan.");
        process.exit(0);
      }

      // --- INACTIVE ---
      if (action === "inactive") {
        if (!tenant.is_active) {
          log.warn(`Tenant '${slug}' sudah nonaktif.`);
          process.exit(0);
        }

        const confirm = await p.confirm({
          message: `Nonaktifkan '${tenant.slug}'? Storefront akan menampilkan halaman not-active.`,
          initialValue: false,
        });
        abortOnCancel(confirm);
        if (!confirm) { p.cancel("Dibatalkan."); process.exit(0); }

        const spinner = p.spinner();
        spinner.start("Menonaktifkan tenant...");
        const { error: updateErr } = await supabase
          .from("tenants")
          .update({ is_active: false })
          .eq("id", tenant.id);

        if (updateErr) {
          spinner.stop("Gagal");
          log.error(`Gagal menonaktifkan: ${updateErr.message}`);
          process.exit(1);
        }
        spinner.stop("Selesai");
        p.outro(pc.yellow(`⊘ Tenant '${tenant.slug}' dinonaktifkan. Aktifkan lagi: make cli tenant:update`));
        return;
      }

      // --- HARD DELETE ---
      log.blank();
      log.warn(`Ini akan menghapus PERMANEN semua data tenant '${pc.bold(tenant.slug)}':`)
      log.warn("produk, variant, CMS config, homepage config, dan tenant itu sendiri.");
      log.blank();

      const confirmSlug = await p.text({
        message: `Ketik slug '${tenant.slug}' untuk konfirmasi hard delete:`,
        validate(v) {
          if (v !== tenant.slug) return `Harus mengetik '${tenant.slug}' persis`;
        },
      });
      abortOnCancel(confirmSlug);

      const spinner = p.spinner();

      // hapus variants dulu
      spinner.start("Menghapus product variants...");
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
          log.error(`Gagal hapus variants: ${variantErr.message}`);
          process.exit(1);
        }
      }

      // hapus products
      spinner.start("Menghapus products...");
      const { error: productsErr } = await supabase
        .from("products")
        .delete()
        .eq("tenant_id", tenant.id);
      if (productsErr) {
        spinner.stop("Gagal");
        log.error(`Gagal hapus products: ${productsErr.message}`);
        process.exit(1);
      }

      // hapus homepage_configs
      spinner.start("Menghapus homepage config...");
      await supabase.from("homepage_configs").delete().eq("tenant_id", tenant.id);

      // hapus tenant_cms
      spinner.start("Menghapus CMS config...");
      await supabase.from("tenant_cms").delete().eq("tenant_id", tenant.id);

      // hapus tenant
      spinner.start("Menghapus tenant...");
      const { error: tenantErr } = await supabase
        .from("tenants")
        .delete()
        .eq("id", tenant.id);
      if (tenantErr) {
        spinner.stop("Gagal");
        log.error(`Gagal hapus tenant: ${tenantErr.message}`);
        process.exit(1);
      }

      spinner.stop("Selesai");
      p.outro(pc.red(`✗ Tenant '${tenant.slug}' dan semua datanya telah dihapus permanen.`));
    });
}
