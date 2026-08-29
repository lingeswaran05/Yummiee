# Yummiee — Cloudflare Native Production Deployment Guide

> [!CAUTION]
> **CRITICAL SECURITY NOTICE — SECRET ROTATION REQUIRED**
> A previous commit in repository history contained a hardcoded Clerk Secret Key (`sk_test_6J2FUzslNxIsLKrgSJR5oE0VYP0AB5ulONkH0vF6jt`).
> This key must be treated as **COMPROMISED**.
> **Before deploying to production, you MUST log in to your Clerk Dashboard and REVOKE / ROTATE this secret key.**
> Never commit real secret keys to source control. Production secrets must be configured via Cloudflare Worker Secrets (`npx wrangler secret put CLERK_SECRET_KEY`).

---

## Architecture Overview

```
                         [ User Browser / Client ]
                                    │
            ┌───────────────────────┴───────────────────────┐
            ▼                                               ▼
┌─────────────────────────┐                     ┌────────────────────────┐
│    Cloudflare Pages     │                     │   Cloudflare Worker    │
│  React 19 + Vite (SPA)  │─── REST API Calls ──▶│   Hono REST API        │
│  (Client Side Routing)  │                     │  (Cryptographic Auth)  │
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

---

## 21-Step Production Deployment Guide

Follow these steps in the exact sequence to deploy Yummiee to Cloudflare:

### 1. Login to Cloudflare
Sign up or log in to your Cloudflare account at [https://dash.cloudflare.com](https://dash.cloudflare.com).

### 2. Install/login with Wrangler
Authenticate your terminal with Cloudflare:
```bash
npx wrangler login
```
Verify the authenticated account:
```bash
npx wrangler whoami
```

### 3. Create D1 database
Create the production serverless D1 database instance:
```bash
cd cloudflare-worker
npx wrangler d1 create yummiee-db
```

### 4. Configure D1 binding
From the output of step 3, copy your unique `database_id` UUID and paste it into `cloudflare-worker/wrangler.jsonc`:
```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "yummiee-db",
    "database_id": "YOUR_ACTUAL_D1_DATABASE_UUID",
    "migrations_dir": "migrations"
  }
]
```

### 5. Apply D1 migrations
Execute the initial database schema migration on your remote production D1 database:
```bash
npx wrangler d1 migrations apply yummiee-db --remote
```

### 6. Load seed data
Migration `0002_seed_recipes.sql` automatically populates the 8 default curated recipes (ingredients, instructions, and nutrition facts) using idempotent `INSERT OR IGNORE`. Verify the database tables:
```bash
npx wrangler d1 execute yummiee-db --remote --command="SELECT id, name, category FROM recipes;"
```

### 7. Create R2 bucket
Create the Cloudflare R2 object storage bucket for recipe and user images:
```bash
npx wrangler r2 bucket create yummiee-images
```

### 8. Configure R2 binding
Confirm the binding in `cloudflare-worker/wrangler.jsonc`:
```jsonc
"r2_buckets": [
  {
    "binding": "IMAGES",
    "bucket_name": "yummiee-images"
  }
]
```

### 9. Add Worker secrets
Inject your freshly rotated Clerk Secret Key directly into Cloudflare's encrypted secret store:
```bash
npx wrangler secret put CLERK_SECRET_KEY
```
When prompted, paste your active, rotated Clerk secret key (`sk_live_...` or `sk_test_...`).

### 10. Configure ALLOWED_ORIGIN
In `cloudflare-worker/wrangler.jsonc`, configure development variables:
```jsonc
"vars": {
  "ALLOWED_ORIGIN": "http://localhost:5173",
  "CLERK_PUBLISHABLE_KEY": "pk_test_bWVhc3VyZWQtaG9uZXliZWUtNzE1OS5jbGVyay5hY2NvdW50cy5kZXYk",
  "CLERK_ISSUER": "https://measured-honeybee-7159.clerk.accounts.dev",
  "CLERK_JWKS_URL": "https://measured-honeybee-7159.clerk.accounts.dev/.well-known/jwks.json"
}
```

### 11. Deploy Worker
Deploy the Hono API Worker to Cloudflare:
```bash
npm run deploy
```
*(Or: `npx wrangler deploy`)*

### 12. Get Worker URL
Note the deployed Worker URL from the deployment output:
```
https://yummiee-api.<your-account-subdomain>.workers.dev
```
Verify the health check endpoint:
```bash
curl https://yummiee-api.<your-account-subdomain>.workers.dev/api/health
```
Expected response: `{"status":"ok"}`.

### 13. Set VITE_API_URL
In `Frontend/.env.local` (and Cloudflare Pages build environment variables):
```env
VITE_API_URL=https://yummiee-api.<your-account-subdomain>.workers.dev
VITE_CLERK_PUBLISHABLE_KEY=pk_test_bWVhc3VyZWQtaG9uZXliZWUtNzE1OS5jbGVyay5hY2NvdW50cy5kZXYk
```

### 14. Deploy React frontend to Pages
#### Option A: Via Wrangler CLI
```bash
cd ../Frontend
npm install
npm run build
npx wrangler pages deploy dist --project-name=yummiee
```

#### Option B: Via Cloudflare Dashboard (GitHub Integration)
1. In Cloudflare Dashboard, go to **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
2. Select your repository and branch `Final-Integration-Cloudflare`.
3. Set build configuration:
   - **Framework preset**: `Vite`
   - **Root directory**: `Frontend`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Set Environment Variables:
   - `VITE_API_URL`: `https://yummiee-api.<your-account-subdomain>.workers.dev`
   - `VITE_CLERK_PUBLISHABLE_KEY`: `pk_test_...`
