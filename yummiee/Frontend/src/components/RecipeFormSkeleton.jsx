import MainLayout from "../layouts/MainLayout";

function RecipeFormSkeleton() {
  return (
    <MainLayout>
      <main className="mx-auto w-full max-w-[1000px] px-5 py-8 md:px-10 md:py-12 animate-pulse">
        <div className="mb-8 h-5 w-36 rounded-lg bg-[#f1ecea]" />

        <div className="mb-10 space-y-3">
          <div className="h-9 w-64 rounded-xl bg-[#f1ecea]" />
          <div className="h-4 w-80 rounded bg-[#f1ecea]" />
        </div>

        <div className="space-y-8">
          {/* Card 1 */}
          <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8 space-y-6">
            <div className="h-6 w-48 rounded bg-[#f1ecea]" />
            <div className="grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2 h-14 rounded-xl bg-[#f1ecea]" />
              <div className="md:col-span-2 h-28 rounded-xl bg-[#f1ecea]" />
              <div className="h-14 rounded-xl bg-[#f1ecea]" />
              <div className="h-14 rounded-xl bg-[#f1ecea]" />
            </div>
          </div>

          {/* Card 2 Image */}
          <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8 space-y-4">
            <div className="h-6 w-36 rounded bg-[#f1ecea]" />
            <div className="h-60 rounded-2xl bg-[#f1ecea]" />
          </div>
        </div>
      </main>
    </MainLayout>
  );
}

export default RecipeFormSkeleton;
