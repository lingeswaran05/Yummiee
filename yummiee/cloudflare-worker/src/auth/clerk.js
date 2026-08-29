import { jwtVerify, createRemoteJWKSet } from "jose";

// In-memory cache for remote JWKS sets
const jwksCache = new Map();

/**
 * Derives the Clerk JWKS URL from environment bindings.
 */
function getClerkJwksUrl(env) {
  if (env.CLERK_JWKS_URL) {
    return env.CLERK_JWKS_URL;
  }

  if (env.CLERK_ISSUER) {
    const cleanIssuer = env.CLERK_ISSUER.replace(/\/$/, "");
    return `${cleanIssuer}/.well-known/jwks.json`;
  }

  if (env.CLERK_PUBLISHABLE_KEY) {
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
      // ignore decode error
    }
  }

  return "https://measured-honeybee-7159.clerk.accounts.dev/.well-known/jwks.json";
}

/**
 * Cryptographically verifies a Clerk session JWT.
 */
export async function verifyClerkToken(token, env) {
  if (!token || typeof token !== "string") return null;

  try {
    let payload;

    // 1. If explicit JWT secret/key is provided (for testing or symmetric key)
    if (env.CLERK_JWT_KEY) {
      const keyBuffer = new TextEncoder().encode(env.CLERK_JWT_KEY);
      try {
        const res = await jwtVerify(token, keyBuffer);
        payload = res.payload;
      } catch (jwtKeyErr) {
        // Fallback to JWKS if token was RS256 signed by Clerk
        const jwksUrl = getClerkJwksUrl(env);
        let jwks = jwksCache.get(jwksUrl);
        if (!jwks) {
          jwks = createRemoteJWKSet(new URL(jwksUrl));
          jwksCache.set(jwksUrl, jwks);
        }
        const verifyOptions = {};
        if (env.CLERK_ISSUER) verifyOptions.issuer = env.CLERK_ISSUER;
        const res = await jwtVerify(token, jwks, verifyOptions);
        payload = res.payload;
      }
    } else if (env.CLERK_SECRET_KEY) {
      // Cryptographic verification with Clerk Secret Key
      const keyBuffer = new TextEncoder().encode(env.CLERK_SECRET_KEY);
      try {
        const res = await jwtVerify(token, keyBuffer);
        payload = res.payload;
      } catch (secErr) {
        // Fallback to JWKS if token was RS256 signed by Clerk
        const jwksUrl = getClerkJwksUrl(env);
        let jwks = jwksCache.get(jwksUrl);
        if (!jwks) {
          jwks = createRemoteJWKSet(new URL(jwksUrl));
          jwksCache.set(jwksUrl, jwks);
        }
        const verifyOptions = {};
        if (env.CLERK_ISSUER) verifyOptions.issuer = env.CLERK_ISSUER;
        const res = await jwtVerify(token, jwks, verifyOptions);
        payload = res.payload;
      }
    } else {
      // 2. Standard Clerk JWKS verification
      const jwksUrl = getClerkJwksUrl(env);
      let jwks = jwksCache.get(jwksUrl);
      if (!jwks) {
        jwks = createRemoteJWKSet(new URL(jwksUrl));
        jwksCache.set(jwksUrl, jwks);
      }

      const verifyOptions = {};
      if (env.CLERK_ISSUER) {
        verifyOptions.issuer = env.CLERK_ISSUER;
      }

      const res = await jwtVerify(token, jwks, verifyOptions);
      payload = res.payload;
    }

    if (!payload || !payload.sub) {
      return null;
    }

    const clerkUserId = payload.sub;
    const email =
      payload.email ||
      payload.primary_email_address ||
      `${clerkUserId}@yummiee.com`;

    const firstName = payload.first_name || payload.given_name || "User";
    const lastName = payload.last_name || payload.family_name || "";

    return {
      clerkUserId,
      email,
      firstName,
      lastName,
    };
  } catch (err) {
    // JWT verification failed
    return null;
  }
}

/**
 * Gets or creates the database user record for the given verified Clerk user.
 */
export async function getOrCreateUser(db, verifiedUser) {
  const existing = await db
    .prepare("SELECT * FROM users WHERE clerk_user_id = ?")
    .bind(verifiedUser.clerkUserId)
    .first();

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
    .first();

  if (result) {
    return result;
  }

  const inserted = await db
    .prepare("SELECT * FROM users WHERE clerk_user_id = ?")
    .bind(verifiedUser.clerkUserId)
    .first();

  if (!inserted) {
    throw new Error("Failed to create application user record");
  }

  return inserted;
}

/**
 * Extracts and verifies token from the request.
 */
async function authenticateRequest(c) {
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
export async function requireAuth(c, next) {
  const verifiedUser = await authenticateRequest(c);
  if (!verifiedUser) {
    return c.json({ message: "A valid signed-in user session is required" }, 401);
  }

  try {
    const user = await getOrCreateUser(c.env.DB, verifiedUser);
    c.set("userId", user.id);
    c.set("clerkUserId", verifiedUser.clerkUserId);
    await next();
  } catch (err) {
    console.error("Auth DB synchronization error:", err);
    return c.json({ message: "Authentication database error" }, 500);
  }
}

/**
 * Hono middleware for optional authentication.
 */
export async function optionalAuth(c, next) {
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
