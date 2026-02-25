import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '../shared';

interface EditorActionsProps {
  onApplyToAll?: () => void;
  onRegenerate?: () => void;
  onChangeIntention?: () => void;
  onAddElement?: (type: 'text' | 'rectangle' | 'line' | 'badge') => void;
}

const ADD_ELEMENT_OPTIONS: { type: 'text' | 'rectangle' | 'line' | 'badge'; label: string; icon: string }[] = [
  { type: 'text', label: 'Texto', icon: 'T' },
  { type: 'rectangle', label: 'Rectangulo', icon: '[]' },
  { type: 'line', label: 'Linea', icon: '--' },
  { type: 'badge', label: 'Badge', icon: 'Bg' },
];

export function EditorActions({
  onApplyToAll,
  onRegenerate,
  onChangeIntention,
  onAddElement,
}: EditorActionsProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!dropdownOpen) return;
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen, handleClickOutside]);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Apply to all formats */}
      <Button
        variant="primary"
        size="sm"
        onClick={onApplyToAll}
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
            <rect x="2" y="7" width="7" height="7" rx="1" />
            <rect x="9" y="2" width="7" height="7" rx="1" />
            <rect x="15" y="7" width="7" height="7" rx="1" />
            <rect x="9" y="12" width="7" height="7" rx="1" />
          </svg>
        }
      >
        Aplicar a todos
      </Button>

      {/* Regenerate with AI */}
      <Button
        variant="secondary"
        size="sm"
        onClick={onRegenerate}
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
        Regenerar con IA
      </Button>

      {/* Change intention */}
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

      {/* Add element dropdown */}
      <div ref={dropdownRef} className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDropdownOpen(!dropdownOpen)}
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
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          }
        >
          Anadir elemento
        </Button>

        {dropdownOpen && (
          <div
            className="absolute left-0 top-full mt-1 w-44 rounded-xl border border-border bg-card py-1 flex flex-col"
            style={{
              zIndex: 'var(--z-dropdown)',
              boxShadow: 'var(--shadow-elevated)',
            }}
          >
            {ADD_ELEMENT_OPTIONS.map((opt) => (
              <button
                key={opt.type}
                type="button"
                onClick={() => {
                  onAddElement?.(opt.type);
                  setDropdownOpen(false);
                }}
                className="flex items-center gap-3 px-3 py-2 text-left font-sans text-sm text-foreground hover:bg-muted transition-colors"
              >
                <span className="w-6 h-6 flex items-center justify-center rounded bg-secondary font-mono text-[10px] text-muted-foreground">
                  {opt.icon}
                </span>
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
