import type { TreatmentConfig } from '../types/canvas.types';

// ---------------------------------------------------------------------------
// Treatment type catalogue — mirrors PRD-05 T-01 through T-09
// ---------------------------------------------------------------------------

export type TreatmentId =
  | 'none'
  | 'overlay'
  | 'duotone'
  | 'vignette'
  | 'blur'
  | 'grain'
  | 'grading'
  | 'frosted'
  | 'text_shadow'
  | 'text_outline';

export interface TreatmentPreset {
  id: TreatmentId;
  name: string;
  description: string;
  category: 'image' | 'text';
  default_config: TreatmentConfig;
}

export const TREATMENT_PRESETS: TreatmentPreset[] = [
  // ── IMAGE TREATMENTS ───────────────────────────────────────────────────
  {
    id: 'none',
    name: 'Ninguno',
    description: 'Sin tratamiento. Imagen original.',
    category: 'image',
    default_config: {
      type: 'none',
      intensity: 0,
    },
  },
  {
    id: 'overlay',
    name: 'Overlay de Color',
    description: 'Color solido de la paleta de marca con opacidad ajustable sobre la imagen completa.',
    category: 'image',
    default_config: {
      type: 'overlay',
      intensity: 0.3,
      color: '#000000',
      blend_mode: 'normal',
    },
  },
  {
    id: 'duotone',
    name: 'Duotono',
    description: 'Convierte la imagen a dos tonos de la paleta de marca. Firma visual de marcas de moda.',
    category: 'image',
    default_config: {
      type: 'duotone',
      intensity: 0.8,
      color: '#1a1a2e',         // shadow color
      secondary_color: '#e0e0e0', // highlight color
    },
  },
  {
    id: 'vignette',
    name: 'Vineta Editorial',
    description: 'Oscurece los bordes progresivamente. Dirige la atencion al sujeto principal.',
    category: 'image',
    default_config: {
      type: 'vignette',
      intensity: 0.3,
      color: '#000000',
    },
  },
  {
    id: 'blur',
    name: 'Blur Selectivo',
    description: 'Desenfoque gaussiano del fondo manteniendo el sujeto nitido.',
    category: 'image',
    default_config: {
      type: 'blur',
      intensity: 0.5,
    },
  },
  {
    id: 'grain',
    name: 'Grain Cinematografico',
    description: 'Textura de grano analogico. Una foto de iPhone que parece pelicula fotografica.',
    category: 'image',
    default_config: {
      type: 'grain',
      intensity: 0.15,
      grain_size: 'fine',
    },
  },
  {
    id: 'grading',
    name: 'Color Grading',
    description: 'Ajusta temperatura, contraste, saturacion y curvas tonales con presets profesionales.',
    category: 'image',
    default_config: {
      type: 'grading',
      intensity: 0.7,
      preset: 'clean_neutral',
    },
  },

  // ── TEXT TREATMENTS ────────────────────────────────────────────────────
  {
    id: 'frosted',
    name: 'Frosted Glass',
    description: 'Fondo de vidrio esmerilado detras del texto. Legibilidad total en fondos complejos.',
    category: 'text',
    default_config: {
      type: 'frosted',
      intensity: 0.3,
      color: '#ffffff',
      blend_mode: 'normal',
    },
  },
  {
    id: 'text_shadow',
    name: 'Sombra Editorial',
    description: 'Sombra muy difusa y sutil bajo el texto. Oscurecimiento de area, no sombra clasica.',
    category: 'text',
    default_config: {
      type: 'text_shadow',
      intensity: 0.2,
      color: '#000000',
    },
  },
  {
    id: 'text_outline',
    name: 'Texto con Trazo',
    description: 'Outline del color de la paleta alrededor de las letras. Firma de moda urbana y streetwear.',
    category: 'text',
    default_config: {
      type: 'text_outline',
      intensity: 0.8,
      color: '#ffffff',
    },
  },
];

// ---------------------------------------------------------------------------
// Color grading presets — from PRD-05 T-06
// ---------------------------------------------------------------------------

export type ColorGradingPresetId =
  | 'warm_lifestyle'
  | 'cold_editorial'
  | 'high_contrast_urban'
  | 'faded_vintage'
  | 'clean_neutral';

