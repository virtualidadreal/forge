/**
 * claude.service.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Low-level OpenAI API calls for Brand DNA extraction and image analysis.
 * Uses fetch directly (browser SPA — proxied through Vite dev server).
 */

import type { BrandDNA } from '../types/brandDNA.types';
import type { ImageAnalysis, IntentionType, CopyInput } from '../types/composition.types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const API_URL = '/api/openai';
const MODEL = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generic OpenAI Chat Completions API call with retry logic.
 * Returns the raw text content from the first choice's message.
 */
async function callOpenAI(
  system: string,
  userContent: Array<Record<string, unknown>>,
  maxTokens = 4096,
): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: maxTokens,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: system,
            },
            {
              role: 'user',
              content: userContent,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`OpenAI API error ${response.status}: ${errorBody}`);
      }

      const data = await response.json();

      // Extract content from the first choice
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('No content in OpenAI response.');
      }

      return content as string;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * attempt);
      }
    }
  }

  throw lastError ?? new Error('OpenAI API call failed after all retries.');
}

/**
 * Extract a JSON object from a string that may contain markdown fences or extra text.
 */
function extractJSON<T>(raw: string): T {
  // Try to find a JSON block in markdown fences first
  const fenceMatch = raw.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  const jsonStr = fenceMatch ? fenceMatch[1].trim() : raw.trim();

  try {
    return JSON.parse(jsonStr) as T;
  } catch {
    // Attempt to find the first { ... } or [ ... ] block
    const braceStart = jsonStr.indexOf('{');
    const braceEnd = jsonStr.lastIndexOf('}');
    if (braceStart !== -1 && braceEnd !== -1 && braceEnd > braceStart) {
      return JSON.parse(jsonStr.slice(braceStart, braceEnd + 1)) as T;
    }
    throw new Error('Failed to parse JSON from OpenAI response.');
  }
}

// ---------------------------------------------------------------------------
// Brand DNA Analysis
// ---------------------------------------------------------------------------

/**
 * Schema description sent to OpenAI for Brand DNA extraction.
 * Omits brand_id/created_at/updated_at — those are set client-side.
 */
const BRAND_DNA_JSON_SCHEMA = `{
  "palette": {
    "background": "#hex",
    "text_primary": "#hex",
    "text_secondary": "#hex",
    "accent": "#hex or null",
    "pill_background": "rgba(...) or #hex",
    "pill_text": "#hex",
    "overlay_color": "#hex or null",
    "overlay_opacity": 0.0-0.6
  },
  "typography": {
    "heading_weight": "heavy|bold|medium|light",
    "heading_case": "uppercase|mixed|lowercase",
    "mix_weights_in_heading": true|false,
    "secondary_weight": "bold|medium|regular|light",
    "secondary_style": "normal|italic",
    "uses_uppercase_headlines": true|false,
    "uses_italic": true|false,
    "headline_to_sub_ratio": 1.5-4.0,
    "preferred_font_style": "editorial-sans|editorial-serif|geometric-sans|display|neutral"
  },
  "composition": {
    "text_zone": "on_subject|clean_zone|edge",
    "preferred_text_positions": ["top-left","top-center","top-right","center-left","center","center-right","bottom-left","bottom-center","bottom-right"],
    "alignment": "left|center|right",
    "density": "dense|balanced|editorial-sparse",
    "logo_positions": ["top-left","top-center","top-right","center-left","center","center-right","bottom-left","bottom-center","bottom-right"],
    "logo_with_tagline": true|false,
    "breathing_room": "tight|normal|generous"
  },
  "signature_elements": ["string array of recurring visual patterns"],
  "image_treatment": {
    "preferred_treatment": "none|overlay_subtle|overlay_medium|grain|duotone",
    "overlay_intensity": 0.0-0.6,
    "uses_grain": true|false,
    "uses_blur": true|false,
    "color_grading_preset": "warm_lifestyle|cold_editorial|high_contrast_urban|faded_vintage|clean_neutral" or null
  },
  "copy_tone": {
    "formality": "formal|casual",
    "urgency_level": "low|medium|high",
    "emotional_weight": "cold|neutral|warm",
    "grammatical_person": "2nd_person|imperative|descriptive",
    "avg_headline_words": number,
    "uses_punctuation_for_style": true|false
  },
  "reference_assets_count": number,
  "confidence_score": 0.0-1.0
}`;

/**
 * Analyze brand reference assets to extract a Brand DNA profile.
 *
 * @param assets - Array of base64-encoded images (without data URI prefix)
 * @param brandName - Name of the brand
 * @returns Partial Brand DNA (without brand_id / timestamps)
 */
