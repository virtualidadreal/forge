/**
 * composer.service.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * The composition engine — the core brain of FORGE.
 * Takes Brand DNA + intention + image + copy + formats and produces
 * CompositionInstructions ready for Fabric.js rendering.
 */

import type { BrandDNA } from '../types/brandDNA.types';
import type {
  IntentionType,
  CopyInput,
  ImageAnalysis,
  CompositionInstruction,
  CompositionElement,
} from '../types/composition.types';
import type { FormatSpec } from '../types/format.types';
import { getFormatById } from '../constants/formats';
import { getIntentionById } from '../constants/intentions';
import { analyzeImageForComposition } from './claude.service';

// ---------------------------------------------------------------------------
// Font mapping — maps preferred_font_style to a Google Font family
// ---------------------------------------------------------------------------

const FONT_MAP: Record<string, string> = {
  'editorial-sans': 'Inter',
  'editorial-serif': 'Playfair Display',
  'geometric-sans': 'DM Sans',
  display: 'Space Grotesk',
  neutral: 'Inter',
};

// ---------------------------------------------------------------------------
// Weight mapping — maps BrandDNA typography weights to numeric values
// ---------------------------------------------------------------------------

const HEADING_WEIGHT_MAP: Record<string, number> = {
  heavy: 900,
  bold: 700,
  medium: 500,
  light: 300,
};

