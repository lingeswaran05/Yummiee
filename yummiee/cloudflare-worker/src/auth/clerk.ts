import { Context, Next } from "hono";
import { Env, Variables, UserRecord } from "../types";
import { decodeJwt } from "jose";

/**
 * Extracts clerkUserId from Authorization Bearer token or x-clerk-user-id header.
 */
export function extractClerkUserId(c: Context<{ Bindings: Env; Variables: Variables }>): string | null {
  const authHeader = c.req.header("Authorization") || c.req.header("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    try {
      const decoded = decodeJwt(token);
      if (decoded && decoded.sub) {
        return decoded.sub;
      }
    } catch {
      // If token decoding fails, fallback to header check
    }
  }

  const clerkHeader = c.req.header("x-clerk-user-id");
  if (clerkHeader && clerkHeader.trim().length > 0) {
    return clerkHeader.trim();
  }

  return null;
}

/**
 * Gets or creates the database user record for the given clerkUserId.
 */
export async function getOrCreateUser(db: D1Database, clerkUserId: string): Promise<UserRecord> {
  const existing = await db
    .prepare("SELECT * FROM users WHERE clerk_user_id = ?")
    .bind(clerkUserId)
    .first<UserRecord>();

  if (existing) {
    return existing;
  }

  const email = `${clerkUserId}@yummiee.com`;
  const result = await db
    .prepare(
      "INSERT INTO users (clerk_user_id, email, first_name, last_name, created_at, updated_at) VALUES (?, ?, 'User', '', datetime('now'), datetime('now')) RETURNING *"
    )
    .bind(clerkUserId, email)
    .first<UserRecord>();

  if (result) {
    return result;
  }

  // Fallback if RETURNING is not supported in some local drivers
  const inserted = await db
    .prepare("SELECT * FROM users WHERE clerk_user_id = ?")
    .bind(clerkUserId)
    .first<UserRecord>();

  if (!inserted) {
    throw new Error("Failed to create user record");
  }

  return inserted;
}

/**
 * Hono middleware requiring authentication.
 */
export async function requireAuth(
  c: Context<{ Bindings: Env; Variables: Variables }>,
  next: Next
) {
  const clerkUserId = extractClerkUserId(c);
  if (!clerkUserId) {
    return c.json({ message: "A signed-in user is required" }, 401);
  }

  try {
    const user = await getOrCreateUser(c.env.DB, clerkUserId);
    c.set("userId", user.id);
    c.set("clerkUserId", clerkUserId);
    await next();
  } catch (err: any) {
    console.error("Auth error:", err);
    return c.json({ message: "Authentication failed: " + (err.message || "Unknown error") }, 500);
  }
}

/**
 * Hono middleware for optional authentication.
 */
export async function optionalAuth(
  c: Context<{ Bindings: Env; Variables: Variables }>,
  next: Next
) {
  const clerkUserId = extractClerkUserId(c);
  if (clerkUserId) {
    try {
      const user = await getOrCreateUser(c.env.DB, clerkUserId);
      c.set("userId", user.id);
      c.set("clerkUserId", clerkUserId);
    } catch {
      // ignore optional auth errors
    }
  }
  await next();
}
