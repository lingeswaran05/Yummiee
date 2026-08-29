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

### Step 1: Cloudflare Login
Sign up or log in to your Cloudflare account at [https://dash.cloudflare.com](https://dash.cloudflare.com).

### Step 2: Wrangler Authentication
Authenticate your local development terminal with Cloudflare:
```bash
npx wrangler login
```
Verify the active account with `npx wrangler whoami`.

### Step 3: Create D1 Database
Create the production serverless D1 database instance:
```bash
cd cloudflare-worker
npx wrangler d1 create yummiee-db
```

### Step 4: Obtain D1 Database ID
From the output of Step 3, locate the `database_id`. Example output:
```toml
[[d1_databases]]
binding = "DB"
database_name = "yummiee-db"
database_id = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```
Copy this unique UUID.

### Step 5: Configure D1 Binding
Open `cloudflare-worker/wrangler.jsonc` and replace the placeholder with your actual `database_id`:
```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "yummiee-db",
    "database_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "migrations_dir": "migrations"
  }
]
```

### Step 6: Create R2 Bucket
Create the Cloudflare R2 object storage bucket for user and recipe image uploads:
```bash
npx wrangler r2 bucket create yummiee-images
```

### Step 7: Configure R2 Binding
Confirm the binding in `cloudflare-worker/wrangler.jsonc`:
```jsonc
"r2_buckets": [
  {
    "binding": "IMAGES",
    "bucket_name": "yummiee-images"
  }
]
```

### Step 8: Configure Worker Variables
In `cloudflare-worker/wrangler.jsonc`, configure public environment variables:
```jsonc
"vars": {
  "ALLOWED_ORIGIN": "http://localhost:5173",
  "CLERK_PUBLISHABLE_KEY": "pk_test_bWVhc3VyZWQtaG9uZXliZWUtNzE1OS5jbGVyay5hY2NvdW50cy5kZXYk",
  "CLERK_ISSUER": "https://measured-honeybee-7159.clerk.accounts.dev",
  "CLERK_JWKS_URL": "https://measured-honeybee-7159.clerk.accounts.dev/.well-known/jwks.json"
}
```
*(Note: `ALLOWED_ORIGIN` will be updated to the production Pages domain in Step 17).*

### Step 9: Add Worker Secrets
Inject private, sensitive credentials directly into Cloudflare's encrypted secret store:
```bash
# Add your freshly rotated Clerk Secret Key
npx wrangler secret put CLERK_SECRET_KEY
```
When prompted, paste your active, rotated Clerk secret key (`sk_live_...` or `sk_test_...`).

### Step 10: Apply D1 Migrations
Execute the initial schema migration on the remote production D1 database:
```bash
npx wrangler d1 migrations apply yummiee-db --remote
```

### Step 11: Seed Database
The migration `0002_seed_recipes.sql` automatically populates the 8 default curated recipes (ingredients, instructions, nutrition facts) using idempotent `INSERT OR IGNORE` statements. Verify the database tables:
```bash
npx wrangler d1 execute yummiee-db --remote --command="SELECT id, name, category FROM recipes;"
```

### Step 12: Deploy Worker
Deploy the Hono API Worker to Cloudflare:
```bash
npm run deploy
```
*(Or: `npx wrangler deploy`)*

### Step 13: Obtain Worker URL
Note the deployed Worker URL from the terminal output:
```
https://yummiee-api.<your-account-subdomain>.workers.dev
```
Verify the health check endpoint:
```bash
curl https://yummiee-api.<your-account-subdomain>.workers.dev/api/health
```
Expected response: `{"status":"ok"}`.

### Step 14: Configure Frontend VITE_API_URL
In `Frontend/.env.local` (or Cloudflare Pages build environment variables):
```env
VITE_API_URL=https://yummiee-api.<your-account-subdomain>.workers.dev
VITE_CLERK_PUBLISHABLE_KEY=pk_test_bWVhc3VyZWQtaG9uZXliZWUtNzE1OS5jbGVyay5hY2NvdW50cy5kZXYk
```

### Step 15: Deploy React Frontend to Cloudflare Pages
#### Option A: Via Wrangler CLI
```bash
cd ../Frontend
npm install
npm run build
npx wrangler pages deploy dist --project-name=yummiee
```

#### Option B: Via Cloudflare Dashboard (GitHub CI/CD)
1. In Cloudflare Dashboard, go to **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
2. Select the repository and branch `Final-Integration-Cloudflare`.
3. Set build configuration:
   - **Framework preset**: `Vite`
   - **Root directory**: `Frontend`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Set Environment Variables:
   - `VITE_API_URL`: `https://yummiee-api.<your-account-subdomain>.workers.dev`
   - `VITE_CLERK_PUBLISHABLE_KEY`: `pk_test_...`
5. Click **Save and Deploy**.

### Step 16: Obtain Pages URL
Note your live frontend domain:
```
https://yummiee.pages.dev (or https://<project-hash>.pages.dev)
```

### Step 17: Configure ALLOWED_ORIGIN
Update the Worker's allowed CORS origins to allow only your production frontend:
1. In `cloudflare-worker/wrangler.jsonc`, update `ALLOWED_ORIGIN`:
   ```jsonc
   "ALLOWED_ORIGIN": "https://yummiee.pages.dev,http://localhost:5173"
   ```
2. Redeploy the Worker:
   ```bash
   cd cloudflare-worker
   npm run deploy
   ```

### Step 18: Configure Clerk Production Settings / Domain
1. In the [Clerk Dashboard](https://dashboard.clerk.com):
   - Add your production frontend origin (`https://yummiee.pages.dev`) to **Allowed redirect URLs** and **Allowed origins**.
   - If using custom domains, configure DNS in Cloudflare.

### Step 19: Test Authentication
1. Open `https://yummiee.pages.dev`.
2. Sign in with Clerk.
3. Verify that the session JWT is transmitted via `Authorization: Bearer <token>` and accepted by the Worker.

### Step 20: Test User A / User B Isolation
Execute the definitive multi-user isolation check:
1. **User A Login**: Create "Recipe A", add Recipe 1 to Wishlist, add "Organic Honey" to Shopping List, check it, upload an image.
2. **User A Logout**: Sign out. Verify client cache is wiped.
3. **User B Login**: Verify Recipe A is NOT visible in "My Recipes", Wishlist is empty, Shopping List is empty.
4. **User B Actions**: Create "Recipe B", add Recipe 2 to Wishlist, add "Almond Milk" to Shopping List.
5. **User B Logout & User A Resumes**: Sign back in as User A. Verify Recipe A, Wishlist Recipe 1, and Shopping List "Organic Honey" (checked) are intact. Verify User B's Recipe B is NOT visible.

### Step 21: Test Redeployment Persistence
1. Perform a Worker redeploy: `npx wrangler deploy`.
2. Re-open the application.
3. Verify all D1 data (users, recipes, wishlist, shopping items, checked status) and R2 image uploads remain 100% intact and unaffected by redeployment.

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
