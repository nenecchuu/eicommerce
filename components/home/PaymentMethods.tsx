const PAYMENTS = [
  { label: "COD", color: "bg-orange-100 text-orange-700", icon: "💵" },
  { label: "QRIS", color: "bg-purple-100 text-purple-700", icon: "📱" },
  { label: "GoPay", color: "bg-green-100 text-green-700", icon: "💚" },
  { label: "OVO", color: "bg-violet-100 text-violet-700", icon: "💜" },
  { label: "DANA", color: "bg-blue-100 text-blue-700", icon: "💙" },
  { label: "ShopeePay", color: "bg-red-100 text-red-700", icon: "🛍️" },
  { label: "BCA", color: "bg-sky-100 text-sky-700", icon: "🏦" },
  { label: "BRI", color: "bg-blue-100 text-blue-800", icon: "🏦" },
  { label: "Mandiri", color: "bg-yellow-100 text-yellow-700", icon: "🏦" },
  { label: "Transfer Bank", color: "bg-gray-100 text-gray-700", icon: "💳" },
];

export default function PaymentMethods() {
  return (
    <section className="bg-white border-b border-gray-100 py-4">
      <div className="max-w-6xl mx-auto px-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Metode Pembayaran
        </p>
        <div className="flex flex-wrap gap-2">
          {PAYMENTS.map((p) => (
            <span
              key={p.label}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${p.color}`}
            >
              <span>{p.icon}</span>
              {p.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
