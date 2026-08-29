# Yummiee — Cloudflare Native Deployment Guide

This guide provides step-by-step instructions to configure, run locally, and deploy the Yummiee application to Cloudflare's serverless infrastructure: **Cloudflare Pages**, **Cloudflare Workers**, **Cloudflare D1**, and **Cloudflare R2**.

---

## 1. Target Architecture Overview

```
                         [ User Browser / Client ]
                                    │
            ┌───────────────────────┴───────────────────────┐
            ▼                                               ▼
┌─────────────────────────┐                     ┌────────────────────────┐
│    Cloudflare Pages     │                     │   Cloudflare Worker    │
│  React 19 + Vite (SPA)  │─── REST API Calls ──▶│   Hono REST API (TS)   │
│  (SPA Client Routing)   │                     │  (Clerk Auth Valid.)   │
└─────────────────────────┘                     └───────────┬────────────┘
                                                            │
                                            ┌───────────────┴───────────────┐
                                            ▼                               ▼
                                ┌──────────────────────┐        ┌───────────────────────┐
                                │    Cloudflare D1     │        │     Cloudflare R2     │
                                │ Serverless Relational│        │ Object Storage Bucket │
                                │   SQLite Database    │        │    (Recipe Images)    │
                                └──────────────────────┘        └───────────────────────┘
```

### Why This Architecture?
- **Zero Local Filesystem Persistence Issues**: Eliminates local SQLite (`yummiee.db`) files that reset on redeployments or container restarts.
- **Global Edge Performance**: Serverless execution close to users with sub-millisecond cold starts.
- **Cost Effective**: Suitable for hackathons and low-to-medium traffic applications with generous free tiers.

---

## 2. Cloudflare Services Summary

| Service | Component | Purpose |
| :--- | :--- | :--- |
| **Cloudflare Pages** | `Frontend/` | Hosts the compiled React 19 + Vite single page application with `_redirects` SPA support. |
| **Cloudflare Workers** | `cloudflare-worker/` | Executes the TypeScript Hono REST API layer, routing, and business logic. |
| **Cloudflare D1** | Database | Cloudflare-native relational SQL database storing users, recipes, ingredients, instructions, nutrition, wishlist, and shopping list data. |
| **Cloudflare R2** | Object Storage | S3-compatible blob storage for recipe images and uploaded media. |
| **Clerk Auth** | Authentication | User management and session authentication. |

---

## 3. Local Development Setup

### Prerequisites
- **Node.js**: v18.0.0 or later (v20+ recommended)
- **npm**: v9+
- **Wrangler CLI**: Included in `devDependencies` (run via `npx wrangler`)

### Clone and Branch
Make sure you are on the `Final-Integration-Cloudflare` branch:
```bash
git checkout Final-Integration-Cloudflare
```

---

### Setting Up the Backend Worker Locally

1. Navigate to `cloudflare-worker`:
   ```bash
   cd cloudflare-worker
   npm install
   ```

2. Apply D1 migrations to your local Miniflare database:
   ```bash
   npm run db:migrate:local
   ```
   *(Or: `npx wrangler d1 migrations apply yummiee-db --local`)*

3. Start the local Worker development server:
   ```bash
   npm run dev
   ```
   The API will start at `http://127.0.0.1:8787`.

4. Run the automated integration test suite:
   ```bash
   npm test
   ```

---

### Setting Up the Frontend Locally

1. Navigate to `Frontend`:
   ```bash
   cd ../Frontend
   npm install
   ```

2. Create `.env.local` based on `.env.example`:
   ```bash
   cp .env.example .env.local
   ```

3. Set your local environment variables in `Frontend/.env.local`:
   ```env
   VITE_API_URL=http://127.0.0.1:8787
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
   ```

4. Start the frontend dev server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 4. Cloudflare Production Deployment

### Step 1: Login to Cloudflare via Wrangler
```bash
npx wrangler login
```

---

### Step 2: Create Cloudflare D1 Database
1. Create the production D1 database:
   ```bash
   npx wrangler d1 create yummiee-db
   ```
2. Note the generated `database_id` from the terminal output, for example:
   ```
   database_name = "yummiee-db"
   database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
   ```
3. Update `cloudflare-worker/wrangler.jsonc` with your real `database_id`:
   ```jsonc
   "d1_databases": [
     {
       "binding": "DB",
       "database_name": "yummiee-db",
       "database_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
       "migrations_dir": "migrations"
     }
   ]
   ```

4. Apply migrations to the remote production D1 database:
   ```bash
   npm run db:migrate:remote
   ```
   *(Or: `npx wrangler d1 migrations apply yummiee-db --remote`)*

5. Verify remote database records:
   ```bash
   npx wrangler d1 execute yummiee-db --remote --command="SELECT id, name, category FROM recipes;"
   ```

---

### Step 3: Create Cloudflare R2 Bucket
1. Create the production R2 bucket for recipe images:
   ```bash
   npx wrangler r2 bucket create yummiee-images
   ```
2. Verify `cloudflare-worker/wrangler.jsonc` matches the bucket name:
   ```jsonc
   "r2_buckets": [
     {
       "binding": "IMAGES",
       "bucket_name": "yummiee-images"
     }
   ]
   ```

---

### Step 4: Configure Worker Secrets & Deploy Worker API
1. If configuring Clerk production signature verification, set secrets via Wrangler:
   ```bash
   npx wrangler secret put CLERK_SECRET_KEY
   npx wrangler secret put CLERK_PUBLISHABLE_KEY
   ```

2. Deploy the Worker:
   ```bash
   npm run deploy
   ```
3. Your Worker will be live at:
   `https://yummiee-api.<your-subdomain>.workers.dev`

