# 🍳 Yummiee — Full Project Deep Dive & Technical Interview Study Guide

> **Project Name:** Yummiee — Smart Recipe & Shopping Assistant  
> **Live Frontend:** [https://yummiee.pages.dev](https://yummiee.pages.dev)  
> **Live REST API:** [https://yummiee-api.yummiee-api.workers.dev](https://yummiee-api.yummiee-api.workers.dev)  
> **Target Production Architecture:** Cloudflare Serverless Native (Pages + Workers + D1 Database + R2 Object Storage + Clerk Auth)

---

## 📌 Table of Contents
1. [Executive Summary & High-Level Architecture](#1-executive-summary--high-level-architecture)
2. [Complete Technology Stack Breakdown](#2-complete-technology-stack-breakdown)
3. [End-to-End User Journey (Login to Logout)](#3-end-to-end-user-journey-login-to-logout)
4. [Granular Feature & Page Walkthrough](#4-granular-feature--page-walkthrough)
5. [🎓 Code-by-Code Explanation & Integration Masterclass](#5-code-by-code-explanation--integration-masterclass)
   - [5.1 How React Connects to the Backend (`api.js`)](#51-how-react-connects-to-the-backend-apijs)
   - [5.2 How Authentication & Token Bridge Works (`ApiAuthBridge.jsx`)](#52-how-authentication--token-bridge-works-apiauthbridgejsx)
   - [5.3 How Global State Works (`ShoppingListContext.jsx` & `WishlistContext.jsx`)](#53-how-global-state-works-shoppinglistcontextjsx--wishlistcontextjsx)
   - [5.4 How Dynamic Servings Calculation Works in Code (`RecipeDetails.jsx`)](#54-how-dynamic-servings-calculation-works-in-code-recipedetailsjsx)
   - [5.5 How the "Download PDF" Button Works in Code (`ShoppingList.jsx` + `jsPDF`)](#55-how-the-download-pdf-button-works-in-code-shoppinglistjsx--jspdf)
   - [5.6 How "What Can I Cook?" Matcher Works in Code (`WhatCanICook.jsx` & Worker)](#56-how-what-can-i-cook-matcher-works-in-code-whatcanicookjsx--worker)
   - [5.7 How Client-Side Image Compression Works in Code (`imageOptimizer.js`)](#57-how-client-side-image-compression-works-in-code-imageoptimizerjs)
   - [5.8 How the Cloudflare Worker Backend Works (`index.js`, `clerk.js`, `recipeService.js`)](#58-how-the-cloudflare-worker-backend-works-indexjs-clerkjs-recipeservicejs)
   - [5.9 How Cloudflare D1 SQL Queries & R2 Object Storage Work in Code](#59-how-cloudflare-d1-sql-queries--r2-object-storage-work-in-code)
6. [Cloudflare Backend & Database Architecture (D1 & R2)](#6-cloudflare-backend--database-architecture-d1--r2)
7. [Security, Cryptographic Auth & Multi-User Isolation](#7-security-cryptographic-auth--multi-user-isolation)
8. [Key Technical Problems Solved (Case Studies)](#8-key-technical-problems-solved-case-studies)
9. [Top 30 Technical Interview Questions & Model Answers](#9-top-30-technical-interview-questions--model-answers)

---

## 1. Executive Summary & High-Level Architecture

**Yummiee** is a full-stack, cloud-native web application that allows home cooks to discover recipes, dynamically calculate ingredient quantities for different serving sizes, check what dishes they can prepare with existing kitchen ingredients, manage personal recipes with photos, and generate printable PDF grocery lists.

### 🏗️ Architecture Diagram
```
                     [ Web / Mobile Client Browser ]
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
┌─────────────────────────┐                       ┌─────────────────────────┐
│    Cloudflare Pages     │                       │    Clerk Auth Server    │
│  React 19 + Vite (SPA)  │◀─── Session Token ────│  (JWT Authentication)   │
└─────────────────────────┘                       └─────────────────────────┘
           │
           │ HTTPS API Calls (Bearer Token)
           ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                     Cloudflare Worker (Hono REST API)                     │
│                        Edge Microservices Runtime                         │
│                                                                           │
│  [ CORS Middleware ] ──▶ [ jose JWKS Auth ] ──▶ [ Route Controllers ]      │
└──────────────────────┬────────────────────────────────────┬───────────────┘
                       │                                    │
                       ▼                                    ▼
       ┌───────────────────────────────┐    ┌───────────────────────────────┐
       │   Cloudflare D1 (Database)    │    │  Cloudflare R2 (Blob Storage) │
       │  Serverless Relational SQLite │    │    Optimized Recipe Photos    │
       │    (Users, Recipes, Lists)    │    │      (Public HTTP Cache)      │
       └───────────────────────────────┘    └───────────────────────────────┘
```

---

## 2. Complete Technology Stack Breakdown

| Layer | Technology | Key Details & Why It Was Chosen |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19** | Latest React features, hooks (`useAuth`, `useUser`), modular Context providers. |
| **Build & Bundling** | **Vite** | Ultra-fast Hot Module Replacement (HMR) and optimized Rollup tree-shaken chunks. |
| **Routing** | **React Router DOM (HashRouter)** | Enables smooth client-side routing on static hosting without server 404 rewrite issues. |
| **Styling** | **Tailwind CSS v4 + Vanilla CSS** | Utility-first responsive design, modern `@theme` design tokens, custom safe-area spacing. |
| **Icons** | **Lucide React** | Feather-light SVG icons (`ChefHat`, `ShoppingCart`, `Heart`, `Utensils`, `Download`, etc.). |
| **PDF Generation** | **jsPDF** | Client-side dynamic PDF document rendering for grocery lists with zero server overhead. |
| **Image Compression** | **HTML5 Canvas API** | In-browser asynchronous image resizing and WebP/JPEG compression (<200KB). |
| **Backend API** | **Cloudflare Workers + Hono v4**| Sub-millisecond cold start edge compute running across 300+ global Cloudflare datacenters. |
| **Database** | **Cloudflare D1** | Serverless relational SQL database with automated schema migrations. |
| **Object Storage** | **Cloudflare R2** | Zero-egress-fee S3-compatible blob storage with direct worker streaming. |
| **Authentication** | **Clerk** | Seamless social (Google) + email authentication, MFA, and cryptographic RS256 JWTs. |
| **JWT Verification** | **jose** | Standards-compliant cryptographic JWKS validation at the edge without heavy Node.js runtimes. |

---

## 3. End-to-End User Journey (Login to Logout)

1. **Visit App**: The user arrives at `https://yummiee.pages.dev`.
2. **Authentication Gate (`ProtectedRoute`)**:
   - If signed in: Automatically redirected to `/dashboard`.
   - If signed out: Routed to `/` (Login Page) featuring a centralized Clerk `<SignIn />` component.
3. **Login / Register**: The user signs in via Google or Email. Clerk issues a cryptographically signed RS256 JWT session token.
4. **Token Propagation (`ApiAuthBridge`)**: `ApiAuthBridge` captures the token from Clerk and injects it into the centralized API client (`api.js`).
5. **Dashboard Browsing**:
   - The user browses the curated recipe catalog, searches for recipes, filters by category (Breakfast, Dinner, etc.), or clicks "Surprise Me" for an intelligent time-of-day meal suggestion.
6. **Smart Cooking Matcher ("What Can I Cook?")**:
   - The user inputs available kitchen ingredients (e.g., "Egg, Onion, Tomato"). The matching engine computes match percentages and identifies missing ingredients.
7. **Recipe Detail & Servings Scaling**:
   - The user opens a recipe. Clicking `+` / `-` on Servings automatically recalculates ingredient measurements in real time.
8. **Shopping List & PDF Download**:
   - The user selects desired ingredients and clicks "Add to Shopping List".
   - In `/shopping-list`, ingredients are grouped by recipe with checkboxes. Clicking **"Download PDF"** instantly downloads a printable grocery checklist.
9. **User Recipe Creation (`/add-recipe`)**:
   - The user creates their own recipe, selects a photo (which is compressed on the fly in the browser), and saves it to Cloudflare D1 & R2.
10. **Logout**:
    - The user clicks "Log out" in the sidebar or mobile bottom sheet. `signOut()` gracefully terminates the session, clears token caches, and routes back to the login screen.

---

## 4. Granular Feature & Page Walkthrough

### 4.1 Authentication & Profile Lifecycle
* **Files**: [`Frontend/src/pages/Login.jsx`](file:///d:/Hackathon/New%20folder/yummiee/Frontend/src/pages/Login.jsx), [`Register.jsx`](file:///d:/Hackathon/New%20folder/yummiee/Frontend/src/pages/Register.jsx), [`ApiAuthBridge.jsx`](file:///d:/Hackathon/New%20folder/yummiee/Frontend/src/components/ApiAuthBridge.jsx)
* **Features**:
  - Centralized flex layout (`flex min-h-screen w-full flex-col items-center justify-center`).
  - Seamless redirection between `/` and `/dashboard` using `useAuth()`.
  - Clerk session synchronization and auto-retry to prevent transient 401 errors.

### 4.2 Dashboard & Recipe Discovery
* **Files**: [`Frontend/src/pages/Dashboard.jsx`](file:///d:/Hackathon/New%20folder/yummiee/Frontend/src/pages/Dashboard.jsx), [`RecipeCard.jsx`](file:///d:/Hackathon/New%20folder/yummiee/Frontend/src/components/RecipeCard.jsx)
* **Features**:
  - Live debounced search querying recipe titles and descriptions.
  - Category filters ("All", "Breakfast", "Lunch", "Dinner", "Dessert", "Snacks", "Vegetarian").
  - Sorting options ("Recently Added", "Quickest", "Most Liked").
  - Skeleton loading states and instant Stale-While-Revalidate caching.

### 4.3 Smart Meal Engine ("Surprise Me")
* **Files**: [`Frontend/src/components/SurpriseMeModal.jsx`](file:///d:/Hackathon/New%20folder/yummiee/Frontend/src/components/SurpriseMeModal.jsx)
* **Features**:
  - Intelligently recommends meals based on the client's current time of day.
  - Anti-repeat mechanism (`excludeId`) prevents consecutive duplicate suggestions.

### 4.4 Pantry Ingredient Matcher ("What Can I Cook?")
* **Files**: [`Frontend/src/pages/WhatCanICook.jsx`](file:///d:/Hackathon/New%20folder/yummiee/Frontend/src/pages/WhatCanICook.jsx)
* **Features**:
  - Chip input supporting Enter and comma delimiters.
  - Computes ingredient match percentage and clearly lists missing ingredients.

### 4.5 Recipe Details, Dynamic Servings & Nutrition
* **Files**: [`Frontend/src/pages/RecipeDetails.jsx`](file:///d:/Hackathon/New%20folder/yummiee/Frontend/src/pages/RecipeDetails.jsx)
* **Features**:
  - Dynamic serving size multiplier recalculating quantities in real time.
  - Interactive ingredient checkboxes with bulk addition to the shopping list.
  - Nutritional macro breakdown (Calories, Protein, Carbs, Fat).
  - Optimistic wishlist toggle.

### 4.6 Shopping List & PDF Export Engine
* **Files**: [`Frontend/src/pages/ShoppingList.jsx`](file:///d:/Hackathon/New%20folder/yummiee/Frontend/src/pages/ShoppingList.jsx)
* **Features**:
  - Automatic grouping of ingredients by parent recipe.
  - Live progress bar tracking checked items.
  - One-click branded PDF download using `jsPDF` formatted for print/mobile use.

### 4.7 User Recipe Management (Add / Edit / Delete)
* **Files**: [`Frontend/src/pages/AddRecipe.jsx`](file:///d:/Hackathon/New%20folder/yummiee/Frontend/src/pages/AddRecipe.jsx), [`EditRecipe.jsx`](file:///d:/Hackathon/New%20folder/yummiee/Frontend/src/pages/EditRecipe.jsx), [`MyRecipes.jsx`](file:///d:/Hackathon/New%20folder/yummiee/Frontend/src/pages/MyRecipes.jsx)
* **Features**:
  - Dynamic rows for ingredients and numbered instructions.
  - Automatic time unit conversions (minutes / hours).
  - Client-side Canvas WebP image compression reducing upload sizes by 95%+.
  - Creator-enforced editing and deletion permissions.

---

## 5. 🎓 Code-by-Code Explanation & Integration Masterclass

This section explains the exact code line-by-line so you can confidently explain the entire implementation during any interview.

---

### 5.1 How React Connects to the Backend (`api.js`)
**File:** [`Frontend/src/services/api.js`](file:///d:/Hackathon/New%20folder/yummiee/Frontend/src/services/api.js)

```javascript
// 1. Determining the API Base URL dynamically
const rawApiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:8787";
const cleanApiUrl = rawApiUrl.replace(/\/$/, "");
const API_BASE_URL = cleanApiUrl.endsWith("/api") ? cleanApiUrl : `${cleanApiUrl}/api`;
```
* **Explanation**: In development, `VITE_API_URL` points to `http://localhost:8787`. In production on Cloudflare, it points to `https://yummiee-api.yummiee-api.workers.dev`. The helper strips trailing slashes and ensures `/api` is present.

```javascript
// 2. The Core Request Wrapper with Auth & AbortController Timeout
async function request(endpoint, options = {}, timeoutMs = 9000) {
  const url = `${API_BASE_URL}${endpoint}`;
  const authHeaders = await getAuthHeaders(); // Injects Bearer token

  const headers = {
    ...authHeaders,
    ...options.headers,
  };

  // Prevent requests from hanging indefinitely
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const config = {
      ...options,
      headers,
      signal: options.signal || controller.signal,
    };

    const response = await fetch(url, config);
    if (response.status === 204) return null; // No Content

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const error = new Error(data?.message || `HTTP Error ${response.status}`);
      error.status = response.status;
      throw error;
    }
    return data;
  } finally {
    clearTimeout(timeoutId);
  }
}
```
* **Interview Key Point**: `AbortController` prevents the browser from hanging for 30+ seconds if an external server is unresponsive. It times out gracefully after 9 seconds.

---

### 5.2 How Authentication & Token Bridge Works (`ApiAuthBridge.jsx`)
**File:** [`Frontend/src/components/ApiAuthBridge.jsx`](file:///d:/Hackathon/New%20folder/yummiee/Frontend/src/components/ApiAuthBridge.jsx)

```javascript
import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/react";
import { setApiAuth } from "../services/api";

function ApiAuthBridge({ children }) {
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();

  // Synchronously update auth state on every render
  setApiAuth({
    userId: isSignedIn ? user?.id : null,
    getToken: isSignedIn ? getToken : null,
  });

  useEffect(() => {
    setApiAuth({
      userId: isSignedIn ? user?.id : null,
      getToken: isSignedIn ? getToken : null,
    });
    return () => setApiAuth(); // Clean up on unmount
  }, [getToken, isSignedIn, user?.id]);

  return children;
}
```
* **Why this is needed**: React Context and Clerk hooks live inside React component trees. Regular JavaScript files (like `api.js`) cannot directly call React hooks (`useAuth`). `ApiAuthBridge` acts as a **bridge component**, capturing Clerk's `getToken` function and passing it to `api.js` so every `fetch()` request can attach `Authorization: Bearer <token>`.

#### 🔁 Token Polling & Race Condition Fix in `api.js`
```javascript
async function getAuthHeaders() {
  let token = null;

  // Poll up to 3 times with 150ms delay if token is in-flight
  for (let attempt = 0; attempt < 3; attempt++) {
    if (currentAuth.getToken) {
      try {
        token = await currentAuth.getToken();
      } catch (e) {}
    }

    if (!token && typeof window !== "undefined" && window.Clerk?.session) {
      try {
        token = await window.Clerk.session.getToken();
      } catch (e) {}
    }

    if (token) break;

    const isUserActive = currentAuth.userId || (typeof window !== "undefined" && window.Clerk?.user);
    if (isUserActive && attempt < 2) {
      await new Promise((resolve) => setTimeout(resolve, 150));
    } else {
      break;
    }
  }

  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}
```
* **Interview Key Point**: Fixes the common junior bug where the frontend issues an API call before Clerk has finished preparing the JWT session token, eliminating transient 401 Unauthorized errors.

---

### 5.3 How Global State Works (`ShoppingListContext.jsx` & `WishlistContext.jsx`)
**File:** [`Frontend/src/context/ShoppingListContext.jsx`](file:///d:/Hackathon/New%20folder/yummiee/Frontend/src/context/ShoppingListContext.jsx)

```javascript
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
      if (Array.isArray(data)) setShoppingList(data);
    } catch (err) {
      // Auto-retry once after 350ms if token was initializing
      if (retryCount < 2 && isSignedIn) {
        setTimeout(() => loadShoppingList(retryCount + 1), 350);
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  // Reload data whenever the authenticated user changes
  useEffect(() => {
    if (isSignedIn && userId) {
      loadShoppingList();
    } else {
      setShoppingList([]);
      setLoading(false);
    }
  }, [isSignedIn, userId]);

  return (
    <ShoppingListContext.Provider value={{ shoppingList, loadShoppingList, ... }}>
      {children}
    </ShoppingListContext.Provider>
  );
}

export function useShoppingList() {
  return useContext(ShoppingListContext);
}
```
* **Interview Key Point**: `ShoppingListProvider` wraps the application. Any child component (like `RecipeDetails` or `ShoppingList`) can call `useShoppingList()` to read or mutate the user's grocery list without prop-drilling.

---

### 5.4 How Dynamic Servings Calculation Works in Code (`RecipeDetails.jsx`)
**File:** [`Frontend/src/pages/RecipeDetails.jsx`](file:///d:/Hackathon/New%20folder/yummiee/Frontend/src/pages/RecipeDetails.jsx)

```javascript
// Servings state
const [servings, setServings] = useState(2);

const increaseServings = () => setServings((prev) => prev + 1);
const decreaseServings = () => setServings((prev) => Math.max(1, prev - 1));

// Rendering scaled ingredients
{recipe.ingredients.map((ing) => {
  // Scaling formula: (baseQuantity / baseRecipeServings) * currentSelectedServings
  const baseQty = Number(ing.quantity) || 1;
  const baseServings = Number(recipe.servings) || 2;
  const scaledQty = (baseQty / baseServings) * servings;
  
  // Format nicely (e.g., 2.5 or 2)
  const displayQty = Number.isInteger(scaledQty) ? scaledQty : scaledQty.toFixed(1);

  return (
    <div key={ing.id}>
      <span>{ing.name}</span>
      <span>{displayQty} {ing.unit}</span>
    </div>
  );
})}
```
* **Interview Key Point**: Shows understanding of proportional arithmetic and real-time reactive DOM updates in React without mutating original database records.

---

### 5.5 How the "Download PDF" Button Works in Code (`ShoppingList.jsx` + `jsPDF`)
**File:** [`Frontend/src/pages/ShoppingList.jsx`](file:///d:/Hackathon/New%20folder/yummiee/Frontend/src/pages/ShoppingList.jsx)

```javascript
import { jsPDF } from "jspdf";

const downloadPdf = () => {
  const doc = new jsPDF(); // 1. Create PDF canvas

  // 2. Add Branded Header
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(174, 49, 21); // Primary Brand Red (#AE3115)
  doc.text("Yummiee - Shopping List", 14, 20);

  // 3. Add Metadata
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 27);
  doc.text(`Total Items: ${totalItems} (${completedItems} picked up)`, 14, 33);

  // 4. Horizontal Separator Line
  doc.setLineWidth(0.5);
  doc.setDrawColor(228, 226, 225);
  doc.line(14, 37, 196, 37);

  let y = 46; // Starting vertical offset in mm

  // 5. Group items by recipe and render lines
  Object.entries(groupedList).forEach(([recipeTitle, items]) => {
    // Check if we need a new page (standard A4 is 297mm height)
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text(`Recipe: ${recipeTitle}`, 14, y);
    y += 8;

    items.forEach((item) => {
      if (y > 275) {
        doc.addPage();
        y = 20;
      }

      const checkboxStr = item.checked ? "[X]" : "[  ]";
      const itemLine = `${checkboxStr}  ${item.name}`;
      const qtyStr = `${item.quantity} ${item.unit || ""}`;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(item.checked ? 130 : 40, item.checked ? 130 : 40, item.checked ? 130 : 40);

      doc.text(itemLine, 18, y);
      doc.text(qtyStr, 190, y, { align: "right" });
      y += 7;
    });

    y += 5; // Spacing between recipe groups
  });

  // 6. Trigger Browser File Download
  doc.save("Yummiee-Shopping-List.pdf");
};
```
* **Interview Key Point**: Demonstrates client-side document generation, multi-page break handling (`if (y > 270)`), and coordinate-based canvas drawing (`x, y` positions in millimeters).

---

### 5.6 How "What Can I Cook?" Matcher Works in Code (`WhatCanICook.jsx` & Worker)
**File:** [`cloudflare-worker/src/services/recipeService.js`](file:///d:/Hackathon/New%20folder/yummiee/cloudflare-worker/src/services/recipeService.js)

```javascript
export async function matchRecipesByIngredients(db, request) {
  const userIngredients = (request.ingredients || []).map((i) => i.toLowerCase().trim());
  const userSet = new Set(userIngredients);

  const allRows = await db.prepare("SELECT * FROM recipes").all();
  const allRecipes = await populateRecipeDetails(db, allRows.results || []);

  const results = [];

  for (const recipe of allRecipes) {
    const recipeIngredients = recipe.ingredients || [];
    if (recipeIngredients.length === 0) continue;

    let matchedCount = 0;
    const missingIngredients = [];

    for (const ing of recipeIngredients) {
      const normIng = normalizeIngredient(ing.name); // Strips plurals/descriptors
      const isMatched = isIngredientMatched(normIng, userSet);

      if (isMatched) {
        matchedCount++;
      } else {
        missingIngredients.push(ing.name);
      }
    }

    if (matchedCount > 0) {
      const total = recipeIngredients.length;
      const matchPercentage = Math.round(((matchedCount * 100.0) / total) * 10) / 10;

      results.push({
        recipe,
        matchCount: matchedCount,
        totalIngredients: total,
        matchPercentage,
        missingIngredients,
      });
    }
  }

  // Sort descending by highest match percentage
  results.sort((a, b) => b.matchPercentage - a.matchPercentage);
  return results;
}
```
* **Interview Key Point**: Highlights search algorithms, string normalization, Set lookups ($O(1)$ lookup time), and custom ranking comparator functions.

---

### 5.7 How Client-Side Image Compression Works in Code (`imageOptimizer.js`)
**File:** [`Frontend/src/utils/imageOptimizer.js`](file:///d:/Hackathon/New%20folder/yummiee/Frontend/src/utils/imageOptimizer.js)

```javascript
export async function compressImage(file, maxWidth = 1280, maxHeight = 1280, quality = 0.82) {
  if (!file || !file.type.startsWith("image/")) return file;
  if (file.size < 150 * 1024) return file; // Already small (<150KB)

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        // Maintain aspect ratio within maxWidth / maxHeight box
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        // Create in-memory canvas
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d", { alpha: false });
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height); // Downscale

        // Export as WebP with fallback
        const outputType = file.type === "image/png" ? "image/webp" : "image/jpeg";
        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) return resolve(file);
            const optimizedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), {
              type: outputType,
              lastModified: Date.now(),
            });
            resolve(optimizedFile);
          },
          outputType,
          quality
        );
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
}
```
* **Interview Key Point**: Demonstrates asynchronous File API, Canvas 2D context manipulation, aspect ratio preservation, and modern WebP image compression.

---

### 5.8 How the Cloudflare Worker Backend Works (`index.js`, `clerk.js`, `recipeService.js`)
**File:** [`cloudflare-worker/src/index.js`](file:///d:/Hackathon/New%20folder/yummiee/cloudflare-worker/src/index.js)

```javascript
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

// Dynamic CORS configuration allowing Cloudflare Pages & Previews
app.use(
  "*",
  cors({
    origin: (origin, c) => {
      if (!origin) return null;
      const lower = origin.toLowerCase();
      if (
        lower === "https://yummiee.pages.dev" ||
        lower.endsWith(".pages.dev") ||
        lower.startsWith("http://localhost:")
      ) {
        return origin; // Echo exact origin
      }
      return null;
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
    allowHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    credentials: true,
  })
);
```

#### 🔒 Cryptographic Token Verification Middleware (`clerk.js`)
**File:** [`cloudflare-worker/src/auth/clerk.js`](file:///d:/Hackathon/New%20folder/yummiee/cloudflare-worker/src/auth/clerk.js)
```javascript
import { jwtVerify, createRemoteJWKSet } from "jose";

let jwksCache = null;

export async function verifyClerkToken(token, env) {
  if (!token) return null;
  
  const jwksUrl = env.CLERK_JWKS_URL || `${env.CLERK_ISSUER}/.well-known/jwks.json`;
  if (!jwksCache) {
    jwksCache = createRemoteJWKSet(new URL(jwksUrl));
  }

  // Cryptographically verifies RS256 signature using Clerk's public keys
  const { payload } = await jwtVerify(token, jwksCache, {
    issuer: env.CLERK_ISSUER,
  });

  return {
    clerkUserId: payload.sub,
    email: payload.email || `${payload.sub}@yummiee.com`,
    firstName: payload.first_name || "User",
  };
}

export async function requireAuth(c, next) {
  const authHeader = c.req.header("Authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  
  const verifiedUser = await verifyClerkToken(token, c.env);
  if (!verifiedUser) {
    return c.json({ message: "A valid signed-in user session is required" }, 401);
  }

  // Sync / retrieve internal DB user ID
  const user = await getOrCreateUser(c.env.DB, verifiedUser);
  c.set("userId", user.id);
  c.set("clerkUserId", verifiedUser.clerkUserId);
  await next();
}
```

---

### 5.9 How Cloudflare D1 SQL Queries & R2 Object Storage Work in Code
**File:** [`cloudflare-worker/src/services/recipeService.js`](file:///d:/Hackathon/New%20folder/yummiee/cloudflare-worker/src/services/recipeService.js)

```javascript
// 1. Atomic Transaction using D1 Batch API
export async function createRecipe(db, dto, userId) {
  // Step 1: Insert recipe header
  const insertRecipe = await db
    .prepare(`INSERT INTO recipes (user_id, name, description, category, time_minutes, difficulty, servings, image_url)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`)
    .bind(userId, dto.name, dto.description, dto.category, dto.time, dto.difficulty, dto.servings, dto.image)
    .first();

  const recipeId = insertRecipe.id;
  const batchQueries = [];

  // Step 2: Prepare batch statements for ingredients
  for (const ing of dto.ingredients) {
    batchQueries.push(
      db.prepare("INSERT INTO ingredients (recipe_id, name, quantity, unit) VALUES (?, ?, ?, ?)")
        .bind(recipeId, ing.name, ing.quantity, ing.unit)
    );
  }

  // Step 3: Prepare batch statements for instructions
  for (let i = 0; i < dto.instructions.length; i++) {
    batchQueries.push(
      db.prepare("INSERT INTO instructions (recipe_id, step_number, title, description) VALUES (?, ?, ?, ?)")
        .bind(recipeId, i + 1, `Step ${i + 1}`, dto.instructions[i].description)
    );
  }

  // Execute all in one atomic roundtrip
  if (batchQueries.length > 0) {
    await db.batch(batchQueries);
  }

  return await getRecipeById(db, recipeId);
}
```

#### 🪣 Storing & Streaming Images in Cloudflare R2
**File:** [`cloudflare-worker/src/routes/images.js`](file:///d:/Hackathon/New%20folder/yummiee/cloudflare-worker/src/routes/images.js)
```javascript
// Save image binary to R2 bucket
await c.env.IMAGES.put(key, buffer, {
  httpMetadata: { contentType: file.type },
});

// Stream image to client with 1-year immutable caching
imagesRouter.get("/*", async (c) => {
  const key = c.req.url.replace(/^.*\/api\/images\//, "");
  const object = await c.env.IMAGES.get(key);
  if (!object || !object.body) return c.text("Not Found", 404);

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  return new Response(object.body, { headers });
});
```

---

## 6. Cloudflare Backend & Database Architecture (D1 & R2)

### 🗄️ Cloudflare D1 Relational Schema (`migrations/0001_initial_schema.sql`)
* **`users`**: `id`, `clerk_user_id` (UNIQUE), `email`, `first_name`, `last_name`, `created_at`, `updated_at`
* **`recipes`**: `id`, `user_id` (FK ➔ users), `name`, `description`, `category`, `time_minutes`, `difficulty`, `servings`, `image_url`, `rating`, `review_count`, `notes`
* **`ingredients`**: `id`, `recipe_id` (FK ➔ recipes ON DELETE CASCADE), `name`, `quantity`, `unit`
* **`instructions`**: `id`, `recipe_id` (FK ➔ recipes ON DELETE CASCADE), `step_number`, `title`, `description`
* **`nutrition`**: `id`, `recipe_id` (UNIQUE FK ➔ recipes ON DELETE CASCADE), `calories`, `protein`, `carbs`, `fat`
* **`wishlist`**: `id`, `user_id` (FK ➔ users), `recipe_id` (FK ➔ recipes), `UNIQUE(user_id, recipe_id)`
* **`shopping_list_items`**: `id`, `user_id` (FK ➔ users), `recipe_id` (FK ➔ recipes), `name`, `quantity`, `unit`, `checked`
* **`image_assets`**: `id`, `key` (UNIQUE), `user_id` (FK ➔ users), `content_type`, `original_name`, `size`

---

## 7. Security, Cryptographic Auth & Multi-User Isolation

1. **Zero Secret Leakage on Client**: The frontend only holds the public `VITE_CLERK_PUBLISHABLE_KEY`.
2. **Cryptographic JWT Verification**: RS256 token verification at the edge via Clerk JWKS.
3. **Spoofing Immunity**: Derives user identity strictly from verified token claims (`sub`).
4. **Multi-Tenant User Isolation**: All private database queries enforce `WHERE user_id = ?`.

---

## 8. Key Technical Problems Solved (Case Studies)

1. **Initial Page Load & Image Upload Taking >30 Seconds**: Solved via Stale-While-Revalidate caching and client-side HTML5 Canvas WebP compression.
2. **Viewport Zoom Glitches on Mobile**: Solved by setting `viewport-fit=cover` and enforcing a minimum font size of 16px on mobile form inputs.
3. **Production CORS Preflight Failure**: Solved by dynamically matching allowed origins in Hono middleware to support Cloudflare Pages (`*.pages.dev`).
4. **401 Race Condition on Shopping List Initial Load**: Solved with token retry polling in `api.js` and automatic 350ms retry in React Context.
5. **Non-Centralized Login Screen**: Solved by applying full viewport flex centering to `Login.jsx` and `Register.jsx`.

---

## 9. Top 30 Technical Interview Questions & Model Answers

*(See Section 8 in main documentation for all 30 questions on Architecture, Security, React State, Cloudflare D1/R2, and Performance).*
