import { Command } from "commander";
import fs from "fs";
import path from "path";
import pc from "picocolors";
import * as p from "@clack/prompts";
import { supabase } from "../lib/supabase.js";
import { log } from "../lib/logger.js";
import { ShopeeExportSchema } from "../lib/shopee-schema.js";
import { transformProduct, transformVariants } from "../lib/transform.js";
import { generateSlug, generateSlugWithSuffix } from "../lib/slugify.js";

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === retries) throw err;
      await sleep(500 * attempt);
    }
  }
  throw new Error("unreachable");
}

function abortOnCancel(val: unknown) {
  if (p.isCancel(val)) {
    p.cancel("Dibatalkan.");
    process.exit(0);
  }
}

async function promptRetryOrAbort(label: string): Promise<"retry" | "abort"> {
  const action = await p.select({
    message: `Gagal ${label}. Apa yang ingin dilakukan?`,
    options: [
      { value: "retry", label: "Coba lagi" },
      { value: "abort", label: "Batalkan" },
    ],
  });
  abortOnCancel(action);
  return action as "retry" | "abort";
}

export function registerProductsImport(program: Command) {
  program
    .command("products:import")
    .description("Import produk dari JSON export Shopee ke tenant")
    .action(async () => {
      p.intro(pc.bold("Vei CLI — Import Produk"));

      // --- TENANT ---
      const slugVal = await p.text({
        message: "Slug tenant tujuan",
        placeholder: "wormhole",
        validate(v) { if (!v?.trim()) return "Slug tidak boleh kosong"; },
      });
      abortOnCancel(slugVal);

      // --- FILE ---
      const fileVal = await p.text({
        message: "Path ke file JSON Shopee export",
        placeholder: "./shopee-export.json",
        validate(v) {
          if (!v?.trim()) return "Path tidak boleh kosong";
          if (!v.trim().endsWith(".json")) return "File harus berekstensi .json";
          if (!fs.existsSync(path.resolve(process.cwd(), v.trim()))) return `File tidak ditemukan: ${v.trim()}`;
        },
      });
      abortOnCancel(fileVal);

      // --- OPTIONS ---
      const isDryRun = await p.confirm({ message: "Dry run? (validasi tanpa simpan ke DB)", initialValue: false });
      abortOnCancel(isDryRun);

      const doUpdate = await p.confirm({ message: "Update produk yang sudah ada? (default: skip)", initialValue: false });
      abortOnCancel(doUpdate);

      const limitVal = await p.text({
        message: "Batasi jumlah produk yang diimport (opsional, Enter untuk semua)",
        placeholder: "kosongkan untuk semua",
      });
      abortOnCancel(limitVal);
      const limit = (limitVal as string).trim() ? parseInt(limitVal as string, 10) : undefined;

      // --- PARSE FILE ---
      const filePath = path.resolve(process.cwd(), (fileVal as string).trim());
      let raw: unknown;
      try {
        raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      } catch (e: unknown) {
        log.error(`Gagal parse JSON: ${e instanceof Error ? e.message : String(e)}`);
        process.exit(1);
      }

      const parsed = ShopeeExportSchema.safeParse(raw);
      if (!parsed.success) {
        log.error("JSON tidak sesuai schema Shopee export:");
        for (const issue of parsed.error.issues) {
          console.error(pc.red(`  ${issue.path.join(".")} — ${issue.message}`));
        }
        process.exit(1);
      }

      let products = parsed.data.products;
      if (limit) products = products.slice(0, limit);

      // --- RESOLVE TENANT (dengan retry) ---
      let tenant: { id: string; slug: string } | null = null;
      while (!tenant) {
        const { data, error: tenantErr } = await supabase
          .from("tenants")
          .select("id, slug")
          .eq("slug", (slugVal as string).trim())
          .single();

        if (tenantErr || !data) {
          log.error(`Tenant '${slugVal}' gagal di-resolve: ${tenantErr?.message ?? "tidak ditemukan"}`);
          const action = await promptRetryOrAbort("resolve tenant");
          if (action === "abort") process.exit(1);
        } else {
          tenant = data;
        }
      }

      // --- CHECK EXISTING ---
      const sourceUrls = products.map((p) => p.product_url);
      const { data: existingRows } = await supabase
        .from("products")
        .select("source_url")
        .eq("tenant_id", tenant.id)
        .in("source_url", sourceUrls);

      const existingSet = new Set((existingRows ?? []).map((r) => r.source_url));
      const toImport = products.filter((p) => doUpdate || !existingSet.has(p.product_url));
      const toSkip = products.length - toImport.length;

      log.blank();
      console.log(
        `Ditemukan ${pc.bold(String(products.length))} produk — ` +
        `${pc.yellow(String(toSkip))} sudah ada (akan di-skip), ` +
        `${pc.green(String(toImport.length))} akan diimport.`
      );

      if (isDryRun) {
        log.warn("Dry run aktif, tidak ada data yang disimpan ke DB.");
        log.success("Validasi selesai.");
        return;
      }

      if (toImport.length === 0) {
        log.info("Tidak ada produk baru untuk diimport.");
        return;
      }

      const confirmImport = await p.confirm({
        message: `Import ${toImport.length} produk ke tenant '${tenant.slug}'?`,
      });
      abortOnCancel(confirmImport);
      if (!confirmImport) { p.cancel("Dibatalkan."); process.exit(0); }

      // --- IMPORT LOOP ---
      const { data: existingSlugs } = await supabase
        .from("products")
        .select("slug")
        .eq("tenant_id", tenant.id);
      const usedSlugs = new Set((existingSlugs ?? []).map((r) => r.slug));

      log.blank();

      let imported = 0;
      let failed = 0;
      const errors: Array<{ name: string; error: string }> = [];
      const importedSlugs: string[] = [];
      const startTime = Date.now();

      for (let i = 0; i < toImport.length; i++) {
        const product = toImport[i];

        const pct = Math.round((i / toImport.length) * 20);
        const bar = "█".repeat(pct) + "░".repeat(20 - pct);
        const elapsed = (Date.now() - startTime) / 1000;
        const eta = i > 0 ? Math.round((elapsed / i) * (toImport.length - i)) : "?";
        process.stdout.write(`\r[${bar}] ${i + 1}/${toImport.length}  ETA: ${eta}s  `);

        let slug = generateSlug(product.name);
        if (!slug) slug = `produk-${Math.random().toString(36).slice(2, 8)}`;
        if (usedSlugs.has(slug)) slug = generateSlugWithSuffix(product.name);
        usedSlugs.add(slug);

        const productRow = transformProduct(product, tenant.id, slug, i);
        const variantRows = transformVariants(product, tenant.id);

        try {
          if (doUpdate && existingSet.has(product.product_url)) {
            const { data: existingProd } = await supabase
              .from("products")
              .select("id")
              .eq("tenant_id", tenant.id)
              .eq("source_url", product.product_url)
              .single();

            if (existingProd) {
              await withRetry(() =>
                supabase.from("products").update({
                  name: productRow.name,
                  description: productRow.description,
                  images: productRow.images,
                  attr1_name: productRow.attr1_name,
                  attr2_name: productRow.attr2_name,
                  attr3_name: productRow.attr3_name,
                  has_variant: productRow.has_variant,
                  source_data: productRow.source_data,
                  rating: productRow.rating,
                  rating_count: productRow.rating_count,
                  sold_display: productRow.sold_display,
                  base_price: productRow.base_price,
                }).eq("id", existingProd.id)
                .then((r) => { if (r.error) throw r.error; return r; })
              );
              await withRetry(() =>
                supabase.from("product_variants").delete().eq("product_id", existingProd.id)
                .then((r) => { if (r.error) throw r.error; return r; })
              );
              await withRetry(() =>
                supabase.from("product_variants")
                .insert(variantRows.map((v) => ({ ...v, product_id: existingProd.id })))
                .then((r) => { if (r.error) throw r.error; return r; })
              );
              imported++;
              importedSlugs.push(slug);
            }
          } else {
            const { data: newProd } = await withRetry(() =>
              supabase.from("products").insert(productRow).select("id").single()
              .then((r) => { if (r.error) throw r.error; return r; })
            );
            if (newProd) {
              await withRetry(() =>
                supabase.from("product_variants")
                .insert(variantRows.map((v) => ({ ...v, product_id: newProd.id })))
                .then((r) => { if (r.error) throw r.error; return r; })
              );
              imported++;
              importedSlugs.push(slug);
            }
          }
        } catch (err: unknown) {
          failed++;
          errors.push({ name: product.name, error: err instanceof Error ? err.message : String(err) });
        }
      }

      process.stdout.write("\n");
      log.blank();

      const sampleUrls = importedSlugs.slice(0, 3).map(
        (s) => `  - https://${tenant.slug}.vei.store/produk/${s}`
      );

      p.outro(
        [
          pc.green("✓ Import selesai"),
          `  Imported: ${pc.green(String(imported))}`,
          `  Skipped:  ${pc.yellow(String(toSkip))} (sudah ada)`,
          `  Failed:   ${failed > 0 ? pc.red(String(failed)) : String(failed)}`,
          ...(sampleUrls.length > 0 ? ["", "  Sample URLs:", ...sampleUrls] : []),
          ...(errors.length > 0 ? ["", pc.yellow("  Error per produk:"), ...errors.map((e) => pc.red(`  ✗ ${e.name}: ${e.error}`))] : []),
        ].join("\n")
      );
    });
}
