export interface BrandPalette {
  background: string;
  text_primary: string;
  text_secondary: string;
  accent: string | null;
  pill_background: string;
  pill_text: string;
  overlay_color: string | null;
  overlay_opacity: number;
}

export interface BrandTypography {
  heading_weight: 'heavy' | 'bold' | 'medium' | 'light';
  heading_case: 'uppercase' | 'mixed' | 'lowercase';
  mix_weights_in_heading: boolean;
  secondary_weight: 'bold' | 'medium' | 'regular' | 'light';
  secondary_style: 'normal' | 'italic';
  uses_uppercase_headlines: boolean;
  uses_italic: boolean;
  headline_to_sub_ratio: number;
  preferred_font_style: 'editorial-sans' | 'editorial-serif' | 'geometric-sans' | 'display' | 'neutral';
}

export interface BrandComposition {
  text_zone: 'on_subject' | 'clean_zone' | 'edge';
  preferred_text_positions: string[];
  alignment: 'left' | 'center' | 'right';
  density: 'dense' | 'balanced' | 'editorial-sparse';
  logo_positions: string[];
  logo_with_tagline: boolean;
  breathing_room: 'tight' | 'normal' | 'generous';
}

export interface BrandImageTreatment {
  preferred_treatment: 'none' | 'overlay_subtle' | 'overlay_medium' | 'grain' | 'duotone';
  overlay_intensity: number;
  uses_grain: boolean;
  uses_blur: boolean;
  color_grading_preset: string | null;
}

export interface BrandCopyTone {
  formality: 'formal' | 'casual';
  urgency_level: 'low' | 'medium' | 'high';
  emotional_weight: 'cold' | 'neutral' | 'warm';
  grammatical_person: '2nd_person' | 'imperative' | 'descriptive';
  avg_headline_words: number;
  uses_punctuation_for_style: boolean;
}

export interface BrandDNA {
  brand_id: string;
  brand_name: string;
  tagline?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
  palette: BrandPalette;
  typography: BrandTypography;
  composition: BrandComposition;
  signature_elements: string[];
  image_treatment: BrandImageTreatment;
  copy_tone: BrandCopyTone;
  reference_assets_count: number;
  confidence_score: number;
  /** Compressed reference asset data URLs for generative mode */
  reference_assets?: string[];
}
