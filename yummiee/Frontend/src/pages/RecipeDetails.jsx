import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  Clock,
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  Star,
  Users,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import { fetchRecipeById } from "../services/api";
import { useWishlist } from "../context/WishlistContext";
import { useShoppingList } from "../context/ShoppingListContext";

function RecipeDetails() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [servings, setServings] = useState(2);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [addedToShoppingList, setAddedToShoppingList] = useState(false);

  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addIngredients } = useShoppingList();

  useEffect(() => {
    let isMounted = true;
    const loadDetail = async () => {
      setLoading(true);
      try {
        const data = await fetchRecipeById(id);
        if (isMounted && data) {
          setRecipe(data);
          setServings(data.servings || 2);
          if (data.ingredients) {
            setSelectedIngredients(data.ingredients.map((ing) => ing.id));
          }
        }
      } catch (err) {
        console.error("Failed to load recipe details:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDetail();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex min-h-screen items-center justify-center px-5">
          <p className="text-text-secondary">Loading recipe details...</p>
        </div>
      </MainLayout>
    );
  }

  if (!recipe) {
    return (
      <MainLayout>
        <div className="flex min-h-screen items-center justify-center px-5">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Recipe not found</h1>
            <p className="mt-2 text-text-secondary">
              We couldn't find the recipe you're looking for.
            </p>
            <Link
              to="/dashboard"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  const saved = isInWishlist(recipe.id);

  const increaseServings = () => {
    setServings((current) => current + 1);
    setAddedToShoppingList(false);
  };

  const decreaseServings = () => {
    setServings((current) => Math.max(1, current - 1));
    setAddedToShoppingList(false);
  };

  const toggleIngredient = (ingredientId) => {
    setSelectedIngredients((current) =>
      current.includes(ingredientId)
        ? current.filter((iId) => iId !== ingredientId)
        : [...current, ingredientId]
    );
  };

  const selectAllIngredients = () => {
    if (selectedIngredients.length === (recipe.ingredients?.length || 0)) {
      setSelectedIngredients([]);
    } else {
      setSelectedIngredients((recipe.ingredients || []).map((ing) => ing.id));
    }
  };

  const handleAddToShoppingList = () => {
    const selected = (recipe.ingredients || []).filter((ing) =>
      selectedIngredients.includes(ing.id)
    );

    if (selected.length === 0) return;

    const selectedRecipe = {
      ...recipe,
      ingredients: selected,
    };

    addIngredients(selectedRecipe, servings);
    setAddedToShoppingList(true);
  };

  return (
    <MainLayout>
      <main className="mx-auto w-full max-w-[1280px] px-5 py-8 md:px-10 md:py-12">
        {/* Back */}
        <Link
          to="/dashboard"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-text-secondary transition hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to recipes
        </Link>

        {/* HERO */}
        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative overflow-hidden rounded-[24px] bg-gray-100">
            <img
              src={recipe.image || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800"}
              alt={recipe.name}
              className="h-[360px] w-full object-cover sm:h-[460px]"
            />

            <button
              type="button"
              onClick={() => toggleWishlist(recipe)}
              className={`absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full bg-white/95 shadow-lg backdrop-blur-sm transition hover:scale-105 ${
                saved ? "text-primary" : "text-text-secondary"
              }`}
              aria-label="Toggle wishlist"
            >
              <Heart className="h-6 w-6" fill={saved ? "currentColor" : "none"} />
            </button>
          </div>

          <div className="flex flex-col justify-center">
            <span className="mb-4 w-fit rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary">
              {recipe.category}
            </span>

            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              {recipe.name}
            </h1>

            <p className="mt-5 text-base leading-7 text-text-secondary sm:text-lg">
              {recipe.description}
            </p>

            <div className="mt-5 flex items-center gap-2">
              <div className="flex items-center gap-1 text-[#E8A317]">
                <Star className="h-5 w-5" fill="currentColor" />
                <span className="font-bold">{recipe.rating || 4.5}</span>
              </div>

              <span className="text-sm text-text-secondary">
                ({recipe.reviews || 0} reviews)
              </span>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 shadow-sm">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-text-secondary">Time</p>
                  <p className="font-semibold">{recipe.time} min</p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 shadow-sm">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-text-secondary">Difficulty</p>
                  <p className="font-semibold">{recipe.difficulty}</p>
                </div>
              </div>
            </div>

            <div className="mt-7 rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-5">
                <div>
                  <h3 className="font-bold">Servings</h3>
                  <p className="mt-1 text-sm text-text-secondary">
                    Ingredient quantities adjust automatically.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={decreaseServings}
                    disabled={servings === 1}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Minus className="h-4 w-4" />
                  </button>

                  <span className="w-8 text-center text-lg font-bold">{servings}</span>

                  <button
                    type="button"
                    onClick={increaseServings}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border transition hover:border-primary hover:text-primary"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INGREDIENTS */}
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <section className="mt-16">
            <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold">Ingredients</h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Select the ingredients you want to add to your shopping list.
                </p>
              </div>

              <button
                type="button"
                onClick={selectAllIngredients}
                className="w-fit text-sm font-bold text-primary hover:underline"
              >
                {selectedIngredients.length === recipe.ingredients.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recipe.ingredients.map((ingredient) => {
                const selected = selectedIngredients.includes(ingredient.id);
                const scaledQuantity =
                  (ingredient.quantity / (recipe.servings || 1)) * servings;

                return (
                  <button
                    type="button"
                    key={ingredient.id}
                    onClick={() => toggleIngredient(ingredient.id)}
                    className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition ${
                      selected
                        ? "border-primary/30 bg-primary/5"
                        : "border-transparent bg-white shadow-sm"
                    }`}
                  >
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition ${
                        selected
                          ? "border-primary bg-primary text-white"
                          : "border-border bg-white"
                      }`}
                    >
                      {selected && <Check className="h-4 w-4" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{ingredient.name}</p>
                      <p className="mt-1 text-xs text-text-secondary">Ingredient</p>
                    </div>

                    <span className="shrink-0 font-bold text-primary">
                      {Number.isInteger(scaledQuantity)
                        ? scaledQuantity
                        : scaledQuantity.toFixed(1)}{" "}
                      {ingredient.unit}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">
                  {selectedIngredients.length} ingredients selected
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  Quantities are based on {servings} servings.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddToShoppingList}
                disabled={selectedIngredients.length === 0}
                className={`flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold transition ${
                  addedToShoppingList
                    ? "bg-secondary text-white"
                    : "bg-primary text-white hover:bg-primary-dark"
                } disabled:cursor-not-allowed disabled:opacity-40`}
              >
                {addedToShoppingList ? (
                  <>
                    <Check className="h-5 w-5" />
                    Added to Shopping List
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    Add to Shopping List
                  </>
                )}
              </button>
            </div>
          </section>
        )}

        {/* INSTRUCTIONS */}
        {recipe.instructions && recipe.instructions.length > 0 && (
          <section className="mt-16">
            <div className="mb-8">
              <h2 className="text-2xl font-bold">How to Make It</h2>
              <p className="mt-1 text-sm text-text-secondary">Follow these simple steps.</p>
            </div>

            <div className="max-w-4xl">
              {recipe.instructions.map((instruction) => (
                <div key={instruction.step} className="relative flex gap-5 pb-10 last:pb-0">
                  <div className="flex flex-col items-center">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-white">
                      {instruction.step}
                    </div>

                    {instruction.step !== recipe.instructions.length && (
                      <div className="mt-2 h-full w-px bg-border" />
                    )}
                  </div>

                  <div className="pt-1">
                    <h3 className="text-lg font-bold">{instruction.title}</h3>
                    <p className="mt-2 leading-7 text-text-secondary">
                      {instruction.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* NUTRITION */}
        {recipe.nutrition && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold">Nutrition</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Approximate nutrition information per serving.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              <NutritionCard label="Calories" value={recipe.nutrition.calories} unit="kcal" />
              <NutritionCard label="Protein" value={recipe.nutrition.protein} unit="g" />
              <NutritionCard label="Carbs" value={recipe.nutrition.carbs} unit="g" />
              <NutritionCard label="Fat" value={recipe.nutrition.fat} unit="g" />
            </div>
          </section>
        )}

        {/* NOTES */}
        {recipe.notes && (
          <section className="mt-16 mb-10">
            <div className="rounded-2xl bg-primary/5 p-6">
              <h2 className="text-xl font-bold">Chef's Note</h2>
              <p className="mt-3 leading-7 text-text-secondary">{recipe.notes}</p>
            </div>
          </section>
        )}
      </main>
    </MainLayout>
  );
}

function NutritionCard({ label, value, unit }) {
  return (
    <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
      <p className="text-sm font-medium text-text-secondary">{label}</p>
      <p className="mt-2 text-2xl font-bold text-primary">
        {value ?? 0}
        <span className="ml-1 text-sm font-medium text-text-secondary">{unit}</span>
      </p>
    </div>
  );
}

export default RecipeDetails;