import { Hono } from "hono";
import { cors } from "hono/cors";
import { healthRouter } from "./routes/health.js";
import { recipesRouter } from "./routes/recipes.js";
import { wishlistRouter } from "./routes/wishlist.js";
import { shoppingListRouter } from "./routes/shoppingList.js";
import { imagesRouter } from "./routes/images.js";

const app = new Hono();

// CORS configuration
app.use(
  "*",
  cors({
    origin: (origin, c) => {
      const allowed = c.env.ALLOWED_ORIGIN || "http://localhost:5173";
      if (!origin) return null;
      if (allowed === "*") return origin;
      const allowedList = allowed.split(",").map((s) => s.trim());
      if (allowedList.includes(origin)) {
        return origin;
      }
      return null;
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    exposeHeaders: ["Content-Length", "Content-Type", "ETag"],
    maxAge: 86400,
    credentials: true,
  })
);

// Global Error Handler
app.onError((err, c) => {
  console.error("Unhandled Worker Error:", err);
  return c.json(
    {
      error: "Internal Server Error",
      message: "An unexpected server error occurred",
    },
    500
  );
});

// Root / Info
app.get("/", (c) => {
  return c.json({
    name: "Yummiee Cloudflare API",
    status: "online",
    endpoints: [
      "/api/health",
      "/api/recipes",
      "/api/recipes/my-recipes",
      "/api/recipes/suggestion",
      "/api/recipes/match",
      "/api/wishlist",
      "/api/shopping-list",
      "/api/images",
    ],
  });
});

// Route Mounting
app.route("/api/health", healthRouter);
app.route("/api/recipes", recipesRouter);
app.route("/api/wishlist", wishlistRouter);
app.route("/api/shopping-list", shoppingListRouter);
app.route("/api/images", imagesRouter);

export default app;
