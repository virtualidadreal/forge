import type { FormatSpec, FormatPack, PlatformId } from '../types/format.types';

// ---------------------------------------------------------------------------
// 26 production formats — exact specs from PRD-07
// ---------------------------------------------------------------------------

export const FORMATS: FormatSpec[] = [
  // ── INSTAGRAM (4) ──────────────────────────────────────────────────────
  {
    id: 'ig_feed_square',
    name: 'Instagram Feed Cuadrado',
    platform: 'instagram',
    platform_label: 'Instagram',
    width: 1080,
    height: 1080,
    aspect_ratio: '1:1',
    file_format: 'jpg',
    compression: 85,
    notes: 'Post estandar',
    slug: 'instagram-feed-square',
  },
  {
    id: 'ig_feed_portrait',
    name: 'Instagram Feed Portrait',
    platform: 'instagram',
    platform_label: 'Instagram',
    width: 1080,
    height: 1350,
    aspect_ratio: '4:5',
    file_format: 'jpg',
    compression: 85,
    notes: 'Maximo espacio en feed',
    slug: 'instagram-feed-portrait',
  },
  {
    id: 'ig_stories',
    name: 'Instagram Stories',
    platform: 'instagram',
    platform_label: 'Instagram',
    width: 1080,
    height: 1920,
    aspect_ratio: '9:16',
    file_format: 'jpg',
    compression: 85,
    safe_zones: { top: 250, bottom: 250 },
    notes: 'Safe zone: 250px top y bottom',
    slug: 'instagram-stories',
  },
  {
    id: 'ig_reels_cover',
    name: 'Instagram Reels Cover',
    platform: 'instagram',
    platform_label: 'Instagram',
    width: 1080,
    height: 1920,
    aspect_ratio: '9:16',
    file_format: 'jpg',
    compression: 85,
    notes: 'Igual que Stories',
    slug: 'instagram-reels-cover',
  },

  // ── TIKTOK (2) ─────────────────────────────────────────────────────────
  {
    id: 'tt_video_cover',
    name: 'TikTok Video Cover',
    platform: 'tiktok',
    platform_label: 'TikTok',
    width: 1080,
    height: 1920,
    aspect_ratio: '9:16',
    file_format: 'jpg',
    compression: 85,
    safe_zones: { top: 200, bottom: 200 },
    notes: 'Safe zone: 200px top y bottom',
    slug: 'tiktok-video-cover',
  },
  {
    id: 'tt_profile_banner',
    name: 'TikTok Profile Banner',
    platform: 'tiktok',
    platform_label: 'TikTok',
    width: 1500,
    height: 500,
    aspect_ratio: '3:1',
    file_format: 'jpg',
    compression: 85,
    notes: 'Fondo de perfil',
    slug: 'tiktok-profile-banner',
  },

  // ── LINKEDIN (3) ───────────────────────────────────────────────────────
  {
    id: 'li_post',
    name: 'LinkedIn Post',
    platform: 'linkedin',
    platform_label: 'LinkedIn',
    width: 1200,
    height: 628,
    aspect_ratio: '1.91:1',
    file_format: 'jpg',
    compression: 90,
    notes: 'Imagen adjunta a post',
    slug: 'linkedin-post',
  },
  {
    id: 'li_article_cover',
    name: 'LinkedIn Articulo Cover',
    platform: 'linkedin',
    platform_label: 'LinkedIn',
    width: 1920,
    height: 1080,
    aspect_ratio: '16:9',
    file_format: 'jpg',
    compression: 85,
    notes: 'Portada de articulo',
    slug: 'linkedin-article-cover',
  },
  {
    id: 'li_banner',
    name: 'LinkedIn Banner de Perfil',
    platform: 'linkedin',
    platform_label: 'LinkedIn',
    width: 1584,
    height: 396,
    aspect_ratio: '4:1',
    file_format: 'jpg',
    compression: 90,
    notes: 'Empresa o persona',
    slug: 'linkedin-banner',
  },

  // ── TWITTER / X (2) ────────────────────────────────────────────────────
  {
    id: 'tw_post',
    name: 'Twitter/X Post',
    platform: 'twitter',
    platform_label: 'Twitter / X',
    width: 1600,
    height: 900,
    aspect_ratio: '16:9',
    file_format: 'jpg',
    compression: 85,
    notes: 'Imagen en tweet',
    slug: 'twitter-post',
  },
  {
    id: 'tw_header',
    name: 'Twitter/X Header',
    platform: 'twitter',
    platform_label: 'Twitter / X',
    width: 1500,
    height: 500,
    aspect_ratio: '3:1',
    file_format: 'jpg',
    compression: 85,
    notes: 'Banner del perfil',
    slug: 'twitter-header',
  },

  // ── META ADS (4) ───────────────────────────────────────────────────────
  {
    id: 'meta_feed_square',
    name: 'Meta Ad Feed Cuadrado',
    platform: 'meta_ads',
    platform_label: 'Meta Ads',
    width: 1080,
    height: 1080,
    aspect_ratio: '1:1',
    file_format: 'jpg',
    compression: 90,
    notes: 'Texto maximo 20% de area',
    slug: 'meta-feed-square',
  },
  {
    id: 'meta_feed_landscape',
    name: 'Meta Ad Feed Landscape',
    platform: 'meta_ads',
    platform_label: 'Meta Ads',
    width: 1200,
    height: 628,
    aspect_ratio: '1.91:1',
    file_format: 'jpg',
    compression: 90,
    notes: 'Formato mas comun',
    slug: 'meta-feed-landscape',
  },
  {
    id: 'meta_story_ad',
    name: 'Meta Story Ad',
    platform: 'meta_ads',
    platform_label: 'Meta Ads',
    width: 1080,
    height: 1920,
    aspect_ratio: '9:16',
    file_format: 'jpg',
    compression: 85,
    safe_zones: { top: 250, bottom: 250 },
    notes: 'Safe zone igual que IG Stories',
    slug: 'meta-story-ad',
  },
  {
    id: 'meta_carousel_card',
    name: 'Meta Carrusel Card',
    platform: 'meta_ads',
    platform_label: 'Meta Ads',
    width: 1080,
    height: 1080,
    aspect_ratio: '1:1',
    file_format: 'jpg',
    compression: 90,
    notes: 'Mismo formato que feed cuadrado',
    slug: 'meta-carousel-card',
  },

  // ── GOOGLE DISPLAY NETWORK (5) ─────────────────────────────────────────
  {
    id: 'gdn_leaderboard',
    name: 'Leaderboard',
    platform: 'google_display',
    platform_label: 'Google Display',
    width: 728,
    height: 90,
    aspect_ratio: '8.09:1',
    file_format: 'jpg',
    compression: 90,
    notes: 'El mas usado en web desktop',
    slug: 'gdn-leaderboard',
  },
  {
    id: 'gdn_medium_rect',
    name: 'Medium Rectangle',
    platform: 'google_display',
    platform_label: 'Google Display',
    width: 300,
    height: 250,
    aspect_ratio: '1.2:1',
    file_format: 'jpg',
    compression: 90,
    notes: 'El formato mas comun de GDN',
    slug: 'gdn-medium-rectangle',
  },
  {
    id: 'gdn_half_page',
    name: 'Half Page',
    platform: 'google_display',
    platform_label: 'Google Display',
    width: 300,
    height: 600,
    aspect_ratio: '1:2',
    file_format: 'jpg',
    compression: 90,
    notes: 'Alto impacto',
    slug: 'gdn-half-page',
  },
  {
    id: 'gdn_large_rect',
    name: 'Large Rectangle',
    platform: 'google_display',
    platform_label: 'Google Display',
    width: 336,
    height: 280,
    aspect_ratio: '1.2:1',
    file_format: 'jpg',
    compression: 90,
    notes: 'Alternativa al Medium',
    slug: 'gdn-large-rectangle',
  },
  {
    id: 'gdn_billboard',
    name: 'Billboard',
    platform: 'google_display',
    platform_label: 'Google Display',
    width: 970,
    height: 250,
    aspect_ratio: '3.88:1',
    file_format: 'jpg',
    compression: 90,
    notes: 'Premium inventory',
    slug: 'gdn-billboard',
  },

  // ── E-COMMERCE (3) ─────────────────────────────────────────────────────
  {
    id: 'ec_product_hero',
    name: 'Ficha de Producto Hero',
    platform: 'ecommerce',
    platform_label: 'E-commerce',
    width: 800,
    height: 800,
    aspect_ratio: '1:1',
    file_format: 'jpg',
    compression: 95,
    notes: 'Alta calidad para zoom',
    slug: 'ecommerce-product-hero',
  },
  {
    id: 'ec_collection_banner',
    name: 'Banner de Coleccion',
    platform: 'ecommerce',
    platform_label: 'E-commerce',
    width: 1920,
    height: 600,
    aspect_ratio: '3.2:1',
    file_format: 'jpg',
    compression: 85,
    notes: 'Header de pagina de categoria',
    slug: 'ecommerce-collection-banner',
  },
  {
    id: 'ec_thumbnail',
    name: 'Thumbnail de Producto',
    platform: 'ecommerce',
    platform_label: 'E-commerce',
    width: 400,
    height: 400,
    aspect_ratio: '1:1',
    file_format: 'jpg',
    compression: 85,
    notes: 'Listado de productos',
    slug: 'ecommerce-thumbnail',
  },

  // ── EMAIL MARKETING (2) ────────────────────────────────────────────────
  {
    id: 'email_header',
    name: 'Header de Email',
    platform: 'email',
    platform_label: 'Email',
    width: 600,
    height: 200,
    aspect_ratio: '3:1',
    file_format: 'jpg',
    compression: 85,
    notes: 'Cabecera de newsletter',
    slug: 'email-header',
  },
  {
    id: 'email_banner',
    name: 'Banner de Email',
    platform: 'email',
    platform_label: 'Email',
    width: 600,
    height: 400,
    aspect_ratio: '3:2',
    file_format: 'jpg',
    compression: 85,
    notes: 'Imagen principal de email',
    slug: 'email-banner',
  },

  // ── PINTEREST (2) ──────────────────────────────────────────────────────
  {
    id: 'pin_standard',
    name: 'Pin Estandar',
    platform: 'pinterest',
    platform_label: 'Pinterest',
    width: 1000,
    height: 1500,
    aspect_ratio: '2:3',
    file_format: 'jpg',
    compression: 85,
    notes: 'Proporcion optima para feed',
    slug: 'pin-standard',
  },
  {
    id: 'pin_square',
    name: 'Pin Cuadrado',
    platform: 'pinterest',
    platform_label: 'Pinterest',
    width: 1000,
    height: 1000,
    aspect_ratio: '1:1',
    file_format: 'jpg',
    compression: 85,
    notes: 'Alternativa cuadrada',
    slug: 'pin-square',
  },
];

