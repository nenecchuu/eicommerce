import { Command } from "commander";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { supabase } from "../lib/supabase.js";
import { log } from "../lib/logger.js";

const RESERVED_SLUGS = ["www", "app", "api", "admin", "demo", "vei", "mail"];
const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{2,30}[a-z0-9]$/;
const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{10,}$/;

const FONT_OPTIONS = [
  { value: "Inter", label: "Inter" },
  { value: "Poppins", label: "Poppins" },
  { value: "Roboto", label: "Roboto" },
  { value: "Nunito", label: "Nunito" },
  { value: "Plus Jakarta Sans", label: "Plus Jakarta Sans" },
];

const HOMEPAGE_PRESETS: Record<string, { label: string; sections: unknown[] }> = {
  fashion: {
    label: "Fashion — Hero + Kategori + Produk + Promo banner + Trust badges",
    sections: [
      { id: "hero", type: "hero_banner", visible: true, props: { image_url: "", title: "", subtitle: "", cta_label: "Lihat Koleksi", cta_url: "/produk" } },
      { id: "categories", type: "category_list", visible: true, props: { title: "Kategori", categories: [] } },
      { id: "products_new", type: "product_list", visible: true, props: { title: "Produk Terbaru", layout: "card", source: "bestseller", item_limit: 12, show_view_all: true } },
      { id: "promo", type: "promo_banner", visible: true, props: { banners: [{ image_url: "", link_url: "/produk" }] } },
      { id: "trust", type: "trust_badges", visible: true, props: { badges: [
        { key: "secure_transaction", label: "Transaksi Aman", active: true },
        { key: "free_shipping", label: "Gratis Ongkir", active: true },
        { key: "money_back", label: "Garansi Uang Kembali", active: true },
      ]}},
    ],
  },
  promo: {
    label: "Promo-first — Sticky + Hero + Flash sale + Promo banner + Trust badges",
    sections: [
      { id: "sticky", type: "sticky_top_message", visible: true, props: { text: "🔥 Flash Sale Hari Ini!", link_url: "/produk", link_label: "Lihat Semua", dismissible: true } },
      { id: "hero", type: "hero_banner", visible: true, props: { image_url: "", title: "", subtitle: "", cta_label: "Belanja Sekarang", cta_url: "/produk" } },
      { id: "flash_sale", type: "product_list", visible: true, props: { title: "Flash Sale", layout: "card", source: "flash_sale", item_limit: 8, show_view_all: true } },
      { id: "promo", type: "promo_banner", visible: true, props: { banners: [{ image_url: "", link_url: "/produk" }] } },
      { id: "trust", type: "trust_badges", visible: true, props: { badges: [
        { key: "secure_transaction", label: "Transaksi Aman", active: true },
        { key: "happy_buyers", label: "Ribuan Pembeli Puas", active: true },
        { key: "money_back", label: "Garansi Uang Kembali", active: true },
      ]}},
    ],
  },
  catalog: {
    label: "Katalog — Hero + Kategori + Grid produk + Trust badges + Testimoni",
    sections: [
      { id: "hero", type: "hero_banner", visible: true, props: { image_url: "", title: "", subtitle: "", cta_label: "Lihat Produk", cta_url: "/produk" } },
      { id: "categories", type: "category_list", visible: true, props: { title: "Jelajahi Kategori", categories: [] } },
      { id: "products", type: "product_list", visible: true, props: { title: "Semua Produk", layout: "card", source: "bestseller", item_limit: 20, show_view_all: false } },
      { id: "trust", type: "trust_badges", visible: true, props: { badges: [
        { key: "secure_transaction", label: "Transaksi Aman", active: true },
        { key: "free_shipping", label: "Gratis Ongkir", active: true },
      ]}},
      { id: "testimonial", type: "testimonial", visible: true, props: { title: "Kata Pelanggan Kami", layout: "carousel", items: [] } },
    ],
  },
  lifestyle: {
    label: "Lifestyle — Hero + Promo banner + Bestseller + Testimoni + Trust badges",
    sections: [
      { id: "hero", type: "hero_banner", visible: true, props: { image_url: "", title: "", subtitle: "", cta_label: "Shop Now", cta_url: "/produk" } },
      { id: "promo", type: "promo_banner", visible: true, props: { banners: [{ image_url: "", link_url: "/produk" }, { image_url: "", link_url: "/produk" }] } },
      { id: "bestseller", type: "product_list", visible: true, props: { title: "Paling Laris", layout: "card", source: "bestseller", item_limit: 8, show_view_all: true } },
      { id: "testimonial", type: "testimonial", visible: true, props: { title: "Review Pelanggan", layout: "grid", items: [] } },
      { id: "trust", type: "trust_badges", visible: true, props: { badges: [
        { key: "secure_transaction", label: "Transaksi Aman", active: true },
        { key: "free_shipping", label: "Gratis Ongkir", active: true },
        { key: "happy_buyers", label: "Ribuan Pembeli Puas", active: true },
        { key: "money_back", label: "Garansi Uang Kembali", active: true },
      ]}},
    ],
  },
  fullhouse: {
    label: "Full — Sticky + Hero + Kategori + Promo + Produk + Testimoni + Trust badges",
    sections: [
      { id: "sticky", type: "sticky_top_message", visible: true, props: { text: "✨ Gratis ongkir untuk pembelian pertama!", link_url: "/produk", link_label: "Belanja Sekarang", dismissible: true } },
      { id: "hero", type: "hero_banner", visible: true, props: { image_url: "", title: "", subtitle: "", cta_label: "Lihat Koleksi", cta_url: "/produk" } },
      { id: "categories", type: "category_list", visible: true, props: { title: "Kategori", categories: [] } },
      { id: "promo", type: "promo_banner", visible: true, props: { banners: [{ image_url: "", link_url: "/produk" }, { image_url: "", link_url: "/produk" }] } },
      { id: "bestseller", type: "product_list", visible: true, props: { title: "Terlaris", layout: "card", source: "bestseller", item_limit: 8, show_view_all: true } },
      { id: "new_arrival", type: "product_list", visible: true, props: { title: "Baru Masuk", layout: "card", source: "bestseller", item_limit: 8, show_view_all: true } },
      { id: "testimonial", type: "testimonial", visible: true, props: { title: "Kata Mereka", layout: "carousel", items: [] } },
      { id: "trust", type: "trust_badges", visible: true, props: { badges: [
        { key: "secure_transaction", label: "Transaksi Aman", active: true },
        { key: "free_shipping", label: "Gratis Ongkir", active: true },
        { key: "happy_buyers", label: "Ribuan Pembeli Puas", active: true },
        { key: "money_back", label: "Garansi Uang Kembali", active: true },
      ]}},
    ],
  },
  empty: {
    label: "Kosong — atur manual via Studio nanti",
    sections: [],
  },
};

