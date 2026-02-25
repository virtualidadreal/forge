import { useMemo } from 'react';
import { VariationNavigator } from '../Results/VariationNavigator';
import { useResultsStore } from '../../store/results.store';
import { getFormatById } from '../../constants/formats';

export function FormatThumbnails() {
  const pieces = useResultsStore((s) => s.pieces);
  const activeFormatId = useResultsStore((s) => s.activeFormatId);
  const activeVariation = useResultsStore((s) => s.activeVariation);
  const setActiveFormat = useResultsStore((s) => s.setActiveFormat);
  const setActiveVariation = useResultsStore((s) => s.setActiveVariation);

  // Unique format IDs preserving order
  const formatIds = useMemo(() => {
    const seen = new Set<string>();
    const ids: string[] = [];
    for (const piece of pieces) {
      if (!seen.has(piece.format_id)) {
        seen.add(piece.format_id);
        ids.push(piece.format_id);
      }
    }
    return ids;
  }, [pieces]);

  // Check which formats have edited pieces
  const editedFormats = useMemo(() => {
    const edited = new Set<string>();
    for (const piece of pieces) {
      if (piece.edited) edited.add(piece.format_id);
    }
    return edited;
  }, [pieces]);

  if (formatIds.length === 0) {
    return (
      <aside
        className="flex flex-col items-center justify-center p-4 bg-sidebar border-r border-border"
        style={{ width: 'var(--sidebar-width)' }}
      >
        <p className="font-sans text-xs text-muted-foreground text-center">
          Sin formatos
        </p>
      </aside>
    );
  }

  return (
    <aside
      className="flex flex-col bg-sidebar border-r border-border overflow-hidden"
      style={{ width: 'var(--sidebar-width)' }}
    >
      {/* Thumbnails scroll area */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        <p className="font-sans text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1 px-1">
          Formatos
        </p>

        {formatIds.map((formatId) => {
          const format = getFormatById(formatId);
          if (!format) return null;

          const isActive = formatId === activeFormatId;
          const isEdited = editedFormats.has(formatId);
          const aspectRatio = format.width / format.height;

          // Calculate thumbnail dimensions (max 180px wide, max 80px tall)
          const thumbMaxW = 180;
          const thumbMaxH = 80;
          let thumbW: number;
          let thumbH: number;

          if (aspectRatio >= 1) {
            thumbW = Math.min(thumbMaxW, 180);
            thumbH = thumbW / aspectRatio;
            if (thumbH > thumbMaxH) {
              thumbH = thumbMaxH;
              thumbW = thumbH * aspectRatio;
            }
          } else {
            thumbH = Math.min(thumbMaxH, 80);
            thumbW = thumbH * aspectRatio;
            if (thumbW > thumbMaxW) {
              thumbW = thumbMaxW;
              thumbH = thumbW / aspectRatio;
            }
          }

          return (
            <button
              key={formatId}
              type="button"
              onClick={() => setActiveFormat(formatId)}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all ${
                isActive
                  ? 'bg-card border border-primary shadow-sm'
                  : 'border border-transparent hover:bg-muted/50 hover:border-border'
              }`}
            >
              {/* Thumbnail preview */}
              <div
                className="rounded overflow-hidden"
                style={{
                  width: `${thumbW}px`,
                  height: `${thumbH}px`,
                  background: `linear-gradient(135deg, var(--card) 0%, var(--secondary) 50%, var(--accent) 100%)`,
                }}
              />

              {/* Format info */}
              <div className="flex items-center gap-1 w-full">
                <span className="flex-1 font-sans text-[10px] text-foreground truncate text-left leading-tight">
                  {format.name}
                </span>
                {isEdited && (
                  <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" title="Editado" />
                )}
              </div>
              <span className="font-mono text-[9px] text-muted-foreground w-full text-left">
                {format.width}x{format.height}
              </span>
            </button>
          );
        })}
      </div>

      {/* Variation navigator at bottom */}
      <div className="border-t border-border px-3 py-3">
        <p className="font-sans text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
          Variacion
        </p>
        <VariationNavigator
          current={activeVariation}
          onChange={setActiveVariation}
        />
      </div>
    </aside>
  );
}
