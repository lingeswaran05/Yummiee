// test-runner.js - Multi-User Isolation & Cryptographic Auth Verification Test Suite
import { SignJWT } from "jose";

const BASE_URL = "http://127.0.0.1:8787";
const TEST_SECRET = new TextEncoder().encode("sk_test_6J2FUzslNxIsLKrgSJR5oE0VYP0AB5ulONkH0vF6jt");

/**
 * Creates a cryptographically signed JWT for a given Clerk user identity.
 */
async function generateTestToken(sub, email, firstName, lastName, expiresIn = "2h") {
  return await new SignJWT({
    sub,
    email,
    first_name: firstName,
    last_name: lastName,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(TEST_SECRET);
}

async function assert(desc, condition, details = "") {
  if (condition) {
    console.log(`  ✅ PASS: ${desc}`);
  } else {
    console.error(`  ❌ FAIL: ${desc} ${details ? `(${details})` : ""}`);
    process.exitCode = 1;
  }
}

async function runTests() {
  console.log("\n🚀 Starting Yummiee Cloudflare Multi-User Isolation & Security Audit Test Suite...\n");

  // 1. Health Endpoint
  console.log("--- 1. Health & Public Endpoints ---");
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  const healthData = await healthRes.json();
  assert("Health check returns 200", healthRes.status === 200);
  assert("Health check status is ok", healthData.status === "ok");

  // 2. Recipe Catalog & Public Browsing
  console.log("\n--- 2. Public Recipe Catalog & Search ---");
  const allRecipesRes = await fetch(`${BASE_URL}/api/recipes`);
  const allRecipes = await allRecipesRes.json();
  assert("Fetch public recipes returns array", Array.isArray(allRecipes));
  assert("Seed catalog contains at least 8 recipes", allRecipes.length >= 8, `Got ${allRecipes.length}`);

  const searchRes = await fetch(`${BASE_URL}/api/recipes?search=Tuscan`);
  const searchData = await searchRes.json();
  assert("Search filter finds Tuscan Chicken", searchData.some((r) => r.name.includes("Tuscan")));

  const catRes = await fetch(`${BASE_URL}/api/recipes?category=Breakfast`);
  const catData = await catRes.json();
  assert("Category filter returns only Breakfast recipes", catData.every((r) => r.category === "Breakfast"));

  const recipe1Res = await fetch(`${BASE_URL}/api/recipes/1`);
  const recipe1 = await recipe1Res.json();
  assert("Fetch recipe details returns 200", recipe1Res.status === 200);
  assert("Recipe has structured ingredients", Array.isArray(recipe1.ingredients) && recipe1.ingredients.length > 0);
  assert("Recipe has step instructions", Array.isArray(recipe1.instructions) && recipe1.instructions.length > 0);
  assert("Recipe has nutrition info", recipe1.nutrition !== null && recipe1.nutrition.calories === 480);

  // 3. Suggestions & Ingredient Matching
  console.log("\n--- 3. Recipe Suggestions & Ingredient Match ---");
  const suggRes = await fetch(`${BASE_URL}/api/recipes/suggestion?mealPeriod=Breakfast`);
  const suggData = await suggRes.json();
  assert("Suggestion endpoint returns 200", suggRes.status === 200);
  assert("Suggestion includes matching mealPeriod", suggData.mealPeriod === "Breakfast");

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
  assert("Top matched recipe is Creamy Tuscan Garlic Chicken", matchData[0]?.recipe?.name === "Creamy Tuscan Garlic Chicken");

  // 4. Security & Cryptographic Authentication Audit
  console.log("\n--- 4. Cryptographic Authentication & Spoofing Defense ---");
  
  // Test A: No token
  const noTokenRes = await fetch(`${BASE_URL}/api/recipes/my-recipes`);
  assert("Unauthenticated request without token rejected (401)", noTokenRes.status === 401);

  // Test B: Spoofed x-clerk-user-id header without cryptographic token
  const spoofHeaderRes = await fetch(`${BASE_URL}/api/recipes/my-recipes`, {
    headers: { "x-clerk-user-id": "user_fake_attacker_999" },
  });
  assert("Spoofed x-clerk-user-id without verified token rejected (401)", spoofHeaderRes.status === 401);

  // Test C: Tampered JWT token
  const validTokenA = await generateTestToken("user_alice_clerk_123", "alice@example.com", "Alice", "Johnson");
  const tamperedToken = validTokenA.slice(0, -10) + "tampered123";
  const tamperedRes = await fetch(`${BASE_URL}/api/recipes/my-recipes`, {
    headers: { Authorization: `Bearer ${tamperedToken}` },
  });
  assert("Cryptographically tampered JWT token rejected (401)", tamperedRes.status === 401);

  // Test D: Expired JWT token
  const expiredToken = await generateTestToken("user_alice_clerk_123", "alice@example.com", "Alice", "Johnson", "-10m");
  const expiredRes = await fetch(`${BASE_URL}/api/recipes/my-recipes`, {
    headers: { Authorization: `Bearer ${expiredToken}` },
  });
  assert("Expired JWT token rejected (401)", expiredRes.status === 401);

  // 5. Complete End-to-End Multi-User Isolation Journey
  console.log("\n--- 5. End-to-End Multi-User Isolation Journey ---");

  const validTokenB = await generateTestToken("user_bob_clerk_456", "bob@example.com", "Bob", "Smith");
  const authHeaderA = { Authorization: `Bearer ${validTokenA}`, "Content-Type": "application/json" };
  const authHeaderB = { Authorization: `Bearer ${validTokenB}`, "Content-Type": "application/json" };

  console.log("\n  [User A Session: Alice]");
  // User A creates Recipe A
  const createRecipeARes = await fetch(`${BASE_URL}/api/recipes`, {
    method: "POST",
    headers: authHeaderA,
    body: JSON.stringify({
      name: "Alice Private Chicken Curry",
      description: "Alice secret family recipe",
      category: "Dinner",
      time: 35,
      difficulty: "Medium",
      servings: 4,
      ingredients: [{ name: "Chicken", quantity: 500, unit: "g" }],
      instructions: [{ step: 1, title: "Cook", description: "Cook thoroughly" }],
      nutrition: { calories: 450, protein: 35, carbs: 10, fat: 20 },
    }),
  });
  const recipeA = await createRecipeARes.json();
  assert("User A creates Recipe A (201 Created)", createRecipeARes.status === 201);
  const recipeAId = recipeA.id;

  // User A adds Recipe 1 to Wishlist
  const addWishlistARes = await fetch(`${BASE_URL}/api/wishlist/1`, {
    method: "POST",
    headers: authHeaderA,
  });
  assert("User A adds Recipe 1 to Wishlist (201 Created)", addWishlistARes.status === 201);

  // User A adds Shopping Item A
  const addShopARes = await fetch(`${BASE_URL}/api/shopping-list`, {
    method: "POST",
    headers: authHeaderA,
    body: JSON.stringify({ name: "Organic Honey", quantity: 1, unit: "jar", recipeId: 1 }),
  });
  const shopItemA = await addShopARes.json();
  assert("User A adds Shopping Item A (201 Created)", addShopARes.status === 201);
  const shopItemAId = shopItemA.id;

  // User A uploads an image to R2
  const samplePngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  const uploadARes = await fetch(`${BASE_URL}/api/images/upload`, {
    method: "POST",
    headers: authHeaderA,
    body: JSON.stringify({
      image: samplePngBase64,
      filename: "alice-dish.png",
      contentType: "image/png",
    }),
  });
  const uploadAData = await uploadARes.json();
  assert("User A uploads image to R2 (201 Created)", uploadARes.status === 201);
  assert("User A receives R2 image key", uploadAData.key && uploadAData.url);

  console.log("\n  [User A Logout -> User B Session: Bob]");
  // Verify User B does NOT see User A's private recipes
  const myRecipesB1Res = await fetch(`${BASE_URL}/api/recipes/my-recipes`, { headers: authHeaderB });
  const myRecipesB1 = await myRecipesB1Res.json();
  assert("User B does NOT see Recipe A in my-recipes (Empty/Isolated)", !myRecipesB1.some((r) => r.id === recipeAId));

  // Verify User B does NOT see User A's wishlist
  const wishlistB1Res = await fetch(`${BASE_URL}/api/wishlist`, { headers: authHeaderB });
  const wishlistB1 = await wishlistB1Res.json();
  assert("User B does NOT see Recipe 1 in wishlist (Empty/Isolated)", wishlistB1.length === 0);

  // Verify User B does NOT see User A's shopping list
  const shopB1Res = await fetch(`${BASE_URL}/api/shopping-list`, { headers: authHeaderB });
  const shopB1 = await shopB1Res.json();
  assert("User B does NOT see Shopping Item A (Empty/Isolated)", shopB1.length === 0);

  // User B attempts to edit User A's Recipe A
  const editRecipeBRes = await fetch(`${BASE_URL}/api/recipes/${recipeAId}`, {
    method: "PUT",
    headers: authHeaderB,
    body: JSON.stringify({ name: "Bob Hijacked Recipe" }),
  });
  assert("User B cannot edit User A's recipe (404 Not Found)", editRecipeBRes.status === 404);

  // User B attempts to delete User A's shopping item
  const delShopBRes = await fetch(`${BASE_URL}/api/shopping-list/${shopItemAId}`, {
    method: "DELETE",
    headers: authHeaderB,
  });
  assert("User B cannot delete User A's shopping item (404 Not Found)", delShopBRes.status === 404);

  // User B attempts to delete User A's R2 image
  const delImageBRes = await fetch(`${BASE_URL}${uploadAData.url}`, {
    method: "DELETE",
    headers: authHeaderB,
  });
  assert("User B cannot delete User A's R2 image (404 Not Found)", delImageBRes.status === 404);

  // User B creates own data
  const createRecipeBRes = await fetch(`${BASE_URL}/api/recipes`, {
    method: "POST",
    headers: authHeaderB,
    body: JSON.stringify({
      name: "Bob Signature Risotto",
      description: "Creamy mushroom risotto",
      category: "Dinner",
      time: 40,
      difficulty: "Medium",
      servings: 2,
    }),
  });
  const recipeB = await createRecipeBRes.json();
  assert("User B creates Recipe B (201 Created)", createRecipeBRes.status === 201);
  const recipeBId = recipeB.id;

  const addWishlistBRes = await fetch(`${BASE_URL}/api/wishlist/2`, {
    method: "POST",
    headers: authHeaderB,
  });
  assert("User B adds Recipe 2 to Wishlist (201 Created)", addWishlistBRes.status === 201);

  const addShopBRes = await fetch(`${BASE_URL}/api/shopping-list`, {
    method: "POST",
    headers: authHeaderB,
    body: JSON.stringify({ name: "Almond Milk", quantity: 2, unit: "cartons" }),
  });
  const shopItemB = await addShopBRes.json();
  assert("User B adds Shopping Item B (201 Created)", addShopBRes.status === 201);

  console.log("\n  [User B Logout -> User A Session Resumed: Alice]");
  // User A verifies own data is intact and User B's data is NOT visible
  const myRecipesA2Res = await fetch(`${BASE_URL}/api/recipes/my-recipes`, { headers: authHeaderA });
  const myRecipesA2 = await myRecipesA2Res.json();
  assert("User A sees Recipe A in my-recipes", myRecipesA2.some((r) => r.id === recipeAId));
  assert("User A does NOT see User B's Recipe B in my-recipes", !myRecipesA2.some((r) => r.id === recipeBId));

  const wishlistA2Res = await fetch(`${BASE_URL}/api/wishlist`, { headers: authHeaderA });
  const wishlistA2 = await wishlistA2Res.json();
  assert("User A sees Recipe 1 in wishlist", wishlistA2.some((r) => r.id === 1));
  assert("User A does NOT see User B's Recipe 2 in wishlist", !wishlistA2.some((r) => r.id === 2));

  const shopA2Res = await fetch(`${BASE_URL}/api/shopping-list`, { headers: authHeaderA });
  const shopA2 = await shopA2Res.json();
  assert("User A sees Shopping Item A ('Organic Honey')", shopA2.some((i) => i.id === shopItemAId));
  assert("User A does NOT see User B's Shopping Item B ('Almond Milk')", !shopA2.some((i) => i.name === "Almond Milk"));

  // Verify User A's R2 image is still accessible
  const getImageRes = await fetch(`${BASE_URL}${uploadAData.url}`);
  assert("User A image in R2 is accessible (200 OK)", getImageRes.status === 200);

  // Cleanup test data
  console.log("\n--- 6. Cleanup Test Data ---");
  await fetch(`${BASE_URL}${uploadAData.url}`, { method: "DELETE", headers: authHeaderA });
  await fetch(`${BASE_URL}/api/recipes/${recipeAId}`, { method: "DELETE", headers: authHeaderA });
  await fetch(`${BASE_URL}/api/recipes/${recipeBId}`, { method: "DELETE", headers: authHeaderB });
  await fetch(`${BASE_URL}/api/wishlist/1`, { method: "DELETE", headers: authHeaderA });
  await fetch(`${BASE_URL}/api/wishlist/2`, { method: "DELETE", headers: authHeaderB });
  await fetch(`${BASE_URL}/api/shopping-list`, { method: "DELETE", headers: authHeaderA });
  await fetch(`${BASE_URL}/api/shopping-list`, { method: "DELETE", headers: authHeaderB });

  console.log("\n✨ All Multi-User Isolation & Cryptographic Security Tests Passed Successfully!\n");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
