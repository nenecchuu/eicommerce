import Image from "next/image";

const REVIEWS = [
  {
    id: 1,
    name: "Siti R.",
    location: "Surabaya",
    avatar: "https://placehold.co/48x48/FBBF24/ffffff?text=SR",
    rating: 5,
    text: "Barangnya sesuai foto, pengiriman cepat banget! Udah order 3x di sini, selalu puas.",
    product: "Tas Selempang Kulit",
  },
  {
    id: 2,
    name: "Budi S.",
    location: "Bandung",
    avatar: "https://placehold.co/48x48/60A5FA/ffffff?text=BS",
    rating: 5,
    text: "COD nya gampang banget, tinggal pesan terus bayar pas dateng. Recommended!",
    product: "Sepatu Olahraga",
  },
  {
    id: 3,
    name: "Ani W.",
    location: "Jakarta",
    avatar: "https://placehold.co/48x48/34D399/ffffff?text=AW",
    rating: 4,
    text: "Harga bersaing, kualitas oke. Ongkir gratis juga, makin hemat deh!",
    product: "Baju Koko",
  },
  {
    id: 4,
    name: "Eko P.",
    location: "Semarang",
    avatar: "https://placehold.co/48x48/F472B6/ffffff?text=EP",
    rating: 5,
    text: "Respon CS cepat via WA, pertanyaan langsung dijawab. Toko terpercaya!",
    product: "Celana Chino",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`w-3 h-3 ${i <= count ? "text-yellow-400" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="bg-white border-b border-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-base font-bold text-gray-800">💬 Kata Pembeli Kami</h2>
          <p className="text-sm text-gray-400 mt-1">
            1.200+ pembeli puas • Rating 4.9/5
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {REVIEWS.map((r) => (
            <div
              key={r.id}
              className="bg-gray-50 rounded-2xl p-4 space-y-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={r.avatar}
                    alt={r.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{r.name}</p>
                  <p className="text-xs text-gray-400">{r.location}</p>
                </div>
              </div>
              <Stars count={r.rating} />
              <p className="text-sm text-gray-600 leading-relaxed">"{r.text}"</p>
              <p className="text-xs text-gray-400 italic">Produk: {r.product}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
