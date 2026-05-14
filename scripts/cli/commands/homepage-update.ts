import { Command } from "commander";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { supabase } from "../lib/supabase.js";
import { log } from "../lib/logger.js";

type SectionType =
  | "hero_banner"
  | "wide_banner"
  | "product_list"
  | "promo_banner"
  | "trust_badges"
  | "category_list"
  | "testimonial"
  | "sticky_top_message";

interface Section {
  id: string;
  type: SectionType;
  visible: boolean;
  props: Record<string, unknown>;
}

const SECTION_LABELS: Record<SectionType, string> = {
  hero_banner: "Hero Banner",
  wide_banner: "Wide Banner",
  product_list: "Product List",
  promo_banner: "Promo Banner",
  trust_badges: "Trust Badges",
  category_list: "Category List",
  testimonial: "Testimonial",
  sticky_top_message: "Sticky Top Message",
};

const SECTION_DEFAULTS: Record<SectionType, Record<string, unknown>> = {
  hero_banner: { banners: [{ image_url: "" }], autoplay_ms: 5000 },
  wide_banner: { image_url: "" },
  product_list: { title: "Produk", layout: "card", source: "bestseller", item_limit: 12, show_view_all: true },
  promo_banner: { display: "grid", banners: [{ image_url: "" }] },
  trust_badges: { badges: [
    { key: "secure_transaction", label: "Transaksi Aman", active: true },
    { key: "free_shipping", label: "Gratis Ongkir", active: true },
    { key: "money_back", label: "Garansi Uang Kembali", active: true },
  ]},
  category_list: { title: "Kategori", categories: [] },
  testimonial: { title: "Kata Pelanggan", layout: "carousel", items: [] },
  sticky_top_message: { text: "", link_url: "", link_label: "", dismissible: true },
};

function abortOnCancel(val: unknown) {
  if (p.isCancel(val)) {
    p.cancel("Dibatalkan.");
    process.exit(0);
  }
}

function getBannerItems(props: Record<string, unknown>): Record<string, unknown>[] {
  if (Array.isArray(props.banners) && props.banners.length > 0) {
    return props.banners as Record<string, unknown>[];
  }
  if (props.image_url) return [props];
  return [{ image_url: "" }];
}

function sectionSummary(s: Section): string {
  const vis = s.visible ? pc.green("✓") : pc.dim("✗");
  const label = SECTION_LABELS[s.type] ?? s.type;
  const extra: string[] = [];

  if (s.type === "hero_banner") extra.push(`${getBannerItems(s.props).length} slide`);
  if (s.type === "wide_banner") extra.push(s.props.image_url ? "1 banner" : "belum ada image");
  if (s.type === "product_list" && s.props.title) extra.push(`"${s.props.title}" · ${s.props.source} · ${s.props.item_limit} item`);
  if (s.type === "sticky_top_message" && s.props.text) extra.push(`"${s.props.text}"`);
  if (s.type === "promo_banner") extra.push(`${(s.props.banners as unknown[]).length} banner · ${s.props.display ?? "grid"}`);
  if (s.type === "trust_badges") extra.push(`${(s.props.badges as unknown[]).length} badge`);

  return `${vis} ${label}${extra.length ? pc.dim(" — " + extra.join(", ")) : ""}`;
}

