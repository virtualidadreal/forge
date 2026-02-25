/**
 * nanoBanana.service.ts
 * Client for Gemini image generation.
 * Runs client-side — calls Google GenAI API directly.
 * Tries gemini-2.5-flash-image (stable) first.
 */

import { GoogleGenAI } from '@google/genai';

const MODELS = ['gemini-2.5-flash-image', 'gemini-2.5-pro-preview-image-generation'] as const;

// Gemini supported aspect ratios
const SUPPORTED_RATIOS = ['1:1', '9:16', '16:9', '3:4', '4:3', '4:5', '5:4', '2:3', '3:2', '21:9'] as const;
type GeminiAspectRatio = typeof SUPPORTED_RATIOS[number];

/**
 * Map a format aspect_ratio string to the closest Gemini-supported ratio.
 */
function normalizeAspectRatio(ratio: string): GeminiAspectRatio {
  if (SUPPORTED_RATIOS.includes(ratio as GeminiAspectRatio)) {
    return ratio as GeminiAspectRatio;
  }
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

let aiClient: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (aiClient) return aiClient;
  const apiKey = localStorage.getItem('forge-google-ai-key') || import.meta.env.VITE_GOOGLE_AI_KEY;
  if (!apiKey) {
    throw new Error('Google AI API key not configured. Set VITE_GOOGLE_AI_KEY.');
  }
  aiClient = new GoogleGenAI({ apiKey });
  return aiClient;
}

/** Reset client (when key changes) */
export function resetNanoBananaClient(): void {
  aiClient = null;
}

export interface NanoBananaRequest {
  prompt: string;
  referenceImages: Array<{ data: string; mimeType: string; role?: string }>;
  aspectRatio?: string;
}

/**
 * Generate an image with Gemini image generation.
 * Tries models in order until one succeeds.
 * Returns raw base64 of the generated image.
 */
export async function generateWithNanoBanana(params: NanoBananaRequest): Promise<string> {
  const ai = getClient();

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

  const config = {
    responseModalities: ['TEXT', 'IMAGE'] as string[],
    ...(params.aspectRatio && {
      imageConfig: {
        aspectRatio: normalizeAspectRatio(params.aspectRatio),
      },
    }),
  };

  let lastError: Error | null = null;

  for (const model of MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [{ role: 'user', parts }],
        config,
      });

      // Extract image from response
      const candidates = response.candidates;
      if (!candidates || candidates.length === 0) {
        throw new Error(`${model}: no candidates returned.`);
      }

      const content = candidates[0].content;
      if (!content || !content.parts) {
        throw new Error(`${model}: empty content.`);
      }

      for (const part of content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return part.inlineData.data; // raw base64
        }
      }

      throw new Error(`${model}: no image in response.`);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`Model ${model} failed:`, lastError.message);
      // Try next model
    }
  }

  throw new Error(`Image generation failed: ${lastError?.message || 'All models failed'}`);
}
