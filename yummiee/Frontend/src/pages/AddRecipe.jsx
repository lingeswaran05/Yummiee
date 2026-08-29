import { useState } from "react";
import {
  ArrowLeft,
  ImagePlus,
  Plus,
  Trash2,
  GripVertical,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import { createRecipe, uploadImageApi } from "../services/api";

function AddRecipe() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [recipe, setRecipe] = useState({
    name: "",
    description: "",
    category: "Dinner",
    time: 30,
    difficulty: "Easy",
    servings: 2,
    image: "",
  });

  const [timeUnit, setTimeUnit] = useState("min");

  const [ingredients, setIngredients] = useState([
    {
      id: 1,
      name: "",
      quantity: 1,
      unit: "unit",
    },
  ]);

  const [instructions, setInstructions] = useState([
    {
      id: 1,
      text: "",
    },
  ]);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const updateRecipe = (field, value) => {
    setRecipe((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleTimeUnitChange = (newUnit) => {
    if (newUnit === timeUnit) return;
    const currentVal = Number(recipe.time);
    if (newUnit === "hr" && currentVal > 0) {
      const converted = Number((currentVal / 60).toFixed(2));
      updateRecipe("time", converted);
    } else if (newUnit === "min" && currentVal > 0) {
      const converted = Math.round(currentVal * 60);
      updateRecipe("time", converted);
    }
    setTimeUnit(newUnit);
  };

  const addIngredient = () => {
    setIngredients((current) => [
      ...current,
      {
        id: Date.now(),
        name: "",
        quantity: 1,
        unit: "unit",
      },
    ]);
  };

  const removeIngredient = (id) => {
    if (ingredients.length === 1) return;
    setIngredients((current) => current.filter((ing) => ing.id !== id));
  };

  const updateIngredient = (id, field, value) => {
    setIngredients((current) =>
      current.map((ing) => (ing.id === id ? { ...ing, [field]: value } : ing))
    );
  };

  const addInstruction = () => {
    setInstructions((current) => [
      ...current,
      {
        id: Date.now(),
        text: "",
      },
    ]);
  };

  const removeInstruction = (id) => {
    if (instructions.length === 1) return;
    setInstructions((current) => current.filter((inst) => inst.id !== id));
  };

  const updateInstruction = (id, value) => {
    setInstructions((current) =>
      current.map((inst) => (inst.id === id ? { ...inst, text: value } : inst))
    );
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result;
      setImagePreview(base64Data);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const rawTime = Number(recipe.time) || 0;
      const totalMinutes = timeUnit === "hr" ? Math.round(rawTime * 60) : Math.round(rawTime);

      let finalImageUrl = recipe.image || imagePreview || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800";

      if (imageFile) {
        try {
          const uploadRes = await uploadImageApi(imageFile);
          if (uploadRes?.url) {
            finalImageUrl = uploadRes.url;
          }
        } catch (uploadErr) {
          console.warn("Could not upload to R2, falling back to preview/default:", uploadErr);
        }
      }

      const payload = {
        name: recipe.name,
        description: recipe.description,
        category: recipe.category,
        time: totalMinutes,
        difficulty: recipe.difficulty,
        servings: Number(recipe.servings),
        image: finalImageUrl,
        ingredients: ingredients.map((ing) => ({
          name: ing.name,
          quantity: Number(ing.quantity) || 1,
          unit: ing.unit || "unit",
        })),
        instructions: instructions.map((inst, index) => ({
          step: index + 1,
          title: `Step ${index + 1}`,
          description: inst.text,
        })),
      };

      await createRecipe(payload);
      navigate("/dashboard");
    } catch (err) {
      console.error("Error creating recipe:", err);
      alert("Failed to create recipe. Please check your backend connection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <main className="mx-auto w-full max-w-[1000px] px-5 py-8 md:px-10 md:py-12">
        <Link
          to="/dashboard"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-text-secondary transition hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <section className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Add a New Recipe
          </h1>
          <p className="mt-2 text-text-secondary">
            Share your favorite recipe and keep everything organized.
          </p>
        </section>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* BASIC INFO */}
          <section className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold">Recipe Information</h2>
              <p className="mt-1 text-sm text-text-secondary">
                Tell us a little about your recipe.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold">Recipe Name</label>
                <input
                  type="text"
                  required
                  value={recipe.name}
                  onChange={(e) => updateRecipe("name", e.target.value)}
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
                  onChange={(e) => updateRecipe("description", e.target.value)}
                  placeholder="Describe your recipe..."
                  className="w-full resize-none rounded-xl border border-border bg-white px-4 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">Category</label>
                <select
                  value={recipe.category}
                  onChange={(e) => updateRecipe("category", e.target.value)}
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
                <div className="flex h-14 w-full rounded-xl border border-border bg-white overflow-hidden focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
                  <input
                    type="number"
                    min="0.1"
                    step="any"
                    required
                    value={recipe.time}
                    onChange={(e) => updateRecipe("time", e.target.value)}
                    placeholder={timeUnit === "hr" ? "0.5" : "30"}
                    className="h-full min-w-0 flex-1 px-4 outline-none bg-transparent text-text-primary"
                  />
                  <select
                    value={timeUnit}
                    onChange={(e) => handleTimeUnitChange(e.target.value)}
                    className="h-full border-l border-border bg-[#faf8f7] px-3 text-sm font-semibold text-text-secondary outline-none cursor-pointer hover:bg-[#f3efed] transition"
                  >
                    <option value="min">min (Minutes)</option>
                    <option value="hr">hr (Hours)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">Difficulty</label>
                <select
                  value={recipe.difficulty}
                  onChange={(e) => updateRecipe("difficulty", e.target.value)}
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
                  onChange={(e) => updateRecipe("servings", Number(e.target.value))}
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
                Add a beautiful image of your dish.
              </p>
            </div>

            <label className="group relative flex min-h-[240px] cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-[#faf8f7] transition hover:border-primary">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Recipe preview"
                  loading="lazy"
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
                  Add every ingredient needed for the recipe.
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
                  Add the steps in the order they should be followed.
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
              onClick={() => navigate("/dashboard")}
              className="rounded-xl border border-border px-6 py-3 font-semibold text-text-secondary transition hover:bg-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-primary px-7 py-3 font-semibold text-white shadow-[0_4px_12px_rgba(174,49,21,0.2)] transition hover:bg-primary-dark disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create Recipe"}
            </button>
          </div>
        </form>
      </main>
    </MainLayout>
  );
}

export default AddRecipe;
