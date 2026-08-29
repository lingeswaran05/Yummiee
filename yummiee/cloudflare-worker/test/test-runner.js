// test-runner.js - Comprehensive integration test suite for Yummiee Cloudflare Worker

const BASE_URL = "http://127.0.0.1:8787";

async function assert(desc, condition, details = "") {
  if (condition) {
    console.log(`  ✅ PASS: ${desc}`);
  } else {
    console.error(`  ❌ FAIL: ${desc} ${details ? `(${details})` : ""}`);
    process.exitCode = 1;
  }
}

async function runTests() {
  console.log("\n🚀 Starting Yummiee Cloudflare API Verification Test Suite...\n");

  // 1. Health Check
  console.log("--- 1. Health Endpoint ---");
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  const healthData = await healthRes.json();
  assert("Health check returns 200", healthRes.status === 200);
  assert("Health check status is ok", healthData.status === "ok");

  // 2. Recipe Listing & Seed Verification
  console.log("\n--- 2. Recipe Listing & Filters ---");
  const allRecipesRes = await fetch(`${BASE_URL}/api/recipes`);
  const allRecipes = await allRecipesRes.json();
  assert("Fetch all recipes returns array", Array.isArray(allRecipes));
  assert("Seed recipes count >= 8", allRecipes.length >= 8, `Got ${allRecipes.length}`);

  // Search filter
  const searchRes = await fetch(`${BASE_URL}/api/recipes?search=Tuscan`);
  const searchData = await searchRes.json();
  assert("Search filter finds Tuscan Chicken", searchData.some(r => r.name.includes("Tuscan")));

  // Category filter
  const catRes = await fetch(`${BASE_URL}/api/recipes?category=Breakfast`);
  const catData = await catRes.json();
  assert("Category filter returns only Breakfast", catData.every(r => r.category === "Breakfast"));

  // Sort filter
  const sortRes = await fetch(`${BASE_URL}/api/recipes?sort=Quickest`);
  const sortData = await sortRes.json();
  assert("Quickest sort returns fastest recipe first", sortData[0].time <= sortData[sortData.length - 1].time);

  // 3. Recipe Details
  console.log("\n--- 3. Recipe Details & Relations ---");
  const recipe1Res = await fetch(`${BASE_URL}/api/recipes/1`);
  const recipe1 = await recipe1Res.json();
  assert("Fetch recipe 1 returns 200", recipe1Res.status === 200);
  assert("Recipe 1 has name 'Creamy Tuscan Garlic Chicken'", recipe1.name === "Creamy Tuscan Garlic Chicken");
  assert("Recipe 1 has ingredients array", Array.isArray(recipe1.ingredients) && recipe1.ingredients.length > 0);
  assert("Recipe 1 has instructions array", Array.isArray(recipe1.instructions) && recipe1.instructions.length > 0);
  assert("Recipe 1 has nutrition info", recipe1.nutrition !== null && recipe1.nutrition.calories === 480);

  // 4. Recipe Suggestions
  console.log("\n--- 4. Recipe Suggestion ---");
  const suggRes = await fetch(`${BASE_URL}/api/recipes/suggestion?mealPeriod=Breakfast`);
  const suggData = await suggRes.json();
  assert("Suggestion returns 200", suggRes.status === 200);
  assert("Suggestion has mealPeriod", suggData.mealPeriod === "Breakfast");
  assert("Suggestion recipe is valid", suggData.recipe && suggData.recipe.name);

  // 5. Ingredient Matching Algorithm
  console.log("\n--- 5. Ingredient Matching Algorithm ---");
  const matchRes = await fetch(`${BASE_URL}/api/recipes/match`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ingredients: ["chicken", "cream", "garlic", "spinach"],
      category: "Dinner",
    }),
  });
  const matchData = await matchRes.json();
  assert("Match endpoint returns 200", matchRes.status === 200);
  assert("Match results found", Array.isArray(matchData) && matchData.length > 0);
  assert("Top match is Tuscan Chicken", matchData[0].recipe.name === "Creamy Tuscan Garlic Chicken");
  assert("Match percentage is calculated", matchData[0].matchPercentage > 50);

  // 6. Authentication & User Isolation
  console.log("\n--- 6. Authentication & User Isolation ---");
  const unauthPostRes = await fetch(`${BASE_URL}/api/recipes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Unauth Recipe" }),
  });
  assert("Unauthenticated recipe create returns 401", unauthPostRes.status === 401);

  // Create recipe as User A
  const userAHeader = { "x-clerk-user-id": "user_clerk_alice_123", "Content-Type": "application/json" };
  const userBHeader = { "x-clerk-user-id": "user_clerk_bob_456", "Content-Type": "application/json" };

  const createRecipeRes = await fetch(`${BASE_URL}/api/recipes`, {
    method: "POST",
    headers: userAHeader,
    body: JSON.stringify({
      name: "Alice Custom Soup",
      description: "A comforting soup created by Alice",
      category: "Dinner",
      time: 25,
      difficulty: "Easy",
      servings: 2,
      ingredients: [{ name: "Carrot", quantity: 2, unit: "pcs" }],
      instructions: [{ step: 1, title: "Boil", description: "Boil water and add carrots" }],
      nutrition: { calories: 150, protein: 3, carbs: 20, fat: 2 },
    }),
  });
  const createdRecipe = await createRecipeRes.json();
  assert("User A creates recipe (201 Created)", createRecipeRes.status === 201);
  const createdRecipeId = createdRecipe.id;

  // Verify User A sees in my-recipes
  const myRecipesARes = await fetch(`${BASE_URL}/api/recipes/my-recipes`, { headers: userAHeader });
  const myRecipesA = await myRecipesARes.json();
  assert("User A sees custom recipe in my-recipes", myRecipesA.some(r => r.id === createdRecipeId));

  // Verify User B does NOT see User A's recipe in my-recipes
  const myRecipesBRes = await fetch(`${BASE_URL}/api/recipes/my-recipes`, { headers: userBHeader });
  const myRecipesB = await myRecipesBRes.json();
  assert("User B does NOT see User A's recipe in my-recipes (Isolation)", !myRecipesB.some(r => r.id === createdRecipeId));

  // User B cannot edit User A's recipe
  const editByBRes = await fetch(`${BASE_URL}/api/recipes/${createdRecipeId}`, {
    method: "PUT",
    headers: userBHeader,
    body: JSON.stringify({ name: "Bob Hacked Soup" }),
  });
  assert("User B cannot edit User A's recipe (404 / Forbidden)", editByBRes.status === 404);

  // User A can edit own recipe
  const editByARes = await fetch(`${BASE_URL}/api/recipes/${createdRecipeId}`, {
    method: "PUT",
    headers: userAHeader,
    body: JSON.stringify({ name: "Alice Masterpiece Soup" }),
  });
  const editedRecipe = await editByARes.json();
  assert("User A can edit own recipe (200 OK)", editByARes.status === 200 && editedRecipe.name === "Alice Masterpiece Soup");

  // 7. Wishlist Operations & Isolation
  console.log("\n--- 7. Wishlist Operations & Isolation ---");
  const addWishlistRes = await fetch(`${BASE_URL}/api/wishlist/1`, {
    method: "POST",
    headers: userAHeader,
  });
  assert("User A adds recipe 1 to wishlist (201 Created)", addWishlistRes.status === 201);

  const wishlistARes = await fetch(`${BASE_URL}/api/wishlist`, { headers: userAHeader });
  const wishlistA = await wishlistARes.json();
  assert("User A wishlist contains recipe 1", wishlistA.some(r => r.id === 1));

  const wishlistBRes = await fetch(`${BASE_URL}/api/wishlist`, { headers: userBHeader });
  const wishlistB = await wishlistBRes.json();
  assert("User B wishlist is isolated and empty", wishlistB.length === 0);

  const delWishlistRes = await fetch(`${BASE_URL}/api/wishlist/1`, {
    method: "DELETE",
    headers: userAHeader,
  });
  assert("User A removes recipe 1 from wishlist (204 No Content)", delWishlistRes.status === 204);

  // 8. Shopping List Operations & Isolation
  console.log("\n--- 8. Shopping List Operations & Isolation ---");
  const addShopRes = await fetch(`${BASE_URL}/api/shopping-list`, {
    method: "POST",
    headers: userAHeader,
    body: JSON.stringify({ name: "Organic Honey", quantity: 1, unit: "jar", recipeId: 1 }),
  });
  const shopItem = await addShopRes.json();
  assert("User A adds item to shopping list (201 Created)", addShopRes.status === 201);
  const shopItemId = shopItem.id;

  const shopARes = await fetch(`${BASE_URL}/api/shopping-list`, { headers: userAHeader });
  const shopA = await shopARes.json();
  assert("User A shopping list contains item", shopA.some(i => i.id === shopItemId));

  const shopBRes = await fetch(`${BASE_URL}/api/shopping-list`, { headers: userBHeader });
  const shopB = await shopBRes.json();
  assert("User B shopping list is isolated and empty", shopB.length === 0);

  // Update item checked state
  const updateShopRes = await fetch(`${BASE_URL}/api/shopping-list/${shopItemId}`, {
    method: "PUT",
    headers: userAHeader,
    body: JSON.stringify({ checked: true }),
  });
  assert("User A updates shopping list item (200 OK)", updateShopRes.status === 200);

  // Delete item
  const delShopRes = await fetch(`${BASE_URL}/api/shopping-list/${shopItemId}`, {
    method: "DELETE",
    headers: userAHeader,
  });
  assert("User A deletes shopping list item (204 No Content)", delShopRes.status === 204);

  // 9. R2 Image Storage & Retrieval
  console.log("\n--- 9. Cloudflare R2 Image Storage ---");
  // 1x1 transparent PNG base64
  const samplePngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  const uploadRes = await fetch(`${BASE_URL}/api/images/upload`, {
    method: "POST",
    headers: userAHeader,
    body: JSON.stringify({
      image: samplePngBase64,
      filename: "test-dish.png",
      contentType: "image/png",
    }),
  });
  const uploadData = await uploadRes.json();
  assert("Image upload returns 201 Created", uploadRes.status === 201);
  assert("Image upload returns image key and URL", uploadData.key && uploadData.url);

  // Retrieve image from R2 via Worker route
  const getImageRes = await fetch(`${BASE_URL}${uploadData.url}`);
  assert("Retrieve image from R2 returns 200", getImageRes.status === 200);
  assert("Image Content-Type is image/png", getImageRes.headers.get("content-type")?.includes("image/png"));

  // 10. Clean up test recipe
  console.log("\n--- 10. Recipe Cleanup ---");
  const deleteRecipeRes = await fetch(`${BASE_URL}/api/recipes/${createdRecipeId}`, {
    method: "DELETE",
    headers: userAHeader,
  });
  assert("User A deletes own recipe (204 No Content)", deleteRecipeRes.status === 204);

  console.log("\n✨ All Integration Tests Completed Successfully!\n");
}

runTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
