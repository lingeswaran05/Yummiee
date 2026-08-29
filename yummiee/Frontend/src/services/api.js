const rawApiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:10000";
const cleanApiUrl = rawApiUrl.replace(/\/$/, "");
const API_BASE_URL = cleanApiUrl.endsWith("/api") ? cleanApiUrl : `${cleanApiUrl}/api`;

let currentAuth = {
  userId: null,
  getToken: null,
};

// Clerk's React hooks provide this state. Keeping it here makes every API call
// use the active account rather than a browser-wide fallback user.
export function setApiAuth({ userId = null, getToken = null } = {}) {
  currentAuth = { userId, getToken };
}

async function getAuthHeaders() {
  let token = null;
  if (currentAuth.getToken) {
    try {
      token = await currentAuth.getToken();
    } catch (e) {
      console.warn("Could not retrieve Clerk token:", e);
    }
  }

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (currentAuth.userId) {
    headers["x-clerk-user-id"] = currentAuth.userId;
  }

  return headers;
}

// Helper function for API calls with JSON header and Bearer token
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const authHeaders = await getAuthHeaders();

  const headers = {
    ...authHeaders,
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
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
}

// Recipe APIs
export async function fetchRecipes(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.append("search", params.search);
  if (params.category && params.category !== "All") query.append("category", params.category);
  if (params.difficulty) query.append("difficulty", params.difficulty);
  if (params.sort) query.append("sort", params.sort);

  const queryString = query.toString() ? `?${query.toString()}` : "";
  return request(`/recipes${queryString}`);
}

export async function fetchMyRecipes() {
  return request("/recipes/my-recipes");
}

export async function fetchRecipeById(id) {
  return request(`/recipes/${id}`);
}

export async function fetchRecipeSuggestion(params = {}) {
  const query = new URLSearchParams();
  if (params.mealPeriod) query.append("mealPeriod", params.mealPeriod);
  if (params.excludeId) query.append("excludeId", params.excludeId);
  if (params.hour !== undefined && params.hour !== null) query.append("hour", params.hour);

  const queryString = query.toString() ? `?${query.toString()}` : "";
  return request(`/recipes/suggestion${queryString}`);
}

export async function matchRecipes(matchRequest) {
  return request("/recipes/match", {
    method: "POST",
    body: JSON.stringify(matchRequest),
  });
}

export async function createRecipe(recipeData) {
  return request("/recipes", {
    method: "POST",
    body: JSON.stringify(recipeData),
  });
}

export async function updateRecipe(id, recipeData) {
  return request(`/recipes/${id}`, {
    method: "PUT",
    body: JSON.stringify(recipeData),
  });
}

export async function deleteRecipe(id) {
  return request(`/recipes/${id}`, {
    method: "DELETE",
  });
}

// Wishlist APIs
export async function fetchWishlist() {
  return request("/wishlist");
}

export async function addToWishlistApi(recipeId) {
  return request(`/wishlist/${recipeId}`, {
    method: "POST",
  });
}

export async function removeFromWishlistApi(recipeId) {
  return request(`/wishlist/${recipeId}`, {
    method: "DELETE",
  });
}

// Shopping List APIs
export async function fetchShoppingList() {
  return request("/shopping-list");
}

export async function addShoppingListItemApi(itemData) {
  return request("/shopping-list", {
    method: "POST",
    body: JSON.stringify(itemData),
  });
}

export async function updateShoppingListItemApi(id, itemData) {
  return request(`/shopping-list/${id}`, {
    method: "PUT",
    body: JSON.stringify(itemData),
  });
}

export async function deleteShoppingListItemApi(id) {
  return request(`/shopping-list/${id}`, {
    method: "DELETE",
  });
}

export async function clearShoppingListApi() {
  return request("/shopping-list", {
    method: "DELETE",
  });
}
