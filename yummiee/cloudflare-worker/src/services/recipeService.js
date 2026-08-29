import { normalizeIngredient, isIngredientMatched } from "../utils/normalize.js";

export async function populateRecipeDetails(db, recipeRows) {
  if (!recipeRows || recipeRows.length === 0) return [];

  const recipeIds = recipeRows.map((r) => r.id);
  const placeholders = recipeIds.map(() => "?").join(",");

  const [ingredientsRes, instructionsRes, nutritionRes] = await Promise.all([
    db
      .prepare(`SELECT * FROM ingredients WHERE recipe_id IN (${placeholders}) ORDER BY id ASC`)
      .bind(...recipeIds)
      .all(),
    db
      .prepare(`SELECT * FROM instructions WHERE recipe_id IN (${placeholders}) ORDER BY step_number ASC, id ASC`)
      .bind(...recipeIds)
      .all(),
    db
      .prepare(`SELECT * FROM nutrition WHERE recipe_id IN (${placeholders})`)
      .bind(...recipeIds)
      .all(),
  ]);

  const ingredientsByRecipe = new Map();
  for (const ing of ingredientsRes.results || []) {
    if (!ingredientsByRecipe.has(ing.recipe_id)) {
      ingredientsByRecipe.set(ing.recipe_id, []);
    }
    ingredientsByRecipe.get(ing.recipe_id).push({
      id: ing.id,
      name: ing.name,
      quantity: ing.quantity,
      unit: ing.unit,
    });
  }

  const instructionsByRecipe = new Map();
  for (const inst of instructionsRes.results || []) {
    if (!instructionsByRecipe.has(inst.recipe_id)) {
      instructionsByRecipe.set(inst.recipe_id, []);
    }
    instructionsByRecipe.get(inst.recipe_id).push({
      id: inst.id,
      step: inst.step_number,
      title: inst.title || `Step ${inst.step_number}`,
      description: inst.description || "",
    });
  }

  const nutritionByRecipe = new Map();
  for (const nut of nutritionRes.results || []) {
    nutritionByRecipe.set(nut.recipe_id, {
      calories: nut.calories,
      protein: nut.protein,
      carbs: nut.carbs,
      fat: nut.fat,
    });
  }

  return recipeRows.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    category: r.category,
    time: r.time_minutes,
    difficulty: r.difficulty,
    servings: r.servings,
    image: r.image_url,
    rating: r.rating ?? 4.5,
    reviews: r.review_count ?? 0,
    notes: r.notes ?? "",
    ingredients: ingredientsByRecipe.get(r.id) || [],
    instructions: instructionsByRecipe.get(r.id) || [],
    nutrition: nutritionByRecipe.get(r.id) || null,
  }));
}

export async function getRecipes(db, search, category, difficulty, sort) {
  let query = "SELECT * FROM recipes WHERE 1=1";
  const params = [];

  if (search && search.trim()) {
    query += " AND (LOWER(name) LIKE ? OR LOWER(description) LIKE ?)";
    const term = `%${search.trim().toLowerCase()}%`;
    params.push(term, term);
  }

  if (category && category.trim() && category.toLowerCase() !== "all") {
    query += " AND LOWER(category) = LOWER(?)";
    params.push(category.trim());
  }

  if (difficulty && difficulty.trim() && difficulty.toLowerCase() !== "all") {
    query += " AND LOWER(difficulty) = LOWER(?)";
    params.push(difficulty.trim());
  }

  if (sort && sort.toLowerCase() === "quickest") {
    query += " ORDER BY CASE WHEN time_minutes IS NULL THEN 999999 ELSE time_minutes END ASC, id DESC";
  } else if (sort && sort.toLowerCase() === "most liked") {
    query += " ORDER BY CASE WHEN rating IS NULL THEN 0 ELSE rating END DESC, review_count DESC, id DESC";
  } else {
    query += " ORDER BY id DESC";
  }

  const res = await db.prepare(query).bind(...params).all();
  return populateRecipeDetails(db, res.results || []);
}

export async function getRecipeById(db, id) {
  const row = await db.prepare("SELECT * FROM recipes WHERE id = ?").bind(id).first();
  if (!row) return null;
  const list = await populateRecipeDetails(db, [row]);
  return list[0] || null;
}

