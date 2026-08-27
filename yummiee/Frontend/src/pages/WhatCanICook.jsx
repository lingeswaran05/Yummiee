import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChefHat,
  Clock,
  Heart,
  Plus,
  Search,
  Users,
  X,
  Check,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

import MainLayout from "../layouts/MainLayout";
import RecipeCardSkeleton from "../components/RecipeCardSkeleton";
import { matchRecipes } from "../services/api";
import { useWishlist } from "../context/WishlistContext";
import { formatTime } from "../utils/formatTime";

const CATEGORIES = [
  "Any",
  "Breakfast",
  "Lunch",
  "Dinner",
  "Dessert",
  "Snacks",
  "Vegetarian",
];

function WhatCanICook() {
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [ingredients, setIngredients] = useState(["Tomato", "Onion", "Egg"]);
  const [inputValue, setInputValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Any");

  const [matchResults, setMatchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAddIngredient = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (!ingredients.some((i) => i.toLowerCase() === trimmed.toLowerCase())) {
      setIngredients((prev) => [...prev, trimmed]);
    }
    setInputValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddIngredient(inputValue);
    }
  };

  const handleRemoveIngredient = (index) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFindRecipes = async () => {
    if (ingredients.length === 0 && !inputValue.trim()) {
      alert("Please add at least one ingredient!");
      return;
    }

    let finalIngredients = [...ingredients];
    if (inputValue.trim()) {
      const extra = inputValue.trim();
      if (!finalIngredients.some((i) => i.toLowerCase() === extra.toLowerCase())) {
        finalIngredients.push(extra);
        setIngredients(finalIngredients);
      }
      setInputValue("");
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const data = await matchRecipes({
        ingredients: finalIngredients,
        category: selectedCategory,
      });
      setMatchResults(data || []);
    } catch (err) {
      console.error("Error matching recipes:", err);
      setError("Failed to fetch matching recipes. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 px-5 py-8 md:px-10 md:py-12">
        {/* Header */}
        <section className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            What Can I Cook?
          </h1>
          <p className="text-text-secondary">
            Tell us what ingredients you already have, and Yummiee will find recipes you can make.
          </p>
        </section>

        {/* Input Box Card */}
        <section className="rounded-3xl border border-[#e4e2e1] bg-white p-6 shadow-sm md:p-8">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-lg">
              📦
            </span>
            <h2 className="text-lg font-bold text-text-primary">
              What's in your kitchen?
            </h2>
          </div>

          {/* Ingredient Chips & Input */}
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#e4e2e1] bg-[#faf8f7] p-3 focus-within:border-primary focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/10 transition">
            {ingredients.map((ing, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-sm font-semibold text-text-primary border border-[#e4e2e1] shadow-xs"
              >
                <span>{ing}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveIngredient(idx)}
                  className="rounded-full p-0.5 text-text-secondary transition hover:bg-red-50 hover:text-red-600"
                  aria-label={`Remove ${ing}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={ingredients.length === 0 ? "Type an ingredient (e.g. Potato) and press Enter..." : "Add another ingredient..."}
              className="flex-1 min-w-[200px] bg-transparent px-2 py-1.5 text-sm outline-none text-text-primary"
            />
          </div>

          <p className="mt-2 text-xs text-text-secondary">
            e.g., Curd, Potato, Rice, Chicken breast, Garlic, Olive oil
          </p>

          {/* Controls: Category Selector & Find Button */}
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-text-secondary">Category Filter:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-12 rounded-xl border border-[#e4e2e1] bg-white px-4 text-sm font-semibold text-text-primary outline-none focus:border-primary"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleFindRecipes}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 font-bold text-white shadow-[0_4px_12px_rgba(174,49,21,0.25)] transition hover:bg-primary-dark"
            >
              <Search className="h-4 w-4" />
              <span>Find Recipes</span>
            </button>
          </div>
        </section>

        {/* Results Section */}
        {loading && (
          <section className="flex flex-col gap-6">
            <h2 className="text-xl font-bold">Matching Recipes</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <RecipeCardSkeleton key={idx} />
              ))}
            </div>
          </section>
        )}

        {!loading && hasSearched && matchResults.length > 0 && (
          <section className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                Found {matchResults.length} recipe{matchResults.length !== 1 ? "s" : ""}
              </h2>
              <span className="text-xs font-semibold text-text-secondary">
                Ranked by ingredient match
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {matchResults.map(({ recipe, matchCount, totalIngredients, matchPercentage, missingIngredients }) => {
                const saved = isInWishlist(recipe.id);
                const isPerfectMatch = matchPercentage === 100;
                const missingCount = missingIngredients ? missingIngredients.length : 0;

                return (
                  <div
                    key={recipe.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-[#e4e2e1] bg-white transition duration-200 hover:shadow-xl hover:-translate-y-1"
                  >
                    {/* Card Image & Match Badge */}
                    <div className="relative h-48 w-full overflow-hidden bg-[#f6f3f2]">
                      <img
                        src={recipe.image || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800"}
                        alt={recipe.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />

                      {/* Match Badge */}
                      <div className="absolute left-3 top-3">
                        {isPerfectMatch ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-md backdrop-blur-md">
                            <Check className="h-3.5 w-3.5" />
                            {matchCount}/{totalIngredients} Matches (Perfect)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white shadow-md backdrop-blur-md">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            Missing {missingCount} item{missingCount !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>

                      {/* Wishlist Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(recipe);
                        }}
                        className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition ${
                          saved ? "text-primary" : "text-text-secondary hover:text-primary"
                        }`}
                      >
                        <Heart className="h-4 w-4" fill={saved ? "currentColor" : "none"} />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col justify-between p-5">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-primary">
                            {recipe.category || "General"}
                          </span>
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                            {Math.round(matchPercentage)}% Match
                          </span>
                        </div>

                        <h3 className="mt-2 text-lg font-bold text-text-primary group-hover:text-primary transition">
                          {recipe.name}
                        </h3>

                        <p className="mt-1 line-clamp-2 text-sm text-text-secondary">
                          {recipe.description}
                        </p>

                        {/* Missing Ingredients list indicator */}
                        {missingCount > 0 && (
                          <p className="mt-3 text-xs text-amber-700 font-medium line-clamp-1 bg-amber-50 px-2.5 py-1 rounded-lg">
                            Missing: {missingIngredients.join(", ")}
                          </p>
                        )}

                        <div className="mt-4 flex items-center gap-4 text-xs font-semibold text-text-secondary">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-primary" />
                            <span>{formatTime(recipe.time)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-primary" />
                            <span>{recipe.servings} servings</span>
                          </div>
                        </div>
                      </div>

                      <Link
                        to={`/recipe/${recipe.id}`}
                        className="mt-5 inline-block text-sm font-bold text-primary hover:text-primary-dark"
                      >
                        View Recipe →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {!loading && hasSearched && matchResults.length === 0 && (
          <section className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-dashed border-[#e4e2e1] bg-white p-8 text-center shadow-sm">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ChefHat className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold">No matching recipes found</h3>
            <p className="mt-2 max-w-md text-sm text-text-secondary leading-relaxed">
              We couldn't find any recipes matching those ingredients under the selected category. Try adding more ingredients or setting category to "Any".
            </p>
          </section>
        )}

        {!loading && !hasSearched && (
          <section className="flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-dashed border-[#e4e2e1] bg-white p-8 text-center shadow-sm">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold">Ready to cook?</h3>
            <p className="mt-1 max-w-md text-sm text-text-secondary">
              Add the ingredients you have available above and click <strong>Find Recipes</strong> to discover what you can make today!
            </p>
          </section>
        )}
      </main>
    </MainLayout>
  );
}

export default WhatCanICook;
