"use client";

export interface CompressOptions {
  maxWidth?: number;
  quality?: number;
  maxBytes?: number;
  preserveAlpha?: boolean;
}

/**
 * Compresses/resizes an uploaded image file in the browser using an HTML5 Canvas.
 * Resizes so the longest edge is at most `maxWidth` pixels and re-encodes as
 * JPEG (or PNG when preserveAlpha is true and the source is a PNG) at the
 * given quality. Iteratively lowers quality (and, if needed, dimensions) until
 * the output is under `maxBytes`.
 */
export function compressImageFile(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const {
    maxWidth = 1600,
    quality = 0.92,
    maxBytes = 2 * 1024 * 1024,
    preserveAlpha = false,
  } = options;

  return new Promise((resolve) => {
    if (typeof window === "undefined" || !file.type.startsWith("image/")) {
      resolve(file);
      return;
    }

    const usePng = preserveAlpha && file.type === "image/png";
    const outputType = usePng ? "image/png" : "image/jpeg";
    const ext = usePng ? ".png" : ".jpg";

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
          // PNG ignores the quality argument; JPEG uses it.
          return new Promise((res) =>
            canvas.toBlob(res, outputType, usePng ? undefined : q)
          );
        };

        (async () => {
          let size = maxWidth;
          let q = quality;
          let blob = await drawAt(size, q);

          // Reduce quality first for JPEG, then dimensions, until under cap.
          let attempts = 0;
          while (blob && blob.size > maxBytes && attempts < 8) {
            if (!usePng && q > 0.45) {
              q -= 0.1;
            } else {
              size = Math.round(size * 0.8);
              if (size < 320) break;
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
            file.name.replace(/\.[^.]+$/, ext),
            { type: outputType }
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

/** Compresses an image file and returns a Base64 data URL. */
export function compressImageToDataUrl(
  file: File,
  options?: CompressOptions
): Promise<string> {
  return compressImageFile(file, options).then(
    (compressed) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(compressed);
      })
  );
}

/** Hero slideshow banners: HD crisp rendering for full-screen banners. */
export function compressHeroBanner(file: File): Promise<File> {
  return compressImageFile(file, {
    maxWidth: 1600,
    quality: 0.92,
    maxBytes: 2.5 * 1024 * 1024,
  });
}

/** Partner logos: razor-sharp donor logos with transparency preserved. */
export function compressPartnerLogo(file: File): Promise<File> {
  return compressImageFile(file, {
    maxWidth: 800,
    quality: 0.95,
    maxBytes: 1.5 * 1024 * 1024,
    preserveAlpha: true,
  });
}

/** Activity & field photos: vibrant, clear field photography. */
export function compressActivityPhoto(file: File): Promise<File> {
  return compressImageFile(file, {
    maxWidth: 1200,
    quality: 0.88,
    maxBytes: 2.5 * 1024 * 1024,
  });
}

/** Team profile photos: sharp, professional headshots. */
export function compressTeamPhoto(file: File): Promise<File> {
  return compressImageFile(file, {
    maxWidth: 600,
    quality: 0.9,
    maxBytes: 1 * 1024 * 1024,
  });
}
