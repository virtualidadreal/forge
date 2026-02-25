/**
 * generativePrompts.service.ts
 * Builds intention-specific prompts for Nano Banana Pro.
 */

import type { BrandDNA } from '../types/brandDNA.types';
import type { CopyInput, IntentionType } from '../types/composition.types';
import type { FormatSpec } from '../types/format.types';

export type VariationMode = 'clean' | 'rich' | 'bold';

interface GenerativePromptParams {
  intention: IntentionType;
  copy: CopyInput;
  brandDNA: BrandDNA;
  format: FormatSpec;
  variationMode: VariationMode;
}

/**
 * Build the copy block — always includes ALL non-empty fields.
 */
function buildCopyBlock(copy: CopyInput): string {
  const lines: string[] = [];
  if (copy.heading) lines.push(`HEADLINE: "${copy.heading}"`);
  if (copy.subheading) lines.push(`SUBHEADLINE: "${copy.subheading}"`);
  if (copy.cta) lines.push(`CTA BUTTON: "${copy.cta}"`);
  if (copy.tagline) lines.push(`TAGLINE: "${copy.tagline}"`);
  if (copy.disclaimer) lines.push(`DISCLAIMER: "${copy.disclaimer}"`);

  if (lines.length === 0) return 'No text provided — image only.';
  return lines.join('\n');
}

export function buildGenerativePrompt(params: GenerativePromptParams): string {
  const { intention, copy, brandDNA, format, variationMode } = params;

  const copyBlock = buildCopyBlock(copy);
  const hasCopy = !!(copy.heading || copy.subheading || copy.cta || copy.tagline);

  const baseContext = `You are creating a professional brand campaign asset.
Format: ${format.name}, ${format.width}x${format.height}px, aspect ratio ${format.aspect_ratio}.
Brand: "${brandDNA.brand_name}".
Brand palette: background ${brandDNA.palette.background}, text ${brandDNA.palette.text_primary}, accent ${brandDNA.palette.accent || 'none'}.
Tone: ${brandDNA.copy_tone.formality}, ${brandDNA.copy_tone.emotional_weight}.

Image 1 is the main subject photo — PRESERVE THE SUBJECT EXACTLY as they appear.
The following images (if any) are brand style references — use them for aesthetic, color palette, and mood.
The last image (if PNG with transparency) is the brand logo.`;

  const copyInstructions = hasCopy ? `
TEXT TO RENDER IN THE IMAGE (ALL of the following must appear):
${copyBlock}

CRITICAL TEXT RULES:
- Every text element listed above MUST be rendered in the final image
- Text must be perfectly legible, correctly spelled, and properly sized
- Use colors from the brand palette for text
- The CTA (if provided) must be a visible button or pill shape with high contrast` : '';

  const intentionStyles: Record<string, string> = {
    editorial: `STYLE: Fashion editorial composition.
- The subject is the hero — large, centered
- Text integrates naturally with the image (overlapping slightly with subject is OK)
- Headline: bold weight, positioned in a clean zone or overlapping the subject at the midpoint
- Subheadline: lighter weight, below the headline
- CTA: subtle pill shape at the bottom, brand accent color
- Tagline: small, uppercase tracking, near the logo
- Clean, magazine-quality feel. No heavy overlays.`,

    convert: `STYLE: Conversion-focused ad asset.
- Subject photo as full-bleed background
- Headline: large and prominent in the biggest clean zone
- Subheadline: floating pill with frosted glass / semi-transparent background
- CTA: bold, high-contrast pill button — the most visually prominent element after the headline
- Tagline: near the logo, small
- Logo at the top with breathing room
- Every element must drive toward the CTA action`,

    campaign: `STYLE: Campaign hero asset.
- Headline: very large, bold, at the top of the image — heavy weight, tight tracking
- Subheadline: below the headline, lighter weight
- CTA: prominent pill button in the lower third
- Tagline: paired with the logo, centered
- Apply dramatic lighting and brand color palette enhancement
- The composition tells a story in three layers: headline → image → CTA`,

    urgency: `STYLE: High-energy urgency asset.
- Headline: RENDER IN ALL CAPS, very large (40-50% of canvas height for text block), heavy weight
- Subheadline: italic, warm, personal — immediately below the headline
- CTA: urgent, bold, high contrast pill — action words
- High-contrast treatment, deep shadows
- The text dominates — image supports the message, not the other way around`,

    awareness: `STYLE: Brand awareness — image is 95% of the communication.
- The image breathes — minimal text
- Logo: prominent, top or center
- Headline (if provided): small, elegant, one line
- CTA (if provided): subtle, bottom corner
- Apply subtle color grading to match brand aesthetic
- Let the image do the talking`,

    branding: `STYLE: Pure branding — the image IS the message.
- Transform the image to match the brand reference aesthetic (lighting, color grading, mood)
- Logo: visible but tasteful placement
- Headline (if provided): minimal, integrated into the image
- CTA (if provided): very subtle, small
- If brand references show a signature visual element, incorporate it
- Maximum visual cohesion with brand identity`,

    social_proof: `STYLE: Social proof / testimonial asset.
- Headline: render as a rating badge (star icon + text) at the top
- Subheadline: center as an elegant quote in italics
- CTA: bold, uppercase pill at the bottom
- Tagline: near the logo
- Subtle dark gradient overlay for text legibility
- Logo small in a corner
- Credibility and trust are the main emotions`,
  };

  const variationModifiers: Record<VariationMode, string> = {
    clean: 'VARIATION: Minimal. One clear message. Maximum breathing room. Editorial restraint. Only the most essential elements.',
    rich: 'VARIATION: Full brand expression. All text elements visible. Conversion optimized. Multiple visual layers.',
    bold: 'VARIATION: Maximum visual impact. Dramatic sizing. Large type. The composition is a statement. Bold colors.',
  };

  return `${baseContext}
${copyInstructions}

${intentionStyles[intention] || intentionStyles.editorial}

${variationModifiers[variationMode]}

OUTPUT REQUIREMENTS:
- Photographic quality, not illustrated or cartoon
- All provided text MUST appear in the image, legible and correctly spelled
- No watermarks, no UI elements, no design software artifacts
- Use brand colors for text and UI elements (pills, buttons)`;
}
