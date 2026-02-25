/**
 * nanoBanana.service.ts
 * Client for Nano Banana Pro (Gemini image generation).
 * Runs client-side — calls Google GenAI API directly.
 */

import { GoogleGenAI } from '@google/genai';

const MODEL_FAST = 'gemini-2.0-flash-preview-image-generation';
const MODEL_PRO = 'gemini-2.0-flash-preview-image-generation';

let aiClient: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (aiClient) return aiClient;
  const apiKey = localStorage.getItem('forge-google-ai-key') || import.meta.env.VITE_GOOGLE_AI_KEY;
  if (!apiKey) {
    throw new Error('Google AI API key not configured. Go to Settings to add your key.');
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
  modelTier: 'fast' | 'pro';
  thinkingMode?: boolean;
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
      responseModalities: ['IMAGE', 'TEXT'],
      ...(params.thinkingMode && {
        thinkingConfig: { thinkingBudget: 8000 },
      }),
    },
  });

  // Extract image from response
  const candidates = response.candidates;
  if (!candidates || candidates.length === 0) {
    throw new Error('Nano Banana Pro returned no candidates.');
  }

  const content = candidates[0].content;
  if (!content || !content.parts) {
    throw new Error('Nano Banana Pro returned empty content.');
  }

  for (const part of content.parts) {
    if (part.inlineData && part.inlineData.data) {
      return part.inlineData.data; // raw base64
    }
  }

  throw new Error('Nano Banana Pro did not return an image.');
}
