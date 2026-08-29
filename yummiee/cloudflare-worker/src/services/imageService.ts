export interface UploadResult {
  key: string;
  url: string;
  contentType: string;
  size: number;
}

export async function uploadImage(
  r2: R2Bucket,
  db: D1Database,
  data: ArrayBuffer | Uint8Array | ReadableStream,
  contentType: string,
  originalName: string,
  userId: number
): Promise<UploadResult> {
  const ext = originalName.includes(".") ? originalName.split(".").pop()?.toLowerCase() || "jpg" : "jpg";
  const safeName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const key = `recipes/${userId}/${safeName}`;

  let size = 0;
  if (data instanceof ArrayBuffer) {
    size = data.byteLength;
  } else if (data instanceof Uint8Array) {
    size = data.length;
  }

  await r2.put(key, data, {
    httpMetadata: {
      contentType: contentType || "image/jpeg",
    },
  });

  try {
    await db
      .prepare(
        "INSERT INTO image_assets (key, user_id, content_type, original_name, size, created_at) VALUES (?, ?, ?, ?, ?, datetime('now'))"
      )
      .bind(key, userId, contentType, originalName, size)
      .run();
  } catch (e) {
    console.warn("Could not insert image asset metadata:", e);
  }

  return {
    key,
    url: `/api/images/${key}`,
    contentType,
    size,
  };
}

export async function getImage(r2: R2Bucket, key: string): Promise<R2ObjectBody | null> {
  return await r2.get(key);
}

export async function deleteImage(
  r2: R2Bucket,
  db: D1Database,
  key: string,
  userId: number
): Promise<boolean> {
  const asset = await db
    .prepare("SELECT * FROM image_assets WHERE key = ? AND user_id = ?")
    .bind(key, userId)
    .first();

  if (!asset) {
    // User is not the owner or asset does not exist
    return false;
  }

  await r2.delete(key);
  await db.prepare("DELETE FROM image_assets WHERE key = ? AND user_id = ?").bind(key, userId).run();
  return true;
}