export async function analyzeBrandAssets(
  assets: string[],
  brandName: string,
): Promise<Omit<BrandDNA, 'brand_id' | 'created_at' | 'updated_at'>> {
  const system = `You are an expert visual brand analyst. You analyze brand reference assets to extract a complete Brand DNA profile — the set of visual rules and preferences that make something "look like" this brand.

Analyze every asset independently and then synthesize a unified profile.

For each asset analyze:
1. Color palette with INTENT — not average colors but functional colors (background, text primary, accent, pill/badge, overlay).
2. Typographic system — heading weight, case, mixed weights, italic usage, headline-to-sub ratio.
3. Compositional logic — text zone, alignment, density, logo position, breathing room.
4. Signature elements — recurring visual patterns unique to the brand.
5. Image treatment — overlays, grain, duotone, color grading.
6. Copy tone — inferred from text visible in the assets.

The confidence_score reflects consistency across assets: very coherent = 0.85+, variable = <0.7.

Respond ONLY with valid JSON matching this schema — no explanatory text:
${BRAND_DNA_JSON_SCHEMA}`;

  // Build image content parts (OpenAI format)
  const imageParts = assets.map((base64) => ({
    type: 'image_url',
    image_url: {
      url: `data:image/png;base64,${base64}`,
      detail: 'high',
    },
  }));

  const userContent = [
    ...imageParts,
    {
      type: 'text',
      text: `Brand name: "${brandName}"\nNumber of reference assets: ${assets.length}\n\nAnalyze these ${assets.length} brand reference assets and extract the complete Brand DNA profile as JSON.`,
    },
  ];

  const raw = await callOpenAI(system, userContent, 4096);
  const parsed = extractJSON<Omit<BrandDNA, 'brand_id' | 'brand_name' | 'created_at' | 'updated_at'>>(raw);

  return {
    ...parsed,
    brand_name: brandName,
    reference_assets_count: assets.length,
  };
}

// ---------------------------------------------------------------------------
// Image Analysis for Composition
// ---------------------------------------------------------------------------

const IMAGE_ANALYSIS_SCHEMA = `{
  "subject_position": { "x": 0.0-1.0, "y": 0.0-1.0 },
  "subject_bbox": { "x1": 0.0-1.0, "y1": 0.0-1.0, "x2": 0.0-1.0, "y2": 0.0-1.0 },
  "clean_zones": ["top-left","top-center","top-right","center-left","center","center-right","bottom-left","bottom-center","bottom-right"],
  "dominant_colors": ["#hex", "#hex", "#hex"],
  "image_type": "lifestyle_portrait|product|flat_lay|landscape|abstract",
  "background_complexity": "low|medium|high",
  "text_contrast_zones": {
    "top": "low|medium|high",
    "center": "low|medium|high",
    "bottom": "low|medium|high"
  },
  "recommended_treatment": "none|overlay_subtle|overlay_medium|grain",
  "subject_facing": "left|right|center"
}`;

/**
 * Analyze an image for composition — identifies subject position, clean zones, contrast zones, etc.
 *
 * @param imageBase64 - Base64-encoded image (without data URI prefix)
 * @param brandDNA - The active Brand DNA
 * @param intention - The selected communication intention
 * @param copy - The copy to compose
 * @returns ImageAnalysis object
 */
export async function analyzeImageForComposition(
  imageBase64: string,
  brandDNA: BrandDNA,
  intention: IntentionType,
  copy: CopyInput,
): Promise<ImageAnalysis> {
  const system = `You are an expert visual composition engine. You analyze images to determine optimal placement of brand elements (text, logo, badges) for professional advertising and social media assets.

Your analysis must be precise — positions are relative coordinates (0-1) where (0,0) is top-left and (1,1) is bottom-right.

Rules:
- subject_position and subject_bbox in relative coordinates 0-1
- clean_zones: areas of the image without complex visual elements where text will be legible
- text_contrast_zones: contrast level available for white text in each zone
- recommended_treatment: only if the image needs it for legibility, respect the Brand DNA
- Do NOT include explanatory text, ONLY the JSON`;

  const brandDNAStr = JSON.stringify(brandDNA, null, 2);

  const copyLines = [
    copy.heading ? `- Heading: "${copy.heading}"` : null,
    copy.subheading ? `- Subheading: "${copy.subheading}"` : null,
    copy.cta ? `- CTA: "${copy.cta}"` : null,
    copy.tagline ? `- Tagline: "${copy.tagline}"` : null,
    copy.disclaimer ? `- Disclaimer: "${copy.disclaimer}"` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const userContent = [
    {
      type: 'image_url',
      image_url: {
        url: `data:image/png;base64,${imageBase64}`,
        detail: 'high',
      },
    },
    {
      type: 'text',
      text: `Analyze this image for brand asset composition.

BRAND DNA:
${brandDNAStr}

COMMUNICATION INTENTION: ${intention}

COPY TO COMPOSE:
${copyLines || '(no copy provided)'}

Respond ONLY with valid JSON matching this schema:
${IMAGE_ANALYSIS_SCHEMA}`,
    },
  ];

  const raw = await callOpenAI(system, userContent, 2048);
  return extractJSON<ImageAnalysis>(raw);
}