function abortOnCancel(val: unknown) {
  if (p.isCancel(val)) {
    p.cancel("Dibatalkan.");
    process.exit(0);
  }
}

async function retryOrAbort(label: string, fn: () => Promise<{ error: unknown } | void>): Promise<void> {
  while (true) {
    const result = await fn();
    const error = result && "error" in result ? result.error : null;
    if (!error) return;

    const errMsg = error instanceof Error ? error.message : String((error as { message?: string }).message ?? error);
    log.blank();
    log.error(`Gagal ${label}: ${errMsg}`);

    const action = await p.select({
      message: "Apa yang ingin dilakukan?",
      options: [
        { value: "retry", label: "Coba lagi" },
        { value: "abort", label: "Batalkan" },
      ],
    });
    abortOnCancel(action);
    if (action === "abort") {
      p.cancel("Dibatalkan.");
      process.exit(1);
    }
    log.info(`Mencoba ulang ${label}...`);
  }
}

export function registerTenantCreate(program: Command) {
  program
    .command("tenant:create")
    .description("Daftarkan tenant baru ke Supabase")
    .action(async () => {
      p.intro(pc.bold("Vei CLI — Buat Tenant Baru"));

      // --- SLUG ---
      const slugVal = await p.text({
        message: "Slug subdomain (contoh: wormhole)",
        placeholder: "wormhole",
        validate(v) {
          if (!v || !SLUG_REGEX.test(v)) return "Harus lowercase alphanumeric + dash, 4–32 karakter";
          if (RESERVED_SLUGS.includes(v)) return `'${v}' adalah slug yang direservasi`;
        },
      });
      abortOnCancel(slugVal);
      const slug = slugVal as string;

      // check uniqueness
      const { data: existing } = await supabase.from("tenants").select("id").eq("slug", slug).single();
      if (existing) {
        log.error(`Tenant dengan slug '${slug}' sudah ada. Gunakan slug lain.`);
        process.exit(1);
      }

      // --- NAMA TOKO ---
      const nameVal = await p.text({
        message: "Nama toko",
        placeholder: "Wormhole Store",
        validate(v) {
          if (!v?.trim()) return "Nama tidak boleh kosong";
        },
      });
      abortOnCancel(nameVal);
      const name = nameVal as string;

      // --- TAGLINE ---
      const taglineVal = await p.text({
        message: "Tagline toko (opsional)",
        placeholder: "Toko fashion terbaik di Indonesia",
      });
      abortOnCancel(taglineVal);

      // --- WARNA UTAMA ---
      const colorVal = await p.text({
        message: "Warna utama (hex, Enter untuk default #000000)",
        placeholder: "#000000",
        defaultValue: "#000000",
        validate(v) {
          if (v && !HEX_REGEX.test(v)) return "Format hex tidak valid (contoh: #FF5722)";
        },
      });
      abortOnCancel(colorVal);
      const primaryColor = (colorVal as string) || "#000000";

      // --- FONT ---
      const fontVal = await p.select({
        message: "Font",
        options: FONT_OPTIONS,
        initialValue: "Inter",
      });
      abortOnCancel(fontVal);
      const font = fontVal as string;

      const fontSizeVal = await p.select({
        message: "Ukuran font",
        options: [
          { value: "regular", label: "Regular (default)" },
          { value: "large", label: "Large (+1 step)" },
          { value: "xl", label: "Extra Large (+2 steps)" },
        ],
        initialValue: "regular",
      });
      abortOnCancel(fontSizeVal);
      const fontSize = fontSizeVal as string;

      // --- LOGO URL ---
      const logoVal = await p.text({
        message: "Logo URL (opsional)",
        placeholder: "https://...",
      });
      abortOnCancel(logoVal);
      const logoUrl = (logoVal as string).trim() || null;

      // --- EMAIL ---
      const emailVal = await p.text({
        message: "Email kontak (opsional)",
        placeholder: "hello@wormhole.id",
        validate(v) {
          if (v && !EMAIL_REGEX.test(v)) return "Format email tidak valid";
        },
      });
      abortOnCancel(emailVal);

      // --- WHATSAPP ---
      const whatsappVal = await p.text({
        message: "Nomor WhatsApp (opsional, tanpa +, contoh: 6281234567890)",
        placeholder: "6281234567890",
        validate(v) {
          if (v && !PHONE_REGEX.test(v)) return "Hanya digit, minimal 10 angka";
        },
      });
      abortOnCancel(whatsappVal);

      // --- INSTAGRAM ---
      const instagramVal = await p.text({
        message: "Instagram handle (opsional, tanpa @)",
        placeholder: "wormholestore",
      });
      abortOnCancel(instagramVal);

      // --- REKENING BANK ---
      const bankAccounts: Array<{ name: string; account_number: string; account_name: string }> = [];
      const addBankConfirm = await p.confirm({ message: "Tambah rekening bank?", initialValue: false });
      abortOnCancel(addBankConfirm);

      if (addBankConfirm) {
        let addMore = true;
        while (addMore) {
          const bankName = await p.text({ message: "Nama bank (contoh: BCA)" });
          abortOnCancel(bankName);
          const accountNumber = await p.text({ message: "Nomor rekening" });
          abortOnCancel(accountNumber);
          const accountName = await p.text({ message: "Nama pemilik rekening" });
          abortOnCancel(accountName);
          bankAccounts.push({
            name: bankName as string,
            account_number: accountNumber as string,
            account_name: accountName as string,
          });
          const more = await p.confirm({ message: "Tambah rekening lain?", initialValue: false });
          abortOnCancel(more);
          addMore = more as boolean;
        }
      }

      // --- QRIS ---
      const qrisVal = await p.text({
        message: "QRIS image URL (opsional)",
        placeholder: "https://...",
      });
      abortOnCancel(qrisVal);
      const qrisImageUrl = (qrisVal as string).trim() || "";

      // --- ORIGIN ADDRESS ---
      let originAddress: {
        biteship_area_id: string;
        address: string;
        district: string;
        city: string;
        province: string;
        postal_code: string;
      } | null = null;

      const wantOrigin = await p.confirm({ message: "Tambah alamat asal pengiriman sekarang?", initialValue: true });
      abortOnCancel(wantOrigin);

      if (wantOrigin) {
        const BITESHIP_KEY = process.env.BITESHIP_API_KEY;

        let areaSelected = false;
        while (!areaSelected) {
          const searchQuery = await p.text({
            message: "Cari kecamatan asal (contoh: Pesanggrahan)",
            placeholder: "Pesanggrahan",
            validate(v) {
              if (!v || v.trim().length < 2) return "Minimal 2 karakter";
            },
          });
          abortOnCancel(searchQuery);

          const spinner2 = p.spinner();
          spinner2.start("Mencari area...");

          let areas: Array<{
            id: string;
            name: string;
            administrative_division_level_1_name: string;
            administrative_division_level_2_name: string;
            administrative_division_level_3_name: string;
            postal_code: number;
          }> = [];

          try {
            if (BITESHIP_KEY) {
              const res = await fetch(
                `https://api.biteship.com/v1/maps/areas?input=${encodeURIComponent((searchQuery as string).trim())}&type=single`,
                { headers: { Authorization: `Bearer ${BITESHIP_KEY}` } }
              );
              const data = await res.json() as { areas?: typeof areas };
              areas = data.areas ?? [];
            } else {
              // fallback mock saat dev tanpa API key
              areas = [
                { id: "IDNP6IDNC60IDND266IDZ12220", name: "Pesanggrahan, Jakarta Selatan, DKI Jakarta. 12220", administrative_division_level_1_name: "DKI Jakarta", administrative_division_level_2_name: "Jakarta Selatan", administrative_division_level_3_name: "Pesanggrahan", postal_code: 12220 },
                { id: "IDNP6IDNC60IDND265IDZ12250", name: "Bintaro, Jakarta Selatan, DKI Jakarta. 12250", administrative_division_level_1_name: "DKI Jakarta", administrative_division_level_2_name: "Jakarta Selatan", administrative_division_level_3_name: "Bintaro", postal_code: 12250 },
              ];
            }
          } catch {
            spinner2.stop("Gagal terhubung ke Biteship");
            log.warn("Lewati input origin address — bisa diisi manual via tenant:update");
            break;
          }

          if (areas.length === 0) {
            spinner2.stop("Tidak ditemukan");
            log.warn(`Tidak ada area untuk "${String(searchQuery)}". Coba kata kunci lain.`);
            continue;
          }

          spinner2.stop(`${areas.length} area ditemukan`);

          const areaChoice = await p.select({
            message: "Pilih area:",
            options: areas.slice(0, 10).map((a) => ({
              value: a.id,
              label: `${a.administrative_division_level_3_name}, ${a.administrative_division_level_2_name}, ${a.administrative_division_level_1_name} ${a.postal_code}`,
            })),
          });
          abortOnCancel(areaChoice);

          const chosen = areas.find((a) => a.id === areaChoice)!;

          const detailAddress = await p.text({
            message: "Alamat lengkap (jalan, nomor, gedung)",
            placeholder: "Jl. Raya Pesanggrahan No. 10",
            validate(v) {
              if (!v?.trim()) return "Alamat tidak boleh kosong";
            },
          });
          abortOnCancel(detailAddress);

          originAddress = {
            biteship_area_id: chosen.id,
            address: (detailAddress as string).trim(),
            district: chosen.administrative_division_level_3_name,
            city: chosen.administrative_division_level_2_name,
            province: chosen.administrative_division_level_1_name,
            postal_code: String(chosen.postal_code),
          };
          areaSelected = true;
        }
      }

      // --- META PIXEL ---
      const metaPixelVal = await p.text({
        message: "Meta Pixel ID (opsional, dari Meta Events Manager)",
        placeholder: "1234567890123456",
        validate(v) {
          if (v && !/^\d{10,20}$/.test(v.trim())) return "Pixel ID hanya digit, 10–20 karakter";
        },
      });
      abortOnCancel(metaPixelVal);
      const metaPixelId = (metaPixelVal as string).trim() || null;

      const gtmVal = await p.text({
        message: "Google Tag Manager ID (opsional, dari GTM seller)",
        placeholder: "GTM-XXXXXXX",
        validate(v) {
          if (v && !/^GTM-[A-Z0-9]+$/i.test(v.trim())) return "GTM ID harus format GTM-XXXXXXX";
        },
      });
      abortOnCancel(gtmVal);
      const googleTagManagerId = (gtmVal as string).trim().toUpperCase() || null;

      // --- LAYOUT HOMEPAGE ---
      const layoutVal = await p.select({
        message: "Pilih layout homepage:",
        options: Object.entries(HOMEPAGE_PRESETS).map(([value, { label }]) => ({ value, label })),
      });
      abortOnCancel(layoutVal);
      const chosenPreset = HOMEPAGE_PRESETS[layoutVal as string];

      // --- RINGKASAN + KONFIRMASI ---
      log.blank();
      console.log(pc.bold("Ringkasan:"));
      console.log(`  Slug:     ${pc.cyan(slug)}`);
      console.log(`  Nama:     ${name}`);
      console.log(`  Warna:    ${primaryColor}`);
      console.log(`  Font:     ${font}`);
      console.log(`  Ukuran:   ${fontSize}`);
      console.log(`  Layout:   ${chosenPreset.label}`);
      if (metaPixelId) console.log(`  Pixel ID: ${metaPixelId}`);
      if (googleTagManagerId) console.log(`  GTM ID:   ${googleTagManagerId}`);
      log.blank();

      const confirm = await p.confirm({ message: "Simpan tenant baru ini?" });
      abortOnCancel(confirm);
      if (!confirm) {
        p.cancel("Dibatalkan.");
        process.exit(0);
      }

      const spinner = p.spinner();

      // --- INSERT TENANT ---
      let tenantId = "";
      let tenantSlug = "";

      await retryOrAbort("membuat tenant", async () => {
        spinner.start("Menyimpan tenant...");
        const { data, error } = await supabase
          .from("tenants")
          .insert({ slug, name, is_active: true })
          .select("id, slug")
          .single();
        if (error) { spinner.stop("Gagal"); return { error }; }
        tenantId = data.id;
        tenantSlug = data.slug;
      });

      // --- INSERT TENANT CMS ---
      await retryOrAbort("membuat CMS config", async () => {
        spinner.start("Menyimpan CMS config...");
        const { error } = await supabase.from("tenant_cms").insert({
          tenant_id: tenantId,
          template_variant: "general",
          logo_url: logoUrl,
          favicon_url: null,
          primary_color: primaryColor,
          tagline: (taglineVal as string).trim() || null,
          description: null,
          whatsapp_number: (whatsappVal as string).trim() || null,
          instagram_handle: (instagramVal as string).trim() || null,
          email: (emailVal as string).trim() || null,
          font,
          font_size: fontSize,
          payment_info: { bank: bankAccounts, qris_image_url: qrisImageUrl },
          meta_pixel_id: metaPixelId,
          google_tag_manager_id: googleTagManagerId,
        });
        if (error) {
          spinner.stop("Gagal");
          await supabase.from("tenants").delete().eq("id", tenantId);
          return { error };
        }
      });

      // --- INSERT HOMEPAGE CONFIG ---
      spinner.start("Menyimpan homepage config...");
      const { error: homepageError } = await supabase
        .from("homepage_configs")
        .insert({ tenant_id: tenantId, sections: chosenPreset.sections, version: 1 });

      if (homepageError) {
        spinner.stop("Selesai (dengan peringatan)");
        log.warn(`homepage_configs gagal: ${homepageError.message}`);
        log.dim(`Fix manual: INSERT INTO homepage_configs (tenant_id, sections, version) VALUES ('${tenantId}', '[]', 1);`);
      } else {
        spinner.stop("Selesai");
      }

      // --- INSERT ORIGIN ADDRESS ---
      if (originAddress) {
        spinner.start("Menyimpan alamat asal pengiriman...");
        const { error: originError } = await supabase
          .from("tenant_origin_addresses")
          .insert({ tenant_id: tenantId, ...originAddress });
        if (originError) {
          spinner.stop("Selesai (dengan peringatan)");
          log.warn(`origin_address gagal: ${originError.message}`);
          log.dim(`Fix manual via: make cli tenant:update --tenant=${tenantSlug}`);
        } else {
          spinner.stop("Selesai");
        }
      }

      // --- IMPORT PRODUK? ---
      log.blank();
      const wantImport = await p.confirm({ message: "Import produk sekarang?", initialValue: false });
      abortOnCancel(wantImport);

      if (wantImport) {
        const filePathVal = await p.text({
          message: "Path ke file JSON Shopee export",
          placeholder: "./shopee-export.json",
          validate(v) {
            if (!v?.trim()) return "Path tidak boleh kosong";
            if (!v.trim().endsWith(".json")) return "File harus berekstensi .json";
          },
        });
        abortOnCancel(filePathVal);

        const { registerProductsImport } = await import("./products-import.js");
        const importProgram = new (await import("commander")).Command();
        registerProductsImport(importProgram);
        await importProgram.parseAsync([
          "node", "cli",
          "products:import",
          `--tenant=${tenantSlug}`,
          `--file=${(filePathVal as string).trim()}`,
        ]);
      }

      p.outro(
        [
          pc.green("✓ Tenant berhasil dibuat"),
          `  ID:        ${tenantId}`,
          `  Slug:      ${tenantSlug}`,
          `  Layout:    ${chosenPreset.label}`,
          `  Subdomain: ${pc.cyan(`https://${tenantSlug}.vei.store`)}`,
          ...(!wantImport ? ["", `  Import produk: ${pc.dim(`make cli products:import --tenant=${tenantSlug} --file=./shopee-export.json`)}`] : []),
        ].join("\n")
      );
    });
}
