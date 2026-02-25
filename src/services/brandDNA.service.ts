/**
 * brandDNA.service.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Higher-level Brand DNA management — file conversion, ID generation,
 * recalculation and preview.
 */

import type { BrandDNA } from '../types/brandDNA.types';
import { analyzeBrandAssets } from './claude.service';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convert a File to a base64 string (without the data URI prefix).
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the "data:image/...;base64," prefix
      const base64 = result.split(',')[1];
      if (!base64) {
        reject(new Error(`Failed to extract base64 from file: ${file.name}`));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Extract a complete Brand DNA from uploaded asset files.
 *
 * 1. Converts Files to base64
 * 2. Calls Claude Vision via claude.service
 * 3. Adds brand_id (UUID), timestamps, tagline and brand_name
 *
 * @param assets - 3-6 reference image files from the brand
 * @param brandName - Name of the brand (required)
 * @param tagline - Optional brand tagline
 * @returns Complete BrandDNA object ready to persist
 */
export async function extractBrandDNA(
  assets: File[],
  brandName: string,
  tagline?: string,
): Promise<BrandDNA> {
  if (assets.length < 1) {
    throw new Error('At least 1 asset is required. 3-6 recommended for accurate extraction.');
  }

  // Convert all files to base64 in parallel
  const base64Assets = await Promise.all(assets.map(fileToBase64));

  // Call Claude Vision analysis
  const analysis = await analyzeBrandAssets(base64Assets, brandName);

  const now = new Date().toISOString();

  const brandDNA: BrandDNA = {
    brand_id: crypto.randomUUID(),
    brand_name: brandName,
    tagline,
    created_at: now,
    updated_at: now,
    palette: analysis.palette,
    typography: analysis.typography,
    composition: analysis.composition,
    signature_elements: analysis.signature_elements,
    image_treatment: analysis.image_treatment,
    copy_tone: analysis.copy_tone,
    reference_assets_count: assets.length,
    confidence_score: analysis.confidence_score,
  };

  return brandDNA;
}

/**
 * Extract a complete Brand DNA from data URL strings (base64-encoded images).
 *
 * This variant is designed for the BrandDNA Wizard, which already holds
 * assets as data-URL strings from the AssetUploader component.
 *
 * @param assetDataUrls - 3-6 data URL strings (e.g. "data:image/png;base64,...")
 * @param brandName - Name of the brand (required)
 * @param tagline - Optional brand tagline
 * @returns Complete BrandDNA object ready to persist
 */
export async function extractBrandDNAFromDataUrls(
  assetDataUrls: string[],
  brandName: string,
  tagline?: string,
): Promise<BrandDNA> {
  if (assetDataUrls.length < 1) {
    throw new Error('At least 1 asset is required. 3-6 recommended for accurate extraction.');
  }

  // Strip the data URI prefix from each URL to get raw base64
  const base64Assets = assetDataUrls.map((url) => {
    const parts = url.split(',');
    return parts.length > 1 ? parts[1] : url;
  });

  // Call Claude Vision analysis
  const analysis = await analyzeBrandAssets(base64Assets, brandName);

  const now = new Date().toISOString();

  return {
    brand_id: crypto.randomUUID(),
    brand_name: brandName,
    tagline,
    created_at: now,
    updated_at: now,
    palette: analysis.palette,
    typography: analysis.typography,
    composition: analysis.composition,
    signature_elements: analysis.signature_elements,
    image_treatment: analysis.image_treatment,
    copy_tone: analysis.copy_tone,
    reference_assets_count: assetDataUrls.length,
    confidence_score: analysis.confidence_score,
  };
}

/**
 * Recalculate a Brand DNA by merging new asset analysis with the existing DNA.
 *
 * The new analysis is performed on the new assets alone, then averaged / merged
 * with the existing DNA. The confidence_score is recalculated based on the
 * weighted combination.
 *
 * @param existingDNA - The current Brand DNA
 * @param newAssets - Additional reference images
 * @returns Updated BrandDNA with new updated_at and incremented asset count
 */
export async function recalculateBrandDNA(
  existingDNA: BrandDNA,
  newAssets: File[],
): Promise<BrandDNA> {
  if (newAssets.length < 1) {
    throw new Error('At least 1 new asset is required for recalculation.');
  }

  const base64Assets = await Promise.all(newAssets.map(fileToBase64));

  // Analyze new assets
  const newAnalysis = await analyzeBrandAssets(base64Assets, existingDNA.brand_name);

  // Weight: existing DNA has more weight based on asset count
  const existingWeight = existingDNA.reference_assets_count;
  const newWeight = newAssets.length;
  const totalWeight = existingWeight + newWeight;

  // Merge numeric values with weighted average
  const mergedOverlayOpacity =
    (existingDNA.palette.overlay_opacity * existingWeight +
      newAnalysis.palette.overlay_opacity * newWeight) /
    totalWeight;

  const mergedOverlayIntensity =
    (existingDNA.image_treatment.overlay_intensity * existingWeight +
      newAnalysis.image_treatment.overlay_intensity * newWeight) /
    totalWeight;

  const mergedHeadlineRatio =
    (existingDNA.typography.headline_to_sub_ratio * existingWeight +
      newAnalysis.typography.headline_to_sub_ratio * newWeight) /
    totalWeight;

  const mergedAvgHeadlineWords =
    (existingDNA.copy_tone.avg_headline_words * existingWeight +
      newAnalysis.copy_tone.avg_headline_words * newWeight) /
    totalWeight;

  const mergedConfidence =
    (existingDNA.confidence_score * existingWeight +
      newAnalysis.confidence_score * newWeight) /
    totalWeight;

  // For non-numeric/categorical values, prefer the new analysis if it has higher weight
  // contribution, otherwise keep existing. In practice: new analysis wins if >= 50% of assets.
  const preferNew = newWeight >= existingWeight;

  // Merge signature elements (union, deduplicated)
  const mergedSignatureElements = Array.from(
    new Set([...existingDNA.signature_elements, ...newAnalysis.signature_elements]),
  );

  const merged: BrandDNA = {
    brand_id: existingDNA.brand_id,
    brand_name: existingDNA.brand_name,
    tagline: existingDNA.tagline,
    logo_url: existingDNA.logo_url,
    created_at: existingDNA.created_at,
    updated_at: new Date().toISOString(),

    palette: {
      background: preferNew ? newAnalysis.palette.background : existingDNA.palette.background,
      text_primary: preferNew ? newAnalysis.palette.text_primary : existingDNA.palette.text_primary,
      text_secondary: preferNew
        ? newAnalysis.palette.text_secondary
        : existingDNA.palette.text_secondary,
      accent: newAnalysis.palette.accent ?? existingDNA.palette.accent,
      pill_background: preferNew
        ? newAnalysis.palette.pill_background
        : existingDNA.palette.pill_background,
      pill_text: preferNew ? newAnalysis.palette.pill_text : existingDNA.palette.pill_text,
      overlay_color: newAnalysis.palette.overlay_color ?? existingDNA.palette.overlay_color,
      overlay_opacity: Math.round(mergedOverlayOpacity * 100) / 100,
    },

    typography: {
      heading_weight: preferNew
        ? newAnalysis.typography.heading_weight
        : existingDNA.typography.heading_weight,
      heading_case: preferNew
        ? newAnalysis.typography.heading_case
        : existingDNA.typography.heading_case,
      mix_weights_in_heading:
        newAnalysis.typography.mix_weights_in_heading ||
        existingDNA.typography.mix_weights_in_heading,
      secondary_weight: preferNew
        ? newAnalysis.typography.secondary_weight
        : existingDNA.typography.secondary_weight,
      secondary_style: preferNew
        ? newAnalysis.typography.secondary_style
        : existingDNA.typography.secondary_style,
      uses_uppercase_headlines:
        newAnalysis.typography.uses_uppercase_headlines ||
        existingDNA.typography.uses_uppercase_headlines,
      uses_italic: newAnalysis.typography.uses_italic || existingDNA.typography.uses_italic,
      headline_to_sub_ratio: Math.round(mergedHeadlineRatio * 10) / 10,
      preferred_font_style: preferNew
        ? newAnalysis.typography.preferred_font_style
        : existingDNA.typography.preferred_font_style,
    },

    composition: preferNew ? newAnalysis.composition : existingDNA.composition,

    signature_elements: mergedSignatureElements,

    image_treatment: {
      preferred_treatment: preferNew
        ? newAnalysis.image_treatment.preferred_treatment
        : existingDNA.image_treatment.preferred_treatment,
      overlay_intensity: Math.round(mergedOverlayIntensity * 100) / 100,
      uses_grain: newAnalysis.image_treatment.uses_grain || existingDNA.image_treatment.uses_grain,
      uses_blur: newAnalysis.image_treatment.uses_blur || existingDNA.image_treatment.uses_blur,
      color_grading_preset:
        newAnalysis.image_treatment.color_grading_preset ??
        existingDNA.image_treatment.color_grading_preset,
    },

    copy_tone: {
      formality: preferNew ? newAnalysis.copy_tone.formality : existingDNA.copy_tone.formality,
      urgency_level: preferNew
        ? newAnalysis.copy_tone.urgency_level
        : existingDNA.copy_tone.urgency_level,
      emotional_weight: preferNew
        ? newAnalysis.copy_tone.emotional_weight
        : existingDNA.copy_tone.emotional_weight,
      grammatical_person: preferNew
        ? newAnalysis.copy_tone.grammatical_person
        : existingDNA.copy_tone.grammatical_person,
      avg_headline_words: Math.round(mergedAvgHeadlineWords),
      uses_punctuation_for_style:
        newAnalysis.copy_tone.uses_punctuation_for_style ||
        existingDNA.copy_tone.uses_punctuation_for_style,
    },

    reference_assets_count: totalWeight,
    confidence_score: Math.round(mergedConfidence * 100) / 100,
  };

  return merged;
}

/**
 * Generate a simple preview piece description to showcase the Brand DNA in action.
 * Returns a descriptive object that can be rendered as a mini card preview.
 */
export function generatePreviewPiece(brandDNA: BrandDNA): {
  heading: string;
  subheading: string;
  palette: { bg: string; textPrimary: string; textSecondary: string; accent: string | null };
  typography: {
    headingWeight: string;
    headingCase: string;
    secondaryStyle: string;
    fontStyle: string;
  };
  treatment: string;
  signatureElements: string[];
} {
  // Generate example heading based on copy tone
  const headingExamples: Record<string, string> = {
    '2nd_person': 'Your Best Look Yet',
    imperative: 'Shop Best Sellers',
    descriptive: 'The New Collection',
  };

  const subheadingExamples: Record<string, string> = {
    '2nd_person': 'Discover what suits you',
    imperative: 'Explore now',
    descriptive: 'Arriving this season',
  };

  const heading = headingExamples[brandDNA.copy_tone.grammatical_person] ?? 'Best Sellers';
  const subheading =
    subheadingExamples[brandDNA.copy_tone.grammatical_person] ?? 'Shop the collection';

  return {
    heading: brandDNA.typography.uses_uppercase_headlines ? heading.toUpperCase() : heading,
    subheading,
    palette: {
      bg: brandDNA.palette.background,
      textPrimary: brandDNA.palette.text_primary,
      textSecondary: brandDNA.palette.text_secondary,
      accent: brandDNA.palette.accent,
    },
    typography: {
      headingWeight: brandDNA.typography.heading_weight,
      headingCase: brandDNA.typography.heading_case,
      secondaryStyle: brandDNA.typography.secondary_style,
      fontStyle: brandDNA.typography.preferred_font_style,
    },
    treatment: brandDNA.image_treatment.preferred_treatment,
    signatureElements: brandDNA.signature_elements,
  };
}
