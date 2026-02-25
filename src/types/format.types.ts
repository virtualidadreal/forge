export type PlatformId = 'instagram' | 'tiktok' | 'linkedin' | 'twitter' | 'meta_ads' | 'google_display' | 'ecommerce' | 'email' | 'pinterest';

export interface FormatSpec {
  id: string;
  name: string;
  platform: PlatformId;
  platform_label: string;
  width: number;
  height: number;
  aspect_ratio: string;
  file_format: 'jpg' | 'png';
  compression: number;
  safe_zones?: {
    top: number;
    bottom: number;
  };
  notes?: string;
  slug: string;
}

export interface FormatPack {
  id: string;
  name: string;
  format_ids: string[];
}
