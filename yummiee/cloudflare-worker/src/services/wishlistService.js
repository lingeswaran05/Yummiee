import { populateRecipeDetails } from "./recipeService.js";

export async function getUserWishlist(db, userId) {
  const res = await db
    .prepare(
      `SELECT r.* FROM recipes r
       JOIN wishlist w ON r.id = w.recipe_id
       WHERE w.user_id = ?
       ORDER BY w.id DESC`
    )
    .bind(userId)
    .all();

  return populateRecipeDetails(db, res.results || []);
}

export async function addToWishlist(db, userId, recipeId) {
  const existing = await db
    .prepare("SELECT * FROM wishlist WHERE user_id = ? AND recipe_id = ?")
    .bind(userId, recipeId)
    .first();

  if (existing) {
    return;
  }

  await db
    .prepare("INSERT INTO wishlist (user_id, recipe_id, created_at) VALUES (?, ?, datetime('now'))")
    .bind(userId, recipeId)
    .run();
}

export async function removeFromWishlist(db, userId, recipeId) {
  await db
    .prepare("DELETE FROM wishlist WHERE user_id = ? AND recipe_id = ?")
    .bind(userId, recipeId)
    .run();
}
