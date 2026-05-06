export default function HomePageLoading() {
  return (
    <div className="animate-pulse">
      {/* Hero skeleton */}
      <div className="h-48 sm:h-64 bg-gray-200" />

      {/* Promo banner skeleton */}
      <div className="h-24 bg-gray-200" />

      {/* Category section skeleton */}
      <div className="py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="h-5 w-32 bg-gray-200 rounded mb-4" />
          <div className="flex gap-4 overflow-x-auto">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gray-200" />
                <div className="h-3 w-14 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product list section skeleton */}
      <div className="py-6 px-4 border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div className="h-5 w-40 bg-gray-200 rounded" />
            <div className="h-4 w-24 bg-gray-200 rounded" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-square bg-gray-200 rounded-xl" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust badges skeleton */}
      <div className="py-6 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
