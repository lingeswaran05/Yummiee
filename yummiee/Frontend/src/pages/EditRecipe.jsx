import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ImagePlus, Plus, Trash2, GripVertical, AlertCircle } from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import { fetchRecipeById, updateRecipe } from "../services/api";

function EditRecipe() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [recipe, setRecipe] = useState({
    name: "",
    description: "",
    category: "Dinner",
    time: 30,
    difficulty: "Easy",
    servings: 2,
    image: "",
  });

  const [ingredients, setIngredients] = useState([]);
  const [instructions, setInstructions] = useState([]);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    async function loadRecipe() {
      try {
        setLoading(true);
        const data = await fetchRecipeById(id);
        if (data) {
          setRecipe({
            name: data.name || "",
            description: data.description || "",
            category: data.category || "Dinner",
            time: data.time || 30,
            difficulty: data.difficulty || "Easy",
            servings: data.servings || 2,
            image: data.image || "",
          });
          setImagePreview(data.image || "");

          if (data.ingredients && data.ingredients.length > 0) {
            setIngredients(
              data.ingredients.map((ing, idx) => ({
                id: ing.id || Date.now() + idx,
                name: ing.name || "",
                quantity: Math.max(1, Math.floor(Number(ing.quantity) || 1)),
                unit: ing.unit || "unit",
              }))
            );
          } else {
            setIngredients([{ id: Date.now(), name: "", quantity: 1, unit: "unit" }]);
          }

          if (data.instructions && data.instructions.length > 0) {
            setInstructions(
              data.instructions.map((inst, idx) => ({
                id: Date.now() + idx,
                text: inst.description || inst.title || "",
              }))
            );
          } else {
            setInstructions([{ id: Date.now(), text: "" }]);
          }
        }
      } catch (err) {
        console.error("Error fetching recipe for edit:", err);
        setError("Failed to load recipe data.");
      } finally {
        setLoading(false);
      }
    }
    loadRecipe();
  }, [id]);

  const updateRecipeField = (field, value) => {
    setRecipe((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const addIngredient = () => {
    setIngredients((current) => [
      ...current,
      { id: Date.now(), name: "", quantity: 1, unit: "unit" },
    ]);
  };

  const removeIngredient = (ingId) => {
    if (ingredients.length === 1) return;
    setIngredients((current) => current.filter((ing) => ing.id !== ingId));
  };

  const updateIngredient = (ingId, field, value) => {
    setIngredients((current) =>
      current.map((ing) => (ing.id === ingId ? { ...ing, [field]: value } : ing))
    );
  };

  const addInstruction = () => {
    setInstructions((current) => [...current, { id: Date.now(), text: "" }]);
  };

  const removeInstruction = (instId) => {
    if (instructions.length === 1) return;
    setInstructions((current) => current.filter((inst) => inst.id !== instId));
  };

  const updateInstruction = (instId, value) => {
    setInstructions((current) =>
      current.map((inst) => (inst.id === instId ? { ...inst, text: value } : inst))
    );
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result;
      setImagePreview(base64Data);
      setRecipe((current) => ({
        ...current,
        image: base64Data,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        name: recipe.name,
        description: recipe.description,
        category: recipe.category,
        time: Number(recipe.time),
        difficulty: recipe.difficulty,
        servings: Number(recipe.servings),
        image: recipe.image || imagePreview,
        ingredients: ingredients
          .filter((ing) => ing.name.trim() !== "")
          .map((ing) => ({
            name: ing.name,
            quantity: Number(ing.quantity) || 1,
            unit: ing.unit || "unit",
          })),
        instructions: instructions
          .filter((inst) => inst.text.trim() !== "")
          .map((inst, index) => ({
            step: index + 1,
            title: `Step ${index + 1}`,
            description: inst.text,
          })),
      };

      await updateRecipe(id, payload);
      navigate("/my-recipes");
    } catch (err) {
      console.error("Error updating recipe:", err);
      alert("Failed to update recipe. Please check backend connections.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm font-semibold text-text-secondary">Loading recipe details...</p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="mx-auto my-12 max-w-md rounded-2xl bg-red-50 p-8 text-center text-red-700">
          <AlertCircle className="mx-auto mb-2 h-10 w-10" />
          <p className="font-semibold">{error}</p>
          <Link
            to="/my-recipes"
            className="mt-4 inline-block rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700"
          >
            Back to My Recipes
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <main className="mx-auto w-full max-w-[1000px] px-5 py-8 md:px-10 md:py-12">
        <Link
          to="/my-recipes"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-text-secondary transition hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Recipes
        </Link>

        <section className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Edit Recipe
          </h1>
          <p className="mt-2 text-text-secondary">
            Update recipe details, ingredients, cooking instructions, or image.
          </p>
        </section>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* BASIC INFO */}
          <section className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold">Recipe Information</h2>
              <p className="mt-1 text-sm text-text-secondary">
                Update the primary details of your recipe.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold">Recipe Name</label>
                <input
                  type="text"
                  required
                  value={recipe.name}
                  onChange={(e) => updateRecipeField("name", e.target.value)}
                  placeholder="e.g. Creamy Garlic Pasta"
                  className="h-14 w-full rounded-xl border border-border bg-white px-4 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold">Description</label>
                <textarea
                  required
                  rows={4}
                  value={recipe.description}
                  onChange={(e) => updateRecipeField("description", e.target.value)}
                  placeholder="Describe your recipe..."
                  className="w-full resize-none rounded-xl border border-border bg-white px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">Category</label>
                <select
                  value={recipe.category}
                  onChange={(e) => updateRecipeField("category", e.target.value)}
                  className="h-14 w-full rounded-xl border border-border bg-white px-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                >
                  <option>Breakfast</option>
                  <option>Lunch</option>
                  <option>Dinner</option>
                  <option>Dessert</option>
                  <option>Snacks</option>
                  <option>Vegetarian</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">Cooking Time</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    required
                    value={recipe.time}
                    onChange={(e) => updateRecipeField("time", e.target.value)}
                    placeholder="30"
                    className="h-14 w-full rounded-xl border border-border bg-white px-4 pr-16 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-text-secondary">
                    min
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">Difficulty</label>
                <select
                  value={recipe.difficulty}
                  onChange={(e) => updateRecipeField("difficulty", e.target.value)}
                  className="h-14 w-full rounded-xl border border-border bg-white px-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">Servings</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={recipe.servings}
                  onChange={(e) => updateRecipeField("servings", Number(e.target.value))}
                  className="h-14 w-full rounded-xl border border-border bg-white px-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              </div>
            </div>
          </section>

          {/* IMAGE */}
          <section className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold">Recipe Image</h2>
              <p className="mt-1 text-sm text-text-secondary">
                Upload a new image file to update the recipe image BLOB in the database.
              </p>
            </div>

            <label className="group relative flex min-h-[240px] cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-[#faf8f7] transition hover:border-primary">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Recipe preview"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <ImagePlus className="h-7 w-7 text-primary" />
                  </div>
                  <p className="font-semibold">Upload recipe image</p>
                  <p className="mt-1 text-sm text-text-secondary">PNG, JPG or WEBP</p>
                </div>
              )}

              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </section>

          {/* INGREDIENTS */}
          <section className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Ingredients</h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Update ingredients required for this recipe.
                </p>
              </div>

              <button
                type="button"
                onClick={addIngredient}
                className="flex shrink-0 items-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5 text-sm font-bold text-primary transition hover:bg-primary/15"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {ingredients.map((ingredient) => (
                <div
                  key={ingredient.id}
                  className="grid grid-cols-[minmax(0,1fr)_64px_84px_32px] items-center gap-2 sm:grid-cols-[auto_minmax(0,1fr)_100px_120px_auto] sm:gap-3"
                >
                  <GripVertical className="hidden h-5 w-5 text-text-secondary sm:block" />

                  <input
                    type="text"
                    required
                    value={ingredient.name}
                    onChange={(e) => updateIngredient(ingredient.id, "name", e.target.value)}
                    placeholder="Ingredient"
                    className="h-12 min-w-0 rounded-xl border border-border px-3 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 sm:px-4"
                  />

                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={ingredient.quantity}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, "");
                      updateIngredient(ingredient.id, "quantity", val ? parseInt(val, 10) : "");
                    }}
                    placeholder="Qty"
                    className="h-12 min-w-0 rounded-xl border border-border px-2 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 sm:px-3"
                  />

                  <select
                    required
                    value={ingredient.unit}
                    onChange={(e) => updateIngredient(ingredient.id, "unit", e.target.value)}
                    className="h-12 min-w-0 rounded-xl border border-border bg-white px-2 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 sm:px-3"
                  >
                    <option value="" disabled>Unit</option>
                    <option value="g">g (grams)</option>
                    <option value="kg">kg (kilograms)</option>
                    <option value="mg">mg (milligrams)</option>
                    <option value="ml">ml (milliliters)</option>
                    <option value="l">l (liters)</option>
                    <option value="tsp">tsp (teaspoon)</option>
                    <option value="tbsp">tbsp (tablespoon)</option>
                    <option value="cup">cup</option>
                    <option value="bowl">bowl</option>
                    <option value="pinch">pinch</option>
                    <option value="piece">piece</option>
                    <option value="unit">unit</option>
                    <option value="slice">slice</option>
                    <option value="clove">clove</option>
                    {ingredient.unit && !["g","kg","mg","ml","l","tsp","tbsp","cup","bowl","pinch","piece","unit","slice","clove"].includes(ingredient.unit) && (
                      <option value={ingredient.unit}>{ingredient.unit}</option>
                    )}
                  </select>

                  <button
                    type="button"
                    onClick={() => removeIngredient(ingredient.id)}
                    disabled={ingredients.length === 1}
                    className="flex h-10 w-8 items-center justify-center rounded-lg text-text-secondary transition hover:bg-red-50 hover:text-red-600 disabled:opacity-30 sm:w-10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* INSTRUCTIONS */}
          <section className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Cooking Instructions</h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Update step-by-step instructions.
                </p>
              </div>

              <button
                type="button"
                onClick={addInstruction}
                className="flex shrink-0 items-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5 text-sm font-bold text-primary transition hover:bg-primary/15"
              >
                <Plus className="h-4 w-4" />
                Add Step
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {instructions.map((instruction, index) => (
                <div key={instruction.id} className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {index + 1}
                  </div>

                  <textarea
                    required
                    rows={3}
                    value={instruction.text}
                    onChange={(e) => updateInstruction(instruction.id, e.target.value)}
                    placeholder={`Describe step ${index + 1}...`}
                    className="flex-1 resize-none rounded-xl border border-border px-4 py-3 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />

                  <button
                    type="button"
                    onClick={() => removeInstruction(instruction.id)}
                    disabled={instructions.length === 1}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-text-secondary transition hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* ACTIONS */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate("/my-recipes")}
              className="rounded-xl border border-border px-6 py-3 font-semibold text-text-secondary transition hover:bg-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-primary px-7 py-3 font-semibold text-white shadow-[0_4px_12px_rgba(174,49,21,0.2)] transition hover:bg-primary-dark disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </main>
    </MainLayout>
  );
}

export default EditRecipe;
