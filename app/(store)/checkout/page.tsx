"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2 } from "lucide-react";
import { getCartStore } from "@/lib/cart/store";
import { formatRupiah } from "@/lib/utils/price";
import { SHIPPING_OPTIONS } from "@/types/schema-contract";
import { createOrder } from "@/lib/queries/createOrder";
import { useTenantSlug } from "@/lib/hooks/useTenantSlug";

interface Form {
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const slug = useTenantSlug();

  if (!slug) {
    router.replace("/");
    return null;
  }

  const useCart = getCartStore(slug);
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal());
  const clearCart = useCart((s) => s.clearCart);

  const [form, setForm] = useState<Form>({
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });
  const [courier, setCourier] = useState(SHIPPING_OPTIONS[0].courier);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Form>>({});

  const selectedShipping = SHIPPING_OPTIONS.find((o) => o.courier === courier)!;
  const total = subtotal + selectedShipping.cost;

  const validate = (): boolean => {
    const e: Partial<Form> = {};
    if (!form.name.trim()) e.name = "Nama wajib diisi";
    if (!form.phone.trim()) e.phone = "Nomor HP wajib diisi";
    else if (!/^[0-9+]{8,15}$/.test(form.phone.replace(/\s/g, "")))
      e.phone = "Nomor HP tidak valid";
    if (!form.address.trim()) e.address = "Alamat wajib diisi";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Need tenant_id — fetch from client-side via a known slug
    // We pass a special marker; createOrder will resolve it
    setLoading(true);
    try {
      // Resolve tenant_id: use slug-based lookup via server action workaround
      // For now we embed slug as tenant_id placeholder and let createOrder handle mock
      const { orderId } = await createOrder({
        tenant_id: slug, // replaced by actual ID in real mode via server action
        customer_name: form.name,
        customer_phone: form.phone,
        customer_email: form.email,
        shipping_address: form.address,
        shipping_courier: selectedShipping.courier,
        shipping_service: selectedShipping.service,
        shipping_cost: selectedShipping.cost,
        payment_method: "bank_transfer",
        notes: form.notes,
        items,
      });
      clearCart();
      router.push(`/checkout/sukses?order=${orderId}`);
    } catch {
      alert("Gagal membuat order. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    router.replace("/keranjang");
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors"
      >
        <ChevronLeft size={16} />
        Kembali ke Keranjang
      </button>

      <h1 className="text-lg font-bold text-gray-900 mb-6">Checkout</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Data diri */}
        <section className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-800">Data Penerima</h2>

          <Field
            label="Nama Lengkap"
            required
            error={errors.name}
          >
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Contoh: Budi Santoso"
              className={inputClass(!!errors.name)}
            />
          </Field>

          <Field label="Nomor HP / WhatsApp" required error={errors.phone}>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="0812xxxxxxxx"
              className={inputClass(!!errors.phone)}
            />
          </Field>

          <Field label="Email (opsional)">
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="email@contoh.com"
              className={inputClass(false)}
            />
          </Field>

          <Field label="Alamat Lengkap" required error={errors.address}>
            <textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Jalan, No. Rumah, Kelurahan, Kecamatan, Kota, Provinsi, Kode Pos"
              rows={3}
              className={`${inputClass(!!errors.address)} resize-none`}
            />
          </Field>

          <Field label="Catatan (opsional)">
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Pesan untuk penjual..."
              className={inputClass(false)}
            />
          </Field>
        </section>

        {/* Pengiriman */}
        <section className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-gray-800">Pilih Pengiriman</h2>
          <div className="space-y-2">
            {SHIPPING_OPTIONS.map((opt) => (
              <label
                key={opt.courier}
                className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                  courier === opt.courier
                    ? "border-[var(--tenant-primary)] bg-[var(--tenant-primary-tint)]"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="courier"
                    value={opt.courier}
                    checked={courier === opt.courier}
                    onChange={() => setCourier(opt.courier)}
                    className="accent-[var(--tenant-primary)]"
                  />
                  <span className="text-sm font-medium text-gray-700">{opt.label}</span>
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  {formatRupiah(opt.cost)}
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* Ringkasan */}
        <section className="bg-gray-50 rounded-2xl p-4 space-y-2 text-sm">
          <h2 className="text-sm font-bold text-gray-800 mb-3">Ringkasan Pesanan</h2>
          {items.map((item) => (
            <div
              key={`${item.product_id}::${item.variant_id}`}
              className="flex justify-between text-gray-600"
            >
              <span className="line-clamp-1 flex-1 pr-2">
                {item.product_name}
                {item.variant_label ? ` (${item.variant_label})` : ""} ×{item.quantity}
              </span>
              <span className="flex-shrink-0 font-medium">
                {formatRupiah(item.price * item.quantity)}
              </span>
            </div>
          ))}
          <div className="border-t border-gray-200 pt-2 space-y-1.5">
            <div className="flex justify-between text-gray-500">
              <span>Ongkir ({selectedShipping.label})</span>
              <span>{formatRupiah(selectedShipping.cost)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-base">
              <span>Total</span>
              <span className="text-[var(--tenant-primary)]">{formatRupiah(total)}</span>
            </div>
          </div>
        </section>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-[var(--tenant-primary)] text-[var(--tenant-primary-contrast)] font-bold py-4 rounded-xl shadow-md hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Memproses...
            </>
          ) : (
            `Pesan Sekarang — ${formatRupiah(total)}`
          )}
        </button>
      </form>
    </div>
  );
}

function inputClass(hasError: boolean) {
  return `w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors ${
    hasError
      ? "border-red-400 focus:border-red-500 bg-red-50"
      : "border-gray-200 focus:border-[var(--tenant-primary)] bg-white"
  }`;
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-gray-600">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
