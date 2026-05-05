import type { TenantCMS } from "@/types/schema-contract";

interface Props {
  cms: TenantCMS;
}

const PAYMENT_METHODS = [
  { label: "COD", color: "bg-orange-100 text-orange-700" },
  { label: "QRIS", color: "bg-purple-100 text-purple-700" },
  { label: "GoPay", color: "bg-green-100 text-green-700" },
  { label: "OVO", color: "bg-violet-100 text-violet-700" },
  { label: "DANA", color: "bg-blue-100 text-blue-700" },
  { label: "ShopeePay", color: "bg-red-100 text-red-700" },
  { label: "BCA", color: "bg-sky-100 text-sky-700" },
  { label: "BRI", color: "bg-blue-100 text-blue-800" },
  { label: "Mandiri", color: "bg-yellow-100 text-yellow-700" },
];

export default function TenantFooter({ cms }: Props) {
  return (
    <footer className="border-t bg-gray-900 text-gray-300 mt-12">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Kontak */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white">Hubungi Kami</h3>
            <div className="space-y-2 text-sm">
              {cms.whatsapp_number && (
                <a
                  href={`https://wa.me/${cms.whatsapp_number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <span>💬</span>
                  <span>WhatsApp: +{cms.whatsapp_number}</span>
                </a>
              )}
              {cms.instagram_handle && (
                <a
                  href={`https://instagram.com/${cms.instagram_handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <span>📸</span>
                  <span>Instagram: @{cms.instagram_handle}</span>
                </a>
              )}
              {cms.email && (
                <a
                  href={`mailto:${cms.email}`}
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <span>✉️</span>
                  <span>{cms.email}</span>
                </a>
              )}
            </div>
          </div>

          {/* Sosial Media */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white">Ikuti Kami</h3>
            <div className="flex gap-3">
              {cms.instagram_handle && (
                <a
                  href={`https://instagram.com/${cms.instagram_handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-white text-lg hover:scale-105 transition-transform"
                  aria-label="Instagram"
                >
                  📸
                </a>
              )}
              {cms.whatsapp_number && (
                <a
                  href={`https://wa.me/${cms.whatsapp_number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-[#25D366] flex items-center justify-center text-white text-lg hover:scale-105 transition-transform"
                  aria-label="WhatsApp"
                >
                  💬
                </a>
              )}
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white text-lg hover:scale-105 transition-transform"
                aria-label="TikTok"
              >
                🎵
              </a>
            </div>
            <div className="space-y-1.5 text-xs text-gray-400">
              <p>Jam Operasional:</p>
              <p className="text-gray-300">Senin – Sabtu: 08.00 – 21.00</p>
              <p className="text-gray-300">Minggu: 09.00 – 18.00</p>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white">Informasi</h3>
            <ul className="space-y-1.5 text-sm text-gray-400">
              {[
                "Cara Belanja",
                "Kebijakan Pengembalian",
                "Syarat & Ketentuan",
                "Kebijakan Privasi",
                "FAQ",
              ].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-white transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Payment methods */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Metode Pembayaran
          </p>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_METHODS.map((p) => (
              <span
                key={p.label}
                className={`px-3 py-1 rounded-md text-xs font-bold ${p.color}`}
              >
                {p.label}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-6 pt-4 border-t border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} — Powered by demo store</p>
          <p>🇮🇩 Produk lokal, kualitas terjamin</p>
        </div>
      </div>
    </footer>
  );
}
