import { useState, useMemo } from 'react';
import { Button } from '../shared';
import { PieceCard } from './PieceCard';
import { useResultsStore } from '../../store/results.store';
import { useSessionStore } from '../../store/session.store';
import { useBrandDNAStore } from '../../store/brandDNA.store';
import { getIntentionById } from '../../constants/intentions';
import type { GeneratedPiece } from '../../types/composition.types';

interface ResultsGridProps {
  onEditPiece?: (piece: GeneratedPiece) => void;
  onExportPiece?: (piece: GeneratedPiece) => void;
  onExportAll?: () => void;
  onExportSelection?: (pieceIds: string[]) => void;
  onRegenerateAll?: () => void;
  onChangeIntention?: () => void;
}

export function ResultsGrid({
  onEditPiece,
  onExportPiece,
  onExportAll,
  onExportSelection,
  onRegenerateAll,
  onChangeIntention,
}: ResultsGridProps) {
  const pieces = useResultsStore((s) => s.pieces);
  const intention = useSessionStore((s) => s.intention);
  const getActiveBrand = useBrandDNAStore((s) => s.getActiveBrand);

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const brand = getActiveBrand();
  const intentionConfig = getIntentionById(intention);

  // Group pieces by format, showing variation 1 by default
  const groupedByFormat = useMemo(() => {
    const map = new Map<string, GeneratedPiece[]>();
    for (const piece of pieces) {
      const existing = map.get(piece.format_id) || [];
      existing.push(piece);
      map.set(piece.format_id, existing);
    }
    return map;
  }, [pieces]);

  // Unique format ids preserving order
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

  // Track which variation is active for each format
  const [activeVariations, setActiveVariations] = useState<Record<string, 1 | 2 | 3>>({});

  const getDisplayedPiece = (formatId: string): GeneratedPiece | undefined => {
    const variations = groupedByFormat.get(formatId);
    if (!variations) return undefined;
    const activeVar = activeVariations[formatId] || 1;
    return variations.find((p) => p.variation === activeVar) || variations[0];
  };

  const toggleSelection = (pieceId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(pieceId)) {
        next.delete(pieceId);
      } else {
        next.add(pieceId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === formatIds.length) {
      setSelectedIds(new Set());
    } else {
      const allIds = new Set<string>();
      for (const fid of formatIds) {
        const piece = getDisplayedPiece(fid);
        if (piece) allIds.add(piece.id);
      }
      setSelectedIds(allIds);
    }
  };

  const handleExportSelection = () => {
    onExportSelection?.(Array.from(selectedIds));
  };

  const formatCount = formatIds.length;
  const totalPieces = pieces.length;

  if (pieces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--muted-foreground)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-40"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
        <p className="font-serif text-lg italic text-muted-foreground">
          No hay piezas generadas todavia
        </p>
        <p className="font-sans text-sm text-muted-foreground max-w-[360px]">
          Sube una imagen, escribe tu copy, selecciona formatos y genera tu primera campana.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <h2 className="font-serif text-3xl italic text-foreground leading-tight">
              {brand?.brand_name || 'Campana'}
            </h2>
            {intentionConfig && (
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-sans text-xs font-semibold uppercase tracking-wider"
                style={{
                  backgroundColor: `color-mix(in srgb, var(${intentionConfig.color_token}) 15%, transparent)`,
                  color: `var(${intentionConfig.color_token})`,
                }}
              >
                {intentionConfig.name}
              </span>
            )}
            <span className="font-mono text-xs text-muted-foreground">
              {formatCount} formatos &middot; {totalPieces} piezas
            </span>
          </div>
        </div>

        {/* Global actions bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="primary"
            size="sm"
            onClick={onExportAll}
            icon={
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            }
          >
            Exportar todo
          </Button>

          <Button
            variant={selectionMode ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => {
              setSelectionMode(!selectionMode);
              if (selectionMode) setSelectedIds(new Set());
            }}
            icon={
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
            }
          >
            {selectionMode ? 'Cancelar seleccion' : 'Seleccionar'}
          </Button>

          {selectionMode && selectedIds.size > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportSelection}
            >
              Exportar seleccion ({selectedIds.size})
            </Button>
          )}

          {selectionMode && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
            >
              {selectedIds.size === formatIds.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
            </Button>
          )}

          <div className="flex-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={onRegenerateAll}
            icon={
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
              </svg>
            }
          >
            Regenerar todo
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onChangeIntention}
            icon={
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
            }
          >
            Cambiar intencion
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        {formatIds.map((formatId, index) => {
          const piece = getDisplayedPiece(formatId);
          const allVariations = groupedByFormat.get(formatId) || [];
          if (!piece) return null;

          return (
            <div
              key={formatId}
              className="piece-card"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <PieceCard
                piece={piece}
                selected={selectedIds.has(piece.id)}
                selectionMode={selectionMode}
                onSelect={() => toggleSelection(piece.id)}
                onEdit={() => onEditPiece?.(piece)}
                onExport={() => onExportPiece?.(piece)}
                variations={allVariations}
                onVariationChange={(v) =>
                  setActiveVariations((prev) => ({ ...prev, [formatId]: v }))
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
