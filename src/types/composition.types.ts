export type IntentionType = 'convert' | 'awareness' | 'editorial' | 'campaign' | 'branding' | 'urgency' | 'social_proof';

export interface CopyInput {
  heading?: string;
  subheading?: string;
  cta?: string;
  tagline?: string;
  disclaimer?: string;
}

export type CopyRole = 'heading' | 'subheading' | 'cta' | 'tagline' | 'disclaimer';

export interface ImageAnalysis {
  subject_position: { x: number; y: number };
  subject_bbox: { x1: number; y1: number; x2: number; y2: number };
  clean_zones: string[];
  dominant_colors: string[];
  image_type: 'lifestyle_portrait' | 'product' | 'flat_lay' | 'landscape' | 'abstract';
  background_complexity: 'low' | 'medium' | 'high';
  text_contrast_zones: Record<string, 'low' | 'medium' | 'high'>;
  recommended_treatment: 'none' | 'overlay_subtle' | 'overlay_medium' | 'grain';
  subject_facing: 'left' | 'right' | 'center';
}

export interface CompositionElement {
  type: 'text' | 'logo' | 'pill' | 'rating_badge';
  role?: CopyRole;
  content?: string;
  position: { x: number; y: number };
  font_family?: string;
  font_weight?: number;
  font_size_px?: number;
  font_style?: 'normal' | 'italic';
  color?: string;
  alignment?: 'left' | 'center' | 'right';
  max_width_ratio?: number;
  text_transform?: 'none' | 'uppercase' | 'lowercase';
  scale?: number;
  background_color?: string;
  background_opacity?: number;
  border_radius?: number;
  padding?: number;
}

export interface CompositionInstruction {
  format: string;
  canvas: { width: number; height: number };
  image: {
    crop: { x: number; y: number; width: number; height: number };
    scale: 'cover' | 'contain' | 'fill';
    treatment: string;
  };
  elements: CompositionElement[];
  variation_seed: 1 | 2 | 3;
}

export interface GeneratedPiece {
  id: string;
  format_id: string;
  variation: 1 | 2 | 3;
  generation_mode: 'compositor' | 'generative';
  composition?: CompositionInstruction;
  canvas_state?: string; // Fabric.js serialized JSON
  preview_data_url?: string;
  edited: boolean;
}
