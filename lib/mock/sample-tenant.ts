import type {
  Tenant,
  TenantCMS,
  TenantOriginAddress,
  Product,
  ProductVariant,
} from "@/types/schema-contract";
import type { HomepageConfig } from "@/lib/types/homepage";

export const mockTenant: Tenant = {
  id: "mock-tenant-001",
  slug: "warung-kopi-nusantara",
  name: "Warung Kopi Nusantara",
  is_active: true,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

export const mockCMS: TenantCMS = {
  tenant_id: "mock-tenant-001",
  template_variant: "general",
  logo_url: null,
  favicon_url: null,
  primary_color: "#4F7942",
  tagline: "Kopi Pilihan dari Seluruh Nusantara",
  description:
    "Kami menghadirkan biji kopi terbaik dari Aceh, Toraja, Flores, dan Papua langsung ke meja kamu.",
  whatsapp_number: "6281234567890",
  instagram_handle: "warungkopinusantara",
  email: "hello@warungkopinusantara.com",
  updated_at: "2024-01-01T00:00:00Z",
  font: "Inter",
  payment_info: {
    bank: [
      { name: "BCA", account_number: "1234567890", account_name: "Warung Kopi Nusantara" },
    ],
    qris_image_url: "",
  },
};

export const mockOriginAddress: TenantOriginAddress = {
  tenant_id: "mock-tenant-001",
  biteship_area_id: "IDNP6IDNC60IDND266IDZ12220",
  address: "Jl. Raya Pesanggrahan No. 10",
  district: "Pesanggrahan",
  city: "Jakarta Selatan",
  province: "DKI Jakarta",
  postal_code: "12220",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

const img = (name: string) =>
  `https://placehold.co/800x800/4F7942/ffffff?text=${encodeURIComponent(name)}`;

const baseVariantFields = {
  tenant_id: "mock-tenant-001",
  is_active: true,
  images: [] as string[],
  created_at: "",
  updated_at: "",
};

export const mockProducts: Product[] = [
  {
    id: "prod-001",
    tenant_id: "mock-tenant-001",
    slug: "kopi-gayo-premium",
    name: "Kopi Arabika Gayo Premium",
    description:
      "Biji kopi Arabika dari dataran tinggi Gayo, Aceh. Profil rasa: coklat gelap, karamel, sedikit floral. Medium roast.",
    category: "Arabika",
    images: [
      { url: img("Gayo 1"), alt: "Kopi Gayo Premium 250g" },
      { url: img("Gayo 2"), alt: "Kopi Gayo Premium kemasan" },
    ],
    attr1_name: "Ukuran",
    attr2_name: "Roast",
    attr3_name: "",
    has_variant: true,
    is_active: true,
    display_order: 1,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "prod-002",
    tenant_id: "mock-tenant-001",
    slug: "kopi-toraja-kalosi",
    name: "Kopi Arabika Toraja Kalosi",
    description:
      "Single origin dari Toraja Selatan. Karakteristik earthy, dark chocolate, dan low acidity. Cocok untuk pour over dan french press.",
    category: "Arabika",
    images: [{ url: img("Toraja"), alt: "Kopi Toraja Kalosi" }],
    attr1_name: "Ukuran",
    attr2_name: "Roast",
    attr3_name: "",
    has_variant: true,
    is_active: true,
    display_order: 2,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "prod-003",
    tenant_id: "mock-tenant-001",
    slug: "kopi-flores-bajawa",
    name: "Kopi Arabika Flores Bajawa",
    description:
      "Kopi dari Bajawa, Flores. Rasa buah-buahan tropis, citrus ringan, dan body medium. Natural process.",
    category: "Arabika",
    images: [{ url: img("Flores"), alt: "Kopi Flores Bajawa" }],
    attr1_name: "Ukuran",
    attr2_name: "",
    attr3_name: "",
    has_variant: true,
    is_active: true,
    display_order: 3,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "prod-004",
    tenant_id: "mock-tenant-001",
    slug: "kopi-robusta-lampung",
    name: "Kopi Robusta Lampung",
    description:
      "Robusta terbaik dari Lampung. Rasa bold, pahit yang bersih, cocok untuk espresso dan kopi susu.",
    category: "Robusta",
    images: [{ url: img("Robusta"), alt: "Kopi Robusta Lampung" }],
    attr1_name: "",
    attr2_name: "",
    attr3_name: "",
    has_variant: false,
    is_active: true,
    display_order: 4,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "prod-005",
    tenant_id: "mock-tenant-001",
    slug: "kopi-papua-wamena",
    name: "Kopi Arabika Papua Wamena",
    description:
      "Ditanam di ketinggian 1.800 mdpl, Lembah Baliem. Rasa bersih, jeruk, madu, dan aftertaste panjang.",
    category: "Arabika",
    images: [{ url: img("Papua"), alt: "Kopi Papua Wamena" }],
    attr1_name: "",
    attr2_name: "",
    attr3_name: "",
    has_variant: false,
    is_active: true,
    display_order: 5,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "prod-006",
    tenant_id: "mock-tenant-001",
    slug: "cold-brew-concentrate",
    name: "Cold Brew Concentrate",
    description:
      "Direndam 18 jam, siap encerkan 1:2 dengan air atau susu. Botol 500ml. Simpan di kulkas, habis dalam 7 hari.",
    category: "Ready to Drink",
    images: [{ url: img("Cold Brew"), alt: "Cold Brew Concentrate 500ml" }],
    attr1_name: "",
    attr2_name: "",
    attr3_name: "",
    has_variant: false,
    is_active: true,
    display_order: 6,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "prod-007",
    tenant_id: "mock-tenant-001",
    slug: "drip-bag-sampler",
    name: "Drip Bag Sampler Pack",
    description:
      "Cobain 4 single origin sekaligus: Gayo, Toraja, Flores, Papua. Masing-masing 2 sachet drip bag. Total 8 sachet.",
    category: "Drip Bag",
    images: [{ url: img("Sampler"), alt: "Drip Bag Sampler Pack" }],
    attr1_name: "",
    attr2_name: "",
    attr3_name: "",
    has_variant: false,
    is_active: true,
    display_order: 7,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "prod-008",
    tenant_id: "mock-tenant-001",
    slug: "moka-pot-stovetop",
    name: "Moka Pot Stovetop 3-Cup",
    description:
      "Aluminium food-grade. Bikin espresso-style di rumah tanpa mesin. Kapasitas 3 cup (150ml). Kompatibel kompor gas.",
    category: "Alat Seduh",
    images: [{ url: img("Moka Pot"), alt: "Moka Pot 3 Cup" }],
    attr1_name: "",
    attr2_name: "",
    attr3_name: "",
    has_variant: false,
    is_active: true,
    display_order: 8,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "prod-009",
    tenant_id: "mock-tenant-001",
    slug: "hand-grinder-ceramic",
    name: "Hand Grinder Ceramic Burr",
    description:
      "Burr keramik 38mm, adjustable grind size dari espresso sampai french press. Body stainless steel.",
    category: "Alat Seduh",
    images: [{ url: img("Grinder"), alt: "Hand Grinder Ceramic" }],
    attr1_name: "Warna",
    attr2_name: "",
    attr3_name: "",
    has_variant: true,
    is_active: true,
    display_order: 9,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

export const mockVariants: ProductVariant[] = [
  // prod-001: Kopi Gayo — ukuran x roast
  { id: "var-001-1", product_id: "prod-001", attr1_val: "250g", attr2_val: "Medium Roast", attr3_val: "", price: 95000, available_qty: 30, ...baseVariantFields },
  { id: "var-001-2", product_id: "prod-001", attr1_val: "250g", attr2_val: "Dark Roast",   attr3_val: "", price: 95000, available_qty: 20, ...baseVariantFields },
  { id: "var-001-3", product_id: "prod-001", attr1_val: "500g", attr2_val: "Medium Roast", attr3_val: "", price: 175000, available_qty: 15, ...baseVariantFields },
  { id: "var-001-4", product_id: "prod-001", attr1_val: "500g", attr2_val: "Dark Roast",   attr3_val: "", price: 175000, available_qty: 10, ...baseVariantFields },

  // prod-002: Kopi Toraja — ukuran x roast
  { id: "var-002-1", product_id: "prod-002", attr1_val: "250g", attr2_val: "Light Roast",  attr3_val: "", price: 105000, available_qty: 20, ...baseVariantFields },
  { id: "var-002-2", product_id: "prod-002", attr1_val: "250g", attr2_val: "Medium Roast", attr3_val: "", price: 105000, available_qty: 25, ...baseVariantFields },
  { id: "var-002-3", product_id: "prod-002", attr1_val: "500g", attr2_val: "Medium Roast", attr3_val: "", price: 195000, available_qty: 8, ...baseVariantFields },

  // prod-003: Kopi Flores — ukuran
  { id: "var-003-1", product_id: "prod-003", attr1_val: "200g", attr2_val: "", attr3_val: "", price: 85000,  available_qty: 15, ...baseVariantFields },
  { id: "var-003-2", product_id: "prod-003", attr1_val: "500g", attr2_val: "", attr3_val: "", price: 195000, available_qty: 10, ...baseVariantFields },

  // prod-004: Robusta Lampung — no variant (single variant row)
  { id: "var-004-1", product_id: "prod-004", attr1_val: "", attr2_val: "", attr3_val: "", price: 65000, available_qty: 50, ...baseVariantFields },

  // prod-005: Papua Wamena — no variant
  { id: "var-005-1", product_id: "prod-005", attr1_val: "", attr2_val: "", attr3_val: "", price: 145000, available_qty: 25, ...baseVariantFields },

  // prod-006: Cold Brew — no variant
  { id: "var-006-1", product_id: "prod-006", attr1_val: "", attr2_val: "", attr3_val: "", price: 55000, available_qty: 30, ...baseVariantFields },

  // prod-007: Drip Bag Sampler — no variant
  { id: "var-007-1", product_id: "prod-007", attr1_val: "", attr2_val: "", attr3_val: "", price: 88000, available_qty: 20, ...baseVariantFields },

  // prod-008: Moka Pot — no variant
  { id: "var-008-1", product_id: "prod-008", attr1_val: "", attr2_val: "", attr3_val: "", price: 125000, available_qty: 15, ...baseVariantFields },

  // prod-009: Hand Grinder — warna
  { id: "var-009-1", product_id: "prod-009", attr1_val: "Silver",      attr2_val: "", attr3_val: "", price: 285000, available_qty: 10, ...baseVariantFields },
  { id: "var-009-2", product_id: "prod-009", attr1_val: "Matte Black", attr2_val: "", attr3_val: "", price: 295000, available_qty: 7,  ...baseVariantFields },
];

export const mockHomepageConfig: HomepageConfig = {
  tenant_id: "mock-tenant-001",
  version: 1,
  updated_at: "2026-05-05T00:00:00Z",
  sections: [
    {
      id: "sticky-1",
      type: "sticky_top_message",
      visible: true,
      props: {
        text: "🚚 Gratis ongkir untuk pembelian di atas Rp 150.000!",
        link_url: "/produk",
        link_label: "Belanja Sekarang",
        dismissible: true,
      },
    },
    {
      id: "hero-1",
      type: "hero_banner",
      visible: true,
      props: {
        image_url: "https://placehold.co/1200x500/4F7942/ffffff?text=Warung+Kopi+Nusantara",
        title: "Kopi Pilihan dari Seluruh Nusantara",
        subtitle: "Dari Gayo, Toraja, Flores, hingga Papua — langsung ke meja kamu.",
        cta_label: "Belanja Sekarang",
        cta_url: "/produk",
      },
    },
    {
      id: "trust-1",
      type: "trust_badges",
      visible: true,
      props: {
        badges: [
          { key: "secure_transaction", label: "Transaksi 100% Aman", active: true },
          { key: "free_shipping", label: "Gratis Ongkir >150rb", active: true },
          { key: "money_back", label: "Garansi Uang Kembali", active: true },
          { key: "happy_buyers", label: "Ribuan Pembeli Puas", active: true },
        ],
      },
    },
    {
      id: "category-1",
      type: "category_list",
      visible: true,
      props: {
        title: "Kategori Produk",
        categories: [
          { name: "Arabika", slug: "arabika" },
          { name: "Robusta", slug: "robusta" },
          { name: "Ready to Drink", slug: "ready-to-drink" },
          { name: "Drip Bag", slug: "drip-bag" },
          { name: "Alat Seduh", slug: "alat-seduh" },
        ],
      },
    },
    {
      id: "products-bestseller",
      type: "product_list",
      visible: true,
      props: {
        title: "Produk Terlaris",
        layout: "card",
        source: "bestseller",
        item_limit: 8,
        show_view_all: true,
      },
    },
    {
      id: "promo-1",
      type: "promo_banner",
      visible: true,
      props: {
        banners: [
          {
            image_url: "https://placehold.co/600x300/795548/ffffff?text=Single+Origin+Series",
            link_url: "/kategori/arabika",
          },
          {
            image_url: "https://placehold.co/600x300/37474F/ffffff?text=Alat+Seduh+Pilihan",
            link_url: "/kategori/alat-seduh",
          },
        ],
      },
    },
    {
      id: "products-alat-seduh",
      type: "product_list",
      visible: true,
      props: {
        title: "Alat Seduh",
        layout: "full_image",
        source: "category",
        source_param: "Alat Seduh",
        item_limit: 4,
        show_view_all: false,
      },
    },
    {
      id: "testimonial-1",
      type: "testimonial",
      visible: true,
      props: {
        title: "💬 Kata Pembeli Kami",
        layout: "grid",
        items: [
          { text: "Kopinya enak banget, aroma Gayo-nya kerasa banget. Bakal repeat order!", author: "Siti R.", rating: 5 },
          { text: "Pengiriman cepat, packaging rapi. Hand grinder-nya build quality oke.", author: "Budi S.", rating: 5 },
          { text: "Cold brew concentrate-nya worth it banget, bisa buat banyak gelas.", author: "Ani W.", rating: 4 },
          { text: "Drip bag sampler cocok banget buat nyobain semua single origin.", author: "Eko P.", rating: 5 },
        ],
      },
    },
  ],
};