export interface ColorGradingPreset {
  id: ColorGradingPresetId;
  name: string;
  description: string;
  adjustments: {
    temperature: number;   // -100 to +100 (negative = cold, positive = warm)
    contrast: number;       // -100 to +100
    saturation: number;     // -100 to +100
    shadow_lift: number;    // 0 to 100 (lifts the blacks)
    highlight_tint: string | null; // hex color tint for highlights
    shadow_tint: string | null;    // hex color tint for shadows
  };
}

export const COLOR_GRADING_PRESETS: ColorGradingPreset[] = [
  {
    id: 'warm_lifestyle',
    name: 'Warm Lifestyle',
    description: 'Temperatura calida, saturacion +10, sombras marrones. Lifestyle, hogar, moda casual.',
    adjustments: {
      temperature: 15,
      contrast: 5,
      saturation: 10,
      shadow_lift: 0,
      highlight_tint: null,
      shadow_tint: '#8B6914',
    },
  },
  {
    id: 'cold_editorial',
    name: 'Cold Editorial',
    description: 'Temperatura fria, contraste +15, sombras azul-negro. Streetwear, moda contemporanea.',
    adjustments: {
      temperature: -20,
      contrast: 15,
      saturation: 0,
      shadow_lift: 0,
      highlight_tint: null,
      shadow_tint: '#1a1a2e',
    },
  },
  {
    id: 'high_contrast_urban',
    name: 'High Contrast Urban',
    description: 'Contraste maximo, saturacion -10, negros profundos. Marcas con actitud, streetwear agresivo.',
    adjustments: {
      temperature: 0,
      contrast: 30,
      saturation: -10,
      shadow_lift: 0,
      highlight_tint: null,
      shadow_tint: null,
    },
  },
  {
    id: 'faded_vintage',
    name: 'Faded Vintage',
    description: 'Saturacion -20, negros levantados, amarillo en medios tonos. Estetica retro o nostalgica.',
    adjustments: {
      temperature: 5,
      contrast: -5,
      saturation: -20,
      shadow_lift: 30,
      highlight_tint: null,
      shadow_tint: '#8B8000',
    },
  },
  {
    id: 'clean_neutral',
    name: 'Clean Neutral',
    description: 'Sin cambios. Imagen tal cual.',
    adjustments: {
      temperature: 0,
      contrast: 0,
      saturation: 0,
      shadow_lift: 0,
      highlight_tint: null,
      shadow_tint: null,
    },
  },
];

// ---------------------------------------------------------------------------
// Intention-to-treatment recommended combos — from PRD-05 table
// ---------------------------------------------------------------------------

import type { IntentionType } from '../types/composition.types';

export interface IntentionTreatmentCombo {
  intention: IntentionType;
  primary: TreatmentId;
  secondary: TreatmentId;
}

export const INTENTION_TREATMENT_COMBOS: IntentionTreatmentCombo[] = [
  { intention: 'convert',      primary: 'overlay',  secondary: 'vignette' },
  { intention: 'awareness',    primary: 'none',     secondary: 'vignette' },
  { intention: 'editorial',    primary: 'none',     secondary: 'grain'    },
  { intention: 'campaign',     primary: 'overlay',  secondary: 'vignette' },
  { intention: 'branding',     primary: 'grain',    secondary: 'duotone'  },
  { intention: 'urgency',      primary: 'none',     secondary: 'grain'    },
  { intention: 'social_proof', primary: 'overlay',  secondary: 'none'     },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getTreatmentPresetById(id: TreatmentId): TreatmentPreset | undefined {
  return TREATMENT_PRESETS.find((t) => t.id === id);
}

export function getImageTreatments(): TreatmentPreset[] {
  return TREATMENT_PRESETS.filter((t) => t.category === 'image');
}

export function getTextTreatments(): TreatmentPreset[] {
  return TREATMENT_PRESETS.filter((t) => t.category === 'text');
}

export function getGradingPresetById(id: ColorGradingPresetId): ColorGradingPreset | undefined {
  return COLOR_GRADING_PRESETS.find((p) => p.id === id);
}

export function getRecommendedTreatments(intention: IntentionType): IntentionTreatmentCombo | undefined {
  return INTENTION_TREATMENT_COMBOS.find((c) => c.intention === intention);
}
