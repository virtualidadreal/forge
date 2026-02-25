export interface FontPair {
  id: string;
  name: string;
  heading_family: string;
  heading_google_font: string;
  body_family: string;
  body_google_font: string;
  style: 'editorial-sans' | 'editorial-serif' | 'geometric-sans' | 'display' | 'neutral';
}

export const FONT_PAIRS: FontPair[] = [
  {
    id: 'inter',
    name: 'Inter (Default)',
    heading_family: 'Inter',
    heading_google_font: 'Inter',
    body_family: 'Inter',
    body_google_font: 'Inter',
    style: 'neutral',
  },
  {
    id: 'bebas-inter',
    name: 'Bebas Neue + Inter',
    heading_family: 'Bebas Neue',
    heading_google_font: 'Bebas+Neue',
    body_family: 'Inter',
    body_google_font: 'Inter',
    style: 'display',
  },
  {
    id: 'playfair-inter',
    name: 'Playfair Display + Inter',
    heading_family: 'Playfair Display',
    heading_google_font: 'Playfair+Display',
    body_family: 'Inter',
    body_google_font: 'Inter',
    style: 'editorial-serif',
  },
  {
    id: 'dm-sans',
    name: 'DM Sans',
    heading_family: 'DM Sans',
    heading_google_font: 'DM+Sans',
    body_family: 'DM Sans',
    body_google_font: 'DM+Sans',
    style: 'geometric-sans',
  },
];

export const FALLBACK_FONTS = ['Inter', 'Bebas Neue', 'Playfair Display', 'DM Sans'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getFontPairById(id: string): FontPair | undefined {
  return FONT_PAIRS.find((fp) => fp.id === id);
}

export function getFontPairsByStyle(style: FontPair['style']): FontPair[] {
  return FONT_PAIRS.filter((fp) => fp.style === style);
}

/**
 * Build a Google Fonts URL that loads all unique fonts in the FONT_PAIRS list.
 * Weights 400..900 for headings, 400+500 for body.
 */
export function buildGoogleFontsUrl(): string {
  const seen = new Set<string>();
  const families: string[] = [];

  for (const pair of FONT_PAIRS) {
    if (!seen.has(pair.heading_google_font)) {
      seen.add(pair.heading_google_font);
      families.push(`family=${pair.heading_google_font}:wght@400;500;600;700;800;900`);
    }
    if (!seen.has(pair.body_google_font)) {
      seen.add(pair.body_google_font);
      families.push(`family=${pair.body_google_font}:wght@400;500;600;700`);
    }
  }

  return `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap`;
}
