import { Hono } from "hono";
import { Env, Variables, ShoppingListItemDTO } from "../types";
import { requireAuth } from "../auth/clerk";
import * as shoppingListService from "../services/shoppingListService";

export const shoppingListRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

// GET /api/shopping-list (Protected)
shoppingListRouter.get("/", requireAuth, async (c) => {
  const userId = c.get("userId");
  const list = await shoppingListService.getUserShoppingList(c.env.DB, userId);
  return c.json(list);
});

// POST /api/shopping-list (Protected)
shoppingListRouter.post("/", requireAuth, async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json<ShoppingListItemDTO>().catch(() => null);

  if (!body || !body.name || !body.name.trim()) {
    return c.json({ message: "Item name is required" }, 400);
  }

  const created = await shoppingListService.addItem(c.env.DB, userId, body);
  return c.json(created, 201);
});

// PUT /api/shopping-list/:id (Protected)
shoppingListRouter.put("/:id", requireAuth, async (c) => {
  const userId = c.get("userId");
  const id = parseInt(c.req.param("id") || "", 10);
  if (isNaN(id)) {
    return c.text("Item not found", 404);
  }

  const body = await c.req.json<ShoppingListItemDTO>().catch(() => null);
  if (!body) {
    return c.json({ message: "Invalid request payload" }, 400);
  }

  const updated = await shoppingListService.updateItem(c.env.DB, userId, id, body);
  if (!updated) {
    return c.text("Item not found", 404);
  }

  return c.json({ message: "Shopping list item updated" });
});

// DELETE /api/shopping-list/:id (Protected)
shoppingListRouter.delete("/:id", requireAuth, async (c) => {
  const userId = c.get("userId");
  const id = parseInt(c.req.param("id") || "", 10);
  if (isNaN(id)) {
    return c.body(null, 404);
  }

  const deleted = await shoppingListService.deleteItem(c.env.DB, userId, id);
  if (!deleted) {
    return c.body(null, 404);
  }

  return c.body(null, 204);
});

// DELETE /api/shopping-list (Protected - Clear entire list)
shoppingListRouter.delete("/", requireAuth, async (c) => {
  const userId = c.get("userId");
  await shoppingListService.clearList(c.env.DB, userId);
  return c.body(null, 204);
});
