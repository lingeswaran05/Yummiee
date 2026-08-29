import { ShoppingListItemDTO } from "../types";

interface ShoppingListRow {
  id: number;
  user_id: number;
  recipe_id: number | null;
  name: string;
  quantity: number | null;
  unit: string | null;
  checked: number;
  created_at: string;
  recipe_name?: string | null;
}

export async function getUserShoppingList(
  db: D1Database,
  userId: number
): Promise<ShoppingListItemDTO[]> {
  const query = `
    SELECT s.*, r.name AS recipe_name
    FROM shopping_list_items s
    LEFT JOIN recipes r ON s.recipe_id = r.id
    WHERE s.user_id = ?
    ORDER BY s.id DESC
  `;
  const res = await db.prepare(query).bind(userId).all<ShoppingListRow>();

  return (res.results || []).map((item) => ({
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    checked: item.checked === 1,
    recipeId: item.recipe_id,
    recipeName: item.recipe_name || "",
  }));
}

export async function addItem(
  db: D1Database,
  userId: number,
  dto: ShoppingListItemDTO
): Promise<ShoppingListItemDTO> {
  const res = await db
    .prepare(
      `INSERT INTO shopping_list_items (user_id, recipe_id, name, quantity, unit, checked, created_at)
       VALUES (?, ?, ?, ?, ?, 0, datetime('now')) RETURNING *`
    )
    .bind(
      userId,
      dto.recipeId ?? null,
      dto.name,
      dto.quantity ?? 1.0,
      dto.unit ?? "unit"
    )
    .first<ShoppingListRow>();

  if (!res) throw new Error("Failed to add shopping list item");

  let recipeName = "";
  if (res.recipe_id) {
    const rec = await db
      .prepare("SELECT name FROM recipes WHERE id = ?")
      .bind(res.recipe_id)
      .first<{ name: string }>();
    if (rec) recipeName = rec.name;
  }

  return {
    id: res.id,
    name: res.name,
    quantity: res.quantity,
    unit: res.unit,
    checked: res.checked === 1,
    recipeId: res.recipe_id,
    recipeName,
  };
}

export async function updateItem(
  db: D1Database,
  userId: number,
  itemId: number,
  dto: ShoppingListItemDTO
): Promise<ShoppingListItemDTO | null> {
  const existing = await db
    .prepare("SELECT * FROM shopping_list_items WHERE id = ? AND user_id = ?")
    .bind(itemId, userId)
    .first<ShoppingListRow>();

  if (!existing) return null;

  const updates: string[] = [];
  const params: any[] = [];

  if (dto.checked !== undefined) {
    updates.push("checked = ?");
    params.push(dto.checked ? 1 : 0);
  }
  if (dto.quantity !== undefined) {
    updates.push("quantity = ?");
    params.push(dto.quantity);
  }
  if (dto.name !== undefined) {
    updates.push("name = ?");
    params.push(dto.name);
  }
  if (dto.unit !== undefined) {
    updates.push("unit = ?");
    params.push(dto.unit);
  }

  if (updates.length > 0) {
    params.push(itemId, userId);
    await db
      .prepare(`UPDATE shopping_list_items SET ${updates.join(", ")} WHERE id = ? AND user_id = ?`)
      .bind(...params)
      .run();
  }

  const updated = await db
    .prepare("SELECT * FROM shopping_list_items WHERE id = ?")
    .bind(itemId)
    .first<ShoppingListRow>();

  if (!updated) return null;

  return {
    id: updated.id,
    name: updated.name,
    quantity: updated.quantity,
    unit: updated.unit,
    checked: updated.checked === 1,
    recipeId: updated.recipe_id,
  };
}

export async function deleteItem(
  db: D1Database,
  userId: number,
  itemId: number
): Promise<boolean> {
  const existing = await db
    .prepare("SELECT id FROM shopping_list_items WHERE id = ? AND user_id = ?")
    .bind(itemId, userId)
    .first();

  if (!existing) return false;

  await db
    .prepare("DELETE FROM shopping_list_items WHERE id = ? AND user_id = ?")
    .bind(itemId, userId)
    .run();

  return true;
}

export async function clearList(db: D1Database, userId: number): Promise<void> {
  await db.prepare("DELETE FROM shopping_list_items WHERE user_id = ?").bind(userId).run();
}
