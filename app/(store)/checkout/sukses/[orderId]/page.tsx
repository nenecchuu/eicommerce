"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  Home,
  Loader2,
  MapPin,
  MessageCircle,
  Package,
  ReceiptText,
  Truck,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils/price";
import { getOrderDisplayId } from "@/lib/utils/order";
import type { OrderWithItems } from "@/lib/queries/orderTypes";
import type { TenantWithCMS } from "@/types/schema-contract";

type PaymentMethod = "bank_transfer" | "qris" | "";

interface OrderResponse {
  success?: boolean;
  data?: OrderWithItems;
  error?: string;
}

interface TenantResponse {
  success?: boolean;
  data?: TenantWithCMS;
  error?: string;
}

const paymentMethodLabels: Record<PaymentMethod, string> = {
  bank_transfer: "Transfer Bank",
  qris: "QRIS",
  "": "-",
};

const statusLabels: Record<string, string> = {
  pending_payment: "Menunggu Pembayaran",
  paid: "Sudah Dibayar",
  shipped: "Dikirim",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

export default function CheckoutSuccessPage() {
  const params = useParams<{ orderId: string }>();
  const router = useRouter();
  const orderId = params.orderId;

  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [tenant, setTenant] = useState<TenantWithCMS | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const [orderRes, tenantRes] = await Promise.all([
          fetch(`/api/orders/${encodeURIComponent(orderId)}`),
          fetch("/api/tenant"),
        ]);

        const orderData: OrderResponse = await orderRes.json();
        const tenantData: TenantResponse = await tenantRes.json();

        if (!active) return;

        if (!orderRes.ok || !orderData.success || !orderData.data) {
          setError(orderData.error || "Pesanan tidak ditemukan.");
          return;
        }

        setOrder(orderData.data);
        if (tenantRes.ok && tenantData.success && tenantData.data) {
          setTenant(tenantData.data);
        }
      } catch (err) {
        console.error("[CheckoutSuccess] Failed to fetch order:", err);
        if (active) setError("Gagal memuat pesanan. Silakan coba lagi.");
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchData();

    return () => {
      active = false;
    };
  }, [orderId]);

  const orderDisplayId = order ? getOrderDisplayId(order) : orderId;
  const createdAt = order
    ? new Date(order.created_at).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const whatsappUrl = useMemo(() => {
    const rawNumber = tenant?.cms.whatsapp_number?.replace(/\D/g, "");
    if (!rawNumber || !order) return null;

    const number = rawNumber.startsWith("0") ? `62${rawNumber.slice(1)}` : rawNumber;
    const message = [
      `Halo, saya ingin konfirmasi pesanan #${orderDisplayId}.`,
      `Total pembayaran: ${formatRupiah(order.total_amount)}.`,
      `Nomor pesanan: ${orderDisplayId}`,
    ].join("\n");

    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  }, [order, orderDisplayId, tenant]);

  const copyText = async (key: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 flex flex-col items-center gap-3 text-gray-500">
        <Loader2 className="animate-spin text-[var(--tenant-primary)]" size={28} />
        <p className="text-sm">Memuat detail pesanan...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="text-red-600" size={26} />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Pesanan Tidak Ditemukan</h1>
        <p className="text-sm text-gray-500 mb-6">{error}</p>
        <button
          onClick={() => router.push("/")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--tenant-primary)] px-5 py-3 text-sm font-semibold text-[var(--tenant-primary-contrast)] transition-opacity hover:opacity-90"
        >
          <Home size={17} />
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  const bankAccounts = tenant?.cms.payment_info?.bank ?? [];
  const isBankTransfer = order.payment_method === "bank_transfer";
  const isQris = order.payment_method === "qris";
  const paymentSection = (
    <section className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm mb-6">
      <div className="flex items-center gap-2 mb-5">
        <CreditCard size={20} className="text-[var(--tenant-primary)]" />
        <h2 className="text-lg font-bold text-gray-900">Pembayaran</h2>
      </div>

      {isBankTransfer && bankAccounts.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {bankAccounts.map((account, idx) => {
            const copyKey = `bank-${idx}`;
            return (
              <div key={`${account.name}-${account.account_number}`} className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{account.name}</p>
                    <p className="text-sm font-mono text-gray-800 mt-1">{account.account_number}</p>
                    <p className="text-xs text-gray-500 mt-1">a.n {account.account_name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyText(copyKey, account.account_number)}
                    className="inline-flex size-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                    title="Salin nomor rekening"
                  >
                    {copied === copyKey ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isQris && tenant?.cms.payment_info?.qris_image_url && (
        <div className="rounded-xl border border-gray-200 p-4 text-center">
          <img
            src={tenant.cms.payment_info.qris_image_url}
            alt="QRIS pembayaran"
            className="mx-auto h-56 w-56 rounded-lg object-contain"
          />
          <p className="text-sm text-gray-600 mt-4">Scan QRIS sesuai nominal pembayaran.</p>
        </div>
      )}

      {((isBankTransfer && bankAccounts.length === 0) || (isQris && !tenant?.cms.payment_info?.qris_image_url)) && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm text-yellow-800">
            Informasi pembayaran belum tersedia. Hubungi CS untuk mendapatkan instruksi pembayaran.
          </p>
        </div>
      )}
    </section>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      <div className="flex flex-col items-center text-center gap-4 mb-8">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle2 size={38} className="text-green-600" />
          </div>
          <span className="absolute inset-0 rounded-full animate-ping bg-green-200 opacity-30" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pesanan Berhasil Dibuat</h1>
          <p className="text-sm text-gray-500 mt-2">
            Simpan nomor pesanan dan selesaikan pembayaran sesuai nominal berikut.
          </p>
        </div>
      </div>

      {paymentSection}

      <section className="bg-gray-950 text-white rounded-2xl p-5 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
              Total yang harus dibayar
            </p>
            <p className="text-3xl font-bold">{formatRupiah(order.total_amount)}</p>
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                Nomor Pesanan
              </p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-bold text-white break-all">
                  {orderDisplayId}
                </span>
                <button
                  type="button"
                  onClick={() => copyText("hero-order", orderDisplayId)}
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-gray-200 transition-colors hover:bg-white/20 hover:text-white"
                  title="Salin nomor pesanan"
                >
                  {copied === "hero-order" ? <Check size={15} className="text-green-300" /> : <Copy size={15} />}
                </button>
              </div>
            </div>
          </div>

          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-green-500 px-5 py-3.5 text-sm font-bold text-white transition-colors hover:bg-green-600"
            >
              <MessageCircle size={18} />
              Hubungi CS via WhatsApp
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gray-700 px-5 py-3.5 text-sm font-bold text-gray-300"
            >
              <MessageCircle size={18} />
              WhatsApp Belum Tersedia
            </button>
          )}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <section className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <ReceiptText size={20} className="text-[var(--tenant-primary)]" />
              <h2 className="text-lg font-bold text-gray-900">Detail Order</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <InfoItem label="Nomor Pesanan">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-sm break-all">{orderDisplayId}</span>
                  <button
                    type="button"
                    onClick={() => copyText("order", orderDisplayId)}
                    className="shrink-0 text-gray-400 hover:text-gray-700"
                    title="Salin nomor pesanan"
                  >
                    {copied === "order" ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                  </button>
                </div>
              </InfoItem>
              <InfoItem label="Tanggal Order">{createdAt}</InfoItem>
              <InfoItem label="Status">{statusLabels[order.status_text] ?? order.status_text}</InfoItem>
              <InfoItem label="Metode Pembayaran">
                {paymentMethodLabels[order.payment_method as PaymentMethod] ?? order.payment_method}
              </InfoItem>
              <InfoItem label="Nama Penerima">{order.customer_name}</InfoItem>
              <InfoItem label="No. WhatsApp">{order.customer_phone}</InfoItem>
            </div>
          </section>

          <section className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Package size={20} className="text-[var(--tenant-primary)]" />
              <h2 className="text-lg font-bold text-gray-900">Item Pesanan</h2>
            </div>

            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{item.product_name}</p>
                    {item.variant_label && <p className="text-xs text-gray-500 mt-0.5">{item.variant_label}</p>}
                    <p className="text-xs text-gray-400 mt-1">{item.quantity} x {formatRupiah(item.price)}</p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-gray-900">{formatRupiah(item.total)}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Truck size={20} className="text-[var(--tenant-primary)]" />
              <h2 className="text-lg font-bold text-gray-900">Pengiriman</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Alamat Pengiriman</p>
                  <p className="text-sm text-gray-800 whitespace-pre-line">{order.shipping_address}</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <InfoItem label="Kurir">{order.shipping_courier} {order.shipping_service}</InfoItem>
                <InfoItem label="Ongkir">{formatRupiah(order.shipping_cost)}</InfoItem>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-gray-50 rounded-2xl p-5 sm:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Ringkasan Nominal</h2>
            <div className="space-y-3 text-sm">
              <SummaryRow label="Subtotal" value={formatRupiah(order.subtotal)} />
              {order.discount_amount > 0 && (
                <SummaryRow label="Diskon" value={`-${formatRupiah(order.discount_amount)}`} valueClassName="text-green-600" />
              )}
              {order.tax_amount > 0 && <SummaryRow label="Pajak" value={formatRupiah(order.tax_amount)} />}
              <SummaryRow label="Pengiriman" value={formatRupiah(order.shipping_cost)} />
              <div className="flex justify-between gap-4 border-t border-gray-200 pt-4 font-bold text-gray-900">
                <span>Total Bayar</span>
                <span className="text-lg text-[var(--tenant-primary)]">{formatRupiah(order.total_amount)}</span>
              </div>
            </div>
          </section>

          <div className="grid gap-3">
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 px-5 py-3.5 text-sm font-bold text-white transition-colors hover:bg-green-600"
              >
                <MessageCircle size={18} />
                Hubungi CS via WhatsApp
              </a>
            )}
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Home size={17} />
              Belanja Lagi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <div className="text-sm font-medium text-gray-900">{children}</div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  valueClassName = "text-gray-900",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-600">{label}</span>
      <span className={`font-medium ${valueClassName}`}>{value}</span>
    </div>
  );
}
