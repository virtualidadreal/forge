export interface TreatmentConfig {
  type: 'none' | 'overlay' | 'duotone' | 'vignette' | 'blur' | 'grain' | 'grading' | 'frosted' | 'text_shadow' | 'text_outline';
  intensity: number;
  color?: string;
  secondary_color?: string;
  blend_mode?: 'normal' | 'multiply' | 'screen';
  preset?: 'warm_lifestyle' | 'cold_editorial' | 'high_contrast_urban' | 'faded_vintage' | 'clean_neutral';
  grain_size?: 'fine' | 'medium' | 'coarse';
}

export interface SessionData {
  brand_dna_id: string | null;
  image_data_url: string | null;
  image_file_name: string | null;
  copy: import('./composition.types').CopyInput;
  intention: import('./composition.types').IntentionType;
  selected_formats: string[];
  generated_pieces: import('./composition.types').GeneratedPiece[];
}

export interface CampaignEntry {
  campaign_id: string;
  campaign_name: string;
  created_at: string;
  brand_dna_id: string;
  brand_name: string;
  intention: import('./composition.types').IntentionType;
  copy: import('./composition.types').CopyInput;
  source_image_thumbnail: string;
  formats_generated: string[];
  formats_exported: string[];
  canvas_states: Record<string, string>;
  export_count: number;
  last_exported_at: string | null;
}
