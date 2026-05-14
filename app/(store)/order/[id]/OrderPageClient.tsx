"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, CheckCircle, Clock, Truck, Package, XCircle, Copy, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatRupiah } from "@/lib/utils/price";
import { getOrderDisplayId } from "@/lib/utils/order";
import { getOrderStatusLabel, getOrderStatusColor } from "@/lib/queries/orderStatus";
import type { OrderWithItems } from "@/lib/queries/orderTypes";
import type { LucideIcon } from "lucide-react";

interface Props {
  orderId: string;
  initialEmail?: string;
  order?: OrderWithItems | null;
}

export default function OrderPageClient({ orderId, initialEmail, order: initialOrder }: Props) {
  const order = initialOrder ?? null;
  const [copied, setCopied] = useState(false);
  const orderDisplayId = order ? getOrderDisplayId(order) : orderId;

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderDisplayId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, LucideIcon> = {
      pending_payment: Clock,
      paid: CheckCircle,
      shipped: Truck,
      completed: Package,
      cancelled: XCircle,
    };
    return icons[status] || Clock;
  };

  const paymentMethodLabels: Record<string, string> = {
    bank_transfer: "Transfer Bank",
    qris: "QRIS",
    "": "-",
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Cek Pesanan</h1>

      {!order ? (
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-[var(--tenant-primary-tint)] rounded-full flex items-center justify-center">
                <Lock className="text-[var(--tenant-primary)]" size={20} />
              </div>
            </div>

            <h2 className="text-lg font-semibold text-center mb-2">Lengkapi untuk Melihat Detail</h2>
            <p className="text-sm text-gray-600 text-center mb-6">
              Masukkan email yang digunakan saat memesan untuk melihat detail pesanan {orderDisplayId}
            </p>

            <form action="" method="GET">
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={initialEmail ?? ""}
                  placeholder="nama@email.com"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--tenant-primary)] focus:border-transparent text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[var(--tenant-primary)] text-[var(--tenant-primary-contrast)] rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Lihat Pesanan
              </button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Order Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-semibold">Order #{orderDisplayId}</h2>
                    <button
                      onClick={handleCopyOrderId}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="Copy Order ID"
                    >
                      {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${getOrderStatusColor(order.status_text)}`}>
                  {(() => {
                    const StatusIcon = getStatusIcon(order.status_text);
                    return <StatusIcon size={16} />;
                  })()}
                  {getOrderStatusLabel(order.status_text)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Nama Pelanggan</p>
                  <p className="text-sm font-medium">{order.customer_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="text-sm font-medium">{order.customer_email || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">No. Telepon</p>
                  <p className="text-sm font-medium">{order.customer_phone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Metode Pembayaran</p>
                  <p className="text-sm font-medium">{paymentMethodLabels[order.payment_method]}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Item Pesanan</h3>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
                      {item.variant_label && (
                        <p className="text-xs text-gray-500">{item.variant_label}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">{item.quantity} × {formatRupiah(item.price)}</p>
                    </div>
                    <p className="text-sm font-semibold">{formatRupiah(item.total)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Info */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Informasi Pengiriman</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Alamat Pengiriman</p>
                  <p className="text-sm text-gray-700">{order.shipping_address}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Kurir</p>
                    <p className="text-sm font-medium">{order.shipping_courier} - {order.shipping_service}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Biaya Pengiriman</p>
                    <p className="text-sm font-medium">{formatRupiah(order.shipping_cost)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Ringkasan Pembayaran</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatRupiah(order.subtotal)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Diskon</span>
                    <span>-{formatRupiah(order.discount_amount)}</span>
                  </div>
                )}
                {order.tax_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Pajak</span>
                    <span>{formatRupiah(order.tax_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pengiriman</span>
                  <span>{formatRupiah(order.shipping_cost)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-100 font-semibold">
                  <span>Total</span>
                  <span className="text-lg text-[var(--tenant-primary)]">{formatRupiah(order.total_amount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {order.notes && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Catatan</h3>
                <p className="text-sm text-gray-600">{order.notes}</p>
              </CardContent>
            </Card>
          )}

          <div className="text-center">
            <p className="text-sm text-gray-500 mb-3">Butuh bantuan?</p>
            <Link href="/" className="inline-block px-6 py-2 bg-[var(--tenant-primary)] text-[var(--tenant-primary-contrast)] rounded-lg font-semibold hover:opacity-90 transition-opacity text-sm">
              Hubungi Kami
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
