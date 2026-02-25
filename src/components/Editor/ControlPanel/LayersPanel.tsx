import { useState } from 'react';
import { SectionLabel } from '../../shared';

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  color: string;
}

const PLACEHOLDER_LAYERS: Layer[] = [
  { id: 'cta', name: 'Texto CTA', visible: true, color: '#B91C1C' },
  { id: 'heading', name: 'Texto Titular', visible: true, color: '#1A1A1A' },
  { id: 'logo', name: 'Logo', visible: true, color: '#666666' },
  { id: 'overlay', name: 'Overlay', visible: true, color: '#D9CEBC' },
  { id: 'bg-image', name: 'Imagen de fondo', visible: true, color: '#E6E0D4' },
];

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
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
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
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
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 01-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function DragHandle() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="text-border"
    >
      <circle cx="8" cy="6" r="2" />
      <circle cx="16" cy="6" r="2" />
      <circle cx="8" cy="12" r="2" />
      <circle cx="16" cy="12" r="2" />
      <circle cx="8" cy="18" r="2" />
      <circle cx="16" cy="18" r="2" />
    </svg>
  );
}

export function LayersPanel() {
  const [layers, setLayers] = useState<Layer[]>(PLACEHOLDER_LAYERS);
  const [selectedId, setSelectedId] = useState<string | null>('heading');

  const toggleVisibility = (id: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)),
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <SectionLabel>Capas</SectionLabel>

      <div className="flex flex-col rounded-lg border border-border bg-secondary overflow-hidden">
        {layers.map((layer) => (
          <button
            key={layer.id}
            type="button"
            onClick={() => setSelectedId(layer.id === selectedId ? null : layer.id)}
            className={`flex items-center gap-2 px-3 py-2 text-left transition-colors ${
              selectedId === layer.id
                ? 'bg-card'
                : 'hover:bg-muted/50'
            } ${!layer.visible ? 'opacity-50' : ''}`}
          >
            {/* Drag handle */}
            <span className="cursor-grab shrink-0">
              <DragHandle />
            </span>

            {/* Color indicator */}
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 border border-border"
              style={{ backgroundColor: layer.color }}
            />

            {/* Layer name */}
            <span className="flex-1 font-sans text-xs text-foreground truncate">
              {layer.name}
            </span>

            {/* Visibility toggle */}
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                toggleVisibility(layer.id);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation();
                  toggleVisibility(layer.id);
                }
              }}
              className={`shrink-0 p-0.5 rounded transition-colors ${
                layer.visible ? 'text-muted-foreground hover:text-foreground' : 'text-border'
              }`}
              aria-label={layer.visible ? 'Ocultar capa' : 'Mostrar capa'}
            >
              <EyeIcon open={layer.visible} />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
