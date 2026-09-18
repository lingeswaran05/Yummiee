import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, X, Dices } from "lucide-react";

import MainLayout from "../layouts/MainLayout";
import RecipeCard from "../components/RecipeCard";
import RecipeCardSkeleton from "../components/RecipeCardSkeleton";
import SurpriseMeModal from "../components/SurpriseMeModal";
import { fetchRecipes, fetchRecipeSuggestion } from "../services/api";

function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filterOption, setFilterOption] = useState("Recently Added");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Surprise Me Modal state
  const [isSurpriseOpen, setIsSurpriseOpen] = useState(false);
  const [suggestionData, setSuggestionData] = useState(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);

  const categories = [
    "All",
    "Breakfast",
    "Lunch",
    "Dinner",
    "Dessert",
    "Snacks",
  ];

  const isFoodTypeAllowed = selectedCategory !== "Dessert" && selectedCategory !== "Snacks";

  // Auto-reset invalid filter option when switching to Dessert or Snacks
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if ((category === "Dessert" || category === "Snacks") && (filterOption === "Vegetarian" || filterOption === "Non-Vegetarian")) {
      setFilterOption("Recently Added");
    }
  };

  useEffect(() => {
    if (!isFoodTypeAllowed && (filterOption === "Vegetarian" || filterOption === "Non-Vegetarian")) {
      setFilterOption("Recently Added");
    }
  }, [selectedCategory, filterOption, isFoodTypeAllowed]);

  useEffect(() => {
    let isMounted = true;
    const loadRecipes = async () => {
      setLoading(true);
      try {
        const isFoodTypeActive = selectedCategory !== "Dessert" && selectedCategory !== "Snacks";
        const currentFoodType = isFoodTypeActive && (filterOption === "Vegetarian" || filterOption === "Non-Vegetarian")
          ? filterOption
          : "All";
        const currentSort = filterOption === "Quickest" ? "quickest" : "recently-added";

        const data = await fetchRecipes({
          search: searchTerm,
          category: selectedCategory,
          foodType: currentFoodType,
          sort: currentSort,
        });
        if (isMounted) {
          setRecipes(data || []);
        }
      } catch (err) {
        console.error("Failed to load recipes from backend:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      loadRecipes();
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchTerm, selectedCategory, filterOption]);

  const loadSurpriseSuggestion = async (excludeId = null) => {
    setLoadingSuggestion(true);
    try {
      const currentHour = new Date().getHours();
      const isFoodTypeActive = selectedCategory !== "Dessert" && selectedCategory !== "Snacks";
      const currentFoodType = isFoodTypeActive && (filterOption === "Vegetarian" || filterOption === "Non-Vegetarian")
        ? filterOption
        : "All";

      const data = await fetchRecipeSuggestion({
        excludeId,
        hour: currentHour,
        foodType: currentFoodType,
      });
      setSuggestionData(data);
    } catch (err) {
      console.error("Error fetching surprise suggestion:", err);
    } finally {
      setLoadingSuggestion(false);
    }
  };

  const handleOpenSurpriseModal = () => {
    setIsSurpriseOpen(true);
    loadSurpriseSuggestion(null);
  };

  const handleTryAgainSurprise = () => {
    const currentId = suggestionData?.recipe?.id || null;
    loadSurpriseSuggestion(currentId);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setFilterOption("Recently Added");
  };

  const getSectionTitle = () => {
    if (searchTerm) return "Search Results";
    const isFoodTypeActive = selectedCategory !== "Dessert" && selectedCategory !== "Snacks";
    const currentFoodType = isFoodTypeActive && (filterOption === "Vegetarian" || filterOption === "Non-Vegetarian")
      ? filterOption
      : null;

    if (selectedCategory !== "All") {
      if (currentFoodType) {
        return `${selectedCategory} (${currentFoodType})`;
      }
      return `${selectedCategory} Recipes`;
    }

    if (currentFoodType) {
      return `${currentFoodType} Recipes`;
    }

    return "All Recipes";
  };

  return (
    <MainLayout>
      <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 px-5 py-8 md:px-10 md:py-12">
        {/* ================= HERO ================= */}
        <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 text-center">
          <div>
            <h1 className="text-[32px] font-bold leading-10 tracking-tight md:text-[48px] md:leading-[56px]">
              What are you cooking today?
            </h1>
            <p className="mt-3 text-text-secondary">
              Discover recipes or find something delicious to make.
            </p>
          </div>

          {/* Search & Surprise Me Button */}
          <div className="flex w-full gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search recipes, ingredients..."
                className="h-14 w-full rounded-xl border border-[#e4e2e1] bg-white pl-12 pr-12 text-base outline-none shadow-sm transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary transition hover:text-primary"
                  aria-label="Clear search"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Surprise Me Button */}
            <button
              type="button"
              onClick={handleOpenSurpriseModal}
              className="flex h-14 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#e4e2e1] bg-white px-4 text-sm font-bold text-text-primary shadow-sm transition hover:border-primary hover:text-primary"
            >
              <Dices className="h-5 w-5 text-primary" />
              <span className="hidden sm:inline">Surprise Me</span>
            </button>

            {/* Filter Scroll Button */}
            <button
              type="button"
              onClick={() =>
                document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" })
              }
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[#e4e2e1] bg-white text-text-secondary shadow-sm transition hover:text-primary"
              aria-label="Show filters"
            >
              <SlidersHorizontal className="h-5 w-5" />
            </button>
          </div>

          {searchTerm && (
            <div className="w-full text-left text-sm text-text-secondary">
              Showing <span className="font-bold text-text-primary">{recipes.length}</span> recipe
              {recipes.length !== 1 ? "s" : ""} for{" "}
              <span className="font-bold text-primary">"{searchTerm}"</span>
            </div>
          )}
        </section>

        {/* ================= CATEGORIES ================= */}
        <section id="categories" className="flex flex-col gap-5">
          <div>
            <h2 className="text-xl font-semibold">Browse Categories</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Find recipes based on what you're craving.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => handleCategoryChange(category)}
                className={`rounded-full px-6 py-2 text-sm font-semibold transition ${
                  selectedCategory === category
                    ? "bg-primary text-white"
                    : "border border-[#e4e2e1] bg-white text-text-secondary hover:bg-[#f6f3f2]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* ================= ALL RECIPES ================= */}
        <section id="all-recipes" className="flex flex-col gap-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                {getSectionTitle()}
              </h2>

              <p className="mt-1 text-sm text-text-secondary">
                {recipes.length} recipe{recipes.length !== 1 ? "s" : ""} found
              </p>
            </div>

            <select
              value={filterOption}
              onChange={(event) => setFilterOption(event.target.value)}
              className="w-fit rounded-lg border border-[#e4e2e1] bg-white px-3 py-2 text-sm font-semibold text-text-secondary outline-none focus:border-primary cursor-pointer"
            >
              <option value="Recently Added">Recently Added</option>
              <option value="Quickest">Quickest</option>
              {isFoodTypeAllowed && <option value="Vegetarian">Vegetarian</option>}
              {isFoodTypeAllowed && <option value="Non-Vegetarian">Non-Vegetarian</option>}
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }, (_, index) => (
                <RecipeCardSkeleton key={index} />
              ))}
            </div>
          ) : recipes.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Search className="h-6 w-6 text-primary" />
              </div>

              <h3 className="mt-5 text-lg font-semibold">No recipes found</h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
                We couldn't find anything matching your search. Try another recipe, ingredient, or category.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
              >
                Clear Search & Filters
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Surprise Me Modal */}
      <SurpriseMeModal
        isOpen={isSurpriseOpen}
        onClose={() => setIsSurpriseOpen(false)}
        suggestionData={suggestionData}
        onTryAgain={handleTryAgainSurprise}
        loading={loadingSuggestion}
      />
    </MainLayout>
  );
}

export default Dashboard;
