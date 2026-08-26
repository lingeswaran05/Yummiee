const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

// Helper function to extract auth headers from Clerk window object or local storage
async function getAuthHeaders() {
  let token = null;
  let userId = null;

  if (typeof window !== "undefined" && window.Clerk && window.Clerk.session) {
    try {
      token = await window.Clerk.session.getToken();
      userId = window.Clerk.user?.id;
    } catch (e) {
      console.warn("Could not retrieve Clerk token:", e);
    }
  }

  if (!token) {
    token = localStorage.getItem("clerk_token") || "mock_clerk_user_1";
  }

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (userId) {
    headers["x-clerk-user-id"] = userId;
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

export async function fetchRecipeById(id) {
  return request(`/recipes/${id}`);
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
