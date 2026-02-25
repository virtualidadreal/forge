/**
 * renderer.service.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Fabric.js rendering engine. Takes CompositionInstructions and produces
 * rendered canvases ready for preview and export.
 */

import * as fabric from 'fabric';
import type { CompositionInstruction, CompositionElement } from '../types/composition.types';

// ---------------------------------------------------------------------------
// Font loading
// ---------------------------------------------------------------------------

const loadedFonts = new Set<string>();

/**
 * Dynamically load a Google Font by injecting a <link> element.
 * Caches already-loaded fonts to avoid duplicate requests.
 */
async function loadFont(fontFamily: string): Promise<void> {
  if (loadedFonts.has(fontFamily)) return;

  const encoded = fontFamily.replace(/\s+/g, '+');
  const linkId = `forge-font-${encoded}`;

  // Check if link already exists
  if (document.getElementById(linkId)) {
    loadedFonts.add(fontFamily);
    return;
  }

  const link = document.createElement('link');
  link.id = linkId;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encoded}:ital,wght@0,300;0,400;0,500;0,700;0,900;1,300;1,400;1,500;1,700;1,900&display=swap`;
  document.head.appendChild(link);

  // Wait for font to be available
  try {
    await document.fonts.load(`400 16px "${fontFamily}"`);
    loadedFonts.add(fontFamily);
  } catch {
    // Font may still load; mark as loaded to avoid re-attempts
    loadedFonts.add(fontFamily);
  }
}

/**
 * Collect all unique font families from instruction elements and load them.
 */
async function loadAllFonts(instruction: CompositionInstruction): Promise<void> {
  const families = new Set<string>();
  for (const el of instruction.elements) {
    if (el.font_family) {
      families.add(el.font_family);
    }
  }
  await Promise.all(Array.from(families).map(loadFont));
}

// ---------------------------------------------------------------------------
// Image loading helpers
// ---------------------------------------------------------------------------

/**
 * Load an image from a data URL into a fabric.Image.
 */
function loadFabricImage(dataUrl: string): Promise<fabric.Image> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const fabricImg = new fabric.Image(img);
      resolve(fabricImg);
    };
    img.onerror = (err) => reject(err);
    img.src = dataUrl;
  });
}

// ---------------------------------------------------------------------------
// Element renderers
// ---------------------------------------------------------------------------

function renderTextElement(
  el: CompositionElement,
  canvasWidth: number,
  canvasHeight: number,
): fabric.Object {
  const left = el.position.x * canvasWidth;
  const top = el.position.y * canvasHeight;
  const maxWidth = el.max_width_ratio ? el.max_width_ratio * canvasWidth : canvasWidth * 0.8;

  const textContent = el.text_transform === 'uppercase' && el.content
    ? el.content.toUpperCase()
    : el.text_transform === 'lowercase' && el.content
      ? el.content.toLowerCase()
      : el.content || '';

  const textObj = new fabric.IText(textContent, {
    left,
    top,
    fontFamily: el.font_family || 'Inter',
    fontWeight: el.font_weight || 400,
    fontSize: el.font_size_px || 32,
    fontStyle: el.font_style || 'normal',
    fill: el.color || '#FFFFFF',
    textAlign: el.alignment || 'left',
    width: maxWidth,
    splitByGrapheme: false,
    selectable: true,
    editable: true,
  });

  return textObj;
}

function renderPillElement(
  el: CompositionElement,
  canvasWidth: number,
  canvasHeight: number,
): fabric.Object {
  const left = el.position.x * canvasWidth;
  const top = el.position.y * canvasHeight;
  const padding = el.padding || 12;
  const borderRadius = el.border_radius || 16;

  // Create text first to measure
  const textContent = el.content || '';
  const text = new fabric.Text(textContent, {
    fontFamily: el.font_family || 'Inter',
    fontWeight: el.font_weight || 400,
    fontSize: el.font_size_px || 14,
    fill: el.color || '#FFFFFF',
    originX: 'center',
    originY: 'center',
  });

  const pillWidth = (text.width || 100) + padding * 2;
  const pillHeight = (text.height || 20) + padding * 2;

  // Background rect
  const bg = new fabric.Rect({
    width: pillWidth,
    height: pillHeight,
    rx: borderRadius,
    ry: borderRadius,
    fill: el.background_color || 'rgba(255,255,255,0.18)',
    opacity: el.background_opacity ?? 0.85,
    originX: 'center',
    originY: 'center',
  });

  const group = new fabric.Group([bg, text], {
    left,
    top,
    selectable: true,
  });

  return group;
}

function renderRatingBadge(
  el: CompositionElement,
  canvasWidth: number,
  canvasHeight: number,
): fabric.Object {
  const left = el.position.x * canvasWidth;
  const top = el.position.y * canvasHeight;
  const padding = el.padding || 16;
  const borderRadius = el.border_radius || 12;

  // Star character + rating number
  const ratingText = `\u2605 ${el.content || '4.9'}`;

  const text = new fabric.Text(ratingText, {
    fontFamily: el.font_family || 'Inter',
    fontWeight: el.font_weight || 700,
    fontSize: el.font_size_px || 28,
    fill: el.color || '#FFFFFF',
    originX: 'center',
    originY: 'center',
  });

  const badgeWidth = (text.width || 80) + padding * 2;
  const badgeHeight = (text.height || 32) + padding * 2;

  const bg = new fabric.Rect({
    width: badgeWidth,
    height: badgeHeight,
    rx: borderRadius,
    ry: borderRadius,
    fill: el.background_color || 'rgba(0,0,0,0.6)',
    opacity: el.background_opacity ?? 0.9,
    originX: 'center',
    originY: 'center',
  });

  const group = new fabric.Group([bg, text], {
    left,
    top,
    originX: 'center',
    originY: 'center',
    selectable: true,
  });

  return group;
}

async function renderLogoElement(
  el: CompositionElement,
  canvasWidth: number,
  canvasHeight: number,
  logoDataUrl?: string,
): Promise<fabric.Object | null> {
  if (!logoDataUrl) return null;

  try {
    const logoImg = await loadFabricImage(logoDataUrl);
    const scale = el.scale || 0.12;
    const targetWidth = canvasWidth * scale;
    const logoScale = targetWidth / (logoImg.width || 100);

    logoImg.set({
      left: el.position.x * canvasWidth,
      top: el.position.y * canvasHeight,
      scaleX: logoScale,
      scaleY: logoScale,
      selectable: true,
    });

    return logoImg;
  } catch {
    // Logo failed to load — skip silently
    return null;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Create a Fabric.js canvas from a CompositionInstruction.
 *
 * @param instruction - The composition instruction to render
 * @param imageDataUrl - Data URL of the source image
 * @param logoDataUrl - Optional data URL of the brand logo
 * @returns A rendered Fabric.js StaticCanvas
 */
export async function renderPiece(
  instruction: CompositionInstruction,
  imageDataUrl: string,
  logoDataUrl?: string,
): Promise<fabric.Canvas> {
  // Load all required fonts first
  await loadAllFonts(instruction);

  const { width, height } = instruction.canvas;

  // Create canvas
  const canvasEl = document.createElement('canvas');
  canvasEl.width = width;
  canvasEl.height = height;

  const canvas = new fabric.Canvas(canvasEl, {
    width,
    height,
    backgroundColor: '#000000',
    selection: true,
  });

  // 1. Render background image
  try {
    const bgImage = await loadFabricImage(imageDataUrl);
    const imgWidth = bgImage.width || width;
    const imgHeight = bgImage.height || height;

    // Apply crop from instruction
    const crop = instruction.image.crop;
    const cropX = crop.x * imgWidth;
    const cropY = crop.y * imgHeight;
    const cropW = crop.width * imgWidth;
    const cropH = crop.height * imgHeight;

    // Scale to cover the canvas (scale: 'cover')
    const scaleX = width / cropW;
    const scaleY = height / cropH;
    const scale = Math.max(scaleX, scaleY);

    bgImage.set({
      left: -(cropX * scale),
      top: -(cropY * scale),
      scaleX: scale,
      scaleY: scale,
      selectable: false,
      evented: false,
    });

    canvas.add(bgImage);
    canvas.sendObjectToBack(bgImage);
  } catch {
    // Failed to load image — leave black background
  }

  // 2. Apply treatment overlay (basic overlay via rect)
  const treatment = instruction.image.treatment;
  if (treatment === 'overlay_subtle' || treatment === 'overlay_medium') {
    const overlayOpacity = treatment === 'overlay_subtle' ? 0.2 : 0.4;
    const overlayRect = new fabric.Rect({
      left: 0,
      top: 0,
      width,
      height,
      fill: '#000000',
      opacity: overlayOpacity,
      selectable: false,
      evented: false,
    });
    canvas.add(overlayRect);
  }

  // 3. Render each element
  for (const el of instruction.elements) {
    let obj: fabric.Object | null = null;

    switch (el.type) {
      case 'text':
        obj = renderTextElement(el, width, height);
        break;
      case 'pill':
        obj = renderPillElement(el, width, height);
        break;
      case 'rating_badge':
        obj = renderRatingBadge(el, width, height);
        break;
      case 'logo':
        obj = await renderLogoElement(el, width, height, logoDataUrl);
        break;
    }

    if (obj) {
      canvas.add(obj);
    }
  }

  canvas.renderAll();
  return canvas;
}

/**
 * Export a Fabric.js canvas to a data URL.
 *
 * @param canvas - The Fabric.js canvas to export
 * @param format - Image format ('jpeg' or 'png')
 * @param quality - JPEG quality (0-1), ignored for PNG
 * @returns Data URL string
 */
export function renderToDataUrl(
  canvas: fabric.Canvas,
  format: 'jpeg' | 'png' = 'jpeg',
  quality: number = 0.85,
): string {
  return canvas.toDataURL({
    format,
    quality,
    multiplier: 1,
  });
}

/**
 * Serialize canvas state to a JSON string for persistence.
 */
export function serializeCanvas(canvas: fabric.Canvas): string {
  return JSON.stringify(canvas.toJSON());
}

/**
 * Restore canvas from a serialized JSON string.
 */
export async function deserializeCanvas(canvas: fabric.Canvas, state: string): Promise<void> {
  const json = JSON.parse(state);
  return new Promise((resolve) => {
    canvas.loadFromJSON(json).then(() => {
      canvas.renderAll();
      resolve();
    });
  });
}
