import { Hono } from "hono";
import { Env, Variables, RecipeDTO, IngredientMatchRequest } from "../types";
import { requireAuth } from "../auth/clerk";
import * as recipeService from "../services/recipeService";

export const recipesRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

// GET /api/recipes
recipesRouter.get("/", async (c) => {
  const search = c.req.query("search");
  const category = c.req.query("category");
  const difficulty = c.req.query("difficulty");
  const sort = c.req.query("sort");

  const recipes = await recipeService.getRecipes(c.env.DB, search, category, difficulty, sort);
  return c.json(recipes);
});

// GET /api/recipes/my-recipes (Protected)
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
    excludeId,
    isNaN(hour as any) ? null : hour
  );

  if (!suggestion) {
    return c.json({ message: "No suggestions found" }, 404);
  }

  return c.json(suggestion);
});

// POST /api/recipes/match
recipesRouter.post("/match", async (c) => {
  const body = await c.req.json<IngredientMatchRequest>().catch(() => null);
  if (!body) {
    return c.json([], 200);
  }

  const matches = await recipeService.matchRecipesByIngredients(c.env.DB, body);
  return c.json(matches);
});

// GET /api/recipes/:id
recipesRouter.get("/:id", async (c) => {
  const id = parseInt(c.req.param("id") || "", 10);
  if (isNaN(id)) {
    return c.text("Recipe not found", 404);
  }

  const recipe = await recipeService.getRecipeById(c.env.DB, id);
  if (!recipe) {
    return c.text("Recipe not found", 404);
  }

  return c.json(recipe);
});

// POST /api/recipes (Protected)
recipesRouter.post("/", requireAuth, async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json<RecipeDTO>().catch(() => null);

  if (!body || !body.name || !body.name.trim()) {
    return c.json({ message: "Recipe name is required" }, 400);
  }

  const created = await recipeService.createRecipe(c.env.DB, body, userId);
  return c.json(created, 201);
});

// PUT /api/recipes/:id (Protected)
recipesRouter.put("/:id", requireAuth, async (c) => {
  const userId = c.get("userId");
  const id = parseInt(c.req.param("id") || "", 10);
  if (isNaN(id)) {
    return c.text("Recipe not found", 404);
  }

  const body = await c.req.json<RecipeDTO>().catch(() => null);
  if (!body) {
    return c.json({ message: "Invalid request payload" }, 400);
  }

  const updated = await recipeService.updateRecipe(c.env.DB, id, body, userId);
  if (!updated) {
    return c.text("Recipe not found", 404);
  }

  return c.json(updated);
});

// DELETE /api/recipes/:id (Protected)
recipesRouter.delete("/:id", requireAuth, async (c) => {
  const userId = c.get("userId");
  const id = parseInt(c.req.param("id") || "", 10);
  if (isNaN(id)) {
    return c.body(null, 404);
  }

  const deleted = await recipeService.deleteRecipe(c.env.DB, id, userId);
  if (!deleted) {
    return c.body(null, 404);
  }

  return c.body(null, 204);
});
