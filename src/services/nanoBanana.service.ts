/**
 * nanoBanana.service.ts
 * Client for Nano Banana Pro (Gemini image generation).
 * Runs client-side — calls Google GenAI API directly.
 */

import { GoogleGenAI } from '@google/genai';

const MODEL_FAST = 'gemini-2.5-flash-image';
const MODEL_PRO = 'gemini-3-pro-image-preview';

let aiClient: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (aiClient) return aiClient;
  const apiKey = localStorage.getItem('forge-google-ai-key') || import.meta.env.VITE_GOOGLE_AI_KEY;
  if (!apiKey) {
    throw new Error('Google AI API key not configured.');
  }
  aiClient = new GoogleGenAI({ apiKey });
  return aiClient;
}

/** Reset client (when key changes) */
export function resetNanoBananaClient(): void {
  aiClient = null;
}

// Gemini supported aspect ratios
const SUPPORTED_RATIOS = ['1:1', '9:16', '16:9', '3:4', '4:3', '4:5', '5:4', '2:3', '3:2', '21:9'] as const;
type GeminiAspectRatio = typeof SUPPORTED_RATIOS[number];

/**
 * Map a format aspect_ratio string to the closest Gemini-supported ratio.
 */
function normalizeAspectRatio(ratio: string): GeminiAspectRatio {
  // Direct match
  if (SUPPORTED_RATIOS.includes(ratio as GeminiAspectRatio)) {
    return ratio as GeminiAspectRatio;
  }
  // Parse ratio as decimal
  const parts = ratio.split(':').map(Number);
  if (parts.length !== 2 || !parts[0] || !parts[1]) return '1:1';
  const target = parts[0] / parts[1];

  let best: GeminiAspectRatio = '1:1';
  let bestDiff = Infinity;
  for (const r of SUPPORTED_RATIOS) {
    const [a, b] = r.split(':').map(Number);
    const diff = Math.abs(a / b - target);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = r;
    }
  }
  return best;
}

export interface NanoBananaRequest {
  prompt: string;
  referenceImages: Array<{ data: string; mimeType: string; role?: string }>;
  modelTier: 'fast' | 'pro';
  aspectRatio?: string;
}

/**
 * Generate or transform an image with Nano Banana Pro.
 * Accepts up to 14 reference images.
 * Returns base64 PNG of the generated image.
 */
export async function generateWithNanoBanana(params: NanoBananaRequest): Promise<string> {
  const ai = getClient();
  const model = params.modelTier === 'pro' ? MODEL_PRO : MODEL_FAST;

  // Build multimodal content parts
  const parts: Array<{ text?: string; inlineData?: { data: string; mimeType: string } }> = [];

  for (const ref of params.referenceImages) {
    if (ref.role) {
      parts.push({ text: ref.role });
    }
    parts.push({
      inlineData: { data: ref.data, mimeType: ref.mimeType },
    });
  }

  // Add the prompt last
  parts.push({ text: params.prompt });

  const response = await ai.models.generateContent({
    model,
    contents: [{ role: 'user', parts }],
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
      ...(params.aspectRatio && {
        imageConfig: {
          aspectRatio: normalizeAspectRatio(params.aspectRatio),
        },
      }),
    },
  });

  // Extract image from response
  const candidates = response.candidates;
  if (!candidates || candidates.length === 0) {
    throw new Error('Gemini returned no candidates.');
  }

  const content = candidates[0].content;
  if (!content || !content.parts) {
    throw new Error('Gemini returned empty content.');
  }

  for (const part of content.parts) {
    if (part.inlineData && part.inlineData.data) {
      return part.inlineData.data; // raw base64
    }
  }

  throw new Error('Gemini did not return an image.');
}
