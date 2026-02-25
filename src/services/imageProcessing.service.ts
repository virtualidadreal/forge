/**
 * imageProcessing.service.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Canvas 2D image treatments — all run in the browser via getImageData/putImageData.
 * Implements the professional-grade treatments from PRD-05.
 */

// ---------------------------------------------------------------------------
// Math helpers
// ---------------------------------------------------------------------------

/**
 * Linear interpolation between two values.
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Clamp a value between min and max.
 */
export function clamp(val: number, min = 0, max = 255): number {
  return Math.min(Math.max(val, min), max);
}

/**
 * Parse a hex color to [r, g, b].
 */
function hexToRgb(hex: string): [number, number, number] {
  const cleaned = hex.replace('#', '');
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);
  return [r, g, b];
}

// ---------------------------------------------------------------------------
// T-01 · Overlay de Color de Marca
// ---------------------------------------------------------------------------

/**
 * Apply a solid color overlay with adjustable opacity.
 * Uses the brand's specific color — not a generic black overlay.
 *
 * @param canvas - The target canvas element
 * @param color - Hex color string (e.g. '#1A1A3E')
 * @param opacity - Opacity 0-1 (0-0.6 recommended)
 * @param blendMode - Canvas composite operation (default: 'source-over')
 */
export function applyOverlay(
  canvas: HTMLCanvasElement,
  color: string,
  opacity: number,
  blendMode: string = 'source-over',
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.save();
  ctx.globalCompositeOperation = blendMode as GlobalCompositeOperation;
  ctx.globalAlpha = clamp(opacity, 0, 1);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = 1;
  ctx.restore();
}

// ---------------------------------------------------------------------------
// T-02 · Duotono
// ---------------------------------------------------------------------------

/**
 * Apply duotone effect — maps luminance to two brand colors.
 * Converts image to grayscale via luminance formula, then maps
 * shadows to shadowColor and highlights to highlightColor.
 *
 * @param canvas - The target canvas element
 * @param shadowColor - Hex color for dark tones (e.g. brand primary)
 * @param highlightColor - Hex color for light tones (e.g. '#FFFFFF')
 * @param intensity - Blend intensity 0-1 (1 = full duotone, 0 = original)
 */
export function applyDuotone(
  canvas: HTMLCanvasElement,
  shadowColor: string,
  highlightColor: string,
  intensity: number,
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  const [shadowR, shadowG, shadowB] = hexToRgb(shadowColor);
  const [highlightR, highlightG, highlightB] = hexToRgb(highlightColor);
  const t = clamp(intensity, 0, 1);

  for (let i = 0; i < data.length; i += 4) {
    const origR = data[i];
    const origG = data[i + 1];
    const origB = data[i + 2];

    // Luminance via Rec. 601 formula
    const luminance = 0.299 * origR + 0.587 * origG + 0.114 * origB;
    const lum01 = luminance / 255;

    // Map luminance to duotone colors
    const duoR = lerp(shadowR, highlightR, lum01);
    const duoG = lerp(shadowG, highlightG, lum01);
    const duoB = lerp(shadowB, highlightB, lum01);

    // Blend with original based on intensity
    data[i] = clamp(lerp(origR, duoR, t));
    data[i + 1] = clamp(lerp(origG, duoG, t));
    data[i + 2] = clamp(lerp(origB, duoB, t));
    // Alpha unchanged
  }

  ctx.putImageData(imageData, 0, 0);
}

// ---------------------------------------------------------------------------
// T-03 · Viñeta Editorial
// ---------------------------------------------------------------------------

/**
 * Apply editorial vignette — progressive darkening from edges toward center.
 * Subtle when done right: the eye doesn't notice it consciously but the
 * subject gains presence.
 *
 * @param canvas - The target canvas element
 * @param intensity - Vignette intensity 0-1 (0.3 = invisible, 0.7 = dramatic)
 * @param size - Radius of unaffected central area (0.3-0.8 of canvas width)
 * @param color - Vignette color (default: '#000000')
 */
