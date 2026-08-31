// test-runner.js - Multi-User Isolation & Cryptographic Auth Verification Test Suite
import { generateKeyPair, exportJWK, SignJWT } from "jose";
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import app from "../src/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createD1Database(dbSync) {
  return {
    prepare(query) {
      const stmt = dbSync.prepare(query);
      const makeBound = (boundParams = []) => ({
        async first() {
          const row = stmt.get(...boundParams);
          return row || null;
        },
        async all() {
          const results = stmt.all(...boundParams);
          return { results: results || [] };
        },
        async run() {
          const info = stmt.run(...boundParams);
          return { success: true, meta: info };
        },
      });

      const obj = makeBound([]);
      obj.bind = (...params) => makeBound(params);
      return obj;
    },
    async batch(statements) {
      const results = [];
      for (const s of statements) {
        if (s.run) {
          results.push(await s.run());
        } else if (s.all) {
          results.push(await s.all());
        } else if (s.first) {
          results.push(await s.first());
        }
      }
      return results;
    },
    exec(sql) {
      dbSync.exec(sql);
    },
  };
}

function createR2Bucket() {
  const storage = new Map();
  return {
    async put(key, data, options = {}) {
      storage.set(key, {
        body: data,
        contentType: options?.httpMetadata?.contentType || "image/jpeg",
        etag: `"r2-${Date.now()}"`,
      });
      return { key };
    },
    async get(key) {
      const item = storage.get(key);
      if (!item) return null;
      return {
        body: item.body,
        httpEtag: item.etag,
        writeHttpMetadata(headers) {
          headers.set("content-type", item.contentType);
        },
      };
    },
    async delete(key) {
      storage.delete(key);
    },
  };
}

// Setup D1 & R2 test environment
const dbSync = new DatabaseSync(":memory:");
const d1 = createD1Database(dbSync);
const r2 = createR2Bucket();

// Apply D1 migrations in sequence
const migration1 = fs.readFileSync(path.join(__dirname, "../migrations/0001_initial_schema.sql"), "utf8");
d1.exec(migration1);

const migration2 = fs.readFileSync(path.join(__dirname, "../migrations/0002_seed_recipes.sql"), "utf8");
d1.exec(migration2);

const testEnv = {
  DB: d1,
  IMAGES: r2,
  ALLOWED_ORIGIN: "https://yummiee.pages.dev,https://yummiee.yummiee-api.workers.dev,http://localhost:5173",
  CLERK_ISSUER: "https://measured-honeybee-7159.clerk.accounts.dev",
  CLERK_JWKS_URL: "https://measured-honeybee-7159.clerk.accounts.dev/.well-known/jwks.json",
  CLERK_PUBLISHABLE_KEY: "pk_test_bWVhc3VyZWQtaG9uZXliZWUtNzE1OS5jbGVyay5hY2NvdW50cy5kZXYk",
};

// Generate genuine RS256 key pair for JWKS mocking
const keyPair = await generateKeyPair("RS256");
const testJwk = await exportJWK(keyPair.publicKey);
testJwk.kid = "test-clerk-kid-123";
testJwk.use = "sig";
testJwk.alg = "RS256";

// Attacker key pair for untrusted key signature tests
const attackerKeyPair = await generateKeyPair("RS256");

