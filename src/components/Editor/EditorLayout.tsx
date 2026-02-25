import { Button } from '../shared';
import { FabricCanvas } from './FabricCanvas';
import { FormatThumbnails } from './FormatThumbnails';
import { ControlPanel } from './ControlPanel';
import { EditorActions } from './EditorActions';
import { useSessionStore } from '../../store/session.store';
import { useBrandDNAStore } from '../../store/brandDNA.store';
import { getIntentionById } from '../../constants/intentions';

interface EditorLayoutProps {
  onBack?: () => void;
  onExport?: () => void;
}

export function EditorLayout({ onBack, onExport }: EditorLayoutProps) {
  const intention = useSessionStore((s) => s.intention);
  const getActiveBrand = useBrandDNAStore((s) => s.getActiveBrand);

  const brand = getActiveBrand();
  const intentionConfig = getIntentionById(intention);

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header
        className="flex items-center justify-between px-5 border-b border-border bg-sidebar shrink-0"
        style={{ height: 'var(--header-height)' }}
      >
        <div className="flex items-center gap-3">
          {/* Back button */}
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Volver"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>

          {/* Campaign name */}
          <h1 className="font-serif text-lg italic text-foreground leading-tight">
            {brand?.brand_name || 'Editor'}
          </h1>

          {/* Separator dot */}
          <span className="w-1 h-1 rounded-full bg-border" />

          {/* Intention badge */}
          {intentionConfig && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-sans text-[10px] font-semibold uppercase tracking-wider"
              style={{
                backgroundColor: `color-mix(in srgb, var(${intentionConfig.color_token}) 15%, transparent)`,
                color: `var(${intentionConfig.color_token})`,
              }}
            >
              <span>{intentionConfig.icon}</span>
              {intentionConfig.name}
            </span>
          )}
        </div>

        {/* Header actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
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
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
              </svg>
            }
          >
            Deshacer
          </Button>
          <Button
            variant="ghost"
            size="sm"
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
                <path d="M20.49 15a9 9 0 11-2.13-9.36L23 10" />
              </svg>
            }
          >
            Rehacer
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          <Button variant="primary" size="sm" onClick={onExport}>
            Exportar
          </Button>
        </div>
      </header>

      {/* ── BODY: Left panel + Canvas + Right panel ──────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel: format thumbnails */}
        <FormatThumbnails />

        {/* Center: canvas area */}
        <FabricCanvas />

        {/* Right panel: controls */}
        <ControlPanel />
      </div>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="flex items-center justify-between px-5 py-2.5 border-t border-border bg-sidebar shrink-0">
        <EditorActions />

        <div className="flex items-center gap-2">
          <span className="font-sans text-[10px] text-muted-foreground uppercase tracking-wider">
            Historial
          </span>
          <button
            type="button"
            className="flex items-center justify-center w-6 h-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Ver historial"
          >
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
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </button>
        </div>
      </footer>
    </div>
  );
}
