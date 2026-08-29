import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import { fetchWishlist, addToWishlistApi, removeFromWishlistApi } from "../services/api";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { isSignedIn, userId } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWishlist = async () => {
    if (!isSignedIn) {
      setWishlist([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await fetchWishlist();
      setWishlist(data || []);
    } catch (err) {
      console.warn("Could not fetch wishlist from backend, using empty state:", err);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSignedIn && userId) {
      loadWishlist();
    } else {
      setWishlist([]);
      setLoading(false);
    }
  }, [isSignedIn, userId]);

  const isInWishlist = (recipeId) => {
    return wishlist.some((recipe) => recipe.id === recipeId);
  };

  const toggleWishlist = async (recipe) => {
    if (!isSignedIn) return;
    const saved = isInWishlist(recipe.id);

    // Optimistic UI update
    if (saved) {
      setWishlist((current) => current.filter((item) => item.id !== recipe.id));
      try {
        await removeFromWishlistApi(recipe.id);
      } catch (err) {
        console.error("Error removing from wishlist backend:", err);
        loadWishlist();
      }
    } else {
      setWishlist((current) => [...current, recipe]);
      try {
        await addToWishlistApi(recipe.id);
      } catch (err) {
        console.error("Error adding to wishlist backend:", err);
        loadWishlist();
      }
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isInWishlist,
        loading,
        refreshWishlist: loadWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}