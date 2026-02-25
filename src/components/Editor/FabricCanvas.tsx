import { useResultsStore } from '../../store/results.store';
import { getFormatById } from '../../constants/formats';

export function FabricCanvas() {
  const activeFormatId = useResultsStore((s) => s.activeFormatId);
  const getActivePiece = useResultsStore((s) => s.getActivePiece);

  const piece = getActivePiece();
  const format = activeFormatId ? getFormatById(activeFormatId) : undefined;

  if (!format) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <p className="font-serif italic text-muted-foreground">
          Selecciona un formato para empezar a editar
        </p>
      </div>
    );
  }

  // Calculate the canvas display size to fit within the available area
  // We use a max of 600px width / 700px height and maintain aspect ratio
  const maxW = 600;
  const maxH = 700;
  const aspectRatio = format.width / format.height;

  let displayW: number;
  let displayH: number;

  if (aspectRatio >= 1) {
    // Landscape or square
    displayW = Math.min(maxW, format.width);
    displayH = displayW / aspectRatio;
    if (displayH > maxH) {
      displayH = maxH;
      displayW = displayH * aspectRatio;
    }
  } else {
    // Portrait
    displayH = Math.min(maxH, format.height);
    displayW = displayH * aspectRatio;
    if (displayW > maxW) {
      displayW = maxW;
      displayH = displayW / aspectRatio;
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-background p-6 overflow-auto">
      {/* Canvas container */}
      <div
        className="relative bg-card rounded-lg shadow-elevated overflow-hidden"
        style={{
          width: `${displayW}px`,
          height: `${displayH}px`,
        }}
      >
        {/* Placeholder gradient that simulates content */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, var(--card) 0%, var(--secondary) 40%, var(--accent) 100%)`,
          }}
        />

        {/* Center icon */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--muted-foreground)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-30"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span className="font-serif italic text-sm text-muted-foreground opacity-50">
            Fabric.js canvas
          </span>
        </div>

        {/* Edited indicator */}
        {piece?.edited && (
          <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-accent text-accent-foreground font-sans text-[10px] font-semibold uppercase tracking-wider">
            Editado
          </span>
        )}
      </div>

      {/* Dimensions label */}
      <div className="flex items-center gap-3 text-muted-foreground">
        <span className="font-mono text-xs tabular-nums">
          {format.width} x {format.height}
        </span>
        <span className="text-border">|</span>
        <span className="font-sans text-xs">
          {format.name}
        </span>
        <span className="text-border">|</span>
        <span className="font-mono text-xs">
          {format.aspect_ratio}
        </span>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="flex items-center gap-4 text-muted-foreground opacity-60">
        <span className="font-sans text-[10px] uppercase tracking-wider">
          <kbd className="px-1 py-0.5 rounded bg-secondary border border-border font-mono text-[10px]">Ctrl+Z</kbd> Deshacer
        </span>
        <span className="font-sans text-[10px] uppercase tracking-wider">
          <kbd className="px-1 py-0.5 rounded bg-secondary border border-border font-mono text-[10px]">Ctrl+S</kbd> Guardar
        </span>
        <span className="font-sans text-[10px] uppercase tracking-wider">
          <kbd className="px-1 py-0.5 rounded bg-secondary border border-border font-mono text-[10px]">Del</kbd> Eliminar
        </span>
      </div>
    </div>
  );
}
