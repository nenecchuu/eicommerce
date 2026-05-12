"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2, Search } from "lucide-react";
import { getCartStore } from "@/lib/cart/store";
import { formatRupiah } from "@/lib/utils/price";
import { useTenantSlug } from "@/lib/hooks/useTenantSlug";
import { useFontScale } from "@/lib/context/font-scale-context";
import type { TenantWithCMS, BiteshipArea } from "@/types/schema-contract";

interface Form {
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}

interface FormErrors extends Partial<Form> {
  area?: string;
  shipping?: string;
}

interface ShippingService {
  courier_code: string;
  courier_service_code: string;
  courier_name: string;
  service: string;
  description: string;
  price: number;
  etd: string;
}

interface ShippingResponse {
  success: boolean;
  services?: ShippingService[];
  error?: string;
  cached?: boolean;
  warning?: string;
}

type PaymentMethod = "bank_transfer" | "qris";

export default function CheckoutPage() {
  const fs = useFontScale();
  const router = useRouter();
  const slug = useTenantSlug();

  const useCart = getCartStore(slug ?? "");
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal());
  const clearCart = useCart((s) => s.clearCart);

  const [form, setForm] = useState<Form>({ name: "", phone: "", email: "", address: "", notes: "" });
  const [errors, setErrors] = useState<FormErrors>({});

  // Area search
  const [areaQuery, setAreaQuery] = useState("");
  const [areaResults, setAreaResults] = useState<BiteshipArea[]>([]);
  const [areaLoading, setAreaLoading] = useState(false);
  const [selectedArea, setSelectedArea] = useState<BiteshipArea | null>(null);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const areaDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const areaRef = useRef<HTMLDivElement>(null);

  // Shipping
  const [shippingOptions, setShippingOptions] = useState<ShippingService[] | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<ShippingService | null>(null);
  const [loadingShipping, setLoadingShipping] = useState(false);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank_transfer");
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [tenant, setTenant] = useState<TenantWithCMS | null>(null);

  const total = subtotal + (selectedShipping?.price ?? 0);

  useEffect(() => {
    async function fetchTenant() {
      try {
        const hostname = typeof window !== "undefined" ? window.location.hostname : "";
        const res = await fetch("/api/tenant", { headers: { "x-tenant-host": hostname } });
        const data = await res.json();
        if (data.success) setTenant(data.data);
      } catch (e) {
        console.error("[Checkout] Failed to fetch tenant:", e);
      }
    }
    fetchTenant();
  }, []);

  // Close area dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (areaRef.current && !areaRef.current.contains(e.target as Node)) {
        setShowAreaDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const searchArea = (q: string) => {
    setAreaQuery(q);
    setSelectedArea(null);
    setShippingOptions(null);
    setSelectedShipping(null);
    if (areaDebounce.current) clearTimeout(areaDebounce.current);
    if (q.trim().length < 2) { setAreaResults([]); setShowAreaDropdown(false); return; }
    areaDebounce.current = setTimeout(async () => {
      setAreaLoading(true);
      try {
        const res = await fetch(`/api/biteship/areas?input=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (data.success) {
          setAreaResults(data.areas ?? []);
          setShowAreaDropdown(true);
        }
      } catch (e) {
        console.error("[Checkout] Area search error:", e);
      } finally {
        setAreaLoading(false);
      }
    }, 400);
  };

  const selectArea = (area: BiteshipArea) => {
    setSelectedArea(area);
    setAreaQuery(area.name);
    setShowAreaDropdown(false);
    setAreaResults([]);
  };

  const fetchShippingRates = async () => {
    if (!selectedArea || !tenant?.origin_address) return;
    setLoadingShipping(true);
    try {
      const weightGram = Math.max(1, items.reduce((sum, i) => sum + i.quantity * 500, 0));
      const res = await fetch("/api/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin_area_id: tenant.origin_address.biteship_area_id,
          destination_area_id: selectedArea.biteship_area_id,
          weight: weightGram,
        }),
      });
      const data: ShippingResponse = await res.json();
      if (data.warning) console.warn("[Checkout]", data.warning);
      setShippingOptions(data.services ?? null);
      if (data.services?.length && !selectedShipping) {
        setSelectedShipping(data.services[0]);
      }
    } catch (e) {
      console.error("[Checkout] Shipping fetch error:", e);
    } finally {
      setLoadingShipping(false);
    }
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = "Nama wajib diisi";
    if (!form.phone.trim()) e.phone = "Nomor HP wajib diisi";
    else if (!/^[0-9+]{8,15}$/.test(form.phone.replace(/\s/g, ""))) e.phone = "Nomor HP tidak valid";
    if (!form.address.trim()) e.address = "Alamat lengkap wajib diisi";
    if (!selectedArea) e.area = "Pilih kecamatan tujuan";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    if (!selectedShipping) { setErrors((prev) => ({ ...prev, shipping: "Pilih layanan pengiriman" })); return; }

    setLoadingSubmit(true);
    try {
      const shippingAddress = `${form.address}\n${selectedArea!.district}, ${selectedArea!.city}, ${selectedArea!.province} ${selectedArea!.postal_code}`;
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: form.name,
          customer_phone: form.phone,
          customer_email: form.email || "",
          shipping_address: shippingAddress,
          shipping_courier: selectedShipping.courier_code,
          shipping_service: selectedShipping.courier_service_code,
          shipping_cost: selectedShipping.price,
          payment_method: paymentMethod,
          notes: form.notes,
          items,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) { alert(data.error || "Gagal membuat pesanan."); return; }
      clearCart();
      router.push(`/checkout/sukses?order=${data.order_id}&method=${paymentMethod}`);
    } catch (err) {
      console.error("[Checkout] Submit error:", err);
      alert("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (!slug) { router.replace("/"); return null; }
  if (items.length === 0) { router.replace("/keranjang"); return null; }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <button
        onClick={() => router.back()}
        className={`flex items-center gap-1 ${fs.body} text-gray-500 hover:text-gray-800 mb-5 transition-colors`}
      >
        <ChevronLeft size={16} />
        Kembali ke Keranjang
      </button>

      <h1 className={`${fs.pageTitle} text-gray-900 mb-6`}>Checkout</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Data diri */}
        <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className={`${fs.sectionHeading} text-gray-800 mb-4`}>Data Penerima</h2>

          <Field label="Nama Lengkap" required error={errors.name}>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Contoh: Budi Santoso"
              className={`${inputClass(!!errors.name)} ${fs.body}`}
            />
          </Field>

          <Field label="Nomor HP / WhatsApp" required error={errors.phone}>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="0812xxxxxxxx"
              className={`${inputClass(!!errors.phone)} ${fs.body}`}
            />
          </Field>

          <Field label="Email (opsional)">
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="email@contoh.com"
              className={`${inputClass(false)} ${fs.body}`}
            />
          </Field>

          {/* Area search */}
          <Field label="Kecamatan / Kota Tujuan" required error={errors.area}>
            <div className="relative" ref={areaRef}>
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={areaQuery}
                  onChange={(e) => searchArea(e.target.value)}
                  onFocus={() => areaResults.length > 0 && setShowAreaDropdown(true)}
                  placeholder="Ketik nama kecamatan atau kota..."
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl border ${fs.body} outline-none transition-colors ${
                    errors.area
                      ? "border-red-400 focus:border-red-500 bg-red-50"
                      : "border-gray-200 focus:border-[var(--tenant-primary)] bg-white"
                  }`}
                />
                {areaLoading && (
                  <Loader2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400" />
                )}
              </div>

              {showAreaDropdown && areaResults.length > 0 && (
                <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {areaResults.map((area) => (
                    <li key={area.biteship_area_id}>
                      <button
                        type="button"
                        onClick={() => selectArea(area)}
                        className={`w-full text-left px-4 py-3 ${fs.body} hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0`}
                      >
                        <p className="font-medium text-gray-800">{area.district}</p>
                        <p className={`${fs.meta} text-gray-500`}>{area.city}, {area.province} {area.postal_code}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {showAreaDropdown && !areaLoading && areaResults.length === 0 && areaQuery.length >= 2 && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3">
                  <p className={`${fs.body} text-gray-500`}>Area tidak ditemukan</p>
                </div>
              )}
            </div>
          </Field>

          <Field label="Alamat Lengkap" required error={errors.address}>
            <textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Nama Jalan, No. Rumah, RT/RW, Kelurahan"
              rows={3}
              className={`w-full px-4 py-2.5 rounded-xl border ${fs.body} outline-none transition-colors resize-none ${
                errors.address
                  ? "border-red-400 focus:border-red-500 bg-red-50"
                  : "border-gray-200 focus:border-[var(--tenant-primary)] bg-white"
              }`}
            />
            {errors.address && <p className={`${fs.meta} text-red-500`}>{errors.address}</p>}
          </Field>

          <Field label="Catatan (opsional)">
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Pesan untuk penjual..."
              className={`${inputClass(false)} ${fs.body}`}
            />
          </Field>
        </section>

        {/* Metode Pembayaran */}
        <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 className={`${fs.sectionHeading} text-gray-800 mb-4`}>Metode Pembayaran</h2>
          <div className="space-y-3">
            <label className={radioClass(paymentMethod === "bank_transfer")}>
              <input type="radio" name="payment_method" value="bank_transfer" checked={paymentMethod === "bank_transfer"} onChange={() => setPaymentMethod("bank_transfer")} className="accent-blue-500" />
              <div>
                <p className={`${fs.body} font-semibold text-gray-900`}>Transfer Bank</p>
                <p className={`${fs.meta} text-gray-500`}>Bayar ke rekening bank</p>
              </div>
            </label>
            {tenant?.cms.payment_info?.qris_image_url && (
              <label className={radioClass(paymentMethod === "qris")}>
                <input type="radio" name="payment_method" value="qris" checked={paymentMethod === "qris"} onChange={() => setPaymentMethod("qris")} className="accent-blue-500" />
                <div>
                  <p className={`${fs.body} font-semibold text-gray-900`}>QRIS</p>
                  <p className={`${fs.meta} text-gray-500`}>Scan QR untuk bayar</p>
                </div>
              </label>
            )}
          </div>
          <p className={`${fs.meta} text-gray-400 mt-3`}>Informasi pembayaran lengkap muncul setelah pesanan dibuat.</p>
        </section>

        {/* Pengiriman */}
        <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className={`${fs.sectionHeading} text-gray-800`}>Pilih Pengiriman</h2>

          {!tenant?.origin_address && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className={`${fs.body} text-yellow-700`}>Toko belum mengatur alamat pengiriman. Hubungi penjual.</p>
            </div>
          )}

          {tenant?.origin_address && !selectedArea && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className={`${fs.body} text-blue-700`}>Pilih kecamatan tujuan untuk melihat opsi pengiriman</p>
            </div>
          )}

          {tenant?.origin_address && selectedArea && !shippingOptions && !loadingShipping && (
            <button
              type="button"
              onClick={fetchShippingRates}
              className={`w-full py-3 rounded-xl border-2 border-dashed border-gray-300 ${fs.body} text-gray-500 hover:border-[var(--tenant-primary)] hover:text-[var(--tenant-primary)] transition-colors`}
            >
              Cek ongkir ke {selectedArea.district}, {selectedArea.city}
            </button>
          )}

          {loadingShipping && (
            <div className="flex items-center justify-center py-8 gap-2">
              <Loader2 size={20} className="animate-spin text-[var(--tenant-primary)]" />
              <p className={`${fs.body} text-gray-500`}>Menghitung ongkir...</p>
            </div>
          )}

          {shippingOptions && shippingOptions.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <p className={`${fs.body} text-yellow-700`}>Tidak ada layanan pengiriman tersedia untuk area ini</p>
            </div>
          )}

          {shippingOptions && shippingOptions.length > 0 && (
            <div className="space-y-2">
              {shippingOptions.map((opt) => {
                const key = `${opt.courier_code}::${opt.courier_service_code}`;
                const active = selectedShipping?.courier_code === opt.courier_code && selectedShipping?.courier_service_code === opt.courier_service_code;
                return (
                  <label key={key} className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    active ? "border-[var(--tenant-primary)] bg-[var(--tenant-primary-tint)]" : "border-gray-100 hover:border-gray-200"
                  }`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        value={key}
                        checked={active}
                        onChange={() => setSelectedShipping(opt)}
                        className="accent-[var(--tenant-primary)]"
                      />
                      <div>
                        <p className={`${fs.body} font-medium text-gray-700`}>{opt.courier_name} {opt.service}</p>
                        <p className={`${fs.meta} text-gray-500`}>{opt.etd}</p>
                      </div>
                    </div>
                    <span className={`${fs.body} font-semibold text-gray-800`}>{formatRupiah(opt.price)}</span>
                  </label>
                );
              })}
            </div>
          )}

          {errors.shipping && <p className={`${fs.meta} text-red-500 mt-2`}>{errors.shipping}</p>}
        </section>

        {/* Ringkasan */}
        <section className={`bg-gray-50 rounded-2xl p-6 space-y-2 ${fs.body}`}>
          <h2 className={`${fs.sectionHeading} text-gray-800 mb-3`}>Ringkasan Pesanan</h2>
          {items.map((item) => (
            <div key={`${item.product_id}::${item.variant_id}`} className="flex justify-between text-gray-600 py-1">
              <span className="line-clamp-1 flex-1 pr-2">
                {item.product_name}{item.variant_label ? ` (${item.variant_label})` : ""} ×{item.quantity}
              </span>
              <span className="flex-shrink-0 font-medium">{formatRupiah(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="border-t border-gray-200 pt-2 space-y-1.5">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>{formatRupiah(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Ongkir {selectedShipping ? `${selectedShipping.courier_name} ${selectedShipping.service}` : "-"}</span>
              <span>{selectedShipping ? formatRupiah(selectedShipping.price) : "-"}</span>
            </div>
            <div className={`flex justify-between font-bold text-gray-900 ${fs.price} pt-2`}>
              <span>Total</span>
              <span className="text-[var(--tenant-primary)]">{formatRupiah(total)}</span>
            </div>
          </div>
        </section>

        <button
          type="submit"
          disabled={loadingSubmit || !selectedShipping}
          className={`w-full flex items-center justify-center gap-2 bg-[var(--tenant-primary)] text-[var(--tenant-primary-contrast)] font-bold py-4 rounded-xl shadow-md hover:opacity-90 transition-opacity disabled:opacity-60 ${fs.body}`}
        >
          {loadingSubmit ? (
            <><Loader2 size={18} className="animate-spin" />Memproses Pesanan...</>
          ) : (
            `Buat Pesanan — ${formatRupiah(total)}`
          )}
        </button>
      </form>
    </div>
  );
}

function inputClass(hasError: boolean) {
  return `w-full px-4 py-2.5 rounded-xl border outline-none transition-colors ${
    hasError
      ? "border-red-400 focus:border-red-500 bg-red-50"
      : "border-gray-200 focus:border-[var(--tenant-primary)] bg-white"
  }`;
}

function radioClass(active: boolean) {
  return `flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
    active ? "border-blue-500 bg-blue-50" : "border-gray-100 hover:border-gray-200"
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
  const fs = useFontScale();
  return (
    <div className="space-y-1">
      <label className={`${fs.label} text-gray-600 block`}>
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className={`${fs.meta} text-red-500`}>{error}</p>}
    </div>
  );
}
