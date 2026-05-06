export default function CategoryLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Title */}
      <div className="h-8 w-48 bg-gray-200 rounded mb-2 animate-pulse" />
      <div className="h-4 w-32 bg-gray-200 rounded mb-6 animate-pulse" />

      {/* Category nav */}
      <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-gray-200">
        <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse" />
        <div className="h-8 w-20 bg-gray-200 rounded-full animate-pulse" />
        <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse" />
        <div className="h-8 w-20 bg-gray-200 rounded-full animate-pulse" />
      </div>

      {/* Back link */}
      <div className="flex justify-end mb-4">
        <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-3/5 animate-pulse" />
            <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
