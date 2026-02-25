import type { IntentionType } from '../types/composition.types';

export interface IntentionConfig {
  id: IntentionType;
  name: string;
  description: string;
  icon: string;
  color_token: string;
  composition_rules: {
    text_zone: string;
    overlay: string;
    elements: string[];
    logo_scale: number;
    heading_size_range: [number, number]; // min-max px at 1080px
    heading_weight_range: [number, number];
    density: string;
    breathing_room_multiplier: number;
  };
}

export const INTENTIONS: IntentionConfig[] = [
  // ── CONVERT ────────────────────────────────────────────────────────────
  {
    id: 'convert',
    name: 'Convert',
    description: 'Clicks y ventas directas. CTA prominente, pills de beneficios, jerarquia persuasiva.',
    icon: '\u{1F3AF}', // target
    color_token: '--color-intention-convert',
    composition_rules: {
      text_zone: 'clean_zone',
      overlay: 'subtle',
      elements: ['heading', 'subheading', 'cta', 'pill', 'logo'],
      logo_scale: 0.8,
      heading_size_range: [48, 72],
      heading_weight_range: [700, 900],
      density: 'dense',
      breathing_room_multiplier: 0.8,
    },
  },

  // ── AWARENESS ──────────────────────────────────────────────────────────
  {
    id: 'awareness',
    name: 'Awareness',
    description: 'Presencia de marca sin presion de compra. Imagen protagonista, logo prominente, sin CTA.',
    icon: '\u{1F441}\u{FE0F}', // eye
    color_token: '--color-intention-awareness',
    composition_rules: {
      text_zone: 'clean_zone',
      overlay: 'none',
      elements: ['heading', 'logo'],
      logo_scale: 1.2,
      heading_size_range: [36, 56],
      heading_weight_range: [400, 500],
      density: 'editorial-sparse',
      breathing_room_multiplier: 1.5,
    },
  },

  // ── EDITORIAL ──────────────────────────────────────────────────────────
  {
    id: 'editorial',
    name: 'Editorial',
    description: 'Contenido que parece organico. Mix de pesos tipograficos, texto inline sobre la imagen.',
    icon: '\u{1F4F0}', // newspaper
    color_token: '--color-intention-editorial',
    composition_rules: {
      text_zone: 'on_subject',
      overlay: 'none',
      elements: ['heading'],
      logo_scale: 0.5,
      heading_size_range: [40, 64],
      heading_weight_range: [400, 700],
      density: 'editorial-sparse',
      breathing_room_multiplier: 1.3,
    },
  },

  // ── CAMPAIGN ───────────────────────────────────────────────────────────
  {
    id: 'campaign',
    name: 'Campaign',
    description: 'Pieza de campana completa. Titular hero, logo con tagline, narrativa en tres capas.',
    icon: '\u{1F680}', // rocket
    color_token: '--color-intention-campaign',
    composition_rules: {
      text_zone: 'edge',
      overlay: 'medium',
      elements: ['heading', 'subheading', 'tagline', 'logo'],
      logo_scale: 1.0,
      heading_size_range: [64, 96],
      heading_weight_range: [700, 900],
      density: 'balanced',
      breathing_room_multiplier: 1.0,
    },
  },

  // ── BRANDING ───────────────────────────────────────────────────────────
  {
    id: 'branding',
    name: 'Branding',
    description: 'Reconocimiento de marca puro. Sin texto o texto minimo. La imagen es el 95-100% de la comunicacion.',
    icon: '\u{2728}', // sparkles
    color_token: '--color-intention-branding',
    composition_rules: {
      text_zone: 'edge',
      overlay: 'none',
      elements: ['logo'],
      logo_scale: 0.7,
      heading_size_range: [0, 36],
      heading_weight_range: [400, 500],
      density: 'editorial-sparse',
      breathing_room_multiplier: 2.0,
    },
  },

  // ── URGENCY ────────────────────────────────────────────────────────────
  {
    id: 'urgency',
    name: 'Urgency',
    description: 'Velocidad + calidez. Titular heavy en mayusculas, subtitulo en cursiva personal.',
    icon: '\u{26A1}', // lightning
    color_token: '--color-intention-urgency',
    composition_rules: {
      text_zone: 'clean_zone',
      overlay: 'none',
      elements: ['heading', 'subheading', 'logo'],
      logo_scale: 0.6,
      heading_size_range: [56, 88],
      heading_weight_range: [800, 900],
      density: 'balanced',
      breathing_room_multiplier: 0.9,
    },
  },

  // ── SOCIAL PROOF ───────────────────────────────────────────────────────
  {
    id: 'social_proof',
    name: 'Social Proof',
    description: 'Credibilidad visual. Rating badge, quote de review, CTA tras la prueba social.',
    icon: '\u{2B50}', // star
    color_token: '--color-intention-social-proof',
    composition_rules: {
      text_zone: 'clean_zone',
      overlay: 'subtle',
      elements: ['heading', 'subheading', 'cta', 'rating_badge', 'logo'],
      logo_scale: 0.7,
      heading_size_range: [36, 56],
      heading_weight_range: [500, 700],
      density: 'balanced',
      breathing_room_multiplier: 1.1,
    },
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getIntentionById(id: IntentionType): IntentionConfig | undefined {
  return INTENTIONS.find((i) => i.id === id);
}

export const INTENTION_IDS = INTENTIONS.map((i) => i.id);
