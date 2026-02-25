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

  if (lines.length === 0) return 'No text provided — only add the logo if available.';
  return lines.join('\n');
}

export function buildGenerativePrompt(params: GenerativePromptParams): string {
  const { intention, copy, brandDNA, format, variationMode } = params;

  const copyBlock = buildCopyBlock(copy);
  const hasCopy = !!(copy.heading || copy.subheading || copy.cta || copy.tagline);

  // Core instruction: NEVER modify the photo
  const baseContext = `You are a professional graphic designer creating a brand asset.

ABSOLUTE RULE — DO NOT MODIFY THE ORIGINAL PHOTO:
- The subject photo (Image 1) must remain EXACTLY as it is — same person, same pose, same clothing, same colors, same lighting, same background.
- DO NOT alter, retouch, recolor, crop, blur, or transform the photo in any way.
- Your ONLY job is to ADD graphic elements ON TOP of the photo: text, logo, buttons, pills, overlays, badges.
- Think of it like placing stickers and text layers on top of a printed photo.

Format: ${format.name}, ${format.width}x${format.height}px, aspect ratio ${format.aspect_ratio}.
Brand: "${brandDNA.brand_name}".
Brand colors: background ${brandDNA.palette.background}, primary text ${brandDNA.palette.text_primary}, secondary text ${brandDNA.palette.text_secondary}, accent ${brandDNA.palette.accent || 'white'}, pill background ${brandDNA.palette.pill_background}, pill text ${brandDNA.palette.pill_text}.
Typography: ${brandDNA.typography.preferred_font_style}, headings ${brandDNA.typography.heading_weight} ${brandDNA.typography.heading_case}.`;

  const copyInstructions = hasCopy ? `

TEXT ELEMENTS TO ADD ON TOP OF THE PHOTO (ALL must appear):
${copyBlock}

TEXT RENDERING RULES:
- Render ALL text elements listed above — do not skip any
- Use the brand colors specified above
- HEADLINE: large, ${brandDNA.palette.text_primary}, ${brandDNA.typography.heading_weight} weight${brandDNA.typography.uses_uppercase_headlines ? ', ALL CAPS' : ''}
- SUBHEADLINE: smaller, ${brandDNA.palette.text_secondary}, lighter weight
- CTA BUTTON: pill/button shape with background ${brandDNA.palette.accent || brandDNA.palette.pill_background}, text ${brandDNA.palette.pill_text}, bold, uppercase
- TAGLINE: very small, uppercase, wide letter-spacing, near the logo
- DISCLAIMER: tiny text at the bottom edge
- All text must be perfectly legible, correctly spelled, and sharp` : '';

  const intentionStyles: Record<string, string> = {
    editorial: `LAYOUT STYLE — Editorial:
- Photo fills the entire canvas
- Add a subtle gradient overlay at the bottom (transparent to semi-dark) for text legibility
- Place headline in the lower third, overlapping slightly with the subject
- Subheadline below the headline
- CTA as a subtle pill at the bottom
- Logo small in a corner
- Tagline near the logo`,

    convert: `LAYOUT STYLE — Conversion:
- Photo fills the entire canvas
- Add a gradient overlay where text will be placed
- Headline: large, in the biggest clean area (usually top or bottom)
- Subheadline: as a floating pill with semi-transparent background
- CTA: THE most prominent element — large pill button, high contrast, impossible to miss
- Logo at the top with breathing room
- Tagline paired with logo`,

    campaign: `LAYOUT STYLE — Campaign:
- Photo fills the entire canvas
- Add a gradient overlay at top and/or bottom for text zones
- Headline: very large, top of the image, heavy weight
- Subheadline: below headline, lighter
- CTA: prominent pill in the lower third
- Logo + tagline centered together
- Three visual layers: headline zone → photo → CTA zone`,

    urgency: `LAYOUT STYLE — Urgency:
- Photo fills the entire canvas
- Add a stronger dark overlay to make text dominate
- Headline: VERY LARGE, ALL CAPS, heavy weight — takes 40% of canvas
- Subheadline: italic, warm tone, right below
- CTA: bold, urgent, high contrast pill
- The text dominates the composition — the photo is secondary`,

    awareness: `LAYOUT STYLE — Awareness:
- Photo fills the entire canvas, minimal overlay
- Logo: prominent placement (top center or center)
- Headline (if provided): small, elegant, one line
- CTA (if provided): very subtle, small pill at bottom
- Maximum breathing room — let the photo speak`,

    branding: `LAYOUT STYLE — Branding:
- Photo fills the entire canvas, no overlay
- Logo: tasteful, visible placement
- Headline (if provided): minimal, small
- CTA (if provided): subtle, tiny
- Almost no graphic additions — just logo and maybe one line of text`,

    social_proof: `LAYOUT STYLE — Social Proof:
- Photo fills the entire canvas
- Add dark gradient overlay for legibility
- Rating badge at the top (star icon + headline text)
- Quote/subheadline centered, italic, in quotation marks
- CTA: bold pill at the bottom
- Logo small in corner`,
  };

  const variationModifiers: Record<VariationMode, string> = {
    clean: 'VARIATION: Minimal elements. Maximum breathing room. Only the essentials.',
    rich: 'VARIATION: Full expression. All text elements prominent. Multiple graphic layers.',
    bold: 'VARIATION: Maximum impact. Oversized text. Dramatic contrast. Bold statement.',
  };

  return `${baseContext}
${copyInstructions}

${intentionStyles[intention] || intentionStyles.editorial}

${variationModifiers[variationMode]}

REMEMBER: The original photo must NOT be modified. Only add graphic elements on top.`;
}
