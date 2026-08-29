import { Hono } from "hono";
import { requireAuth } from "../auth/clerk.js";
import * as recipeService from "../services/recipeService.js";

export const recipesRouter = new Hono();

// GET /api/recipes
recipesRouter.get("/", async (c) => {
  const search = c.req.query("search");
  const category = c.req.query("category");
  const difficulty = c.req.query("difficulty");
  const sort = c.req.query("sort");

  const recipes = await recipeService.getRecipes(c.env.DB, search, category, difficulty, sort);
  return c.json(recipes);
});

// GET /api/recipes/my-recipes (Protected - Authenticated user's recipes only)
recipesRouter.get("/my-recipes", requireAuth, async (c) => {
  const userId = c.get("userId");
  const recipes = await recipeService.getMyRecipes(c.env.DB, userId);
  return c.json(recipes);
});

// GET /api/recipes/suggestion
recipesRouter.get("/suggestion", async (c) => {
  const mealPeriod = c.req.query("mealPeriod");
  const excludeIdStr = c.req.query("excludeId");
  const excludeId = excludeIdStr ? parseInt(excludeIdStr, 10) : null;
  const hourStr = c.req.query("hour");
  const hour = hourStr !== undefined && hourStr !== null ? parseInt(hourStr, 10) : null;

  const suggestion = await recipeService.getRecipeSuggestion(
    c.env.DB,
    mealPeriod,
    excludeId && excludeId > 0 ? excludeId : null,
    isNaN(hour) ? null : hour
  );

  if (!suggestion) {
    return c.json({ message: "No suggestions found" }, 404);
  }

  return c.json(suggestion);
});

// POST /api/recipes/match
recipesRouter.post("/match", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body || !body.ingredients || !Array.isArray(body.ingredients)) {
    return c.json([], 200);
  }

  const matches = await recipeService.matchRecipesByIngredients(c.env.DB, body);
  return c.json(matches);
});

// GET /api/recipes/:id
recipesRouter.get("/:id", async (c) => {
  const id = parseInt(c.req.param("id") || "", 10);
  if (isNaN(id) || id <= 0) {
    return c.text("Recipe not found", 404);
  }

  const recipe = await recipeService.getRecipeById(c.env.DB, id);
  if (!recipe) {
    return c.text("Recipe not found", 404);
  }

  return c.json(recipe);
});

// POST /api/recipes (Protected - Creates recipe owned by authenticated user)
recipesRouter.post("/", requireAuth, async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json().catch(() => null);

  if (!body || !body.name || typeof body.name !== "string" || !body.name.trim()) {
    return c.json({ message: "Recipe name is required" }, 400);
  }

  if (body.name.length > 200) {
    return c.json({ message: "Recipe name exceeds maximum length of 200 characters" }, 400);
  }

  const created = await recipeService.createRecipe(c.env.DB, body, userId);
  return c.json(created, 201);
});

// PUT /api/recipes/:id (Protected - Verified creator ownership enforced)
recipesRouter.put("/:id", requireAuth, async (c) => {
  const userId = c.get("userId");
  const id = parseInt(c.req.param("id") || "", 10);
  if (isNaN(id) || id <= 0) {
    return c.text("Recipe not found", 404);
  }

  const body = await c.req.json().catch(() => null);
  if (!body) {
    return c.json({ message: "Invalid request payload" }, 400);
  }

  const updated = await recipeService.updateRecipe(c.env.DB, id, body, userId);
  if (!updated) {
    return c.text("Recipe not found", 404);
  }

  return c.json(updated);
});

// DELETE /api/recipes/:id (Protected - Verified creator ownership enforced)
recipesRouter.delete("/:id", requireAuth, async (c) => {
  const userId = c.get("userId");
  const id = parseInt(c.req.param("id") || "", 10);
  if (isNaN(id) || id <= 0) {
    return c.body(null, 404);
  }

  const deleted = await recipeService.deleteRecipe(c.env.DB, id, userId);
  if (!deleted) {
    return c.body(null, 404);
  }

  return c.body(null, 204);
});
