import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import {
  fetchShoppingList,
  addShoppingListItemApi,
  updateShoppingListItemApi,
  deleteShoppingListItemApi,
  clearShoppingListApi,
} from "../services/api";

const ShoppingListContext = createContext();

export function ShoppingListProvider({ children }) {
  const { isSignedIn, userId } = useAuth();
  const [shoppingList, setShoppingList] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadShoppingList = async (retryCount = 0) => {
    if (!isSignedIn) {
      setShoppingList([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await fetchShoppingList();
      if (Array.isArray(data)) {
        setShoppingList(data);
      }
    } catch (err) {
      console.warn("Could not fetch shopping list from backend:", err);
      // If unauthorized on first mount, retry once after token finishes resolving
      if (retryCount < 2 && isSignedIn) {
        setTimeout(() => {
          loadShoppingList(retryCount + 1);
        }, 350);
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSignedIn && userId) {
      loadShoppingList();
    } else {
      setShoppingList([]);
      setLoading(false);
    }
  }, [isSignedIn, userId]);

  const addIngredients = async (recipe, servings) => {
    if (!isSignedIn || !recipe || !recipe.ingredients) return;

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
    if (!isSignedIn) return;
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
    if (!isSignedIn) return;
    setShoppingList((current) => current.filter((item) => item.id !== itemId));

    try {
      await deleteShoppingListItemApi(itemId);
    } catch (err) {
      console.error("Failed to remove shopping list item from backend:", err);
      loadShoppingList();
    }
  };

  const clearList = async () => {
    if (!isSignedIn) return;
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