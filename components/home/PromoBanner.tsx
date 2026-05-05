import Image from "next/image";

const PROMOS = [
  {
    id: "harbolnas",
    title: "Harbolnas 12.12",
    sub: "Diskon besar-besaran akhir tahun!",
    color: "from-red-600 to-orange-500",
    img: "https://placehold.co/400x200/EF4444/ffffff?text=Harbolnas+12.12",
  },
  {
    id: "lebaran",
    title: "Promo Lebaran",
    sub: "Koleksi spesial Hari Raya",
    color: "from-green-600 to-teal-500",
    img: "https://placehold.co/400x200/059669/ffffff?text=Promo+Lebaran",
  },
];

export default function PromoBanner() {
  return (
    <section className="bg-gray-50 border-b border-gray-100 py-6">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          📢 Promo Spesial
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PROMOS.map((promo) => (
            <div
              key={promo.id}
              className={`relative rounded-2xl overflow-hidden bg-gradient-to-r ${promo.color} cursor-pointer hover:scale-[1.02] transition-transform shadow-md`}
            >
              <div className="relative aspect-[2/1]">
                <Image
                  src={promo.img}
                  alt={promo.title}
                  fill
                  className="object-cover opacity-70"
                  sizes="(max-width: 640px) 100vw, 50vw"
                  unoptimized
                />
                <div className="absolute inset-0 flex flex-col justify-center px-6">
                  <p className="text-white font-extrabold text-xl drop-shadow">{promo.title}</p>
                  <p className="text-white/90 text-sm mt-1 drop-shadow">{promo.sub}</p>
                  <span className="mt-3 inline-block bg-white text-gray-900 text-xs font-bold px-4 py-1.5 rounded-full w-fit shadow">
                    Belanja Sekarang
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
