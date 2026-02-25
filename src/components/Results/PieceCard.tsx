import { useState } from 'react';
import { Button } from '../shared';
import { VariationNavigator } from './VariationNavigator';
import { getFormatById } from '../../constants/formats';
import type { GeneratedPiece } from '../../types/composition.types';

interface PieceCardProps {
  piece: GeneratedPiece;
  selected?: boolean;
  selectionMode?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onExport?: () => void;
  variations?: GeneratedPiece[];
  onVariationChange?: (variation: 1 | 2 | 3) => void;
}

const PLATFORM_COLORS: Record<string, string> = {
  instagram: 'bg-pink-100 text-pink-800',
  tiktok: 'bg-slate-100 text-slate-800',
  linkedin: 'bg-blue-100 text-blue-800',
  twitter: 'bg-sky-100 text-sky-800',
  meta_ads: 'bg-indigo-100 text-indigo-800',
  google_display: 'bg-green-100 text-green-800',
  ecommerce: 'bg-amber-100 text-amber-800',
  email: 'bg-orange-100 text-orange-800',
  pinterest: 'bg-red-100 text-red-800',
};

export function PieceCard({
  piece,
  selected = false,
  selectionMode = false,
  onSelect,
  onEdit,
  onExport,
  variations,
  onVariationChange,
}: PieceCardProps) {
  const format = getFormatById(piece.format_id);
  const [currentVariation, setCurrentVariation] = useState<1 | 2 | 3>(piece.variation);

  if (!format) return null;

  const aspectRatio = format.width / format.height;
  const platformClass = PLATFORM_COLORS[format.platform] || 'bg-muted text-muted-foreground';

  const handleVariationChange = (v: 1 | 2 | 3) => {
    setCurrentVariation(v);
    onVariationChange?.(v);
  };

  return (
    <div
      className={`group relative flex flex-col rounded-2xl bg-card overflow-hidden shadow-subtle transition-shadow duration-300 hover:shadow-elevated ${
        selected ? 'ring-2 ring-primary shadow-elevated' : ''
      }`}
    >
      {selectionMode && (
        <button
          type="button"
          onClick={onSelect}
          className="absolute top-3 left-3 z-10 flex items-center justify-center w-5 h-5 rounded-full border-2 transition-colors duration-300"
          style={{
            borderColor: selected ? 'var(--primary)' : 'var(--border)',
            backgroundColor: selected ? 'var(--primary)' : 'transparent',
          }}
          aria-label={selected ? 'Deseleccionar' : 'Seleccionar'}
        >
          {selected && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--primary-foreground)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>
      )}

      {piece.edited && (
        <span className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-[10px] font-semibold uppercase tracking-[0.15em]">
          Editado
        </span>
      )}

      {/* Preview area */}
      <div className="relative w-full bg-muted flex items-center justify-center p-5">
        <div
          className="w-full rounded-2xl overflow-hidden flex items-center justify-center"
          style={{
            aspectRatio: `${format.width} / ${format.height}`,
            maxHeight: aspectRatio < 0.6 ? '280px' : '200px',
          }}
        >
          {piece.preview_data_url ? (
            <img src={piece.preview_data_url} alt={format.name} className="w-full h-full object-contain" />
          ) : (
            <div
              className="w-full h-full bg-card relative"
              style={{ background: `linear-gradient(135deg, var(--card) 0%, var(--secondary) 50%, var(--accent) 100%)` }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-muted-foreground">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span className="font-mono text-[10px] opacity-60">
                  {format.width} x {format.height}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card info */}
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-card-foreground leading-tight">
              {format.name}
            </p>
            <span className="font-mono text-xs font-light text-muted-foreground">
              {format.width} x {format.height} &middot; {format.aspect_ratio}
            </span>
          </div>
          <span
            className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.15em] overflow-hidden ${platformClass}`}
          >
            {format.platform_label}
          </span>
        </div>

        {variations && variations.length > 1 && (
          <div className="flex justify-center">
            <VariationNavigator current={currentVariation} onChange={handleVariationChange} />
          </div>
        )}

        <div className="flex items-center gap-2 pt-2">
          <Button variant="secondary" size="sm" onClick={onEdit} className="flex-1"
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>}
          >
            Editar
          </Button>
          <Button variant="ghost" size="sm" onClick={onExport}
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>}
          >
            Exportar
          </Button>
        </div>
      </div>
    </div>
  );
}
