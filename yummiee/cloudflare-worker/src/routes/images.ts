import { Hono } from "hono";
import { Env, Variables } from "../types";
import { optionalAuth, requireAuth } from "../auth/clerk";
import * as imageService from "../services/imageService";

export const imagesRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

// POST /api/images/upload (Supports multipart form or base64 JSON)
imagesRouter.post("/upload", optionalAuth, async (c) => {
  const userId = c.get("userId") || null;
  const contentTypeHeader = c.req.header("Content-Type") || "";

  try {
    if (contentTypeHeader.includes("multipart/form-data")) {
      const formData = await c.req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return c.json({ message: "No file uploaded" }, 400);
      }

      if (!ALLOWED_MIME_TYPES.has(file.type)) {
        return c.json({ message: "Invalid image type. Supported: JPG, PNG, WEBP, GIF, SVG" }, 400);
      }

      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        return c.json({ message: "Image exceeds 10MB maximum limit" }, 400);
      }

      const buffer = await file.arrayBuffer();
      const result = await imageService.uploadImage(
        c.env.IMAGES,
        c.env.DB,
        buffer,
        file.type,
        file.name || "recipe-image.jpg",
        userId
      );

      return c.json(result, 201);
    }

    // JSON base64 upload
    const body = await c.req.json<{ image?: string; filename?: string; contentType?: string }>().catch(() => null);
    if (!body || !body.image) {
      return c.json({ message: "Invalid payload. Provide multipart form or { image: base64 }" }, 400);
    }

    let mimeType = body.contentType || "image/jpeg";
    let base64Data = body.image;

    if (body.image.startsWith("data:")) {
      const match = body.image.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        base64Data = match[2];
      }
    }

    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return c.json({ message: "Invalid image type: " + mimeType }, 400);
    }

    // Convert base64 to Uint8Array
    const binaryStr = atob(base64Data);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    if (bytes.length > MAX_IMAGE_SIZE_BYTES) {
      return c.json({ message: "Image exceeds 10MB limit" }, 400);
    }

    const filename = body.filename || "recipe-image.jpg";
    const result = await imageService.uploadImage(
      c.env.IMAGES,
      c.env.DB,
      bytes,
      mimeType,
      filename,
      userId
    );

    return c.json(result, 201);
  } catch (err: any) {
    console.error("Upload error:", err);
    return c.json({ message: "Failed to upload image: " + (err.message || "Unknown error") }, 500);
  }
});

// GET /api/images/* (Stream image from R2 bucket)
imagesRouter.get("/*", async (c) => {
  const url = new URL(c.req.url);
  // Extract key after /api/images/
  let key = url.pathname.replace(/^\/api\/images\//, "");
  if (!key) {
    return c.text("Image key required", 400);
  }

  try {
    const object = await imageService.getImage(c.env.IMAGES, key);
    if (!object || !object.body) {
      return c.text("Image not found", 404);
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new Response(object.body, {
      headers,
      status: 200,
    });
  } catch (err: any) {
    console.error("Image retrieval error:", err);
    return c.text("Error retrieving image", 500);
  }
});

// DELETE /api/images/* (Protected)
imagesRouter.delete("/*", requireAuth, async (c) => {
  const userId = c.get("userId");
  const url = new URL(c.req.url);
  const key = url.pathname.replace(/^\/api\/images\//, "");

  if (!key) {
    return c.text("Image key required", 400);
  }

  const deleted = await imageService.deleteImage(c.env.IMAGES, c.env.DB, key, userId);
  if (!deleted) {
    return c.body(null, 404);
  }

  return c.body(null, 204);
});
