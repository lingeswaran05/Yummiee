import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Eye, ChefHat, AlertCircle, Clock, Users, AlertTriangle, X } from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import RecipeCardSkeleton from "../components/RecipeCardSkeleton";
import { fetchMyRecipes, deleteRecipe } from "../services/api";
import { formatTime } from "../utils/formatTime";

const CATEGORIES = ["All", "Breakfast", "Lunch", "Dinner", "Dessert", "Snacks", "Vegetarian"];

function MyRecipes() {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Deletion modal state
  const [recipeToDelete, setRecipeToDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadMyRecipes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyRecipes();
      setRecipes(data || []);
    } catch (err) {
      console.error("Error fetching my recipes:", err);
      setError("Failed to load your recipes. Make sure the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyRecipes();
  }, []);

  const confirmDelete = async () => {
    if (!recipeToDelete) return;

    const id = recipeToDelete.id;
    setDeletingId(id);
    try {
      await deleteRecipe(id);
      setRecipes((current) => current.filter((r) => r.id !== id));
      setRecipeToDelete(null);
    } catch (err) {
      console.error("Error deleting recipe:", err);
      alert("Failed to delete recipe. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  // Filter recipes based on selected category
  const filteredRecipes = recipes.filter((recipe) => {
    if (selectedCategory === "All") return true;
    return recipe.category?.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <MainLayout>
      <main className="mx-auto w-full max-w-[1200px] px-5 py-8 md:px-10 md:py-12">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              My Recipes
            </h1>
            <p className="mt-1 text-text-secondary">
              Manage, edit, and view all recipes created by you.
            </p>
          </div>

          <Link
            to="/add-recipe"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-white shadow-[0_4px_12px_rgba(174,49,21,0.2)] transition hover:bg-primary-dark"
          >
            <Plus className="h-5 w-5" />
            <span>Add New Recipe</span>
          </Link>
        </div>

        {/* Category Filters */}
        <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "border border-[#e4e2e1] bg-white text-text-secondary hover:bg-[#f6f3f2] hover:text-primary"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Loading State - Skeleton Cards */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <RecipeCardSkeleton key={idx} />
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-red-50 p-8 text-center text-red-700">
            <AlertCircle className="mb-2 h-10 w-10" />
            <p className="font-semibold">{error}</p>
            <button
              onClick={loadMyRecipes}
              className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State - No Recipes at all */}
        {!loading && !error && recipes.length === 0 && (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-white p-8 text-center shadow-sm">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ChefHat className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold">No recipes uploaded yet</h2>
            <p className="mt-1 max-w-sm text-sm text-text-secondary">
              You haven't created any recipes. Click below to add your first recipe!
            </p>
            <Link
              to="/add-recipe"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-md transition hover:bg-primary-dark"
            >
              <Plus className="h-5 w-5" />
              <span>Create Recipe</span>
            </Link>
          </div>
        )}

        {/* Empty Filter State - Category has 0 matches */}
        {!loading && !error && recipes.length > 0 && filteredRecipes.length === 0 && (
          <div className="flex min-h-[280px] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-white p-8 text-center shadow-sm">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#f6f3f2] text-text-secondary">
              <ChefHat className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold">No {selectedCategory} recipes found</h3>
            <p className="mt-1 text-sm text-text-secondary">
              You haven't added any recipes under the "{selectedCategory}" category.
            </p>
            <button
              onClick={() => setSelectedCategory("All")}
              className="mt-4 text-sm font-bold text-primary hover:underline"
            >
              Clear Filter
            </button>
          </div>
        )}

        {/* Recipe Grid */}
        {!loading && !error && filteredRecipes.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[#e4e2e1] bg-white transition duration-200 hover:shadow-lg"
              >
                {/* Image */}
                <div className="relative h-48 w-full overflow-hidden bg-[#f6f3f2]">
                  <img
                    src={recipe.image || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800"}
                    alt={recipe.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-primary backdrop-blur-md shadow-sm">
                    {recipe.category || "General"}
                  </span>
                </div>

                {/* Details */}
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <h3 className="text-lg font-bold text-text-primary group-hover:text-primary">
                      {recipe.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-text-secondary">
                      {recipe.description}
                    </p>

                    <div className="mt-4 flex items-center gap-4 text-xs font-semibold text-text-secondary">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>{formatTime(recipe.time)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-primary" />
                        <span>{recipe.servings} servings</span>
                      </div>
                      <span className="rounded-md bg-[#f6f3f2] px-2 py-0.5 font-bold">
                        {recipe.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex items-center gap-2 border-t border-[#f0edec] pt-4">
                    <button
                      onClick={() => navigate(`/recipe/${recipe.id}`)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#e4e2e1] bg-white py-2 text-xs font-bold text-text-primary transition hover:bg-primary/5 hover:text-primary"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>

                    <button
                      onClick={() => navigate(`/edit-recipe/${recipe.id}`)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-primary/20 bg-primary/10 py-2 text-xs font-bold text-primary transition hover:bg-primary/20"
                      title="Edit Recipe"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => setRecipeToDelete({ id: recipe.id, name: recipe.name })}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
                      title="Delete Recipe"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CUSTOM POPUP CONFIRMATION MODAL */}
        {recipeToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#e4e2e1] bg-white p-6 shadow-2xl">
              {/* Close Button */}
              <button
                onClick={() => setRecipeToDelete(null)}
                disabled={deletingId !== null}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-text-secondary hover:bg-[#f6f3f2] hover:text-text-primary disabled:opacity-30"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex flex-col items-center text-center">
                {/* Warning Icon */}
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                  <AlertTriangle className="h-7 w-7" />
                </div>

                <h3 className="text-xl font-bold text-text-primary">Delete Recipe?</h3>
                <p className="mt-2 text-sm text-text-secondary">
                  Are you sure you want to delete{" "}
                  <span className="font-bold text-text-primary">"{recipeToDelete.name}"</span>? This action cannot be undone.
                </p>

                {/* Modal Buttons */}
                <div className="mt-6 flex w-full gap-3">
                  <button
                    type="button"
                    onClick={() => setRecipeToDelete(null)}
                    disabled={deletingId !== null}
                    className="flex-1 rounded-xl border border-[#e4e2e1] bg-white py-3 font-semibold text-text-secondary transition hover:bg-[#f6f3f2] hover:text-text-primary disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDelete}
                    disabled={deletingId !== null}
                    className="flex-1 rounded-xl bg-red-600 py-3 font-semibold text-white shadow-md transition hover:bg-red-700 disabled:opacity-50"
                  >
                    {deletingId !== null ? "Deleting..." : "Yes, Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </MainLayout>
  );
}

export default MyRecipes;