5. Click **Save and Deploy**.

### 15. Get Pages URL
Note your live frontend domain:
```
https://yummiee.pages.dev (or https://<project-hash>.pages.dev)
```

### 16. Update ALLOWED_ORIGIN
Update the Worker's allowed CORS origins to permit your production Pages frontend:
1. In `cloudflare-worker/wrangler.jsonc`, update `ALLOWED_ORIGIN`:
   ```jsonc
   "ALLOWED_ORIGIN": "https://yummiee.pages.dev,http://localhost:5173"
   ```
2. Redeploy the Worker:
   ```bash
   cd ../cloudflare-worker
   npm run deploy
   ```

### 17. Configure Clerk production URLs/domains
1. In the [Clerk Dashboard](https://dashboard.clerk.com):
   - Add your production frontend origin (`https://yummiee.pages.dev`) to **Allowed redirect URLs** and **Allowed origins**.
   - If using custom domains, configure DNS in Cloudflare.

### 18. Test login
1. Open `https://yummiee.pages.dev`.
2. Sign in with Clerk.
3. Verify that the session JWT is transmitted via `Authorization: Bearer <token>` and accepted by the Worker.

### 19. Test User A/User B isolation
Execute the definitive multi-user isolation check:
1. **User A Login**: Create "Recipe A", add Recipe 1 to Wishlist, add "Organic Honey" to Shopping List, check it, upload an image.
2. **User A Logout**: Sign out. Verify client cache is wiped.
3. **User B Login**: Verify Recipe A is NOT visible in "My Recipes", Wishlist is empty, Shopping List is empty.
4. **User B Actions**: Create "Recipe B", add Recipe 2 to Wishlist, add "Almond Milk" to Shopping List.
5. **User B Logout & User A Resumes**: Sign back in as User A. Verify Recipe A, Wishlist Recipe 1, and Shopping List "Organic Honey" (checked) are intact. Verify User B's Recipe B is NOT visible.

### 20. Test image upload
1. Log in to the application and create a recipe with an uploaded photo.
2. Verify image is stored in R2 and rendered correctly via `/api/images/*`.
3. Verify non-owners cannot delete or modify the uploaded asset.

### 21. Test redeployment persistence
1. Perform a Worker redeploy: `npx wrangler deploy`.
2. Refresh and re-open the application.
3. Verify all D1 data (users, recipes, wishlist, shopping items, checked status) and R2 images remain 100% intact and unaffected by redeployment.

---

## API Endpoints Inventory

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/health` | No | System health check (`{"status":"ok"}`) |
| `GET` | `/api/recipes` | No | Public recipe catalog with search, category, difficulty, sort |
| `GET` | `/api/recipes/my-recipes` | **Yes** | Returns only authenticated user's private recipes (`WHERE user_id = ?`) |
| `GET` | `/api/recipes/suggestion` | No | Meal-period suggestions (Breakfast, Lunch, Snacks, Dinner) |
| `POST` | `/api/recipes/match` | No | Smart ingredient matching algorithm with ranking |
| `GET` | `/api/recipes/:id` | No | Full recipe details (ingredients, instructions, nutrition) |
| `POST` | `/api/recipes` | **Yes** | Create recipe owned by authenticated user |
| `PUT` | `/api/recipes/:id` | **Yes** | Update recipe (verified creator ownership required) |
| `DELETE`| `/api/recipes/:id` | **Yes** | Delete recipe (verified creator ownership required) |
| `GET` | `/api/wishlist` | **Yes** | Returns only authenticated user's wishlist |
| `POST` | `/api/wishlist/:recipeId`| **Yes** | Add recipe to authenticated user's wishlist |
| `DELETE`| `/api/wishlist/:recipeId`| **Yes** | Remove recipe from authenticated user's wishlist |
| `GET` | `/api/shopping-list` | **Yes** | Returns only authenticated user's shopping list |
| `POST` | `/api/shopping-list` | **Yes** | Add shopping list item for authenticated user |
| `PUT` | `/api/shopping-list/:id` | **Yes** | Update shopping item name, quantity, checked status (owner only) |
| `DELETE`| `/api/shopping-list/:id` | **Yes** | Delete shopping item (owner only) |
| `DELETE`| `/api/shopping-list` | **Yes** | Clear all items from authenticated user's shopping list |
| `POST` | `/api/images/upload` | **Yes** | Upload JPEG/PNG/WEBP/GIF image (<= 10MB) to Cloudflare R2 |
| `GET` | `/api/images/*` | No | Stream public image asset directly from Cloudflare R2 |
| `DELETE`| `/api/images/*` | **Yes** | Delete image asset from R2 (creator only) |
