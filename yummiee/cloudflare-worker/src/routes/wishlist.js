import { Hono } from "hono";
import { requireAuth } from "../auth/clerk.js";
import * as wishlistService from "../services/wishlistService.js";

export const wishlistRouter = new Hono();

// GET /api/wishlist (Protected - Returns only authenticated user's wishlist)
wishlistRouter.get("/", requireAuth, async (c) => {
  const userId = c.get("userId");
  const wishlist = await wishlistService.getUserWishlist(c.env.DB, userId);
  return c.json(wishlist);
});

// POST /api/wishlist/:recipeId (Protected - Adds recipe to authenticated user's wishlist)
wishlistRouter.post("/:recipeId", requireAuth, async (c) => {
  const userId = c.get("userId");
  const recipeId = parseInt(c.req.param("recipeId") || "", 10);
  if (isNaN(recipeId) || recipeId <= 0) {
    return c.json({ message: "Invalid recipe ID" }, 400);
  }

  await wishlistService.addToWishlist(c.env.DB, userId, recipeId);
  return c.json({ message: "Added to wishlist" }, 201);
});

// DELETE /api/wishlist/:recipeId (Protected - Removes recipe from authenticated user's wishlist)
wishlistRouter.delete("/:recipeId", requireAuth, async (c) => {
  const userId = c.get("userId");
  const recipeId = parseInt(c.req.param("recipeId") || "", 10);
  if (isNaN(recipeId) || recipeId <= 0) {
    return c.body(null, 400);
  }

  await wishlistService.removeFromWishlist(c.env.DB, userId, recipeId);
  return c.body(null, 204);
});
