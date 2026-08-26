import { createContext, useContext, useEffect, useState } from "react";
import {
  fetchShoppingList,
  addShoppingListItemApi,
  updateShoppingListItemApi,
  deleteShoppingListItemApi,
  clearShoppingListApi,
} from "../services/api";

const ShoppingListContext = createContext();

export function ShoppingListProvider({ children }) {
  const [shoppingList, setShoppingList] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadShoppingList = async () => {
    try {
      setLoading(true);
      const data = await fetchShoppingList();
      setShoppingList(data || []);
    } catch (err) {
      console.warn("Could not fetch shopping list from backend:", err);
      setShoppingList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShoppingList();
  }, []);

  const addIngredients = async (recipe, servings) => {
    if (!recipe || !recipe.ingredients) return;

    for (const ingredient of recipe.ingredients) {
      const scaledQuantity = (ingredient.quantity / recipe.servings) * servings;
      try {
        await addShoppingListItemApi({
          name: ingredient.name,
          quantity: scaledQuantity,
          unit: ingredient.unit,
          recipeId: recipe.id,
        });
      } catch (err) {
        console.error("Failed to add ingredient to shopping list API:", err);
      }
    }

    loadShoppingList();
  };

  const toggleItem = async (itemId) => {
    const target = shoppingList.find((item) => item.id === itemId);
    if (!target) return;

    const newCheckedStatus = !target.checked;
    setShoppingList((current) =>
      current.map((item) =>
        item.id === itemId ? { ...item, checked: newCheckedStatus } : item
      )
    );

    try {
      await updateShoppingListItemApi(itemId, { checked: newCheckedStatus });
    } catch (err) {
      console.error("Failed to toggle shopping list item on backend:", err);
      loadShoppingList();
    }
  };

  const removeItem = async (itemId) => {
    setShoppingList((current) => current.filter((item) => item.id !== itemId));

    try {
      await deleteShoppingListItemApi(itemId);
    } catch (err) {
      console.error("Failed to remove shopping list item from backend:", err);
      loadShoppingList();
    }
  };

  const clearList = async () => {
    setShoppingList([]);

    try {
      await clearShoppingListApi();
    } catch (err) {
      console.error("Failed to clear shopping list on backend:", err);
      loadShoppingList();
    }
  };

  return (
    <ShoppingListContext.Provider
      value={{
        shoppingList,
        addIngredients,
        toggleItem,
        removeItem,
        clearList,
        loading,
        refreshShoppingList: loadShoppingList,
      }}
    >
      {children}
    </ShoppingListContext.Provider>
  );
}

export function useShoppingList() {
  return useContext(ShoppingListContext);
}