export async function getMyRecipes(db, userId) {
  const res = await db
    .prepare("SELECT * FROM recipes WHERE user_id = ? ORDER BY id DESC")
    .bind(userId)
    .all();
  return populateRecipeDetails(db, res.results || []);
}

function getTitleForMealPeriod(mealPeriod) {
  if (!mealPeriod) return "Today's Suggestion";
  switch (mealPeriod.toLowerCase()) {
    case "breakfast":
      return "This Morning's Suggestion";
    case "lunch":
      return "This Afternoon's Suggestion";
    case "snacks":
    case "snack":
      return "This Evening's Suggestion";
    case "dinner":
      return "Tonight's Suggestion";
    case "dessert":
      return "Sweet Suggestion";
    default:
      return "Today's Suggestion";
  }
}

function getFallbackCategories(mealPeriod) {
  if (!mealPeriod) return ["Lunch", "Dinner", "Breakfast", "Snacks"];
  switch (mealPeriod.toLowerCase()) {
    case "breakfast":
      return ["Snacks", "Vegetarian", "Lunch"];
    case "lunch":
      return ["Dinner", "Vegetarian", "Snacks"];
    case "snacks":
    case "snack":
      return ["Dinner", "Lunch", "Vegetarian"];
    case "dinner":
      return ["Dessert", "Snacks", "Lunch"];
    case "dessert":
      return ["Snacks", "Dinner"];
    default:
      return ["Lunch", "Dinner", "Breakfast", "Snacks"];
  }
}

export async function getRecipeSuggestion(db, clientMealPeriod, excludeId, clientHour) {
  const allRecipesRes = await db.prepare("SELECT * FROM recipes").all();
  const allRows = allRecipesRes.results || [];
  if (allRows.length === 0) return null;

  const allRecipes = await populateRecipeDetails(db, allRows);

  let hour = clientHour;
  if (hour === undefined || hour === null) {
    hour = new Date().getUTCHours();
  }

  let activePeriod;
  let suggestionTitle;

  if (clientMealPeriod && clientMealPeriod.trim().length > 0) {
    activePeriod = clientMealPeriod.trim();
    suggestionTitle = getTitleForMealPeriod(activePeriod);
  } else {
    if (hour >= 5 && hour < 12) {
      activePeriod = "Breakfast";
      suggestionTitle = "This Morning's Suggestion";
    } else if (hour >= 12 && hour < 17) {
      activePeriod = "Lunch";
      suggestionTitle = "This Afternoon's Suggestion";
    } else if (hour >= 17 && hour < 21) {
      activePeriod = "Snacks";
      suggestionTitle = "This Evening's Suggestion";
    } else {
      activePeriod = "Dinner";
      suggestionTitle = "Tonight's Suggestion";
    }
  }

  const filterExcluded = (candidates, excl) => {
    if (!excl) return candidates;
    const filtered = candidates.filter((r) => r.id !== excl);
    return filtered.length > 0 ? filtered : candidates;
  };

  const primaryCandidates = allRecipes.filter(
    (r) => r.category && r.category.toLowerCase() === activePeriod.toLowerCase()
  );
  let eligibleCandidates = filterExcluded(primaryCandidates, excludeId);

  if (eligibleCandidates.length === 0) {
    const fallbacks = getFallbackCategories(activePeriod);
    for (const fbCategory of fallbacks) {
      const fbMatches = allRecipes.filter(
        (r) => r.category && r.category.toLowerCase() === fbCategory.toLowerCase()
      );
      eligibleCandidates = filterExcluded(fbMatches, excludeId);
      if (eligibleCandidates.length > 0) break;
    }
  }

  if (eligibleCandidates.length === 0) {
    eligibleCandidates = filterExcluded(allRecipes, excludeId);
  }

  if (eligibleCandidates.length === 0) {
    eligibleCandidates = allRecipes;
  }

  const selected = eligibleCandidates[Math.floor(Math.random() * eligibleCandidates.length)];
  return {
    recipe: selected,
    mealPeriod: activePeriod,
    suggestionTitle,
  };
}

