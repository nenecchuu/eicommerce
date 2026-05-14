// Source of truth until Supabase auto-gen types are set up.
// Reflects actual Supabase schema as of migration add_tenant_demo_flag (2026-05-13).

export interface TenantOriginAddress {
  tenant_id: string;
  biteship_area_id: string;
  address: string;
  district: string;
  city: string;
  province: string;
  postal_code: string;
  created_at: string;
  updated_at: string;
}

// Shape returned by /api/biteship/areas
export interface BiteshipArea {
  biteship_area_id: string;
  name: string;
  district: string;
  city: string;
  province: string;
  postal_code: string;
}

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  is_active: boolean;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface BankAccount {
  name: string;           // e.g. "BCA"
  account_number: string;
  account_name: string;
}

export interface PaymentInfo {
  bank: BankAccount[];
  qris_image_url: string;
}

export interface TenantCMS {
  tenant_id: string;
  template_variant: "general" | "fashion";
  logo_url: string | null;
  favicon_url: string | null;
  primary_color: string; // hex e.g. "#3B82F6"
  tagline: string | null;
  description: string | null;
  whatsapp_number: string | null; // e.g. "6281234567890"
  instagram_handle: string | null;
  email: string | null;
  updated_at: string;
  payment_info: PaymentInfo;
  font: string;
  font_size: "regular" | "large" | "xl";
  meta_pixel_id: string | null;
  google_tag_manager_id: string | null;
}

export interface ProductImage {
  url: string;
  alt: string;
}

export interface Product {
  id: string;
  tenant_id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string | null;
  images: ProductImage[];
  attr1_name: string;
  attr2_name: string;
  attr3_name: string;
  has_variant: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  tenant_id: string;
  product_id: string;
  attr1_val: string;
  attr2_val: string;
  attr3_val: string;
  price: number;
  available_qty: number;
  is_active: boolean;
  images: string[];
  created_at: string;
  updated_at: string;
}

export interface ProductWithVariants extends Product {
  variants: ProductVariant[];
}

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "shipped"
  | "completed"
  | "cancelled";

export type PaymentMethod = "bank_transfer" | "qris";

export interface Order {
  id: string;
  order_number: string | null;
  tenant_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  shipping_address: string;
  shipping_courier: string;
  shipping_service: string;
  shipping_cost: number;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  notes: string | null;
  status: number; // legacy smallint, baca via status_text
  status_text: OrderStatus;
  payment_method: PaymentMethod | "";
  payment_proof_url: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  tenant_id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  product_name: string;
  variant_label: string;
  price: number;
  quantity: number;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  created_at: string;
}

// Joined type used in tenant layout
export interface TenantWithCMS extends Tenant {
  cms: TenantCMS;
  origin_address: TenantOriginAddress | null;
}

// Cart types
export interface CartItem {
  product_id: string;
  variant_id: string | null;
  product_name: string;
  variant_label: string | null;
  price: number;
  quantity: number;
  image_url: string | null;
  slug: string;
}

export type ShippingOption = {
  courier: string;
  service: string;
  label: string;
  cost: number;
};

export const SHIPPING_OPTIONS: ShippingOption[] = [
  { courier: "JNE", service: "REG", label: "JNE Reguler", cost: 15000 },
  { courier: "J&T", service: "EZ", label: "J&T Express", cost: 13000 },
  { courier: "GoSend", service: "SAME_DAY", label: "GoSend Same Day", cost: 20000 },
];