4. Test health endpoint:
   `https://yummiee-api.<your-subdomain>.workers.dev/api/health`

---

### Step 5: Deploy Frontend to Cloudflare Pages

#### Option A: Direct Deployment via Wrangler CLI
1. Inside `Frontend/`, build the production bundle:
   ```bash
   npm run build
   ```
2. Deploy the `dist/` directory to Cloudflare Pages:
   ```bash
   npx wrangler pages deploy dist --project-name=yummiee
   ```

#### Option B: Continuous Deployment via Cloudflare Dashboard (GitHub Integration)
1. Go to **Cloudflare Dashboard** → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
2. Select your repository and choose branch: `Final-Integration-Cloudflare`.
3. Configure Build Settings:
   - **Framework preset**: `Vite`
   - **Root directory**: `Frontend`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Add Environment Variables in Cloudflare Pages Dashboard:
   - `VITE_API_URL`: `https://yummiee-api.<your-subdomain>.workers.dev`
   - `VITE_CLERK_PUBLISHABLE_KEY`: `pk_test_...`
5. Click **Save and Deploy**.

---

## 5. Single Page Application (SPA) Routing

Cloudflare Pages automatically reads the included `Frontend/public/_redirects` file:
```
/* /index.html 200
```
This ensures nested client-side URLs (e.g. `/recipes/1`, `/wishlist`, `/shopping-list`, `/my-recipes`, `/add-recipe`) resolve directly to `index.html` on browser refresh without returning 404 errors.

---

## 6. Environment Variables Reference

### Frontend Public Variables (`Frontend/.env.example`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL of the Cloudflare Worker API | `https://yummiee-api.your-account.workers.dev` |
| `VITE_CLERK_PUBLISHABLE_KEY` | Public Clerk publishable key | `pk_test_...` |

### Worker Backend Variables & Secrets (`cloudflare-worker/.env.example`)
| Variable / Secret | Type | Description |
| :--- | :--- | :--- |
| `DB` | D1 Binding | D1 database instance bound in `wrangler.jsonc` |
| `IMAGES` | R2 Binding | R2 bucket instance bound in `wrangler.jsonc` |
| `ALLOWED_ORIGIN` | Var | CORS allowed origins (default: `*`) |
| `CLERK_SECRET_KEY` | Secret | Clerk backend secret key |
| `CLERK_PUBLISHABLE_KEY` | Secret | Clerk publishable key |
| `CLERK_ISSUER` | Var / Secret | Optional Clerk JWT Issuer URL |

---

## 7. API Endpoints Inventory

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/health` | No | Health check (`{ "status": "ok" }`) |
| `GET` | `/api/recipes` | No | List recipes with search, category, difficulty, sort |
| `GET` | `/api/recipes/suggestion` | No | Meal-period recipe suggestions |
| `POST` | `/api/recipes/match` | No | Smart ingredient matching algorithm |
| `GET` | `/api/recipes/:id` | No | Full recipe details (ingredients, instructions, nutrition) |
| `GET` | `/api/recipes/my-recipes` | **Yes** | List user's created recipes |
| `POST` | `/api/recipes` | **Yes** | Create a new user recipe |
| `PUT` | `/api/recipes/:id` | **Yes** | Edit recipe (creator only) |
| `DELETE`| `/api/recipes/:id` | **Yes** | Delete recipe (creator only) |
| `GET` | `/api/wishlist` | **Yes** | List recipes in user's wishlist |
| `POST` | `/api/wishlist/:recipeId`| **Yes** | Add recipe to user's wishlist |
| `DELETE`| `/api/wishlist/:recipeId`| **Yes** | Remove recipe from user's wishlist |
| `GET` | `/api/shopping-list` | **Yes** | List user's shopping list items |
| `POST` | `/api/shopping-list` | **Yes** | Add item to shopping list |
| `PUT` | `/api/shopping-list/:id` | **Yes** | Update item (name, quantity, checked) |
| `DELETE`| `/api/shopping-list/:id` | **Yes** | Delete item from shopping list |
| `DELETE`| `/api/shopping-list` | **Yes** | Clear all items from user's shopping list |
| `POST` | `/api/images/upload` | **Yes** | Upload image to Cloudflare R2 |
| `GET` | `/api/images/*` | No | Stream public image from Cloudflare R2 |
| `DELETE`| `/api/images/*` | **Yes** | Delete image from Cloudflare R2 |

---

## 8. Verification & Acceptance Checklist

- [x] **D1 Database Persistence**: Database is serverless, resilient, and independent of container restarts.
- [x] **R2 Image Storage**: Images are uploaded and streamed from R2; no images stored in database binary columns or temporary worker filesystems.
- [x] **Clerk Auth & User Isolation**: Authenticated requests properly isolate User A and User B for wishlist, shopping list, and recipe management.
- [x] **SPA Routing**: Nested routes like `/wishlist` or `/recipes/1` reload without 404.
- [x] **Seed Catalog**: 8 default recipes populated with full ingredients, steps, and nutrition facts.
- [x] **Automated Tests**: Integration tests passing via `npm test` in `cloudflare-worker/`.

---

## 9. Troubleshooting

### Issue: `d1: database not found`
**Solution**: Verify `database_id` in `wrangler.jsonc` matches the ID output from `npx wrangler d1 create yummiee-db`.

### Issue: `401 Unauthorized` on Wishlist/Shopping List
**Solution**: Ensure the frontend has initialized Clerk and `setApiAuth` has set the active token/userId.

### Issue: CORS error during development
**Solution**: Verify `VITE_API_URL` points to `http://127.0.0.1:8787` (local) or your deployed worker URL. The worker CORS middleware allows `*` by default.
