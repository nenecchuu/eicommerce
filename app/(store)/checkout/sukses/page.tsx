"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, Home, ShoppingBag } from "lucide-react";
import { Suspense } from "react";
import { useTenantSlug } from "@/lib/hooks/useTenantSlug";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = useTenantSlug();
  const orderId = searchParams.get("order") ?? "-";

  if (!slug) {
    router.replace("/");
    return null;
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 flex flex-col items-center text-center gap-5">
      {/* Icon */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center">
          <CheckCircle2 size={52} className="text-green-500" />
        </div>
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full animate-ping bg-green-200 opacity-30" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-gray-900">Pesanan Berhasil!</h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          Terima kasih sudah berbelanja. Pesanan kamu sedang kami proses dan akan segera dikirim.
        </p>
      </div>

      {/* Order ID */}
      <div className="w-full bg-gray-50 border border-dashed border-gray-200 rounded-2xl px-5 py-4 space-y-1">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
          Nomor Pesanan
        </p>
        <p className="text-sm font-mono font-bold text-gray-800 break-all">{orderId}</p>
      </div>

      {/* Info */}
      <div className="w-full bg-blue-50 rounded-2xl px-5 py-4 text-left space-y-2">
        <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">
          Informasi Pengiriman
        </p>
        <ul className="text-xs text-blue-600 space-y-1 list-disc list-inside">
          <li>Konfirmasi akan dikirim via WhatsApp</li>
          <li>Estimasi pengiriman 1–3 hari kerja</li>
          <li>Hubungi kami jika ada pertanyaan</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="w-full flex flex-col gap-3 pt-2">
        <button
          onClick={() => router.push("/")}
          className="w-full flex items-center justify-center gap-2 bg-[var(--tenant-primary)] text-[var(--tenant-primary-contrast)] font-bold py-3.5 rounded-xl shadow-md hover:opacity-90 transition-opacity"
        >
          <Home size={16} />
          Kembali ke Toko
        </button>
        <button
          onClick={() => router.push("/")}
          className="w-full flex items-center justify-center gap-2 border-2 border-[var(--tenant-primary)] text-[var(--tenant-primary)] font-semibold py-3.5 rounded-xl hover:bg-[var(--tenant-primary-tint)] transition-colors"
        >
          <ShoppingBag size={16} />
          Belanja Lagi
        </button>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-gray-400 text-sm">Memuat...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
