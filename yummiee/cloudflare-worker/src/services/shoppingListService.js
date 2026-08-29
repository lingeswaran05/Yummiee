export async function getUserShoppingList(db, userId) {
  const res = await db
    .prepare(
      `SELECT s.*, r.name AS recipe_name
       FROM shopping_list_items s
       LEFT JOIN recipes r ON s.recipe_id = r.id
       WHERE s.user_id = ?
       ORDER BY s.id DESC`
    )
    .bind(userId)
    .all();

  return (res.results || []).map((row) => ({
    id: row.id,
    name: row.name,
    quantity: row.quantity,
    unit: row.unit,
    checked: Boolean(row.checked),
    recipeId: row.recipe_id,
    recipeName: row.recipe_name || "Custom Item",
  }));
}

export async function addItem(db, userId, dto) {
  const res = await db
    .prepare(
      `INSERT INTO shopping_list_items (user_id, recipe_id, name, quantity, unit, checked, created_at)
       VALUES (?, ?, ?, ?, ?, 0, datetime('now')) RETURNING *`
    )
    .bind(userId, dto.recipeId || null, dto.name, dto.quantity ?? 1.0, dto.unit || "unit")
    .first();

  if (res) {
    let recipeName = "Custom Item";
    if (res.recipe_id) {
      const rec = await db
        .prepare("SELECT name FROM recipes WHERE id = ?")
        .bind(res.recipe_id)
        .first();
      if (rec) recipeName = rec.name;
    }

    return {
      id: res.id,
      name: res.name,
      quantity: res.quantity,
      unit: res.unit,
      checked: Boolean(res.checked),
      recipeId: res.recipe_id,
      recipeName,
    };
  }

  throw new Error("Failed to add shopping list item");
}

export async function updateItem(db, userId, itemId, dto) {
  const existing = await db
    .prepare("SELECT * FROM shopping_list_items WHERE id = ? AND user_id = ?")
    .bind(itemId, userId)
    .first();

  if (!existing) return false;

  const updates = [];
  const params = [];

  if (dto.checked !== undefined) {
    updates.push("checked = ?");
    params.push(dto.checked ? 1 : 0);
  }
  if (dto.name !== undefined) {
    updates.push("name = ?");
    params.push(dto.name);
  }
  if (dto.quantity !== undefined) {
    updates.push("quantity = ?");
    params.push(dto.quantity);
  }
  if (dto.unit !== undefined) {
    updates.push("unit = ?");
    params.push(dto.unit);
  }

  if (updates.length === 0) return true;

  params.push(itemId, userId);
  await db
    .prepare(`UPDATE shopping_list_items SET ${updates.join(", ")} WHERE id = ? AND user_id = ?`)
    .bind(...params)
    .run();

  return true;
}

export async function deleteItem(db, userId, itemId) {
  const existing = await db
    .prepare("SELECT * FROM shopping_list_items WHERE id = ? AND user_id = ?")
    .bind(itemId, userId)
    .first();

  if (!existing) return false;

  await db
    .prepare("DELETE FROM shopping_list_items WHERE id = ? AND user_id = ?")
    .bind(itemId, userId)
    .run();

  return true;
}

export async function clearList(db, userId) {
  await db.prepare("DELETE FROM shopping_list_items WHERE user_id = ?").bind(userId).run();
}
