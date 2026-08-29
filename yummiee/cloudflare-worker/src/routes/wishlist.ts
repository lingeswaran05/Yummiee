import { Hono } from "hono";
import { Env, Variables } from "../types";
import { requireAuth } from "../auth/clerk";
import * as wishlistService from "../services/wishlistService";

export const wishlistRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

// GET /api/wishlist (Protected)
wishlistRouter.get("/", requireAuth, async (c) => {
  const userId = c.get("userId");
  const wishlist = await wishlistService.getUserWishlist(c.env.DB, userId);
  return c.json(wishlist);
});

// POST /api/wishlist/:recipeId (Protected)
wishlistRouter.post("/:recipeId", requireAuth, async (c) => {
  const userId = c.get("userId");
  const recipeId = parseInt(c.req.param("recipeId") || "", 10);
  if (isNaN(recipeId)) {
    return c.json({ message: "Invalid recipe ID" }, 400);
  }

  await wishlistService.addToWishlist(c.env.DB, userId, recipeId);
  return c.json({ message: "Added to wishlist" }, 201);
});

// DELETE /api/wishlist/:recipeId (Protected)
wishlistRouter.delete("/:recipeId", requireAuth, async (c) => {
  const userId = c.get("userId");
  const recipeId = parseInt(c.req.param("recipeId") || "", 10);
  if (isNaN(recipeId)) {
    return c.body(null, 400);
  }

  await wishlistService.removeFromWishlist(c.env.DB, userId, recipeId);
  return c.body(null, 204);
});
