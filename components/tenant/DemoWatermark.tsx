export default function DemoWatermark() {
  const marks = Array.from({ length: 32 }, (_, i) => i);

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-30 overflow-hidden"
      >
        <div className="absolute -inset-32 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-14 rotate-[-24deg] opacity-70">
          {marks.map((mark) => (
            <span
              key={mark}
              className="select-none whitespace-nowrap text-5xl sm:text-6xl font-black uppercase tracking-[0.22em] text-gray-900/[0.055]"
            >
              Demo
            </span>
          ))}
        </div>
      </div>
      <div className="pointer-events-none fixed bottom-4 left-4 z-40 rounded-md border border-amber-300 bg-amber-50/95 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-800 shadow-sm">
        Demo - This store is for demonstration purposes only. No orders will be fulfilled.
      </div>
    </>
  );
}
