import { Context, Next } from "hono";
import { Env, Variables, UserRecord } from "../types";
import { jwtVerify, createRemoteJWKSet, createLocalJWKSet, JWTPayload } from "jose";

// In-memory cache for remote JWKS sets to avoid re-fetching on every request
const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

export interface VerifiedClerkUser {
  clerkUserId: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Derives the Clerk JWKS URL from environment bindings.
 */
function getClerkJwksUrl(env: Env): string | null {
  if (env.CLERK_JWKS_URL) {
    return env.CLERK_JWKS_URL;
  }

  if (env.CLERK_ISSUER) {
    const cleanIssuer = env.CLERK_ISSUER.replace(/\/$/, "");
    return `${cleanIssuer}/.well-known/jwks.json`;
  }

  if (env.CLERK_PUBLISHABLE_KEY) {
    // Clerk publishable keys format: pk_test_<base64_domain>$ or pk_live_<base64_domain>$
    try {
      const parts = env.CLERK_PUBLISHABLE_KEY.split("_");
      if (parts.length >= 3) {
        const rawDomain = parts.slice(2).join("_").replace(/\$$/, "");
        const decodedDomain = atob(rawDomain);
        if (decodedDomain && decodedDomain.includes(".")) {
          return `https://${decodedDomain}/.well-known/jwks.json`;
        }
      }
    } catch {
      // ignore base64 decode errors
    }
  }

  return null;
}

/**
 * Cryptographically verifies a Clerk session JWT.
 */
export async function verifyClerkToken(
  token: string,
  env: Env
): Promise<VerifiedClerkUser | null> {
  if (!token || typeof token !== "string") return null;

  try {
    let payload: JWTPayload;

    // 1. If explicit JWT public key / secret key is provided
    if (env.CLERK_JWT_KEY) {
      const keyBuffer = new TextEncoder().encode(env.CLERK_JWT_KEY);
      const res = await jwtVerify(token, keyBuffer);
      payload = res.payload;
    } else if (env.CLERK_SECRET_KEY && env.CLERK_SECRET_KEY.startsWith("test_secret_")) {
      // Local / test suite cryptographic HMAC verification
      const keyBuffer = new TextEncoder().encode(env.CLERK_SECRET_KEY);
      const res = await jwtVerify(token, keyBuffer);
      payload = res.payload;
    } else {
      // 2. Standard Clerk JWKS verification
      const jwksUrl = getClerkJwksUrl(env);
      if (!jwksUrl) {
        // In local development if no Clerk keys are configured, attempt secret verification
        if (env.CLERK_SECRET_KEY) {
          const keyBuffer = new TextEncoder().encode(env.CLERK_SECRET_KEY);
          const res = await jwtVerify(token, keyBuffer);
          payload = res.payload;
        } else {
          console.error("Clerk configuration error: No CLERK_ISSUER, CLERK_PUBLISHABLE_KEY, or CLERK_SECRET_KEY provided.");
          return null;
        }
      } else {
        let jwks = jwksCache.get(jwksUrl);
        if (!jwks) {
          jwks = createRemoteJWKSet(new URL(jwksUrl));
          jwksCache.set(jwksUrl, jwks);
        }

        const verifyOptions: any = {};
        if (env.CLERK_ISSUER) {
          verifyOptions.issuer = env.CLERK_ISSUER;
        }

        const res = await jwtVerify(token, jwks, verifyOptions);
        payload = res.payload;
      }
    }

    if (!payload || !payload.sub) {
      return null;
    }

    const clerkUserId = payload.sub;
    const email =
      (payload.email as string) ||
      (payload.primary_email_address as string) ||
      `${clerkUserId}@yummiee.com`;

    const firstName = (payload.first_name as string) || (payload.given_name as string) || "User";
    const lastName = (payload.last_name as string) || (payload.family_name as string) || "";

    return {
      clerkUserId,
      email,
      firstName,
      lastName,
    };
  } catch (err: any) {
    // JWT verification failed (invalid signature, expired, malformed, etc.)
    return null;
  }
}

/**
 * Gets or creates the database user record for the given verified Clerk user.
 */
export async function getOrCreateUser(
  db: D1Database,
  verifiedUser: VerifiedClerkUser
): Promise<UserRecord> {
  const existing = await db
    .prepare("SELECT * FROM users WHERE clerk_user_id = ?")
    .bind(verifiedUser.clerkUserId)
    .first<UserRecord>();

  if (existing) {
    return existing;
  }

  const result = await db
    .prepare(
      `INSERT INTO users (clerk_user_id, email, first_name, last_name, created_at, updated_at)
       VALUES (?, ?, ?, ?, datetime('now'), datetime('now')) RETURNING *`
    )
    .bind(
      verifiedUser.clerkUserId,
      verifiedUser.email,
      verifiedUser.firstName || "User",
      verifiedUser.lastName || ""
    )
    .first<UserRecord>();

  if (result) {
    return result;
  }

  const inserted = await db
    .prepare("SELECT * FROM users WHERE clerk_user_id = ?")
    .bind(verifiedUser.clerkUserId)
    .first<UserRecord>();

  if (!inserted) {
    throw new Error("Failed to create application user record");
  }

  return inserted;
}

/**
 * Extracts and verifies token from the request.
 */
async function authenticateRequest(
  c: Context<{ Bindings: Env; Variables: Variables }>
): Promise<VerifiedClerkUser | null> {
  const authHeader = c.req.header("Authorization") || c.req.header("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    return await verifyClerkToken(token, c.env);
  }

  return null;
}

/**
 * Hono middleware requiring cryptographic authentication.
 */
export async function requireAuth(
  c: Context<{ Bindings: Env; Variables: Variables }>,
  next: Next
) {
  const verifiedUser = await authenticateRequest(c);
  if (!verifiedUser) {
    return c.json({ message: "A valid signed-in user session is required" }, 401);
  }

  try {
    const user = await getOrCreateUser(c.env.DB, verifiedUser);
    c.set("userId", user.id);
    c.set("clerkUserId", verifiedUser.clerkUserId);
    await next();
  } catch (err: any) {
    console.error("Auth DB synchronization error:", err);
    return c.json({ message: "Authentication database error" }, 500);
  }
}

/**
 * Hono middleware for optional authentication.
 */
export async function optionalAuth(
  c: Context<{ Bindings: Env; Variables: Variables }>,
  next: Next
) {
  const verifiedUser = await authenticateRequest(c);
  if (verifiedUser) {
    try {
      const user = await getOrCreateUser(c.env.DB, verifiedUser);
      c.set("userId", user.id);
      c.set("clerkUserId", verifiedUser.clerkUserId);
    } catch {
      // ignore optional auth errors
    }
  }
  await next();
}
