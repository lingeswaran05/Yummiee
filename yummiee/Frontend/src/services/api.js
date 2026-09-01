import { recipeDetails } from "../data/recipeDetails";
import { recipes as fallbackRecipes } from "../data/recipes";

const rawApiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:8787";
const cleanApiUrl = rawApiUrl.replace(/\/$/, "");
const API_BASE_URL = cleanApiUrl.endsWith("/api") ? cleanApiUrl : `${cleanApiUrl}/api`;

let currentAuth = {
  userId: null,
  getToken: null,
};

// In-memory cache for fast instant loads
const cache = new Map();
const CACHE_TTL_MS = 60 * 1000; // 1 minute fresh TTL

export function setApiAuth({ userId = null, getToken = null } = {}) {
  currentAuth = { userId, getToken };
}

async function getAuthHeaders() {
  let token = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    if (currentAuth.getToken) {
      try {
        token = await currentAuth.getToken();
      } catch (e) {
        console.warn("Could not retrieve Clerk token:", e);
      }
    }

    if (!token && typeof window !== "undefined" && window.Clerk?.session) {
      try {
        token = await window.Clerk.session.getToken();
      } catch (e) {
        // ignore
      }
    }

    if (token) break;

    // If user is authenticated but token is resolving, wait briefly
    const isUserActive = currentAuth.userId || (typeof window !== "undefined" && window.Clerk?.user);
    if (isUserActive && attempt < 2) {
      await new Promise((resolve) => setTimeout(resolve, 150));
    } else {
      break;
    }
  }

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

