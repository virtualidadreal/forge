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

export function buildGenerativePrompt(params: GenerativePromptParams): string {
  const { intention, copy, brandDNA, format, variationMode } = params;

  const baseContext = `You are creating a professional brand campaign asset.
Format: ${format.name}, ${format.width}×${format.height}px, aspect ratio ${format.aspect_ratio}.
Brand: ${brandDNA.brand_name}. Tone: ${brandDNA.copy_tone.formality}, ${brandDNA.copy_tone.emotional_weight}.
Image 1 is the main subject photo. The following images are brand style references. The last image (if PNG) is the brand logo.`;

  const intentionPrompts: Record<string, string> = {
    editorial: `Create a fashion editorial composition.
The subject photo is the hero — preserve the person and their outfit exactly.
Apply the visual aesthetic, lighting mood, and color treatment from the brand reference images.
${copy.heading ? `Text to integrate directly into the image: "${copy.heading}" — bold weight, positioned at the natural midpoint of the composition, overlapping slightly with the subject.` : 'No text needed.'}
${copy.subheading ? `Secondary text: "${copy.subheading}" — lighter weight below the headline.` : ''}
No borders, no backgrounds behind the text. The typography is part of the image.`,

    convert: `Create a conversion-focused brand asset.
Subject photo as background, full bleed. Preserve the person exactly.
${copy.heading ? `Place the headline "${copy.heading}" prominently in a clean zone.` : ''}
${copy.subheading ? `Add a floating pill element with frosted glass style: "${copy.subheading}"` : ''}
${copy.cta ? `Add a CTA pill: "${copy.cta}" — bold, high contrast, action-oriented.` : ''}
Place the brand logo at the top with breathing room.
Pills should have soft, semi-transparent backgrounds that complement the image.`,

    campaign: `Create a full campaign hero asset.
${copy.heading ? `Place a large, bold headline at the top: "${copy.heading}" — heavy weight, left-aligned, white, tight tracking.` : ''}
The headline should sit in the clean zone at the top of the image.
${copy.tagline || copy.subheading ? `In the middle-lower area, place the brand logo with tagline: "${copy.tagline || copy.subheading}".` : 'Place the brand logo in the middle-lower area.'}
Apply dramatic lighting and the brand's color palette to enhance the image.`,

    urgency: `Create a high-energy urgency asset.
${copy.heading ? `Large ALL CAPS headline: "${copy.heading.toUpperCase()}"` : ''}
${copy.subheading ? `Followed immediately by italic warm subtext: "${copy.subheading}"` : ''}
The headline dominates the composition — 40-50% of the canvas height in total text block.
Apply high-contrast treatment. Deep shadows. The image supports the text, not the opposite.`,

    awareness: `Brand awareness asset. Image is 95% of the communication.
Place only the brand logo at the top center.
Nothing else. Let the image breathe.
Apply subtle enhancement to match the brand reference aesthetic.`,

    branding: `Pure branding asset. The image IS the message.
No text. No overlay. No elements.
Transform the image to fully match the aesthetic of the brand reference images:
lighting, color grading, mood, atmosphere — everything aligned with brand references.
If there's a signature visual element in the references, incorporate it subtly.`,

    social_proof: `Social proof / testimonial asset.
${copy.heading ? `Add a rating badge at the top: "★ ${copy.heading}"` : 'Add a rating badge: "★ 4.9"'}
${copy.subheading ? `Center a quote: "${copy.subheading}" — italic, elegant.` : ''}
${copy.cta ? `Bottom CTA: "${copy.cta}" — bold, uppercase.` : ''}
Apply a subtle dark overlay for text legibility. Brand logo small in corner.`,
  };

  const variationModifiers: Record<VariationMode, string> = {
    clean: 'Minimal. One clear message. Maximum breathing room. Editorial restraint.',
    rich: 'Full brand expression. Multiple elements. Conversion optimized. All brand assets visible.',
    bold: 'Maximum visual impact. Dramatic. Large type. The composition is a statement.',
  };

  return `${baseContext}

${intentionPrompts[intention] || intentionPrompts.editorial}

COMPOSITION RULES (from brand references):
- Color palette: derive from reference images, do not invent colors
- Typography weight and style: match the brand's typographic voice from references
- Spacing and breathing room: match the density seen in reference images
- Logo placement: always consistent with brand references

VARIATION MODE: ${variationModifiers[variationMode]}

OUTPUT SPECS:
- Exact dimensions: ${format.width}×${format.height}px
- Photographic quality, not illustrated
- Text must be legible and correctly spelled
- No watermarks, no UI elements from design software in the output`;
}
