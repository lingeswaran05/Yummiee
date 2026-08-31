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
      if (!origin) return null;

      const configuredAllowed = c.env.ALLOWED_ORIGIN || "https://yummiee.pages.dev";
      if (configuredAllowed === "*") return origin;

      const allowedList = configuredAllowed
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      const lowerOrigin = origin.toLowerCase();

      // Check configured origins list
      if (allowedList.includes(lowerOrigin)) {
        return origin;
      }

      // Automatically allow production Cloudflare Pages domains & previews
      if (
        lowerOrigin === "https://yummiee.pages.dev" ||
        lowerOrigin.endsWith(".pages.dev") ||
        lowerOrigin === "https://yummiee.yummiee-api.workers.dev" ||
        lowerOrigin.startsWith("http://localhost:") ||
        lowerOrigin.startsWith("http://127.0.0.1:")
      ) {
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