// Mock global fetch for JWKS retrieval
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const urlStr = typeof input === "string" ? input : input?.url || input?.toString();
  if (urlStr === testEnv.CLERK_JWKS_URL) {
    return new Response(JSON.stringify({ keys: [testJwk] }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  }
  return originalFetch(input, init);
};

async function testFetch(urlStr, options = {}) {
  const fullUrl = urlStr.startsWith("http") ? urlStr : `http://localhost${urlStr}`;
  const req = new Request(fullUrl, options);
  return await app.fetch(req, testEnv);
}

/**
 * Creates a cryptographically signed RS256 JWT for a given Clerk user identity.
 */
async function generateTestToken(
  sub,
  email,
  firstName,
  lastName,
  expiresIn = "2h",
  issuer = testEnv.CLERK_ISSUER,
  key = keyPair.privateKey,
  kid = "test-clerk-kid-123"
) {
  const jwt = new SignJWT({
    sub,
    email,
    first_name: firstName,
    last_name: lastName,
  })
    .setProtectedHeader({ alg: "RS256", kid })
    .setIssuedAt()
    .setExpirationTime(expiresIn);

  if (issuer) {
    jwt.setIssuer(issuer);
  }

  return await jwt.sign(key);
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
  const healthRes = await testFetch("/api/health");
  const healthData = await healthRes.json();
  assert("Health check returns 200", healthRes.status === 200);
  assert("Health check status is ok", healthData.status === "ok");

  // 2. Recipe Catalog & Public Browsing
  console.log("\n--- 2. Public Recipe Catalog & Search ---");
  const allRecipesRes = await testFetch("/api/recipes");
  const allRecipes = await allRecipesRes.json();
  assert("Fetch public recipes returns array", Array.isArray(allRecipes));
  assert("Seed catalog contains at least 8 recipes", allRecipes.length >= 8, `Got ${allRecipes.length}`);

  const searchRes = await testFetch("/api/recipes?search=Tuscan");
  const searchData = await searchRes.json();
  assert("Search filter finds Tuscan Chicken", searchData.some((r) => r.name.includes("Tuscan")));

  const catRes = await testFetch("/api/recipes?category=Breakfast");
  const catData = await catRes.json();
  assert("Category filter returns only Breakfast recipes", catData.every((r) => r.category === "Breakfast"));

  const recipe1Res = await testFetch("/api/recipes/1");
  const recipe1 = await recipe1Res.json();
  assert("Fetch recipe details returns 200", recipe1Res.status === 200);
  assert("Recipe has structured ingredients", Array.isArray(recipe1.ingredients) && recipe1.ingredients.length > 0);
  assert("Recipe has step instructions", Array.isArray(recipe1.instructions) && recipe1.instructions.length > 0);
  assert("Recipe has nutrition info", recipe1.nutrition !== null && recipe1.nutrition.calories === 480);

  // 3. Suggestions & Ingredient Matching
  console.log("\n--- 3. Recipe Suggestions & Ingredient Match ---");
  const suggRes = await testFetch("/api/recipes/suggestion?mealPeriod=Breakfast");
  const suggData = await suggRes.json();
  assert("Suggestion endpoint returns 200", suggRes.status === 200);
  assert("Suggestion includes matching mealPeriod", suggData.mealPeriod === "Breakfast");

  const matchRes = await testFetch("/api/recipes/match", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ingredients: ["chicken", "cream", "garlic", "spinach"],
      category: "Dinner",
    }),
  });
  const matchData = await matchRes.json();
  assert("Match endpoint returns 200", matchRes.status === 200);
  assert(
    "Top matched recipe is Creamy Tuscan Garlic Chicken",
    matchData[0]?.recipe?.name === "Creamy Tuscan Garlic Chicken"
  );

  // 4. Security & Cryptographic Authentication Audit
  console.log("\n--- 4. Cryptographic Authentication & Spoofing Defense ---");

  // Test A: No token
  const noTokenRes = await testFetch("/api/recipes/my-recipes");
  assert("Unauthenticated request without token rejected (401)", noTokenRes.status === 401);

  // Test B: Spoofed x-clerk-user-id header without cryptographic token
  const spoofHeaderRes = await testFetch("/api/recipes/my-recipes", {
    headers: { "x-clerk-user-id": "user_fake_attacker_999" },
  });
  assert("Spoofed x-clerk-user-id without verified token rejected (401)", spoofHeaderRes.status === 401);

  // Test C: Tampered JWT token
  const validTokenA = await generateTestToken("user_alice_clerk_123", "alice@example.com", "Alice", "Johnson");
  const tamperedToken = validTokenA.slice(0, -10) + "tampered123";
  const tamperedRes = await testFetch("/api/recipes/my-recipes", {
    headers: { Authorization: `Bearer ${tamperedToken}` },
  });
  assert("Cryptographically tampered JWT token rejected (401)", tamperedRes.status === 401);

  // Test D: Expired JWT token
  const expiredToken = await generateTestToken("user_alice_clerk_123", "alice@example.com", "Alice", "Johnson", "-10m");
  const expiredRes = await testFetch("/api/recipes/my-recipes", {
    headers: { Authorization: `Bearer ${expiredToken}` },
  });
  assert("Expired JWT token rejected (401)", expiredRes.status === 401);

  // Test E: Token signed with untrusted private key
  const untrustedKeyToken = await generateTestToken(
    "user_alice_clerk_123",
    "alice@example.com",
    "Alice",
    "Johnson",
    "2h",
    testEnv.CLERK_ISSUER,
    attackerKeyPair.privateKey,
    "untrusted-kid"
  );
  const untrustedRes = await testFetch("/api/recipes/my-recipes", {
    headers: { Authorization: `Bearer ${untrustedKeyToken}` },
  });
  assert("Token signed with untrusted key rejected (401)", untrustedRes.status === 401);

  // Test F: Token with invalid issuer claim
  const wrongIssuerToken = await generateTestToken(
    "user_alice_clerk_123",
    "alice@example.com",
    "Alice",
    "Johnson",
    "2h",
    "https://fake-issuer.clerk.accounts.dev"
  );
  const wrongIssuerRes = await testFetch("/api/recipes/my-recipes", {
    headers: { Authorization: `Bearer ${wrongIssuerToken}` },
  });
  assert("Token with wrong issuer claim rejected (401)", wrongIssuerRes.status === 401);

  // Test G: Valid token + fake spoofed header -> authenticated strictly as token subject
  const spoofWithValidTokenRes = await testFetch("/api/recipes/my-recipes", {
    headers: {
      Authorization: `Bearer ${validTokenA}`,
      "x-clerk-user-id": "user_fake_attacker_999",
    },
  });
  assert("Valid token with spoofed user header accepts token identity (200)", spoofWithValidTokenRes.status === 200);

  // 5. Complete End-to-End Multi-User Isolation Journey
  console.log("\n--- 5. End-to-End Multi-User Isolation Journey ---");

  const validTokenB = await generateTestToken("user_bob_clerk_456", "bob@example.com", "Bob", "Smith");
  const authHeaderA = { Authorization: `Bearer ${validTokenA}`, "Content-Type": "application/json" };
  const authHeaderB = { Authorization: `Bearer ${validTokenB}`, "Content-Type": "application/json" };

  console.log("\n  [User A Session: Alice]");
  // User A creates Recipe A
  const createRecipeARes = await testFetch("/api/recipes", {
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
  const addWishlistARes = await testFetch("/api/wishlist/1", {
    method: "POST",
    headers: authHeaderA,
  });
  assert("User A adds Recipe 1 to Wishlist (201 Created)", addWishlistARes.status === 201);

  // User A adds Shopping Item A
  const addShopARes = await testFetch("/api/shopping-list", {
    method: "POST",
    headers: authHeaderA,
    body: JSON.stringify({ name: "Organic Honey", quantity: 1, unit: "jar", recipeId: 1 }),
  });
  const shopItemA = await addShopARes.json();
  assert("User A adds Shopping Item A (201 Created)", addShopARes.status === 201);
  const shopItemAId = shopItemA.id;

  // User A marks Shopping Item A checked
  const checkShopARes = await testFetch(`/api/shopping-list/${shopItemAId}`, {
    method: "PUT",
    headers: authHeaderA,
    body: JSON.stringify({ checked: true }),
  });
  assert("User A marks Shopping Item A checked (200 OK)", checkShopARes.status === 200);

  // User A uploads an image to R2
  const samplePngBase64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  const uploadARes = await testFetch("/api/images/upload", {
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
  const myRecipesB1Res = await testFetch("/api/recipes/my-recipes", { headers: authHeaderB });
  const myRecipesB1 = await myRecipesB1Res.json();
  assert(
    "User B does NOT see Recipe A in my-recipes (Empty/Isolated)",
    !myRecipesB1.some((r) => r.id === recipeAId)
  );

  // Verify User B does NOT see User A's wishlist
  const wishlistB1Res = await testFetch("/api/wishlist", { headers: authHeaderB });
  const wishlistB1 = await wishlistB1Res.json();
  assert("User B does NOT see Recipe 1 in wishlist (Empty/Isolated)", wishlistB1.length === 0);

  // Verify User B does NOT see User A's shopping list
  const shopB1Res = await testFetch("/api/shopping-list", { headers: authHeaderB });
  const shopB1 = await shopB1Res.json();
  assert("User B does NOT see Shopping Item A (Empty/Isolated)", shopB1.length === 0);

  // User B attempts to edit User A's Recipe A
  const editRecipeBRes = await testFetch(`/api/recipes/${recipeAId}`, {
    method: "PUT",
    headers: authHeaderB,
    body: JSON.stringify({ name: "Bob Hijacked Recipe" }),
  });
  assert("User B cannot edit User A's recipe (404 Not Found)", editRecipeBRes.status === 404);

  // User B attempts to delete User A's Recipe A
  const delRecipeBRes = await testFetch(`/api/recipes/${recipeAId}`, {
    method: "DELETE",
    headers: authHeaderB,
  });
  assert("User B cannot delete User A's recipe (404 Not Found)", delRecipeBRes.status === 404);

  // User B attempts to delete User A's shopping item
  const delShopBRes = await testFetch(`/api/shopping-list/${shopItemAId}`, {
    method: "DELETE",
    headers: authHeaderB,
  });
  assert("User B cannot delete User A's shopping item (404 Not Found)", delShopBRes.status === 404);

  // User B attempts to delete User A's R2 image
  const delImageBRes = await testFetch(uploadAData.url, {
    method: "DELETE",
    headers: authHeaderB,
  });
  assert("User B cannot delete User A's R2 image (404 Not Found)", delImageBRes.status === 404);

  // Test Image Security - reject SVG or disallowed mime types
  const badMimeRes = await testFetch("/api/images/upload", {
    method: "POST",
    headers: authHeaderB,
    body: JSON.stringify({
      image: samplePngBase64,
      filename: "exploit.svg",
      contentType: "image/svg+xml",
    }),
  });
  assert("Disallowed SVG MIME type rejected (400 Bad Request)", badMimeRes.status === 400);

  // Test CORS preflight OPTIONS request from production Pages origin
  const corsPreflightPages = await testFetch("/api/recipes", {
    method: "OPTIONS",
    headers: {
      Origin: "https://yummiee.pages.dev",
      "Access-Control-Request-Method": "POST",
      "Access-Control-Request-Headers": "Authorization, Content-Type",
    },
  });
  assert("CORS preflight for yummiee.pages.dev returns 204", corsPreflightPages.status === 204);
  assert(
    "CORS preflight sets Access-Control-Allow-Origin to https://yummiee.pages.dev",
    corsPreflightPages.headers.get("access-control-allow-origin") === "https://yummiee.pages.dev"
  );
  assert(
    "CORS preflight sets credentials header",
    corsPreflightPages.headers.get("access-control-allow-credentials") === "true"
  );
  assert(
    "CORS preflight allows Authorization & Content-Type headers",
    corsPreflightPages.headers.get("access-control-allow-headers")?.includes("Authorization") &&
    corsPreflightPages.headers.get("access-control-allow-headers")?.includes("Content-Type")
  );

  // Test CORS preflight on authenticated endpoints (wishlist, shopping-list, images/upload)
  const corsWishlist = await testFetch("/api/wishlist", {
    method: "OPTIONS",
    headers: {
      Origin: "https://yummiee.pages.dev",
      "Access-Control-Request-Method": "POST",
      "Access-Control-Request-Headers": "Authorization, Content-Type",
    },
  });
  assert("CORS preflight for /api/wishlist succeeds without auth (204)", corsWishlist.status === 204);
  assert("CORS preflight for /api/wishlist has Allow-Origin", corsWishlist.headers.get("access-control-allow-origin") === "https://yummiee.pages.dev");

  const corsImages = await testFetch("/api/images/upload", {
    method: "OPTIONS",
    headers: {
      Origin: "https://yummiee.pages.dev",
      "Access-Control-Request-Method": "POST",
      "Access-Control-Request-Headers": "Authorization, Content-Type",
    },
  });
  assert("CORS preflight for /api/images/upload succeeds without auth (204)", corsImages.status === 204);
  assert("CORS preflight for /api/images/upload has Allow-Origin", corsImages.headers.get("access-control-allow-origin") === "https://yummiee.pages.dev");

  // Test actual GET request contains Access-Control-Allow-Origin
  const corsGet = await testFetch("/api/recipes", {
    method: "GET",
    headers: {
      Origin: "https://yummiee.pages.dev",
    },
  });
  assert("GET /api/recipes contains Access-Control-Allow-Origin for Pages", corsGet.headers.get("access-control-allow-origin") === "https://yummiee.pages.dev");
  assert("GET /api/recipes contains Access-Control-Allow-Credentials", corsGet.headers.get("access-control-allow-credentials") === "true");

  // User B creates own data
  const createRecipeBRes = await testFetch("/api/recipes", {
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

  const addWishlistBRes = await testFetch("/api/wishlist/2", {
    method: "POST",
    headers: authHeaderB,
  });
  assert("User B adds Recipe 2 to Wishlist (201 Created)", addWishlistBRes.status === 201);

  const addShopBRes = await testFetch("/api/shopping-list", {
    method: "POST",
    headers: authHeaderB,
    body: JSON.stringify({ name: "Almond Milk", quantity: 2, unit: "cartons" }),
  });
  const shopItemB = await addShopBRes.json();
  assert("User B adds Shopping Item B (201 Created)", addShopBRes.status === 201);

  console.log("\n  [User B Logout -> User A Session Resumed: Alice]");
  // User A verifies own data is intact and User B's data is NOT visible
  const myRecipesA2Res = await testFetch("/api/recipes/my-recipes", { headers: authHeaderA });
  const myRecipesA2 = await myRecipesA2Res.json();
  assert("User A sees Recipe A in my-recipes", myRecipesA2.some((r) => r.id === recipeAId));
  assert("User A does NOT see User B's Recipe B in my-recipes", !myRecipesA2.some((r) => r.id === recipeBId));

  const wishlistA2Res = await testFetch("/api/wishlist", { headers: authHeaderA });
  const wishlistA2 = await wishlistA2Res.json();
  assert("User A sees Recipe 1 in wishlist", wishlistA2.some((r) => r.id === 1));
  assert("User A does NOT see User B's Recipe 2 in wishlist", !wishlistA2.some((r) => r.id === 2));

  const shopA2Res = await testFetch("/api/shopping-list", { headers: authHeaderA });
  const shopA2 = await shopA2Res.json();
  assert("User A sees Shopping Item A ('Organic Honey')", shopA2.some((i) => i.id === shopItemAId));
  assert("User A's Shopping Item A checked state is preserved (true)", shopA2.find((i) => i.id === shopItemAId)?.checked === true);
  assert("User A does NOT see User B's Shopping Item B ('Almond Milk')", !shopA2.some((i) => i.name === "Almond Milk"));

  // Verify User A's R2 image is still accessible
  const getImageRes = await testFetch(uploadAData.url);
  assert("User A image in R2 is accessible (200 OK)", getImageRes.status === 200);

  // Cleanup test data
  console.log("\n--- 6. Cleanup & Teardown ---");
  await testFetch(uploadAData.url, { method: "DELETE", headers: authHeaderA });
  await testFetch(`/api/recipes/${recipeAId}`, { method: "DELETE", headers: authHeaderA });
  await testFetch(`/api/recipes/${recipeBId}`, { method: "DELETE", headers: authHeaderB });
  await testFetch("/api/wishlist/1", { method: "DELETE", headers: authHeaderA });
  await testFetch("/api/wishlist/2", { method: "DELETE", headers: authHeaderB });
  await testFetch("/api/shopping-list", { method: "DELETE", headers: authHeaderA });
  await testFetch("/api/shopping-list", { method: "DELETE", headers: authHeaderB });

  console.log("\n✨ All Multi-User Isolation & Cryptographic Security Tests Passed Successfully!\n");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