async function editSectionProps(section: Section): Promise<Section> {
  const type = section.type;
  const props = { ...section.props };

  if (type === "hero_banner") {
    const currentBanners = getBannerItems(props);
    const count = await p.text({
      message: "Jumlah slide hero",
      defaultValue: String(currentBanners.length),
      validate(v) { if (isNaN(Number(v)) || Number(v) < 1) return "Minimal 1 slide"; },
    });
    abortOnCancel(count);

    const banners: Record<string, unknown>[] = [];
    for (let i = 0; i < Number(count); i += 1) {
      const current = currentBanners[i] ?? {};
      const imageUrl = await p.text({
        message: `Slide ${i + 1} image URL`,
        defaultValue: String(current.image_url ?? ""),
        validate(v) { if (!v?.trim()) return "Image URL wajib diisi"; },
      });
      abortOnCancel(imageUrl);
      const linkUrl = await p.text({ message: `Slide ${i + 1} link URL (opsional)`, defaultValue: String(current.link_url ?? "") });
      abortOnCancel(linkUrl);
      const title = await p.text({ message: `Slide ${i + 1} judul (opsional)`, defaultValue: String(current.title ?? "") });
      abortOnCancel(title);
      const subtitle = await p.text({ message: `Slide ${i + 1} subtitle (opsional)`, defaultValue: String(current.subtitle ?? "") });
      abortOnCancel(subtitle);
      const ctaLabel = await p.text({ message: `Slide ${i + 1} CTA label (opsional)`, defaultValue: String(current.cta_label ?? "") });
      abortOnCancel(ctaLabel);
      const ctaUrl = await p.text({ message: `Slide ${i + 1} CTA URL (opsional)`, defaultValue: String(current.cta_url ?? "") });
      abortOnCancel(ctaUrl);
      banners.push({ image_url: imageUrl, link_url: linkUrl, title, subtitle, cta_label: ctaLabel, cta_url: ctaUrl });
    }

    return { ...section, props: { banners, autoplay_ms: props.autoplay_ms ?? 5000 } };
  }

  if (type === "wide_banner") {
    const imageUrl = await p.text({
      message: "Image URL",
      defaultValue: String(props.image_url ?? ""),
      validate(v) { if (!v?.trim()) return "Image URL wajib diisi"; },
    });
    abortOnCancel(imageUrl);
    const linkUrl = await p.text({ message: "Link URL (opsional)", defaultValue: String(props.link_url ?? "") });
    abortOnCancel(linkUrl);
    const title = await p.text({ message: "Judul (opsional)", defaultValue: String(props.title ?? "") });
    abortOnCancel(title);
    const subtitle = await p.text({ message: "Subtitle (opsional)", defaultValue: String(props.subtitle ?? "") });
    abortOnCancel(subtitle);
    const ctaLabel = await p.text({ message: "CTA label (opsional)", defaultValue: String(props.cta_label ?? "") });
    abortOnCancel(ctaLabel);
    const ctaUrl = await p.text({ message: "CTA URL (opsional)", defaultValue: String(props.cta_url ?? "") });
    abortOnCancel(ctaUrl);
    return { ...section, props: { image_url: imageUrl, link_url: linkUrl, title, subtitle, cta_label: ctaLabel, cta_url: ctaUrl } };
  }

  if (type === "product_list") {
    const title = await p.text({ message: "Judul section", defaultValue: String(props.title ?? "Produk") });
    abortOnCancel(title);
    const layout = await p.select({
      message: "Layout",
      options: [{ value: "card", label: "Card" }, { value: "full_image", label: "Full Image" }],
      initialValue: String(props.layout ?? "card"),
    });
    abortOnCancel(layout);
    const source = await p.select({
      message: "Sumber produk",
      options: [
        { value: "bestseller", label: "Bestseller" },
        { value: "flash_sale", label: "Flash Sale" },
        { value: "category", label: "Kategori tertentu" },
        { value: "custom_selection", label: "Custom selection" },
      ],
      initialValue: String(props.source ?? "bestseller"),
    });
    abortOnCancel(source);
    const itemLimit = await p.text({
      message: "Jumlah produk ditampilkan",
      defaultValue: String(props.item_limit ?? 12),
      validate(v) { if (isNaN(Number(v)) || Number(v) < 1) return "Harus angka positif"; },
    });
    abortOnCancel(itemLimit);
    const showViewAll = await p.confirm({ message: "Tampilkan tombol 'Lihat Semua'?", initialValue: Boolean(props.show_view_all) });
    abortOnCancel(showViewAll);
    return { ...section, props: { ...props, title, layout, source, item_limit: Number(itemLimit), show_view_all: showViewAll } };
  }

  if (type === "sticky_top_message") {
    const text = await p.text({ message: "Teks pesan", defaultValue: String(props.text ?? "") });
    abortOnCancel(text);
    const linkLabel = await p.text({ message: "Label link (opsional)", defaultValue: String(props.link_label ?? "") });
    abortOnCancel(linkLabel);
    const linkUrl = await p.text({ message: "URL link (opsional)", defaultValue: String(props.link_url ?? "") });
    abortOnCancel(linkUrl);
    const dismissible = await p.confirm({ message: "Bisa ditutup oleh user?", initialValue: Boolean(props.dismissible ?? true) });
    abortOnCancel(dismissible);
    return { ...section, props: { ...props, text, link_label: linkLabel, link_url: linkUrl, dismissible } };
  }

  if (type === "testimonial") {
    const title = await p.text({ message: "Judul section", defaultValue: String(props.title ?? "Kata Pelanggan") });
    abortOnCancel(title);
    const layout = await p.select({
      message: "Layout",
      options: [{ value: "carousel", label: "Carousel" }, { value: "grid", label: "Grid" }],
      initialValue: String(props.layout ?? "carousel"),
    });
    abortOnCancel(layout);
    return { ...section, props: { ...props, title, layout } };
  }

  if (type === "category_list") {
    const title = await p.text({ message: "Judul section", defaultValue: String(props.title ?? "Kategori") });
    abortOnCancel(title);
    return { ...section, props: { ...props, title } };
  }

  if (type === "promo_banner") {
    const display = await p.select({
      message: "Tampilan promo",
      options: [{ value: "grid", label: "Grid" }, { value: "carousel", label: "Carousel" }],
      initialValue: String(props.display ?? "grid"),
    });
    abortOnCancel(display);

    const currentBanners = getBannerItems(props);
    const count = await p.text({
      message: "Jumlah promo banner",
      defaultValue: String(Math.min(currentBanners.length, 3)),
      validate(v) { if (isNaN(Number(v)) || Number(v) < 1 || Number(v) > 3) return "Isi 1 sampai 3 banner"; },
    });
    abortOnCancel(count);

    const banners: Record<string, unknown>[] = [];
    for (let i = 0; i < Number(count); i += 1) {
      const current = currentBanners[i] ?? {};
      const imageUrl = await p.text({
        message: `Promo ${i + 1} image URL`,
        defaultValue: String(current.image_url ?? ""),
        validate(v) { if (!v?.trim()) return "Image URL wajib diisi"; },
      });
      abortOnCancel(imageUrl);
      const linkUrl = await p.text({ message: `Promo ${i + 1} link URL (opsional)`, defaultValue: String(current.link_url ?? "") });
      abortOnCancel(linkUrl);
      banners.push({ image_url: imageUrl, link_url: linkUrl });
    }

    return { ...section, props: { display, banners, autoplay_ms: props.autoplay_ms ?? 4500 } };
  }

  // trust_badges: edit via JSON langsung (terlalu kompleks untuk form)
  log.warn(`Edit props ${SECTION_LABELS[type]} tidak tersedia via CLI — edit langsung di Supabase Studio.`);
  log.dim(`Props saat ini: ${JSON.stringify(props, null, 2)}`);
  return section;
}

