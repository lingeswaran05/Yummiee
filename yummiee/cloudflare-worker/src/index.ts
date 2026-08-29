import { Hono } from "hono";
import { cors } from "hono/cors";
import { Env, Variables } from "./types";
import { healthRouter } from "./routes/health";
import { recipesRouter } from "./routes/recipes";
import { wishlistRouter } from "./routes/wishlist";
import { shoppingListRouter } from "./routes/shoppingList";
import { imagesRouter } from "./routes/images";

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// Production-safe CORS configuration
app.use("*", async (c, next) => {
  const allowedOriginEnv = c.env.ALLOWED_ORIGIN || "*";
  const allowedList = allowedOriginEnv.split(",").map((o) => o.trim());

  const corsMiddleware = cors({
    origin: (origin) => {
      if (!origin) return "*";
      if (allowedOriginEnv === "*") return origin;
      if (allowedList.includes(origin) || allowedList.includes("*")) {
        return origin;
      }
      // Allow localhost and local IP ranges during development
      if (
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:") ||
        origin.endsWith(".pages.dev")
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
  });

  return corsMiddleware(c, next);
});

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
