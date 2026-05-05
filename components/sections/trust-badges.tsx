import type { TrustBadgesProps } from "@/lib/types/homepage";

const DEFAULT_ICONS: Record<string, string> = {
  secure_transaction: "🔒",
  free_shipping: "🚚",
  money_back: "🔄",
  happy_buyers: "⭐",
};

export default function TrustBadgesSection({ props }: { props: TrustBadgesProps }) {
  const active = props.badges.filter((b) => b.active);
  if (active.length === 0) return null;

  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
          {active.map((badge) => (
            <div
              key={badge.key}
              className="flex items-center gap-2 flex-shrink-0 px-3 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="text-lg">{DEFAULT_ICONS[badge.key] ?? "✅"}</span>
              <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
                {badge.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
