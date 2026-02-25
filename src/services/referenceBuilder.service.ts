/**
 * referenceBuilder.service.ts
 * Builds the reference images array for Nano Banana Pro requests.
 * Compresses all images to reduce payload size.
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
 * Compress a raw base64 image (without data: prefix).
 */
function compressRawBase64(rawBase64: string, maxDim: number, quality: number): Promise<{ base64: string; mimeType: string }> {
  return compressImage(`data:image/jpeg;base64,${rawBase64}`, maxDim, quality);
}

/**
 * Build reference images array for Nano Banana Pro.
 * Order: user photo → brand style references → logo
 * All images compressed to keep payload under browser limits.
 */
export async function buildReferenceImages(params: {
  userPhotoBase64: string;
  brandStyleReferences: string[];  // data URLs from store
  logoDataUrl?: string;
  intention: string;
}): Promise<ReferenceImage[]> {
  const refs: ReferenceImage[] = [];

  // 1. User photo — compress to 1024px JPEG
  const userCompressed = await compressRawBase64(params.userPhotoBase64, 1024, 0.8);
  refs.push({
    data: userCompressed.base64,
    mimeType: userCompressed.mimeType,
    role: 'Image 1: Main subject photo. DO NOT modify this photo. Only add graphic elements on top.',
  });

  // 2. Brand style references — compress to 512px, max 3
  const styleRefs = params.brandStyleReferences.slice(0, 3);
  for (let i = 0; i < styleRefs.length; i++) {
    const compressed = await compressImage(styleRefs[i], 512, 0.7);
    refs.push({
      data: compressed.base64,
      mimeType: compressed.mimeType,
      role: `Image ${i + 2}: Brand style reference. Use for color palette and visual style only.`,
    });
  }

  // 3. Logo — compress to 256px
  if (params.logoDataUrl) {
    const logoCompressed = await compressImage(params.logoDataUrl, 256, 0.9);
    refs.push({
      data: logoCompressed.base64,
      mimeType: logoCompressed.mimeType,
      role: `Image ${refs.length + 1}: Brand logo. Place this logo in the composition.`,
    });
  }

  return refs;
}
