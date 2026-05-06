export default function ProductsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Title */}
      <div className="h-8 w-64 bg-gray-200 rounded mb-6 animate-pulse" />

      {/* Search bar */}
      <div className="h-11 bg-gray-200 rounded-lg mb-4 animate-pulse" />

      {/* Filter controls */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="h-10 w-28 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-10 w-36 bg-gray-200 rounded-lg animate-pulse ml-auto" />
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
