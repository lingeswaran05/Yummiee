function RecipeCardSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-[#f0eded] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
      aria-label="Loading recipe"
      aria-busy="true"
    >
      <div className="h-48 animate-pulse bg-[#f1ecea]" />
      <div className="space-y-4 p-5">
        <div className="h-5 w-3/4 animate-pulse rounded bg-[#f1ecea]" />
        <div className="flex gap-2">
          <div className="h-6 w-20 animate-pulse rounded-full bg-[#f1ecea]" />
          <div className="h-6 w-24 animate-pulse rounded-full bg-[#f1ecea]" />
        </div>
        <div className="h-4 w-24 animate-pulse rounded bg-[#f1ecea]" />
      </div>
    </div>
  );
}

export default RecipeCardSkeleton;
