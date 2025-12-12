/**
 * Client-side image compression utility
 * Reduces image file size before upload to improve performance and reduce storage costs
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxFileSizeMB?: number;
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxWidth: 1920,
  maxHeight: 1440,
  quality: 0.8,
  maxFileSizeMB: 1,
};

/**
 * Compresses an image file using canvas
 * @param file - The original image file
 * @param options - Compression options
 * @returns A compressed File object
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Skip compression for small files (under 500KB)
  if (file.size < 500 * 1024) {
    return file;
  }
  
  // Skip non-image files
  if (!file.type.startsWith("image/")) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    img.onload = () => {
      try {
        let { width, height } = img;

        // Calculate new dimensions maintaining aspect ratio
        if (width > opts.maxWidth) {
          height = (height * opts.maxWidth) / width;
          width = opts.maxWidth;
        }
        if (height > opts.maxHeight) {
          width = (width * opts.maxHeight) / height;
          height = opts.maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        if (!ctx) {
          resolve(file);
          return;
        }

        // Draw image to canvas with smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            // If compressed file is still too large, try again with lower quality
            const maxSizeBytes = opts.maxFileSizeMB * 1024 * 1024;
            if (blob.size > maxSizeBytes && opts.quality > 0.3) {
              // Create a new file from the already-reduced blob for next iteration
              const reducedFile = new File([blob], file.name, { type: "image/jpeg" });
              compressImage(reducedFile, {
                ...opts,
                quality: opts.quality - 0.1,
              }).then(resolve).catch(() => resolve(reducedFile));
              return;
            }

            // Create new file with compressed data
            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^.]+$/, ".jpg"),
              { type: "image/jpeg" }
            );

            // Only use compressed version if it's actually smaller
            if (compressedFile.size < file.size) {
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          opts.quality
        );
      } catch (error) {
        resolve(file);
      }
    };

    img.onerror = () => {
      resolve(file);
    };

    // Load image from file
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      resolve(file);
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Compresses a blob (e.g., from canvas capture) with specified options
 * @param blob - The original blob
 * @param fileName - Name for the output file
 * @param options - Compression options
 * @returns A compressed File object
 */
export async function compressBlob(
  blob: Blob,
  fileName: string,
  options: CompressionOptions = {}
): Promise<File> {
  const file = new File([blob], fileName, { type: blob.type || "image/jpeg" });
  return compressImage(file, options);
}

/**
 * Formats file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
