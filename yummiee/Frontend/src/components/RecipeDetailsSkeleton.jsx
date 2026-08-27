import MainLayout from "../layouts/MainLayout";

function RecipeDetailsSkeleton() {
  return (
    <MainLayout>
      <main className="mx-auto w-full max-w-[1280px] px-5 py-8 md:px-10 md:py-12 animate-pulse">
        {/* Back Link Skeleton */}
        <div className="mb-8 h-5 w-32 rounded-lg bg-[#f1ecea]" />

        {/* HERO SECTION SKELETON */}
        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Image Box Skeleton */}
          <div className="h-[360px] w-full rounded-[24px] bg-[#f1ecea] sm:h-[460px]" />

          {/* Details Content Skeleton */}
          <div className="flex flex-col justify-center">
            {/* Category Pill */}
            <div className="mb-4 h-7 w-24 rounded-full bg-[#f1ecea]" />

            {/* Title */}
            <div className="h-10 w-3/4 rounded-xl bg-[#f1ecea] sm:h-12" />

            {/* Description lines */}
            <div className="mt-5 space-y-2">
              <div className="h-4 w-full rounded bg-[#f1ecea]" />
              <div className="h-4 w-5/6 rounded bg-[#f1ecea]" />
              <div className="h-4 w-2/3 rounded bg-[#f1ecea]" />
            </div>

            {/* Rating Skeleton */}
            <div className="mt-5 h-5 w-36 rounded bg-[#f1ecea]" />

            {/* Stat Cards Skeleton */}
            <div className="mt-6 flex gap-3">
              <div className="h-14 w-28 rounded-xl bg-[#f1ecea]" />
              <div className="h-14 w-32 rounded-xl bg-[#f1ecea]" />
            </div>

            {/* Servings Box Skeleton */}
            <div className="mt-7 h-20 w-full rounded-2xl bg-[#f1ecea]" />
          </div>
        </section>

        {/* INGREDIENTS SKELETON */}
        <section className="mt-16">
          <div className="mb-7 flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-7 w-40 rounded-lg bg-[#f1ecea]" />
              <div className="h-4 w-64 rounded bg-[#f1ecea]" />
            </div>
            <div className="h-5 w-24 rounded bg-[#f1ecea]" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-[#f1ecea]" />
            ))}
          </div>
        </section>

        {/* INSTRUCTIONS SKELETON */}
        <section className="mt-16">
          <div className="mb-8 space-y-2">
            <div className="h-7 w-48 rounded-lg bg-[#f1ecea]" />
            <div className="h-4 w-40 rounded bg-[#f1ecea]" />
          </div>

          <div className="max-w-4xl space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-5">
                <div className="h-10 w-10 shrink-0 rounded-full bg-[#f1ecea]" />
                <div className="flex-1 space-y-3 pt-1">
                  <div className="h-5 w-40 rounded bg-[#f1ecea]" />
                  <div className="h-4 w-full rounded bg-[#f1ecea]" />
                  <div className="h-4 w-3/4 rounded bg-[#f1ecea]" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </MainLayout>
  );
}

export default RecipeDetailsSkeleton;