// ---------------------------------------------------------------------------
// Format packs — predefined bundles from PRD-07
// ---------------------------------------------------------------------------

export const FORMAT_PACKS: FormatPack[] = [
  {
    id: 'instagram_completo',
    name: 'Instagram Completo',
    format_ids: ['ig_feed_square', 'ig_feed_portrait', 'ig_stories', 'ig_reels_cover'],
  },
  {
    id: 'pack_ads',
    name: 'Pack Ads',
    format_ids: ['meta_feed_square', 'meta_story_ad', 'gdn_medium_rect', 'gdn_leaderboard'],
  },
  {
    id: 'pack_redes',
    name: 'Pack Redes',
    format_ids: ['ig_feed_square', 'ig_stories', 'li_post', 'tw_post'],
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    format_ids: ['ec_product_hero', 'ec_collection_banner', 'ec_thumbnail'],
  },
  {
    id: 'todo',
    name: 'Todo',
    format_ids: FORMATS.map((f) => f.id),
  },
];

// ---------------------------------------------------------------------------
// V1 priority formats (10) — from PRD-07 roadmap
// ---------------------------------------------------------------------------

export const V1_FORMAT_IDS = [
  'ig_feed_square',
  'ig_feed_portrait',
  'ig_stories',
  'li_post',
  'li_banner',
  'meta_feed_square',
  'meta_story_ad',
  'ec_product_hero',
  'email_header',
  'pin_standard',
] as const;

export const V1_FORMATS: FormatSpec[] = FORMATS.filter((f) =>
  (V1_FORMAT_IDS as readonly string[]).includes(f.id),
);

// ---------------------------------------------------------------------------
// Platform folder map for ZIP export
// ---------------------------------------------------------------------------

export const PLATFORM_FOLDER_MAP: Record<PlatformId, string> = {
  instagram: 'instagram',
  tiktok: 'tiktok',
  linkedin: 'linkedin',
  twitter: 'twitter-x',
  meta_ads: 'meta-ads',
  google_display: 'google-display',
  ecommerce: 'ecommerce',
  email: 'email',
  pinterest: 'pinterest',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getFormatById(id: string): FormatSpec | undefined {
  return FORMATS.find((f) => f.id === id);
}

export function getFormatsByPlatform(platform: PlatformId): FormatSpec[] {
  return FORMATS.filter((f) => f.platform === platform);
}