export function registerHomepageUpdate(program: Command) {
  program
    .command("homepage:update")
    .description("Edit sections homepage tenant secara manual")
    .action(async () => {
      p.intro(pc.bold("Vei CLI — Edit Homepage"));

      const slugVal = await p.text({
        message: "Slug tenant",
        placeholder: "wormhole",
        validate(v) { if (!v?.trim()) return "Slug tidak boleh kosong"; },
      });
      abortOnCancel(slugVal);

      const { data: tenant, error: tenantErr } = await supabase
        .from("tenants")
        .select("id, slug, name")
        .eq("slug", slugVal as string)
        .single();

      if (tenantErr || !tenant) {
        log.error(`Tenant '${String(slugVal)}' tidak ditemukan.`);
        process.exit(1);
      }

      const { data: config } = await supabase
        .from("homepage_configs")
        .select("sections, version")
        .eq("tenant_id", tenant.id)
        .single();

      const sections: Section[] = (config?.sections as Section[] | null) ?? [];
      let version = config?.version ?? 0;
      let dirty = false;

      // --- MAIN LOOP ---
      while (true) {
        log.blank();
        console.log(pc.bold(`Homepage — ${tenant.slug}`) + pc.dim(` (v${version})`));

        if (sections.length === 0) {
          log.dim("  (tidak ada section)");
        } else {
          sections.forEach((s, i) => {
            console.log(`  ${pc.dim(String(i + 1).padStart(2, " "))}. ${sectionSummary(s)}`);
          });
        }
        log.blank();

        const action = await p.select({
          message: "Aksi:",
          options: [
            { value: "toggle", label: "Toggle visible/hidden section" },
            { value: "edit", label: "Edit props section" },
            { value: "add", label: "Tambah section baru" },
            { value: "remove", label: "Hapus section" },
            { value: "reorder", label: "Pindah urutan section" },
            { value: "save", label: dirty ? pc.green("Simpan perubahan ✱") : "Simpan perubahan" },
            { value: "discard", label: "Keluar tanpa simpan" },
          ],
        });
        abortOnCancel(action);

        // --- TOGGLE ---
        if (action === "toggle") {
          if (sections.length === 0) { log.warn("Tidak ada section."); continue; }
          const idx = await p.select({
            message: "Section mana?",
            options: sections.map((s, i) => ({ value: String(i), label: sectionSummary(s) })),
          });
          abortOnCancel(idx);
          const i = Number(idx);
          sections[i] = { ...sections[i], visible: !sections[i].visible };
          log.success(`${SECTION_LABELS[sections[i].type]} → ${sections[i].visible ? "visible" : "hidden"}`);
          dirty = true;
        }

        // --- EDIT PROPS ---
        if (action === "edit") {
          if (sections.length === 0) { log.warn("Tidak ada section."); continue; }
          const idx = await p.select({
            message: "Section mana?",
            options: sections.map((s, i) => ({ value: String(i), label: sectionSummary(s) })),
          });
          abortOnCancel(idx);
          const i = Number(idx);
          sections[i] = await editSectionProps(sections[i]);
          dirty = true;
        }

        // --- ADD ---
        if (action === "add") {
          const typeVal = await p.select({
            message: "Tipe section baru:",
            options: (Object.keys(SECTION_LABELS) as SectionType[]).map((t) => ({
              value: t,
              label: SECTION_LABELS[t],
            })),
          });
          abortOnCancel(typeVal);
          const type = typeVal as SectionType;
          const newSection: Section = {
            id: `${type}_${Date.now()}`,
            type,
            visible: true,
            props: { ...SECTION_DEFAULTS[type] },
          };
          const editNow = await p.confirm({ message: "Edit props sekarang?", initialValue: true });
          abortOnCancel(editNow);
          sections.push(editNow ? await editSectionProps(newSection) : newSection);
          log.success(`${SECTION_LABELS[type]} ditambahkan di posisi ${sections.length}.`);
          dirty = true;
        }

        // --- REMOVE ---
        if (action === "remove") {
          if (sections.length === 0) { log.warn("Tidak ada section."); continue; }
          const idx = await p.select({
            message: "Hapus section mana?",
            options: sections.map((s, i) => ({ value: String(i), label: sectionSummary(s) })),
          });
          abortOnCancel(idx);
          const i = Number(idx);
          const removed = sections.splice(i, 1)[0];
          log.success(`${SECTION_LABELS[removed.type]} dihapus.`);
          dirty = true;
        }

        // --- REORDER ---
        if (action === "reorder") {
          if (sections.length < 2) { log.warn("Minimal 2 section untuk diurutkan."); continue; }
          const idx = await p.select({
            message: "Section mana yang ingin dipindah?",
            options: sections.map((s, i) => ({ value: String(i), label: sectionSummary(s) })),
          });
          abortOnCancel(idx);
          const from = Number(idx);

          const targets = sections
            .map((s, i) => ({ value: String(i), label: sectionSummary(s) }))
            .filter((_, i) => i !== from);
          const toVal = await p.select({ message: "Pindah ke posisi (sebelum section ini):", options: targets });
          abortOnCancel(toVal);
          const to = Number(toVal);

          const [moved] = sections.splice(from, 1);
          sections.splice(to, 0, moved);
          log.success(`${SECTION_LABELS[moved.type]} dipindah ke posisi ${to + 1}.`);
          dirty = true;
        }

        // --- SAVE ---
        if (action === "save") {
          const spinner = p.spinner();
          spinner.start("Menyimpan...");
          version += 1;

          const upsertFn = config
            ? supabase.from("homepage_configs").update({ sections, version }).eq("tenant_id", tenant.id)
            : supabase.from("homepage_configs").insert({ tenant_id: tenant.id, sections, version });

          const { error: saveErr } = await upsertFn;
          if (saveErr) {
            spinner.stop("Gagal");
            log.error(`Gagal simpan: ${saveErr.message}`);
          } else {
            spinner.stop("Tersimpan");
            dirty = false;
            p.outro(
              [
                pc.green(`✓ Homepage '${tenant.slug}' disimpan`),
                `  Version: ${version}`,
                `  Preview: ${pc.cyan(`https://${tenant.slug}.vei.store`)}`,
              ].join("\n")
            );
            process.exit(0);
          }
        }

        // --- DISCARD ---
        if (action === "discard") {
          if (dirty) {
            const sure = await p.confirm({ message: "Ada perubahan yang belum disimpan. Yakin keluar?", initialValue: false });
            abortOnCancel(sure);
            if (!sure) continue;
          }
          p.cancel("Keluar tanpa simpan.");
          process.exit(0);
        }
      }
    });
}
