export default function ResultsSkeleton() {
  return (
    <div className="mt-8 animate-in fade-in duration-500">
      {/* Market Data Ticker skeleton */}
      <div className="w-full bg-panel border border-steel/15 py-3 px-6 mb-8 overflow-hidden">
        <div className="flex justify-between items-center">
          <div className="flex gap-8 items-center">
            {[16, 20, 14].map((w, i) => (
              <div
                key={i}
                className="h-2.5 bg-steel/15 rounded-sm animate-pulse"
                style={{ width: `${w * 4}px` }}
              />
            ))}
          </div>
          <div className="h-2.5 w-24 bg-signal/15 rounded-sm animate-pulse" />
        </div>
      </div>

      {/* Command Center skeleton */}
      <div className="grid lg:grid-cols-12 gap-0 border border-steel/15 shadow-2xl bg-panel">
        {/* LEFT: Creative Studio */}
        <div className="lg:col-span-7 p-8 md:p-12 border-b lg:border-b-0 lg:border-r border-steel/15">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="h-[2px] w-8 bg-beacon/40" />
              <div className="h-2.5 w-32 bg-beacon/20 rounded-sm animate-pulse" />
            </div>
            <div className="flex gap-2">
              <div className="size-8 bg-abyss border border-steel/15 animate-pulse" />
              <div className="size-8 bg-abyss border border-steel/15 animate-pulse" />
            </div>
          </div>

          <div className="space-y-12">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <div className="h-2.5 w-28 bg-beacon/20 rounded-sm animate-pulse" />
                <div className="space-y-2">
                  <div className="h-3 w-full bg-steel/15 rounded-sm animate-pulse" />
                  <div className="h-3 w-full bg-steel/15 rounded-sm animate-pulse" />
                  <div className="h-3 w-2/3 bg-steel/15 rounded-sm animate-pulse" />
                </div>
              </div>
              <div className="relative aspect-video border border-steel/15 bg-abyss animate-pulse" />
            </div>

            <div className="space-y-4">
              <div className="h-2.5 w-36 bg-beacon/20 rounded-sm animate-pulse" />
              <div className="space-y-3">
                <div className="h-5 w-full bg-steel/15 rounded-sm animate-pulse" />
                <div className="h-5 w-4/5 bg-steel/15 rounded-sm animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Strategy Lab */}
        <div className="lg:col-span-5 p-8 md:p-12 bg-abyss/60">
          <div className="flex items-center gap-3 mb-10">
            <div className="h-[2px] w-8 bg-signal/40" />
            <div className="h-2.5 w-28 bg-signal/20 rounded-sm animate-pulse" />
          </div>

          <div className="space-y-10">
            <div className="border-l-2 border-beacon/30 pl-6 space-y-2">
              <div className="h-2.5 w-32 bg-beacon/20 rounded-sm animate-pulse" />
              <div className="h-3 w-full bg-steel/15 rounded-sm animate-pulse" />
              <div className="h-3 w-3/4 bg-steel/15 rounded-sm animate-pulse" />
            </div>

            <div className="border-l-2 border-signal/30 pl-6 space-y-2">
              <div className="h-2.5 w-24 bg-signal/20 rounded-sm animate-pulse" />
              <div className="h-3 w-full bg-steel/15 rounded-sm animate-pulse" />
              <div className="h-3 w-2/3 bg-steel/15 rounded-sm animate-pulse" />
            </div>

            <div className="bg-panel p-6 border border-steel/15 shadow-inner">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-abyss p-4 border border-steel/15 space-y-2">
                  <div className="h-2 w-16 bg-steel/15 rounded-sm animate-pulse" />
                  <div className="h-5 w-8 bg-steel/20 rounded-sm animate-pulse" />
                </div>
                <div className="bg-abyss p-4 border border-steel/15 space-y-2">
                  <div className="h-2 w-16 bg-steel/15 rounded-sm animate-pulse" />
                  <div className="h-5 w-8 bg-steel/20 rounded-sm animate-pulse" />
                </div>
              </div>
            </div>

            <div className="pt-6 space-y-4">
              <div className="h-2.5 w-40 bg-steel/15 rounded-sm animate-pulse" />
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="size-6 bg-beacon/20 shrink-0 animate-pulse" />
                  <div className="h-3 w-full bg-steel/15 rounded-sm animate-pulse mt-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
