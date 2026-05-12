const ITEMS = [
  { icon: "🤝", label: "COD / Bayar di Tempat" },
  { icon: "🔒", label: "Transaksi 100% Aman" },
  { icon: "🚚", label: "Gratis Ongkir" },
  { icon: "🔄", label: "Garansi Uang Kembali" },
  { icon: "⭐", label: "Ribuan Pembeli Puas" },
];

export default function TrustStrip() {
  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
          {ITEMS.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 flex-shrink-0 px-3 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