const SECONDARY_WEIGHT_MAP: Record<string, number> = {
  bold: 700,
  medium: 500,
  regular: 400,
  light: 300,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

/**
 * Scale a font size from a 1080px base to the target canvas width.
 */
function scaleFontSize(basePx: number, canvasWidth: number): number {
  return Math.round(basePx * (canvasWidth / 1080));
}

/**
 * Pick a position from clean_zones that avoids the subject.
 * Returns { x, y } in 0-1 range.
 */
function pickCleanPosition(
  cleanZones: string[],
  subjectPos: { x: number; y: number },
  preferredPositions: string[],
): { x: number; y: number } {
  // Position map
  const posMap: Record<string, { x: number; y: number }> = {
    'top-left': { x: 0.08, y: 0.08 },
    'top-center': { x: 0.5, y: 0.08 },
    'top-right': { x: 0.92, y: 0.08 },
    'center-left': { x: 0.08, y: 0.45 },
    center: { x: 0.5, y: 0.45 },
    'center-right': { x: 0.92, y: 0.45 },
    'bottom-left': { x: 0.08, y: 0.78 },
    'bottom-center': { x: 0.5, y: 0.78 },
    'bottom-right': { x: 0.92, y: 0.78 },
  };

  // Prefer brand's preferred positions that overlap with clean zones
  for (const pref of preferredPositions) {
    if (cleanZones.includes(pref) && posMap[pref]) {
      return posMap[pref];
    }
  }

  // Fall back to any clean zone
  for (const zone of cleanZones) {
    if (posMap[zone]) {
      return posMap[zone];
    }
  }

  // Ultimate fallback: opposite side of subject
  return {
    x: subjectPos.x > 0.5 ? 0.08 : 0.92,
    y: subjectPos.y > 0.5 ? 0.15 : 0.78,
  };
}

/**
 * Apply safe zones for Stories/TikTok formats.
 * Clamps y positions to stay within safe areas.
 */
function applySafeZones(
  elements: CompositionElement[],
  format: FormatSpec,
): CompositionElement[] {
  if (!format.safe_zones) return elements;

  const topSafe = format.safe_zones.top / format.height;
  const bottomSafe = 1 - format.safe_zones.bottom / format.height;

  return elements.map((el) => ({
    ...el,
    position: {
      x: el.position.x,
      y: clamp(el.position.y, topSafe + 0.02, bottomSafe - 0.05),
    },
  }));
}

/**
 * Mirror a position (for variation 2).
 */
function mirrorPosition(pos: { x: number; y: number }): { x: number; y: number } {
  // Flip both axes relative to center
  return {
    x: pos.x < 0.5 ? 1 - pos.x : 1 - pos.x,
    y: pos.y < 0.5 ? 1 - pos.y : 1 - pos.y,
  };
}

// ---------------------------------------------------------------------------
// Core composition generator
// ---------------------------------------------------------------------------

/**
 * Build a single CompositionInstruction for a given format and variation.
 */
function buildInstruction(
  format: FormatSpec,
  imageAnalysis: ImageAnalysis,
  brandDNA: BrandDNA,
  intention: IntentionType,
  copy: CopyInput,
  variation: 1 | 2 | 3,
): CompositionInstruction {
  const intentionConfig = getIntentionById(intention);
  const rules = intentionConfig?.composition_rules;

  const fontFamily = FONT_MAP[brandDNA.typography.preferred_font_style] ?? 'Inter';
  const headingWeight = HEADING_WEIGHT_MAP[brandDNA.typography.heading_weight] ?? 700;
  const secondaryWeight = SECONDARY_WEIGHT_MAP[brandDNA.typography.secondary_weight] ?? 400;
  const aspectRatio = format.width / format.height;
  const isLandscape = aspectRatio > 2;
  const isPortrait = aspectRatio < 0.7;

  // Base heading size from intention rules, scaled to canvas
  const [minSize, maxSize] = rules?.heading_size_range ?? [48, 72];
  const baseHeadingSize = Math.round((minSize + maxSize) / 2);
  const headingSize = scaleFontSize(baseHeadingSize, format.width);
  const subheadingSize = Math.round(headingSize / (brandDNA.typography.headline_to_sub_ratio || 2));
  const ctaSize = Math.round(headingSize * 0.6);

  // Determine text position based on intention and image analysis
  let textPos: { x: number; y: number };
  if (intention === 'editorial') {
    // EDITORIAL: text on subject
    textPos = { ...imageAnalysis.subject_position };
    textPos.y = clamp(textPos.y - 0.05, 0.2, 0.7);
  } else if (isLandscape) {
    // Landscape formats: text left, image right
    textPos = { x: 0.05, y: 0.35 };
  } else {
    // Use clean zones
    textPos = pickCleanPosition(
      imageAnalysis.clean_zones,
      imageAnalysis.subject_position,
      brandDNA.composition.preferred_text_positions,
    );
  }

  // Apply variation offsets
  if (variation === 2) {
    textPos = mirrorPosition(textPos);
  }

  // Determine alignment
  const alignment = textPos.x > 0.6 ? 'right' : textPos.x > 0.35 ? 'center' : 'left';

  // Determine treatment
  let treatment = brandDNA.image_treatment.preferred_treatment;
  if (variation === 3) {
    // Variation 3: change treatment
    if (treatment === 'none') {
      treatment = 'grain';
    } else if (treatment === 'grain') {
      treatment = 'overlay_subtle';
    } else {
      treatment = 'none';
    }
  }

  // Determine image crop
  const crop = { x: 0, y: 0, width: 1.0, height: 1.0 };
  if (isLandscape) {
    // Billboard/leaderboard: show torso area
    const subBbox = imageAnalysis.subject_bbox;
    crop.y = clamp(subBbox.y1, 0, 0.5);
    crop.height = clamp(subBbox.y2 - subBbox.y1 + 0.1, 0.3, 0.7);
  }

  // Build elements array based on intention
  const elements: CompositionElement[] = [];
  let currentY = textPos.y;
  const lineSpacing = isLandscape ? 0.15 : 0.06;

  // ── INTENTION-SPECIFIC COMPOSITION ─────────────────────────────────────

  switch (intention) {
    case 'convert': {
      // Dense info: heading, pills, prominent CTA
      if (copy.heading) {
        elements.push({
          type: 'text',
          role: 'heading',
          content: brandDNA.typography.uses_uppercase_headlines
            ? copy.heading.toUpperCase()
            : copy.heading,
          position: { x: textPos.x, y: currentY },
          font_family: fontFamily,
          font_weight: headingWeight,
          font_size_px: headingSize,
          color: brandDNA.palette.text_primary,
          alignment,
          max_width_ratio: isLandscape ? 0.45 : 0.75,
          text_transform: brandDNA.typography.uses_uppercase_headlines ? 'uppercase' : 'none',
        });
        currentY += lineSpacing;
      }
      if (copy.subheading) {
        elements.push({
          type: 'pill',
          role: 'subheading',
          content: copy.subheading,
          position: { x: textPos.x, y: currentY },
          font_family: fontFamily,
          font_weight: secondaryWeight,
          font_size_px: Math.round(subheadingSize * 0.85),
          color: brandDNA.palette.pill_text,
          background_color: brandDNA.palette.pill_background,
          background_opacity: 0.85,
          border_radius: 20,
          padding: 12,
          alignment,
        });
        currentY += lineSpacing * 0.8;
      }
      if (copy.cta) {
        elements.push({
          type: 'text',
          role: 'cta',
          content: copy.cta,
          position: { x: textPos.x, y: currentY },
          font_family: fontFamily,
          font_weight: 700,
          font_size_px: ctaSize,
          color: brandDNA.palette.text_primary,
          alignment,
          max_width_ratio: 0.5,
          text_transform: 'uppercase',
        });
        currentY += lineSpacing;
      }
      // Logo
      elements.push({
        type: 'logo',
        position: { x: 0.08, y: 0.06 },
        scale: 0.10,
        color: brandDNA.palette.text_primary,
      });
      break;
    }

    case 'awareness': {
      // Minimal: large logo, heading only, no CTA
      elements.push({
        type: 'logo',
        position: { x: textPos.x, y: 0.06 },
        scale: 0.16,
        color: brandDNA.palette.text_primary,
      });
      if (copy.heading) {
        elements.push({
          type: 'text',
          role: 'heading',
          content: copy.heading,
          position: { x: textPos.x, y: currentY },
          font_family: fontFamily,
          font_weight: clamp(headingWeight, 400, 500),
          font_size_px: headingSize,
          color: brandDNA.palette.text_primary,
          alignment,
          max_width_ratio: isLandscape ? 0.45 : 0.7,
          text_transform: brandDNA.typography.heading_case === 'uppercase' ? 'uppercase' : 'none',
        });
      }
      break;
    }

    case 'editorial': {
      // Text ON subject, mixed weights, no logo or pills
      if (copy.heading) {
        elements.push({
          type: 'text',
          role: 'heading',
          content: brandDNA.typography.uses_uppercase_headlines
            ? copy.heading.toUpperCase()
            : copy.heading,
          position: { x: textPos.x, y: textPos.y },
          font_family: fontFamily,
          font_weight: brandDNA.typography.mix_weights_in_heading ? 700 : headingWeight,
          font_size_px: scaleFontSize(clamp(baseHeadingSize, 40, 56), format.width),
          color: brandDNA.palette.text_primary,
          alignment: 'left',
          max_width_ratio: isLandscape ? 0.4 : 0.65,
          text_transform: brandDNA.typography.heading_case === 'uppercase' ? 'uppercase' : 'none',
        });
      }
      if (copy.subheading) {
        elements.push({
          type: 'text',
          role: 'subheading',
          content: copy.subheading,
          position: { x: textPos.x, y: textPos.y + lineSpacing },
          font_family: fontFamily,
          font_weight: 400,
          font_size_px: scaleFontSize(Math.round(baseHeadingSize * 0.6), format.width),
          color: brandDNA.palette.text_secondary,
          alignment: 'left',
          max_width_ratio: isLandscape ? 0.35 : 0.6,
          text_transform: 'none',
        });
      }
      break;
    }

    case 'campaign': {
      // Three-zone layout: hero heading top, logo+tagline mid, secondary bottom
      const heroY = isPortrait ? 0.15 : 0.08;
      if (copy.heading) {
        elements.push({
          type: 'text',
          role: 'heading',
          content: brandDNA.typography.uses_uppercase_headlines
            ? copy.heading.toUpperCase()
            : copy.heading,
          position: { x: 0.08, y: heroY },
          font_family: fontFamily,
          font_weight: 700,
          font_size_px: scaleFontSize(clamp(baseHeadingSize, 64, 96), format.width),
          color: brandDNA.palette.text_primary,
          alignment: 'left',
          max_width_ratio: isLandscape ? 0.5 : 0.85,
          text_transform: brandDNA.typography.uses_uppercase_headlines ? 'uppercase' : 'none',
        });
      }
      // Logo with tagline in middle zone
      const logoY = isPortrait ? 0.55 : 0.5;
      elements.push({
        type: 'logo',
        position: { x: 0.08, y: logoY },
        scale: 0.12,
        color: brandDNA.palette.text_primary,
      });
      if (copy.tagline || brandDNA.tagline) {
        elements.push({
          type: 'text',
          role: 'tagline',
          content: copy.tagline || brandDNA.tagline || '',
          position: { x: 0.25, y: logoY + 0.01 },
          font_family: fontFamily,
          font_weight: secondaryWeight,
          font_size_px: scaleFontSize(16, format.width),
          color: brandDNA.palette.text_secondary,
          alignment: 'left',
          max_width_ratio: 0.5,
        });
      }
      if (copy.subheading) {
        elements.push({
          type: 'text',
          role: 'subheading',
          content: copy.subheading,
          position: { x: 0.08, y: logoY + lineSpacing },
          font_family: fontFamily,
          font_weight: secondaryWeight,
          font_size_px: subheadingSize,
          color: brandDNA.palette.text_secondary,
          alignment: 'left',
          max_width_ratio: 0.65,
        });
      }
      break;
    }

    case 'branding': {
      // Image only, minimal or no text, logo as signature element
      elements.push({
        type: 'logo',
        position: {
          x: imageAnalysis.subject_position.x < 0.5 ? 0.75 : 0.15,
          y: 0.85,
        },
        scale: 0.10,
        color: brandDNA.palette.text_primary,
      });
      // At most one line of text
      if (copy.heading && brandDNA.composition.density !== 'editorial-sparse') {
        elements.push({
          type: 'text',
          role: 'heading',
          content: copy.heading,
          position: { x: 0.5, y: 0.92 },
          font_family: fontFamily,
          font_weight: clamp(headingWeight, 300, 500),
          font_size_px: scaleFontSize(24, format.width),
          color: brandDNA.palette.text_primary,
          alignment: 'center',
          max_width_ratio: 0.6,
        });
      }
      break;
    }

    case 'urgency': {
      // Uppercase heading, italic subheading, max contrast
      if (copy.heading) {
        elements.push({
          type: 'text',
          role: 'heading',
          content: copy.heading.toUpperCase(),
          position: { x: textPos.x, y: currentY },
          font_family: fontFamily,
          font_weight: clamp(headingWeight, 700, 900),
          font_size_px: scaleFontSize(clamp(baseHeadingSize, 56, 88), format.width),
          color: brandDNA.palette.text_primary,
          alignment,
          max_width_ratio: isLandscape ? 0.45 : 0.8,
          text_transform: 'uppercase',
        });
        currentY += lineSpacing;
      }
      if (copy.subheading) {
        elements.push({
          type: 'text',
          role: 'subheading',
          content: copy.subheading,
          position: { x: textPos.x, y: currentY },
          font_family: fontFamily,
          font_weight: secondaryWeight,
          font_size_px: Math.round(headingSize * 0.5),
          font_style: 'italic',
          color: brandDNA.palette.text_secondary,
          alignment,
          max_width_ratio: isLandscape ? 0.4 : 0.7,
          text_transform: 'none',
        });
      }
      // Logo optional and discrete, omit by default
      break;
    }

    case 'social_proof': {
      // Rating badge top, quote center, CTA bottom
      elements.push({
        type: 'rating_badge',
        content: copy.heading || '4.9',
        position: { x: 0.5, y: isPortrait ? 0.18 : 0.12 },
        font_family: fontFamily,
        font_weight: 700,
        font_size_px: scaleFontSize(28, format.width),
        color: brandDNA.palette.pill_text,
        background_color: brandDNA.palette.pill_background,
        background_opacity: 0.9,
        border_radius: 12,
        padding: 16,
        alignment: 'center',
      });
      if (copy.subheading) {
        elements.push({
          type: 'text',
          role: 'subheading',
          content: `\u201C${copy.subheading}\u201D`,
          position: { x: 0.5, y: isPortrait ? 0.45 : 0.4 },
          font_family: fontFamily,
          font_weight: secondaryWeight,
          font_size_px: subheadingSize,
          font_style: 'italic',
          color: brandDNA.palette.text_primary,
          alignment: 'center',
          max_width_ratio: 0.75,
          text_transform: 'none',
        });
      }
      if (copy.cta) {
        elements.push({
          type: 'text',
          role: 'cta',
          content: copy.cta,
          position: { x: 0.5, y: isPortrait ? 0.78 : 0.75 },
          font_family: fontFamily,
          font_weight: 700,
          font_size_px: ctaSize,
          color: brandDNA.palette.text_primary,
          alignment: 'center',
          max_width_ratio: 0.5,
          text_transform: 'uppercase',
        });
      }
      // Logo subtle
      elements.push({
        type: 'logo',
        position: { x: 0.08, y: 0.06 },
        scale: 0.08,
        color: brandDNA.palette.text_primary,
      });
      break;
    }

    default: {
      // Generic fallback
      if (copy.heading) {
        elements.push({
          type: 'text',
          role: 'heading',
          content: copy.heading,
          position: { x: textPos.x, y: currentY },
          font_family: fontFamily,
          font_weight: headingWeight,
          font_size_px: headingSize,
          color: brandDNA.palette.text_primary,
          alignment,
          max_width_ratio: 0.75,
        });
      }
      break;
    }
  }

  // Apply safe zones
  const safeElements = applySafeZones(elements, format);

  // Determine overlay treatment from intention
  let imageTreatment = treatment;
  if (intention === 'convert' && imageAnalysis.background_complexity === 'high') {
    imageTreatment = 'overlay_subtle';
  } else if (intention === 'social_proof') {
    imageTreatment = 'overlay_subtle';
  } else if (intention === 'campaign') {
    imageTreatment = 'overlay_medium';
  }

  return {
    format: format.id,
    canvas: { width: format.width, height: format.height },
    image: {
      crop,
      scale: 'cover',
      treatment: imageTreatment,
    },
    elements: safeElements,
    variation_seed: variation,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate CompositionInstructions for all selected formats, with 3 variations each.
 *
 * 1. Calls claude.service for image analysis
 * 2. For each format, generates 3 variations
 * 3. Applies intention-specific rules from PRD-02 / PRD-04
 * 4. Adapts positions by format aspect ratio
 * 5. Applies safe zones for Stories/TikTok
 *
 * @returns Array of CompositionInstruction (formatCount * 3 variations)
 */
export async function generateCompositions(
  imageBase64: string,
  brandDNA: BrandDNA,
  intention: IntentionType,
  copy: CopyInput,
  formatIds: string[],
): Promise<CompositionInstruction[]> {
  // Validate inputs
  if (!formatIds.length) {
    throw new Error('At least one format must be selected.');
  }

  const formats = formatIds
    .map((id) => getFormatById(id))
    .filter((f): f is FormatSpec => f !== undefined);

  if (!formats.length) {
    throw new Error('No valid formats found for the provided IDs.');
  }

  // Step 1: Analyze image with Claude Vision
  const imageAnalysis = await analyzeImageForComposition(imageBase64, brandDNA, intention, copy);
  console.log('[FORGE] imageAnalysis result:', JSON.stringify(imageAnalysis, null, 2));

  // Step 2: Generate instructions for each format x 3 variations
  const instructions: CompositionInstruction[] = [];

  for (const format of formats) {
    for (const variation of [1, 2, 3] as const) {
      const instruction = buildInstruction(
        format,
        imageAnalysis,
        brandDNA,
        intention,
        copy,
        variation,
      );
      instructions.push(instruction);
    }
  }

  console.log('[FORGE] Generated instructions:', JSON.stringify(instructions.slice(0, 3), null, 2));
  return instructions;
}
