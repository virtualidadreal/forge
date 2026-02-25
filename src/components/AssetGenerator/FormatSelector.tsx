import { useCallback, useMemo } from 'react';
import { useSessionStore } from '../../store/session.store';
import { V1_FORMATS, FORMAT_PACKS } from '../../constants/formats';
import type { FormatSpec, PlatformId } from '../../types/format.types';
import { Button, SectionLabel } from '../shared';

function groupByPlatform(formats: FormatSpec[]): Map<PlatformId, FormatSpec[]> {
  const map = new Map<PlatformId, FormatSpec[]>();
  for (const fmt of formats) {
    const list = map.get(fmt.platform) ?? [];
    list.push(fmt);
    map.set(fmt.platform, list);
  }
  return map;
}

function AspectRatioPreview({ width, height }: { width: number; height: number }) {
  const maxDim = 32;
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

  w = Math.max(w, 8);
  h = Math.max(h, 8);

  return (
    <div className="flex items-center justify-center w-9 h-9">
      <div
        className="rounded-[3px] border border-border bg-secondary"
        style={{ width: `${w}px`, height: `${h}px` }}
      />
    </div>
  );
}

const SECONDS_PER_FORMAT = 3;

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
      <div className="flex items-center justify-between mb-3">
        <SectionLabel>Formatos</SectionLabel>
        <span className="font-sans text-xs text-muted-foreground">
          {selectedCount} seleccionado{selectedCount !== 1 ? 's' : ''}
          {selectedCount > 0 && (
            <span className="ml-1 font-mono">
              &middot; ~{estimatedSeconds < 60 ? `${estimatedSeconds}s` : `${estimatedMinutes}min`}
            </span>
          )}
        </span>
      </div>

      {/* Pack shortcuts */}
      <div className="flex flex-wrap gap-2 mb-5">
        {FORMAT_PACKS.filter((p) => p.id !== 'todo').map((pack) => {
          const allSelected = pack.format_ids.every((id) => selectedFormats.includes(id));
          return (
            <button
              key={pack.id}
              onClick={() => handlePackClick(pack.id)}
              className={`
                px-3 py-1.5 rounded-lg font-sans text-xs font-medium
                border transition-all duration-[150ms]
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
      <div className="space-y-8">
        {platforms.map((platformId) => {
          const formats = grouped.get(platformId)!;
          const platformLabel = formats[0].platform_label;

          return (
            <div key={platformId}>
              <p className="font-sans text-xs font-semibold text-muted-foreground tracking-widest uppercase mb-3">
                {platformLabel}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {formats.map((fmt) => {
                  const isSelected = selectedFormats.includes(fmt.id);

                  return (
                    <button
                      key={fmt.id}
                      onClick={() => toggleFormat(fmt.id)}
                      className={`
                        flex items-center gap-3 p-3.5 rounded-xl border text-left overflow-hidden
                        transition-all duration-[150ms] cursor-pointer
                        ${
                          isSelected
                            ? 'border-foreground/40 bg-accent/20'
                            : 'border-border bg-card hover:border-muted-foreground'
                        }
                      `}
                    >
                      <div
                        className={`
                          flex items-center justify-center shrink-0
                          w-4 h-4 rounded border transition-all duration-[150ms]
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

                      <AspectRatioPreview width={fmt.width} height={fmt.height} />

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