export async function matchRecipesByIngredients(db, request) {
  if (!request || !request.ingredients || !Array.isArray(request.ingredients) || request.ingredients.length === 0) {
    return [];
  }

  const userSet = new Set(
    request.ingredients
      .map((i) => normalizeIngredient(i))
      .filter((i) => i.length > 0)
  );

  if (userSet.size === 0) {
    return [];
  }

  const allRows = await db.prepare("SELECT * FROM recipes").all();
  const allRecipes = await populateRecipeDetails(db, allRows.results || []);

  const categoryFilter = request.category?.trim();
  const results = [];

  for (const recipe of allRecipes) {
    if (
      categoryFilter &&
      categoryFilter.toLowerCase() !== "any" &&
      categoryFilter.toLowerCase() !== "all"
    ) {
      if (!recipe.category || recipe.category.toLowerCase() !== categoryFilter.toLowerCase()) {
        continue;
      }
    }

    const recipeIngredients = recipe.ingredients || [];
    if (recipeIngredients.length === 0) continue;

    let matchedCount = 0;
    const missingIngredients = [];

    for (const ing of recipeIngredients) {
      const rawName = ing.name || "";
      const normRecIng = normalizeIngredient(rawName);
      const isMatched = isIngredientMatched(normRecIng, userSet);

      if (isMatched) {
        matchedCount++;
      } else {
        missingIngredients.push(rawName);
      }
    }

    if (matchedCount > 0) {
      const totalIngredients = recipeIngredients.length;
      const matchPercentage = (matchedCount * 100.0) / totalIngredients;

      results.push({
        recipe,
        matchCount: matchedCount,
        totalIngredients,
        matchPercentage: Math.round(matchPercentage * 10) / 10,
        missingIngredients,
      });
    }
  }

  results.sort((r1, r2) => {
    if (r2.matchPercentage !== r1.matchPercentage) {
      return r2.matchPercentage - r1.matchPercentage;
    }
    if (r2.matchCount !== r1.matchCount) {
      return r2.matchCount - r1.matchCount;
    }
    if (r1.missingIngredients.length !== r2.missingIngredients.length) {
      return r1.missingIngredients.length - r2.missingIngredients.length;
    }
    const rating1 = r1.recipe.rating ?? 0.0;
    const rating2 = r2.recipe.rating ?? 0.0;
    if (rating2 !== rating1) {
      return rating2 - rating1;
    }
    return (r1.recipe.id || 0) - (r2.recipe.id || 0);
  });

  return results;
}

export async function createRecipe(db, dto, userId) {
  const insertRecipe = await db
    .prepare(
      `INSERT INTO recipes (user_id, name, description, category, time_minutes, difficulty, servings, image_url, rating, review_count, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 4.5, 1, ?, datetime('now'), datetime('now')) RETURNING id`
    )
    .bind(
      userId,
      dto.name,
      dto.description || "",
      dto.category || "Dinner",
      dto.time || 30,
      dto.difficulty || "Easy",
      dto.servings || 2,
      dto.image && dto.image.trim() ? dto.image : "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800",
      dto.notes || ""
    )
    .first();

  const recipeId = insertRecipe?.id;
  if (!recipeId) throw new Error("Failed to insert recipe");

  const batchQueries = [];

  if (dto.ingredients && Array.isArray(dto.ingredients) && dto.ingredients.length > 0) {
    for (const ing of dto.ingredients) {
      batchQueries.push(
        db
          .prepare("INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES (?, ?, ?, ?)")
          .bind(recipeId, ing.name, ing.quantity ?? 1.0, ing.unit ?? "unit")
      );
    }
  }

  if (dto.instructions && Array.isArray(dto.instructions) && dto.instructions.length > 0) {
    for (let i = 0; i < dto.instructions.length; i++) {
      const inst = dto.instructions[i];
      batchQueries.push(
        db
          .prepare(
            "INSERT INTO instructions (recipe_id, step_number, title, description) VALUES (?, ?, ?, ?)"
          )
          .bind(recipeId, inst.step || i + 1, inst.title || `Step ${i + 1}`, inst.description || "")
      );
    }
  }

  if (dto.nutrition) {
    batchQueries.push(
      db
        .prepare(
          "INSERT INTO nutrition (recipe_id, calories, protein, carbs, fat) VALUES (?, ?, ?, ?, ?)"
        )
        .bind(
          recipeId,
          dto.nutrition.calories ?? 300,
          dto.nutrition.protein ?? 10,
          dto.nutrition.carbs ?? 30,
          dto.nutrition.fat ?? 10
        )
    );
  }

  if (batchQueries.length > 0) {
    await db.batch(batchQueries);
  }

  return await getRecipeById(db, recipeId);
}

