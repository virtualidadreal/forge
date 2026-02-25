import * as fabric from 'fabric';

/**
 * Scale font size based on canvas width (base: 1080px)
 */
export function scaleFontSize(baseSizePx: number, canvasWidth: number): number {
  return Math.round(baseSizePx * (canvasWidth / 1080));
}

/**
 * Convert relative position (0-1) to absolute pixels
 */
export function relativeToAbsolute(
  relX: number,
  relY: number,
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } {
  return {
    x: Math.round(relX * canvasWidth),
    y: Math.round(relY * canvasHeight),
  };
}

/**
 * Check if position is in safe zone (Stories/TikTok)
 */
export function isInSafeZone(
  yPosition: number,
  canvasHeight: number,
  safeZone: { top: number; bottom: number }
): boolean {
  return yPosition < safeZone.top || yPosition > (canvasHeight - safeZone.bottom);
}

/**
 * Calculate smart crop for an image to fit a target aspect ratio
 */
export function calculateSmartCrop(
  imageWidth: number,
  imageHeight: number,
  targetWidth: number,
  targetHeight: number,
  subjectPosition?: { x: number; y: number }
): { x: number; y: number; width: number; height: number } {
  const imageAspect = imageWidth / imageHeight;
  const targetAspect = targetWidth / targetHeight;

  let cropWidth: number, cropHeight: number, cropX: number, cropY: number;

  if (imageAspect > targetAspect) {
    // Image is wider, crop sides
    cropHeight = imageHeight;
    cropWidth = imageHeight * targetAspect;
    cropY = 0;
    cropX = subjectPosition
      ? Math.max(0, Math.min(imageWidth - cropWidth, subjectPosition.x * imageWidth - cropWidth / 2))
      : (imageWidth - cropWidth) / 2;
  } else {
    // Image is taller, crop top/bottom
    cropWidth = imageWidth;
    cropHeight = imageWidth / targetAspect;
    cropX = 0;
    cropY = subjectPosition
      ? Math.max(0, Math.min(imageHeight - cropHeight, subjectPosition.y * imageHeight - cropHeight / 2))
      : (imageHeight - cropHeight) / 2;
  }

  return {
    x: cropX / imageWidth,
    y: cropY / imageHeight,
    width: cropWidth / imageWidth,
    height: cropHeight / imageHeight,
  };
}

/**
 * Load Google Font dynamically
 */
export function loadGoogleFont(fontFamily: string, weights: number[] = [400, 700]): Promise<void> {
  return new Promise((resolve) => {
    const id = `google-font-${fontFamily.replace(/\s/g, '-')}`;
    if (document.getElementById(id)) {
      resolve();
      return;
    }
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s/g, '+')}:wght@${weights.join(';')}&display=swap`;
    link.onload = () => resolve();
    document.head.appendChild(link);
  });
}

/**
 * Create a Fabric.js text object with proper configuration
 */
export function createTextObject(
  content: string,
  options: {
    left: number;
    top: number;
    fontSize: number;
    fontFamily: string;
    fontWeight: number;
    fill: string;
    textAlign?: string;
    fontStyle?: string;
    textTransform?: string;
    maxWidth?: number;
  }
): fabric.FabricText {
  const text = options.textTransform === 'uppercase' ? content.toUpperCase() : content;
  return new fabric.FabricText(text, {
    left: options.left,
    top: options.top,
    fontSize: options.fontSize,
    fontFamily: options.fontFamily,
    fontWeight: options.fontWeight as any,
    fill: options.fill,
    textAlign: options.textAlign || 'left',
    fontStyle: options.fontStyle || 'normal',
  });
}

/**
 * Generate a UUID
 */
export function generateId(): string {
  return crypto.randomUUID();
}
