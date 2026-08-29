import { Hono } from "hono";
import { cors } from "hono/cors";
import { Env, Variables } from "./types";
import { healthRouter } from "./routes/health";
import { recipesRouter } from "./routes/recipes";
import { wishlistRouter } from "./routes/wishlist";
import { shoppingListRouter } from "./routes/shoppingList";
import { imagesRouter } from "./routes/images";

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// CORS configuration
app.use(
  "*",
  cors({
    origin: (origin) => {
      // Allow any origin during development and hackathon deployments
      return origin || "*";
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "x-clerk-user-id",
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
      message: err.message || "An unexpected error occurred",
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
