import Image from "next/image";
import type { TestimonialProps } from "@/lib/types/homepage";

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

export default function TestimonialSection({ props }: { props: TestimonialProps }) {
  if (props.items.length === 0) return null;

  return (
    <section className="bg-white border-b border-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {props.title && (
          <h2 className="text-base font-bold text-gray-800 text-center mb-6">
            {props.title}
          </h2>
        )}
        <div
          className={
            props.layout === "carousel"
              ? "flex gap-4 overflow-x-auto scrollbar-none pb-1"
              : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          }
        >
          {props.items.map((item, i) => (
            <div
              key={i}
              className={`bg-gray-50 rounded-2xl p-4 space-y-3 hover:shadow-md transition-shadow ${
                props.layout === "carousel" ? "flex-shrink-0 w-64" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                {item.avatar_url ? (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={item.avatar_url}
                      alt={item.author}
                      fill
                      className="object-cover"
                      sizes="40px"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[var(--tenant-primary-tint)] flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-[var(--tenant-primary)]">
                      {item.author.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <p className="text-xs font-semibold text-gray-800">{item.author}</p>
              </div>
              {item.rating && <Stars count={item.rating} />}
              <p className="text-xs text-gray-600 leading-relaxed">"{item.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
