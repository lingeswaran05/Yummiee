import { RecipeDTO } from "../types";
import { populateRecipeDetails } from "./recipeService";

export async function getUserWishlist(db: D1Database, userId: number): Promise<RecipeDTO[]> {
  const query = `
    SELECT r.* FROM recipes r
    JOIN wishlist w ON r.id = w.recipe_id
    WHERE w.user_id = ?
    ORDER BY w.id DESC
  `;
  const res = await db.prepare(query).bind(userId).all<any>();
  return populateRecipeDetails(db, res.results || []);
}

export async function addToWishlist(db: D1Database, userId: number, recipeId: number): Promise<void> {
  const existing = await db
    .prepare("SELECT id FROM wishlist WHERE user_id = ? AND recipe_id = ?")
    .bind(userId, recipeId)
    .first();

  if (!existing) {
    await db
      .prepare("INSERT INTO wishlist (user_id, recipe_id, created_at) VALUES (?, ?, datetime('now'))")
      .bind(userId, recipeId)
      .run();
  }
}

export async function removeFromWishlist(db: D1Database, userId: number, recipeId: number): Promise<void> {
  await db
    .prepare("DELETE FROM wishlist WHERE user_id = ? AND recipe_id = ?")
    .bind(userId, recipeId)
    .run();
}
