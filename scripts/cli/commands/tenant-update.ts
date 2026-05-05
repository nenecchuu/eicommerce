import { Command } from "commander";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { supabase } from "../lib/supabase.js";
import { log } from "../lib/logger.js";

const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{10,}$/;

function abortOnCancel(val: unknown) {
  if (p.isCancel(val)) {
    p.cancel("Dibatalkan.");
    process.exit(0);
  }
}

export function registerTenantUpdate(program: Command) {
  program
    .command("tenant:update")
    .description("Update field tenant existing")
    .action(async () => {
      p.intro(pc.bold("Vei CLI — Update Tenant"));

      const slugVal = await p.text({
        message: "Slug tenant yang ingin di-update",
        placeholder: "wormhole",
        validate(v) { if (!v?.trim()) return "Slug tidak boleh kosong"; },
      });
      abortOnCancel(slugVal);

      const { data: tenant, error: tenantErr } = await supabase
        .from("tenants")
        .select("id, slug, name, is_active")
        .eq("slug", slugVal as string)
        .single();

      if (tenantErr || !tenant) {
        log.error(`Tenant '${slugVal}' tidak ditemukan.`);
        process.exit(1);
      }

      const { data: cms, error: cmsErr } = await supabase
        .from("tenant_cms")
        .select("*")
        .eq("tenant_id", tenant.id)
        .single();

      if (cmsErr || !cms) {
        log.error(`CMS config untuk tenant '${slugVal}' tidak ditemukan.`);
        process.exit(1);
      }

      log.blank();
      console.log(`  Nama:   ${pc.bold(tenant.name)}`);
      console.log(`  Status: ${tenant.is_active ? pc.green("aktif") : pc.yellow("nonaktif")}`);
      log.blank();

      const fields = await p.multiselect({
        message: "Field mana yang mau di-update? (Space untuk pilih)",
        options: [
          { value: "name", label: `Nama toko ${pc.dim(`(saat ini: ${tenant.name})`)}` },
          { value: "tagline", label: `Tagline ${pc.dim(`(saat ini: ${cms.tagline || "-"})`)}` },
          { value: "primary_color", label: `Warna utama ${pc.dim(`(saat ini: ${cms.primary_color})`)}` },
          { value: "font", label: `Font ${pc.dim(`(saat ini: ${cms.font})`)}` },
          { value: "logo_url", label: `Logo URL ${pc.dim(`(saat ini: ${cms.logo_url || "-"})`)}` },
          { value: "email", label: `Email ${pc.dim(`(saat ini: ${cms.email || "-"})`)}` },
          { value: "whatsapp", label: `WhatsApp ${pc.dim(`(saat ini: ${cms.whatsapp_number || "-"})`)}` },
          { value: "instagram", label: `Instagram ${pc.dim(`(saat ini: ${cms.instagram_handle || "-"})`)}` },
          { value: "qris", label: `QRIS image URL ${pc.dim(`(saat ini: ${cms.payment_info?.qris_image_url || "-"})`)}` },
          { value: "is_active", label: `Status aktif ${pc.dim(`(saat ini: ${tenant.is_active ? "aktif" : "nonaktif"})`)}` },
        ],
        required: true,
      });
      abortOnCancel(fields);

      const selected = fields as string[];
      const tenantUpdates: Record<string, unknown> = {};
      const cmsUpdates: Record<string, unknown> = {};

      for (const field of selected) {
        if (field === "name") {
          const val = await p.text({
            message: "Nama toko baru",
            defaultValue: tenant.name,
            validate(v) { if (!v?.trim()) return "Tidak boleh kosong"; },
          });
          abortOnCancel(val);
          tenantUpdates.name = val;
        }

        if (field === "tagline") {
          const val = await p.text({ message: "Tagline baru", defaultValue: cms.tagline ?? "" });
          abortOnCancel(val);
          cmsUpdates.tagline = (val as string).trim() || null;
        }

        if (field === "primary_color") {
          const val = await p.text({
            message: "Warna utama (hex)",
            defaultValue: cms.primary_color,
            validate(v) { if (!HEX_REGEX.test(v)) return "Format hex tidak valid (contoh: #FF5722)"; },
          });
          abortOnCancel(val);
          cmsUpdates.primary_color = val;
        }

        if (field === "font") {
          const val = await p.select({
            message: "Font",
            options: ["Inter", "Poppins", "Roboto", "Nunito", "Plus Jakarta Sans"].map((f) => ({ value: f, label: f })),
            initialValue: cms.font ?? "Inter",
          });
          abortOnCancel(val);
          cmsUpdates.font = val;
        }

        if (field === "logo_url") {
          const val = await p.text({ message: "Logo URL baru", defaultValue: cms.logo_url ?? "" });
          abortOnCancel(val);
          cmsUpdates.logo_url = (val as string).trim() || null;
        }

        if (field === "email") {
          const val = await p.text({
            message: "Email kontak baru",
            defaultValue: cms.email ?? "",
            validate(v) { if (v && !EMAIL_REGEX.test(v)) return "Format email tidak valid"; },
          });
          abortOnCancel(val);
          cmsUpdates.email = (val as string).trim() || null;
        }

        if (field === "whatsapp") {
          const val = await p.text({
            message: "Nomor WhatsApp baru (tanpa +)",
            defaultValue: cms.whatsapp_number ?? "",
            validate(v) { if (v && !PHONE_REGEX.test(v)) return "Hanya digit, minimal 10 angka"; },
          });
          abortOnCancel(val);
          cmsUpdates.whatsapp_number = (val as string).trim() || null;
        }

        if (field === "instagram") {
          const val = await p.text({ message: "Instagram handle (tanpa @)", defaultValue: cms.instagram_handle ?? "" });
          abortOnCancel(val);
          cmsUpdates.instagram_handle = (val as string).trim() || null;
        }

        if (field === "qris") {
          const val = await p.text({ message: "QRIS image URL baru", defaultValue: cms.payment_info?.qris_image_url ?? "" });
          abortOnCancel(val);
          cmsUpdates.payment_info = { ...(cms.payment_info ?? {}), qris_image_url: (val as string).trim() };
        }

        if (field === "is_active") {
          const val = await p.confirm({ message: "Aktifkan tenant?", initialValue: tenant.is_active });
          abortOnCancel(val);
          tenantUpdates.is_active = val;
        }
      }

      const spinner = p.spinner();
      spinner.start("Menyimpan perubahan...");

      if (Object.keys(tenantUpdates).length > 0) {
        const { error } = await supabase.from("tenants").update(tenantUpdates).eq("id", tenant.id);
        if (error) { spinner.stop("Gagal"); log.error(`Gagal update tenant: ${error.message}`); process.exit(1); }
      }

      if (Object.keys(cmsUpdates).length > 0) {
        const { error } = await supabase.from("tenant_cms").update(cmsUpdates).eq("tenant_id", tenant.id);
        if (error) { spinner.stop("Gagal"); log.error(`Gagal update CMS: ${error.message}`); process.exit(1); }
      }

      spinner.stop("Selesai");
      p.outro(pc.green(`✓ Tenant '${tenant.slug}' berhasil di-update`));
    });
}
