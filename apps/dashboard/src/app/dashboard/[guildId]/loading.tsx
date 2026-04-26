export default function Loading() {
  return (
    <div className="loading-delayed animate-pulse space-y-6">
      <div>
        <div className="h-8 w-44 bg-[#e5e7eb]/10 rounded-lg" />
        <div className="h-3.5 w-64 bg-[#e5e7eb]/5 rounded mt-2" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-[#111116] rounded-xl border border-[#e5e7eb]/10" />
        ))}
      </div>
      <div className="h-64 bg-[#111116] rounded-xl border border-[#e5e7eb]/10" />
      <div className="h-48 bg-[#111116] rounded-xl border border-[#e5e7eb]/10" />
    </div>
  );
}