export function applyVignette(
  canvas: HTMLCanvasElement,
  intensity: number,
  size: number,
  color: string = '#000000',
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;

  // Inner radius (no vignette here) and outer radius
  const diagonal = Math.sqrt(cx * cx + cy * cy);
  const innerRadius = diagonal * clamp(size, 0.1, 0.9);
  const outerRadius = diagonal;

  // Parse color for rgba
  const [r, g, b] = hexToRgb(color);
  const vignetteIntensity = clamp(intensity, 0, 1);

  const gradient = ctx.createRadialGradient(cx, cy, innerRadius, cx, cy, outerRadius);
  gradient.addColorStop(0, `rgba(${r},${g},${b},0)`);
  gradient.addColorStop(1, `rgba(${r},${g},${b},${vignetteIntensity})`);

  ctx.save();
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

// ---------------------------------------------------------------------------
// T-05 · Grain Cinematografico
// ---------------------------------------------------------------------------

/**
 * Apply cinematic grain — adds analog film texture over the image.
 * Transforms a clinically clean digital photo into something with
 * character and texture.
 *
 * @param canvas - The target canvas element
 * @param intensity - Grain intensity 0-1 (0.15 = subtle, 0.4 = visible film grain)
 * @param grainSize - Grain particle size: 'fine' (1px), 'medium' (2px), 'coarse' (3px)
 */
export function applyGrain(
  canvas: HTMLCanvasElement,
  intensity: number,
  grainSize: 'fine' | 'medium' | 'coarse' = 'medium',
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  const grainIntensity = clamp(intensity, 0, 1);

  // Grain size determines step — larger grains use block noise
  const step = grainSize === 'fine' ? 1 : grainSize === 'medium' ? 2 : 3;

  if (step === 1) {
    // Fine grain: per-pixel noise
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * grainIntensity * 255;
      data[i] = clamp(data[i] + noise);
      data[i + 1] = clamp(data[i + 1] + noise);
      data[i + 2] = clamp(data[i + 2] + noise);
    }
  } else {
    // Medium/coarse: block noise for larger grain particles
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const noise = (Math.random() - 0.5) * grainIntensity * 255;

        // Apply same noise to entire block
        for (let dy = 0; dy < step && y + dy < h; dy++) {
          for (let dx = 0; dx < step && x + dx < w; dx++) {
            const idx = ((y + dy) * w + (x + dx)) * 4;
            data[idx] = clamp(data[idx] + noise);
            data[idx + 1] = clamp(data[idx + 1] + noise);
            data[idx + 2] = clamp(data[idx + 2] + noise);
          }
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

// ---------------------------------------------------------------------------
// T-06 · Color Grading
// ---------------------------------------------------------------------------

/**
 * Preset definitions for color grading.
 * Each preset adjusts temperature, contrast, saturation, and shadow lift.
 */
interface GradingPreset {
  temperature: number; // -30 to +30 (negative = cold, positive = warm)
  contrast: number; // -30 to +30
  saturation: number; // -30 to +30
  shadowLift: number; // 0 to 50 (lifts black point)
  tint: [number, number, number]; // RGB tint applied to midtones
}

const GRADING_PRESETS: Record<string, GradingPreset> = {
  warm_lifestyle: {
    temperature: 15,
    contrast: 5,
    saturation: 10,
    shadowLift: 0,
    tint: [10, 5, -5],
  },
  cold_editorial: {
    temperature: -20,
    contrast: 15,
    saturation: -5,
    shadowLift: 0,
    tint: [-5, 0, 10],
  },
  high_contrast_urban: {
    temperature: 0,
    contrast: 30,
    saturation: -10,
    shadowLift: 0,
    tint: [0, 0, 0],
  },
  faded_vintage: {
    temperature: 5,
    contrast: -10,
    saturation: -20,
    shadowLift: 30,
    tint: [8, 6, -3],
  },
  clean_neutral: {
    temperature: 0,
    contrast: 0,
    saturation: 0,
    shadowLift: 0,
    tint: [0, 0, 0],
  },
};

/**
 * Apply color grading to achieve a consistent visual atmosphere.
 * Adjusts temperature, contrast, saturation and tonal curves.
 *
 * @param canvas - The target canvas element
 * @param preset - Grading preset name
 * @param intensity - How much to apply the preset (0-1)
 */
export function applyColorGrading(
  canvas: HTMLCanvasElement,
  preset: string,
  intensity: number,
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const gradingPreset = GRADING_PRESETS[preset];
  if (!gradingPreset || preset === 'clean_neutral') return;

  const w = canvas.width;
  const h = canvas.height;
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  const t = clamp(intensity, 0, 1);
  const { temperature, contrast, saturation, shadowLift, tint } = gradingPreset;

  // Pre-compute contrast curve (S-curve approximation)
  const contrastFactor = (259 * (contrast * t + 255)) / (255 * (259 - contrast * t));

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // 1. Temperature shift (warm = +R -B, cold = -R +B)
    const tempShift = temperature * t;
    r = clamp(r + tempShift);
    b = clamp(b - tempShift);

    // 2. Contrast (S-curve around 128)
    r = clamp(contrastFactor * (r - 128) + 128);
    g = clamp(contrastFactor * (g - 128) + 128);
    b = clamp(contrastFactor * (b - 128) + 128);

    // 3. Shadow lift (raise black point)
    if (shadowLift > 0) {
      const lift = shadowLift * t;
      r = clamp(r + lift * (1 - r / 255));
      g = clamp(g + lift * (1 - g / 255));
      b = clamp(b + lift * (1 - b / 255));
    }

    // 4. Saturation adjustment (convert to HSL-like, adjust S, convert back)
    const avg = (r + g + b) / 3;
    const satFactor = 1 + (saturation * t) / 100;
    r = clamp(avg + (r - avg) * satFactor);
    g = clamp(avg + (g - avg) * satFactor);
    b = clamp(avg + (b - avg) * satFactor);

    // 5. Midtone tint
    const luminance = (r + g + b) / 3 / 255;
    // Apply tint most strongly in midtones (bell curve around 0.5)
    const midtoneMask = Math.sin(luminance * Math.PI);
    r = clamp(r + tint[0] * t * midtoneMask);
    g = clamp(g + tint[1] * t * midtoneMask);
    b = clamp(b + tint[2] * t * midtoneMask);

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }

  ctx.putImageData(imageData, 0, 0);
}
