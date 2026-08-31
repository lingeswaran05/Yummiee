/**
 * Client-side image compression and resizing utility.
 * Shrinks 5-20MB smartphone photos down to ~100-200KB WebP/JPEG
 * before uploading to backend, speeding up recipe uploads by 95-98%.
 */

export async function compressImage(file, maxWidth = 1280, maxHeight = 1280, quality = 0.82) {
  if (!file || !file.type.startsWith("image/")) {
    return file;
  }

  // If file is already small (< 150KB), return as is
  if (file.size < 150 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;

        // Calculate aspect ratio preserving dimensions
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) {
          resolve(file);
          return;
        }

        // Draw and compress image
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Prefer image/webp if supported, fallback to image/jpeg
        const outputType = file.type === "image/png" ? "image/webp" : "image/jpeg";

        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              resolve(file);
              return;
            }

            const optimizedFile = new File([blob], file.name.replace(/\.[^/.]+$/, outputType === "image/webp" ? ".webp" : ".jpg"), {
              type: outputType,
              lastModified: Date.now(),
            });

            resolve(optimizedFile);
          },
          outputType,
          quality
        );
      };

      img.onerror = () => resolve(file);
      img.src = event.target.result;
    };

    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
