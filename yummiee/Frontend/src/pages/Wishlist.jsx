import { Heart } from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import RecipeCard from "../components/RecipeCard";
import RecipeCardSkeleton from "../components/RecipeCardSkeleton";
import { useWishlist } from "../context/WishlistContext";

function Wishlist() {
  const { wishlist, loading } = useWishlist();

  return (
    <MainLayout>
      <main className="mx-auto w-full max-w-[1280px] px-5 py-8 md:px-10 md:py-12">
        {/* Header */}
        <section className="mb-10">
          <div className="flex items-center gap-3">
            <Heart
              className="h-7 w-7 text-primary"
              fill="currentColor"
            />

            <h1 className="text-3xl font-bold tracking-tight">
              My Wishlist
            </h1>
          </div>

          <p className="mt-2 text-text-secondary">
            Your favorite recipes, all in one place.
          </p>
        </section>

        {/* Loading State - Skeleton Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <RecipeCardSkeleton key={index} />
            ))}
          </div>
        ) : wishlist.length === 0 ? (
          /* Empty State */
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl bg-white px-6 text-center shadow-sm">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Heart className="h-8 w-8 text-primary" />
            </div>

            <h2 className="text-xl font-semibold">
              Your wishlist is empty
            </h2>

            <p className="mt-2 max-w-md text-sm text-text-secondary">
              Tap the heart on any recipe you love and it will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* Count */}
            <p className="mb-6 text-sm font-medium text-text-secondary">
              {wishlist.length}{" "}
              {wishlist.length === 1 ? "recipe" : "recipes"} saved
            </p>

            {/* Recipes */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {wishlist.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </MainLayout>
  );
}

export default Wishlist;