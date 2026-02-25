/**
 * referenceBuilder.service.ts
 * Builds the reference images array for Nano Banana Pro requests.
 */

export interface ReferenceImage {
  data: string;    // raw base64 (no prefix)
  mimeType: string;
  role: string;
}

/**
 * Build reference images array for Nano Banana Pro.
 * Order: user photo → brand style references → logo
 */
export function buildReferenceImages(params: {
  userPhotoBase64: string;
  brandStyleReferences: string[];  // data URLs from store
  logoDataUrl?: string;
  intention: string;
}): ReferenceImage[] {
  const refs: ReferenceImage[] = [];

  // 1. User photo — always first
  refs.push({
    data: params.userPhotoBase64,
    mimeType: 'image/jpeg',
    role: 'Image 1: Main subject photo. Preserve the person and their clothing exactly.',
  });

  // 2. Brand style references — up to 5
  const styleRefs = params.brandStyleReferences.slice(0, 5);
  styleRefs.forEach((dataUrl, i) => {
    const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
    const mime = dataUrl.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
    refs.push({
      data: base64,
      mimeType: mime,
      role: `Image ${i + 2}: Brand style reference ${i + 1}. Use for aesthetic, lighting, mood, and color palette.`,
    });
  });

  // 3. Logo — always last if exists
  if (params.logoDataUrl) {
    const logoBase64 = params.logoDataUrl.includes(',')
      ? params.logoDataUrl.split(',')[1]
      : params.logoDataUrl;
    const logoMime = params.logoDataUrl.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
    refs.push({
      data: logoBase64,
      mimeType: logoMime,
      role: `Image ${refs.length + 1}: Brand logo. Place according to intention rules.`,
    });
  }

  return refs;
}
