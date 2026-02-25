/**
 * Convert a File to base64 data URL
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Extract raw base64 string from data URL (removes prefix)
 */
export function dataUrlToBase64(dataUrl: string): string {
  return dataUrl.split(',')[1] || dataUrl;
}

/**
 * Get MIME type from data URL
 */
export function getDataUrlMimeType(dataUrl: string): string {
  const match = dataUrl.match(/data:([^;]+);/);
  return match ? match[1] : 'image/jpeg';
}

/**
 * Resize image to max dimension while maintaining aspect ratio
 */
export function resizeImage(dataUrl: string, maxDimension: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const { width, height } = img;
      if (width <= maxDimension && height <= maxDimension) {
        resolve(dataUrl);
        return;
      }
      const ratio = Math.min(maxDimension / width, maxDimension / height);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.src = dataUrl;
  });
}

/**
 * Get image dimensions from data URL
 */
export function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.src = dataUrl;
  });
}

/**
 * Create a thumbnail at specified size
 */
export function createThumbnail(dataUrl: string, size: number = 200): Promise<string> {
  return resizeImage(dataUrl, size);
}

/**
 * Convert data URL to Blob
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(parts[1]);
  const u8arr = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Validate image file type and size
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Formato no soportado. Usa JPG, PNG, WebP o HEIC.' };
  }
  const maxSize = 20 * 1024 * 1024; // 20MB
  if (file.size > maxSize) {
    return { valid: false, error: 'Imagen demasiado grande. Máximo 20MB.' };
  }
  return { valid: true };
}
