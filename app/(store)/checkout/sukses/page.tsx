"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, Home, ShoppingBag, Upload, Loader2, AlertCircle } from "lucide-react";
import { useTenantSlug } from "@/lib/hooks/useTenantSlug";
import { formatRupiah } from "@/lib/utils/price";
import type { TenantWithCMS } from "@/types/schema-contract";

type PaymentMethod = "bank_transfer" | "qris";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = useTenantSlug();

  const orderId = searchParams.get("order") ?? "-";
  const methodParam = searchParams.get("method") as PaymentMethod | null;
  const [paymentMethod] = useState<PaymentMethod>(methodParam || "bank_transfer");

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tenant, setTenant] = useState<TenantWithCMS | null>(null);

  // Fetch tenant data
  useEffect(() => {
    async function fetchTenant() {
      try {
        const hostname = typeof window !== "undefined" ? window.location.hostname : "";
        const response = await fetch("/api/tenant", {
          headers: {
            "x-tenant-host": hostname,
          },
        });
        const data = await response.json();
        if (data.success) {
          setTenant(data.data);
        }
      } catch (error) {
        console.error("[OrderSuccess] Failed to fetch tenant:", error);
      }
    }
    fetchTenant();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(selected.type)) {
      setError("Format file tidak valid. Gunakan JPG, PNG, atau PDF.");
      return;
    }

    // Validate file size (5MB)
    if (selected.size > 5 * 1024 * 1024) {
      setError("Ukuran file maksimal 5MB.");
      return;
    }

    setError(null);
    setFile(selected);

    // Create preview for images
    if (selected.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(selected));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Silakan pilih file bukti transfer.");
      return;
    }

    if (!orderId) {
      setError("Order ID tidak ditemukan.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("order_id", orderId);
      formData.append("tenant_id", slug ?? "");

      const response = await fetch("/api/upload-proof", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || "Gagal mengupload bukti transfer.");
        return;
      }

      setUploadSuccess(true);
      setFile(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error("[Upload Proof] Error:", err);
      setError("Gagal mengupload. Silakan coba lagi.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreviewUrl(null);
    setError(null);
  };

  if (!slug) {
    router.replace("/");
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Success header */}
      <div className="flex flex-col items-center text-center gap-5 mb-8">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle2 size={40} className="text-green-500" />
          </div>
          <span className="absolute inset-0 rounded-full animate-ping bg-green-200 opacity-30" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900">Pesanan Berhasil!</h1>
        <p className="text-gray-500 text-sm max-w-md">
          Pesanan kamu sudah kami terima. Silakan selesaikan pembayaran.
        </p>
      </div>

      {/* Order info */}
      <div className="bg-white border border-gray-100 rounded-2xl px-6 py-4 mb-6">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-2">
          Nomor Pesanan
        </p>
        <p className="text-sm font-mono font-bold text-gray-800 break-all">{orderId}</p>
      </div>

      {/* Payment instructions */}
      <div className="bg-blue-50 rounded-2xl px-6 py-6 mb-6">
        <h2 className="text-lg font-bold text-blue-900 mb-4">Instruksi Pembayaran</h2>

        {/* Payment method selector */}
        <div className="flex gap-3 mb-6">
          {tenant?.cms.payment_info.bank && tenant.cms.payment_info.bank.length > 0 && (
            <button
              onClick={() => setPaymentMethod("bank_transfer")}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${
                paymentMethod === "bank_transfer"
                  ? "bg-blue-900 text-white"
                  : "bg-white text-blue-700 hover:bg-blue-100"
              }`}
            >
              Transfer Bank
            </button>
          )}

          {tenant?.cms.payment_info.qris_image_url && (
            <button
              onClick={() => setPaymentMethod("qris")}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${
                paymentMethod === "qris"
                  ? "bg-blue-900 text-white"
                  : "bg-white text-blue-700 hover:bg-blue-100"
              }`}
            >
              QRIS
            </button>
          )}
        </div>

        {/* Bank transfer instructions */}
        {paymentMethod === "bank_transfer" && tenant?.cms.payment_info.bank && tenant.cms.payment_info.bank.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-start gap-2 p-4 bg-white rounded-lg border border-blue-200">
              <Upload size={20} className="text-blue-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900">Upload Bukti Transfer</p>
                <p className="text-xs text-blue-600">
                  JPG, PNG, atau PDF (maksimal 5MB)
                </p>
              </div>
            </div>

            {previewUrl && (
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-blue-200">
                <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button
                    onClick={handleRemoveFile}
                    className="text-xs text-red-600 hover:text-red-700 mt-2"
                  >
                    Ganti
                  </button>
                </div>
              </div>
            )}

            {!previewUrl && (
              <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-blue-200">
                <p className="text-sm text-gray-500">Belum ada file yang dipilih</p>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={uploading || !file}
              className="w-full flex items-center justify-center gap-2 bg-blue-900 text-white font-semibold py-4 rounded-xl hover:bg-blue-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Mengupload...
                </>
              ) : uploadSuccess ? (
                <>
                  <CheckCircle2 size={18} />
                  Terupload!
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Upload Bukti
                </>
              )}
            </button>

            {/* Bank accounts */}
            <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Rekening Pembayaran
            </p>
            <div className="space-y-2">
              {tenant.cms.payment_info.bank.map((acc, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{acc.name}</p>
                    <p className="text-sm font-mono text-gray-800">{acc.account_number}</p>
                    <p className="text-xs text-gray-500">a.n {acc.account_name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </div>
        )}

        {/* QRIS display */}
        {paymentMethod === "qris" && tenant?.cms.payment_info.qris_image_url && (
          <div className="space-y-4">
            <div className="flex justify-center p-4 bg-white rounded-lg border border-blue-200">
              <img
                src={tenant.cms.payment_info.qris_image_url}
                alt="QRIS Payment"
                className="w-48 h-48 rounded-lg"
                unoptimized
              />
            </div>
            <p className="text-sm text-center text-gray-600">
              Scan QR di atas menggunakan aplikasi e-wallet Anda
            </p>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
          <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Upload success message */}
      {uploadSuccess && !error && (
        <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl mb-6">
          <CheckCircle2 className="text-green-600 flex-shrink-0" size={20} />
          <div>
            <p className="text-sm font-semibold text-green-900">Bukti Transfer Terupload!</p>
            <p className="text-xs text-green-700">
              Kami akan menverifikasi pembayaran Anda dalam 1x24 jam.
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button
          onClick={() => router.push("/order/" + orderId)}
          className="flex-1 flex items-center justify-center gap-2 border-2 border-[var(--tenant-primary)] text-[var(--tenant-primary)] font-semibold py-3.5 rounded-xl hover:bg-[var(--tenant-primary-tint)] transition-colors"
        >
          Lihat Detail Pesanan
        </button>

        <button
          onClick={() => router.push("/")}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white font-semibold py-3.5 rounded-xl hover:bg-gray-800 transition-colors"
        >
          <Home size={18} />
          Belanja Lagi
        </button>
      </div>

      <div className="flex justify-center pt-6">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ShoppingBag size={16} />
          Lanjutkan Belanja
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
