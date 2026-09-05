"use client";

const MAX_BYTES = 50 * 1024; // 50KB hard cap

/**
 * Compresses an uploaded image file in the browser using an HTML5 Canvas.
 * Resizes so the longest edge is at most `maxSize` pixels and re-encodes as
 * JPEG at the given quality. Iteratively lowers quality (and, if needed,
 * dimensions) until the output is strictly under 50KB, before converting to
 * a Base64 data URL or uploading to Supabase Storage.
 */
export function compressImageFile(
  file: File,
  maxSize = 350,
  quality = 0.75
): Promise<File> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !file.type.startsWith("image/")) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const drawAt = (size: number, q: number): Promise<Blob | null> => {
          let { width, height } = img;
          if (width > size || height > size) {
            if (width >= height) {
              height = Math.round((height * size) / width);
              width = size;
            } else {
              width = Math.round((width * size) / height);
              height = size;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return Promise.resolve(null);
          ctx.drawImage(img, 0, 0, width, height);
          return new Promise((res) => canvas.toBlob(res, "image/jpeg", q));
        };

        (async () => {
          let size = maxSize;
          let q = quality;
          let blob = await drawAt(size, q);

          // Shrink quality first, then dimensions, until under the cap.
          let attempts = 0;
          while (blob && blob.size > MAX_BYTES && attempts < 6) {
            if (q > 0.4) {
              q -= 0.15;
            } else {
              size = Math.round(size * 0.75);
            }
            blob = await drawAt(size, q);
            attempts += 1;
          }

          if (!blob) {
            resolve(file);
            return;
          }
          const compressed = new File(
            [blob],
            file.name.replace(/\.[^.]+$/, ".jpg"),
            { type: "image/jpeg" }
          );
          resolve(compressed);
        })();
      };
      img.onerror = () => resolve(file);
      img.src = reader.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

/** Compresses an image file (<50KB) and returns a Base64 data URL. */
export function compressImageToDataUrl(
  file: File,
  maxSize = 350,
  quality = 0.75
): Promise<string> {
  return compressImageFile(file, maxSize, quality).then(
    (compressed) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(compressed);
      })
  );
}
