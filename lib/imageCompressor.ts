"use client";

/**
 * Compresses an uploaded image file in the browser using an HTML5 Canvas.
 * Resizes so the longest edge is at most `maxSize` pixels and re-encodes as
 * JPEG at the given quality, keeping payloads small (~<80KB for most photos)
 * before converting to a Base64 data URL or uploading to Supabase Storage.
 */
export function compressImageFile(
  file: File,
  maxSize = 400,
  quality = 0.8
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
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          if (width >= height) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
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
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = reader.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

/** Compresses an image file and returns a Base64 data URL. */
export function compressImageToDataUrl(
  file: File,
  maxSize = 400,
  quality = 0.8
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
