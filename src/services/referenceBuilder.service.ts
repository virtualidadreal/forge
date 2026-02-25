/**
 * referenceBuilder.service.ts
 * Builds the reference images array for image generation requests.
 * Aggressively compresses all images to keep payload small.
 */

export interface ReferenceImage {
  data: string;    // raw base64 (no prefix)
  mimeType: string;
  role: string;
}

/**
 * Compress a data URL image to JPEG at reduced size.
 * Returns raw base64 (no prefix).
 */
function compressImage(dataUrl: string, maxDim: number, quality: number): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const { width, height } = img;
      const ratio = Math.min(maxDim / width, maxDim / height, 1);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas context failed')); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const result = canvas.toDataURL('image/jpeg', quality);
      const base64 = result.split(',')[1];
      resolve({ base64, mimeType: 'image/jpeg' });
    };
    img.onerror = () => reject(new Error('Failed to load image for compression'));
    img.src = dataUrl;
  });
}

/**
 * Detect mime type from raw base64 by reading magic bytes.
 */
function detectMimeFromBase64(raw: string): string {
  if (raw.startsWith('/9j/')) return 'image/jpeg';
  if (raw.startsWith('iVBOR')) return 'image/png';
  if (raw.startsWith('R0lGO')) return 'image/gif';
  if (raw.startsWith('UklGR')) return 'image/webp';
  return 'image/jpeg'; // default
}

/**
 * Compress a raw base64 image (without data: prefix).
 */
function compressRawBase64(rawBase64: string, maxDim: number, quality: number): Promise<{ base64: string; mimeType: string }> {
  const mime = detectMimeFromBase64(rawBase64);
  return compressImage(`data:${mime};base64,${rawBase64}`, maxDim, quality);
}

/**
 * Build reference images array.
 * Only sends user photo + logo (skip style refs to reduce payload).
 * All images compressed aggressively.
 */
export async function buildReferenceImages(params: {
  userPhotoBase64: string;
  brandStyleReferences: string[];  // data URLs from store
  logoDataUrl?: string;
  intention: string;
}): Promise<ReferenceImage[]> {
  const refs: ReferenceImage[] = [];

  // 1. User photo — compress to 768px JPEG at 0.6 quality
  const userCompressed = await compressRawBase64(params.userPhotoBase64, 768, 0.6);
  refs.push({
    data: userCompressed.base64,
    mimeType: userCompressed.mimeType,
    role: 'Image 1: Main subject photo. DO NOT modify this photo. Only add graphic elements on top.',
  });

  // 2. Logo — compress to 200px (skip style refs to keep payload small)
  if (params.logoDataUrl) {
    const logoCompressed = await compressImage(params.logoDataUrl, 200, 0.7);
    refs.push({
      data: logoCompressed.base64,
      mimeType: logoCompressed.mimeType,
      role: 'Image 2: Brand logo. Place this logo in the composition.',
    });
  }

  return refs;
}