// Helper function for API calls with JSON header, Bearer token, and fast timeout
async function request(endpoint, options = {}, timeoutMs = 9000) {
  const url = `${API_BASE_URL}${endpoint}`;
  const authHeaders = await getAuthHeaders();

  const headers = {
    ...authHeaders,
    ...options.headers,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const config = {
      ...options,
      headers,
      signal: options.signal || controller.signal,
    };

    const response = await fetch(url, config);

    if (response.status === 204) {
      return null;
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const error = new Error(data?.message || `HTTP Error ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === "AbortError") {
      const timeoutError = new Error(`Request to ${endpoint} timed out after ${timeoutMs}ms`);
      timeoutError.name = "TimeoutError";
      throw timeoutError;
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Get fallback full recipe list
function getCuratedFallbackRecipes() {
  const list = [];
  for (const id in recipeDetails) {
    list.push(recipeDetails[id]);
  }
  if (list.length > 0) return list;
  return fallbackRecipes;
}

// Recipe APIs with Stale-While-Revalidate Caching for Instant Initial Loading
export async function fetchRecipes(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.append("search", params.search);
  if (params.category && params.category !== "All") query.append("category", params.category);
  if (params.difficulty) query.append("difficulty", params.difficulty);
  if (params.sort) query.append("sort", params.sort);

  const queryString = query.toString() ? `?${query.toString()}` : "";
  const cacheKey = `recipes:${queryString}`;

  // If cached and fresh, return cached immediately
  const cached = cache.get(cacheKey);
  const now = Date.now();
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  // Also check localStorage for instant first paint
  let localData = null;
  if (!queryString) {
    try {
      const saved = localStorage.getItem("yummiee_cached_recipes");
      if (saved) {
        localData = JSON.parse(saved);
      }
    } catch {
      // ignore storage error
    }
  }

  try {
    const data = await request(`/recipes${queryString}`, {}, 7000);
    if (Array.isArray(data) && data.length > 0) {
      cache.set(cacheKey, { timestamp: now, data });
      if (!queryString) {
        try {
          localStorage.setItem("yummiee_cached_recipes", JSON.stringify(data));
        } catch {
          // ignore
        }
      }
      return data;
    }
    return data || [];
  } catch (err) {
    console.warn("Backend fetch failed or timed out, returning cached or curated recipes:", err);
    if (cached?.data) return cached.data;
    if (localData && Array.isArray(localData) && localData.length > 0) return localData;
    return getCuratedFallbackRecipes();
  }
}

export async function fetchMyRecipes() {
  try {
    return await request("/recipes/my-recipes", {}, 7000);
  } catch (err) {
    console.warn("fetchMyRecipes error:", err);
    return [];
  }
}

export async function fetchRecipeById(id) {
  const cacheKey = `recipe:${id}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const data = await request(`/recipes/${id}`, {}, 6000);
    if (data) {
      cache.set(cacheKey, { timestamp: Date.now(), data });
      return data;
    }
  } catch (err) {
    console.warn(`fetchRecipeById(${id}) network error, trying local fallback:`, err);
  }

  // Check fallback data
  if (recipeDetails[id]) {
    return recipeDetails[id];
  }

  const list = getCuratedFallbackRecipes();
  const found = list.find((r) => String(r.id) === String(id));
  return found || null;
}

export async function fetchRecipeSuggestion(params = {}) {
  const query = new URLSearchParams();
  if (params.mealPeriod) query.append("mealPeriod", params.mealPeriod);
  if (params.excludeId) query.append("excludeId", params.excludeId);
  if (params.hour !== undefined && params.hour !== null) query.append("hour", params.hour);

  const queryString = query.toString() ? `?${query.toString()}` : "";
  try {
    return await request(`/recipes/suggestion${queryString}`, {}, 5000);
  } catch (err) {
    console.warn("fetchRecipeSuggestion fallback to random recipe:", err);
    const list = getCuratedFallbackRecipes();
    const filtered = params.excludeId ? list.filter((r) => r.id !== params.excludeId) : list;
    const random = filtered[Math.floor(Math.random() * filtered.length)] || list[0];
    return {
      mealPeriod: params.mealPeriod || "Lunch",
      suggestionTitle: "Chef's Recommendation",
      recipe: random,
    };
  }
}

export async function matchRecipes(matchRequest) {
  try {
    return await request("/recipes/match", {
      method: "POST",
      body: JSON.stringify(matchRequest),
    }, 6000);
  } catch (err) {
    console.warn("matchRecipes fallback to client-side matcher:", err);
    const userIngredients = (matchRequest.ingredients || []).map((i) => i.toLowerCase().trim());
    const list = getCuratedFallbackRecipes();
    const results = [];

    for (const recipe of list) {
      const recIngs = (recipe.ingredients || []).map((i) => i.name.toLowerCase());
      const matched = recIngs.filter((ing) => userIngredients.some((u) => ing.includes(u) || u.includes(ing)));
      if (matched.length > 0) {
        const missing = (recipe.ingredients || []).map((i) => i.name).filter((n) => !userIngredients.some((u) => n.toLowerCase().includes(u)));
        results.push({
          recipe,
          matchCount: matched.length,
          totalIngredients: recIngs.length,
          matchPercentage: Math.round((matched.length / Math.max(1, recIngs.length)) * 100),
          missingIngredients: missing,
        });
      }
    }

    results.sort((a, b) => b.matchPercentage - a.matchPercentage);
    return results;
  }
}

export async function createRecipe(recipeData) {
  // Clear caches so new recipe appears immediately everywhere
  cache.clear();
  const created = await request("/recipes", {
    method: "POST",
    body: JSON.stringify(recipeData),
  }, 12000);

  // Update local storage cache optimistically
  try {
    const saved = localStorage.getItem("yummiee_cached_recipes");
    const list = saved ? JSON.parse(saved) : [];
    if (created) {
      list.unshift(created);
      localStorage.setItem("yummiee_cached_recipes", JSON.stringify(list));
    }
  } catch {
    // ignore
  }

  return created;
}

export async function updateRecipe(id, recipeData) {
  cache.clear();
  return request(`/recipes/${id}`, {
    method: "PUT",
    body: JSON.stringify(recipeData),
  }, 12000);
}

export async function deleteRecipe(id) {
  cache.clear();
  try {
    const saved = localStorage.getItem("yummiee_cached_recipes");
    if (saved) {
      const list = JSON.parse(saved).filter((r) => String(r.id) !== String(id));
      localStorage.setItem("yummiee_cached_recipes", JSON.stringify(list));
    }
  } catch {
    // ignore
  }
  return request(`/recipes/${id}`, {
    method: "DELETE",
  }, 8000);
}

// Wishlist APIs
export async function fetchWishlist() {
  try {
    return await request("/wishlist", {}, 6000);
  } catch {
    return [];
  }
}

export async function addToWishlistApi(recipeId) {
  return request(`/wishlist/${recipeId}`, {
    method: "POST",
  }, 6000);
}

export async function removeFromWishlistApi(recipeId) {
  return request(`/wishlist/${recipeId}`, {
    method: "DELETE",
  }, 6000);
}

// Shopping List APIs
export async function fetchShoppingList() {
  try {
    return await request("/shopping-list", {}, 6000);
  } catch {
    return [];
  }
}

export async function addShoppingListItemApi(itemData) {
  return request("/shopping-list", {
    method: "POST",
    body: JSON.stringify(itemData),
  }, 6000);
}

export async function updateShoppingListItemApi(id, itemData) {
  return request(`/shopping-list/${id}`, {
    method: "PUT",
    body: JSON.stringify(itemData),
  }, 6000);
}

export async function deleteShoppingListItemApi(id) {
  return request(`/shopping-list/${id}`, {
    method: "DELETE",
  }, 6000);
}

export async function clearShoppingListApi() {
  return request("/shopping-list", {
    method: "DELETE",
  }, 6000);
}

// Image Storage APIs (Cloudflare R2)
export function resolveImageUrl(imageUrl) {
  if (!imageUrl) return "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800";
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://") || imageUrl.startsWith("data:")) {
    return imageUrl;
  }
  return `${cleanApiUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
}

export async function uploadImageApi(file) {
  const formData = new FormData();
  formData.append("file", file);
  const authHeaders = await getAuthHeaders();
  delete authHeaders["Content-Type"];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(`${API_BASE_URL}/images/upload`, {
      method: "POST",
      headers: authHeaders,
      body: formData,
      signal: controller.signal,
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.message || "Failed to upload image to R2 storage");
    }

    // Return resolved URL if relative
    if (data?.url && !data.url.startsWith("http")) {
      data.url = `${cleanApiUrl}${data.url.startsWith("/") ? "" : "/"}${data.url}`;
    }

    return data;
  } finally {
    clearTimeout(timeoutId);
  }
}
