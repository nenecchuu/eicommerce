export default function OrderLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Title */}
      <div className="h-8 w-32 bg-gray-200 rounded mb-6 animate-pulse" />

      {/* Order card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <div className="h-6 w-40 bg-gray-200 rounded mb-2 animate-pulse" />
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-7 w-32 bg-gray-200 rounded-full animate-pulse" />
        </div>

        {/* Customer info */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          <div>
            <div className="h-3 w-24 bg-gray-200 rounded mb-1 animate-pulse" />
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
          <div>
            <div className="h-3 w-16 bg-gray-200 rounded mb-1 animate-pulse" />
            <div className="h-4 w-36 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4">
        <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex justify-between items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
            <div className="flex-1">
              <div className="h-4 w-48 bg-gray-200 rounded mb-1 animate-pulse" />
              <div className="h-3 w-24 bg-gray-200 rounded mt-1 animate-pulse" />
              <div className="h-3 w-20 bg-gray-200 rounded mt-1 animate-pulse" />
            </div>
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
        <div className="flex justify-between">
          <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="flex justify-between pt-3 border-t border-gray-100">
          <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
          <div className="h-7 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