export async function updateRecipe(db, id, dto, userId) {
  const existing = await db
    .prepare("SELECT * FROM recipes WHERE id = ? AND user_id = ?")
    .bind(id, userId)
    .first();

  if (!existing) return null;

  const updates = ["updated_at = datetime('now')"];
  const params = [];

  if (dto.name !== undefined) {
    updates.push("name = ?");
    params.push(dto.name);
  }
  if (dto.description !== undefined) {
    updates.push("description = ?");
    params.push(dto.description);
  }
  if (dto.category !== undefined) {
    updates.push("category = ?");
    params.push(dto.category);
  }
  if (dto.time !== undefined) {
    updates.push("time_minutes = ?");
    params.push(dto.time);
  }
  if (dto.difficulty !== undefined) {
    updates.push("difficulty = ?");
    params.push(dto.difficulty);
  }
  if (dto.servings !== undefined) {
    updates.push("servings = ?");
    params.push(dto.servings);
  }
  if (dto.image !== undefined && dto.image !== null && dto.image.trim()) {
    updates.push("image_url = ?");
    params.push(dto.image);
  }
  if (dto.notes !== undefined) {
    updates.push("notes = ?");
    params.push(dto.notes);
  }

  params.push(id, userId);
  await db.prepare(`UPDATE recipes SET ${updates.join(", ")} WHERE id = ? AND user_id = ?`).bind(...params).run();

  const batchQueries = [];

  if (dto.ingredients !== undefined) {
    batchQueries.push(db.prepare("DELETE FROM ingredients WHERE recipe_id = ?").bind(id));
    for (const ing of dto.ingredients) {
      batchQueries.push(
        db
          .prepare("INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES (?, ?, ?, ?)")
          .bind(id, ing.name, ing.quantity ?? 1.0, ing.unit ?? "unit")
      );
    }
  }

  if (dto.instructions !== undefined) {
    batchQueries.push(db.prepare("DELETE FROM instructions WHERE recipe_id = ?").bind(id));
    for (let i = 0; i < dto.instructions.length; i++) {
      const inst = dto.instructions[i];
      batchQueries.push(
        db
          .prepare(
            "INSERT INTO instructions (recipe_id, step_number, title, description) VALUES (?, ?, ?, ?)"
          )
          .bind(id, inst.step || i + 1, inst.title || `Step ${i + 1}`, inst.description || "")
      );
    }
  }

  if (dto.nutrition !== undefined) {
    batchQueries.push(db.prepare("DELETE FROM nutrition WHERE recipe_id = ?").bind(id));
    if (dto.nutrition) {
      batchQueries.push(
        db
          .prepare(
            "INSERT INTO nutrition (recipe_id, calories, protein, carbs, fat) VALUES (?, ?, ?, ?, ?)"
          )
          .bind(
            id,
            dto.nutrition.calories ?? 300,
            dto.nutrition.protein ?? 10,
            dto.nutrition.carbs ?? 30,
            dto.nutrition.fat ?? 10
          )
      );
    }
  }

  if (batchQueries.length > 0) {
    await db.batch(batchQueries);
  }

  return getRecipeById(db, id);
}

export async function deleteRecipe(db, id, userId) {
  const existing = await db
    .prepare("SELECT * FROM recipes WHERE id = ? AND user_id = ?")
    .bind(id, userId)
    .first();

  if (!existing) return false;

  await db.batch([
    db.prepare("DELETE FROM wishlist WHERE recipe_id = ?").bind(id),
    db.prepare("DELETE FROM recipes WHERE id = ? AND user_id = ?").bind(id, userId),
  ]);

  return true;
}
