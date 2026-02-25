import { useCallback, useMemo } from 'react';
import { useSessionStore } from '../../store/session.store';
import { V1_FORMATS, FORMAT_PACKS } from '../../constants/formats';
import type { FormatSpec, PlatformId } from '../../types/format.types';
import { Button, SectionLabel } from '../shared';

// ---------------------------------------------------------------------------
// Group formats by platform
// ---------------------------------------------------------------------------

function groupByPlatform(formats: FormatSpec[]): Map<PlatformId, FormatSpec[]> {
  const map = new Map<PlatformId, FormatSpec[]>();
  for (const fmt of formats) {
    const list = map.get(fmt.platform) ?? [];
    list.push(fmt);
    map.set(fmt.platform, list);
  }
  return map;
}

// ---------------------------------------------------------------------------
// Aspect ratio preview — small rectangle that visually represents the ratio
// ---------------------------------------------------------------------------

function AspectRatioPreview({ width, height }: { width: number; height: number }) {
  const maxDim = 36;
  const ratio = width / height;
  let w: number;
  let h: number;

  if (ratio >= 1) {
    w = maxDim;
    h = Math.round(maxDim / ratio);
  } else {
    h = maxDim;
    w = Math.round(maxDim * ratio);
  }

  // Ensure minimum visible size
  w = Math.max(w, 8);
  h = Math.max(h, 8);

  return (
    <div className="flex items-center justify-center w-10 h-10">
      <div
        className="rounded-[3px] border border-border bg-secondary"
        style={{ width: `${w}px`, height: `${h}px` }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Estimated time per format (mock: 3s per format)
// ---------------------------------------------------------------------------

const SECONDS_PER_FORMAT = 3;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FormatSelector() {
  const { selectedFormats, toggleFormat, setSelectedFormats, selectFormatPack } =
    useSessionStore();

  const grouped = useMemo(() => groupByPlatform(V1_FORMATS), []);
  const platforms = useMemo(() => Array.from(grouped.keys()), [grouped]);

  const selectedCount = selectedFormats.length;
  const estimatedSeconds = selectedCount * SECONDS_PER_FORMAT;
  const estimatedMinutes = Math.ceil(estimatedSeconds / 60);

  const handleSelectAll = useCallback(() => {
    setSelectedFormats(V1_FORMATS.map((f) => f.id));
  }, [setSelectedFormats]);

  const handleDeselectAll = useCallback(() => {
    setSelectedFormats([]);
  }, [setSelectedFormats]);

  const handlePackClick = useCallback(
    (packId: string) => {
      selectFormatPack(packId);
    },
    [selectFormatPack],
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <SectionLabel>Formatos</SectionLabel>
        <div className="flex items-center gap-2">
          <span className="font-sans text-xs text-muted-foreground">
            {selectedCount} seleccionado{selectedCount !== 1 ? 's' : ''}
            {selectedCount > 0 && (
              <span className="ml-1 font-mono">
                &middot; ~{estimatedSeconds < 60 ? `${estimatedSeconds}s` : `${estimatedMinutes}min`}
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Pack shortcuts */}
      <div className="flex flex-wrap gap-2.5 mb-6">
        {FORMAT_PACKS.filter((p) => p.id !== 'todo').map((pack) => {
          const allSelected = pack.format_ids.every((id) => selectedFormats.includes(id));
          return (
            <button
              key={pack.id}
              onClick={() => handlePackClick(pack.id)}
              className={`
                px-5 py-2.5 rounded-full font-sans text-xs font-medium
                border transition-all duration-300
                ${
                  allSelected
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border bg-card text-muted-foreground hover:border-muted-foreground hover:text-foreground'
                }
              `}
            >
              {pack.name}
            </button>
          );
        })}

        <div className="flex items-center gap-1 ml-auto">
          <Button variant="ghost" size="sm" onClick={handleSelectAll}>
            Todos
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDeselectAll}>
            Ninguno
          </Button>
        </div>
      </div>

      {/* Platform groups */}
      <div className="space-y-10">
        {platforms.map((platformId) => {
          const formats = grouped.get(platformId)!;
          const platformLabel = formats[0].platform_label;

          return (
            <div key={platformId}>
              <p className="font-sans text-xs font-medium text-muted-foreground tracking-wide uppercase mb-4">
                {platformLabel}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {formats.map((fmt) => {
                  const isSelected = selectedFormats.includes(fmt.id);

                  return (
                    <button
                      key={fmt.id}
                      onClick={() => toggleFormat(fmt.id)}
                      className={`
                        flex items-center gap-3.5 p-5 rounded-xl border text-left overflow-hidden
                        transition-all duration-300 cursor-pointer
                        ${
                          isSelected
                            ? 'border-foreground/40 bg-accent/20'
                            : 'border-border bg-card hover:border-muted-foreground'
                        }
                      `}
                    >
                      {/* Checkbox */}
                      <div
                        className={`
                          flex items-center justify-center shrink-0
                          w-4 h-4 rounded border transition-all duration-300
                          ${
                            isSelected
                              ? 'bg-foreground border-foreground'
                              : 'border-border bg-transparent'
                          }
                        `}
                      >
                        {isSelected && (
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="var(--background)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>

                      {/* Aspect ratio preview */}
                      <AspectRatioPreview width={fmt.width} height={fmt.height} />

                      {/* Label + dims */}
                      <div className="min-w-0 flex-1">
                        <p className="font-sans text-xs font-medium text-foreground truncate">
                          {fmt.name}
                        </p>
                        <p className="font-mono text-[10px] text-muted-foreground">
                          {fmt.width}x{fmt.height} &middot; {fmt.aspect_ratio}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
