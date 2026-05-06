import { cn } from "@/lib/utils";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-pulse">
      {/* Title skeleton */}
      <div className="h-8 w-48 bg-gray-200 rounded mb-6" />

      {/* Search bar skeleton */}
      <div className="h-11 bg-gray-200 rounded-lg mb-4" />

      {/* Filter bar skeleton */}
      <div className="flex gap-3 mb-4">
        <div className="h-10 w-24 bg-gray-200 rounded-lg" />
        <div className="h-10 w-32 bg-gray-200 rounded-lg ml-auto" />
      </div>

      {/* Product grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-square bg-gray-200 rounded-xl" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
