"use client";

import { useState } from "react";

const VOUCHERS = [
  {
    id: "GRATIS-ONGKIR",
    label: "Gratis Ongkir",
    desc: "Gratis ongkos kirim untuk semua produk",
    color: "from-green-500 to-emerald-600",
    badge: "🚚",
    expiry: "Hari ini saja",
  },
  {
    id: "DISKON10",
    label: "Diskon 10%",
    desc: "Potongan 10% untuk pembelian pertama",
    color: "from-orange-500 to-red-500",
    badge: "🎁",
    expiry: "Berlaku 3 hari",
  },
  {
    id: "COD-PROMO",
    label: "Bebas Ongkir COD",
    desc: "Bayar di tempat tanpa biaya tambahan",
    color: "from-blue-500 to-indigo-600",
    badge: "💵",
    expiry: "Tanpa batas",
  },
];

export default function VoucherSection() {
  const [claimed, setClaimed] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setClaimed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <section className="bg-gray-50 border-b border-gray-100 py-6">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          🏷️ Voucher & Kupon
        </h2>
        <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
          {VOUCHERS.map((v) => {
            const isClaimed = claimed.has(v.id);
            return (
              <div
                key={v.id}
                className={`flex-shrink-0 w-52 rounded-2xl bg-gradient-to-br ${v.color} p-4 text-white shadow-md`}
              >
                <div className="text-2xl mb-1">{v.badge}</div>
                <p className="font-bold text-sm">{v.label}</p>
                <p className="text-white/80 text-xs mt-0.5 leading-snug">{v.desc}</p>
                <p className="text-white/60 text-[10px] mt-1">{v.expiry}</p>
                <button
                  onClick={() => toggle(v.id)}
                  className={`mt-3 w-full py-1.5 rounded-full text-xs font-bold transition-all ${
                    isClaimed
                      ? "bg-white/30 text-white cursor-default"
                      : "bg-white text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  {isClaimed ? "✅ Diklaim" : "Klaim Voucher"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
