import { useCallback } from 'react';
import { useSessionStore } from '../../store/session.store';
import { INTENTIONS } from '../../constants/intentions';
import type { IntentionType } from '../../types/composition.types';
import { SectionLabel } from '../shared';

// ---------------------------------------------------------------------------
// SVG icon component for intentions (replaces emoji)
// ---------------------------------------------------------------------------

function IntentionIcon({ id, className = '' }: { id: string; className?: string }) {
  const icons: Record<string, string> = {
    convert: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2',
    awareness: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z',
    editorial: 'M4 4h16v16H4z M8 4v16 M4 8h16 M4 12h8',
    campaign: 'M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7z',
    branding: 'M20.24 12.24a6 6 0 00-8.49-8.49L5 10.5V19h8.5z M16 8L2 22 M17.5 15H9',
    urgency: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
    social_proof: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  };

  const d = icons[id] || '';

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {d.split(' M').map((segment, i) => (
        <path key={i} d={i === 0 ? segment : `M${segment}`} />
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Map intention id to Tailwind color classes (using CSS custom properties)
// ---------------------------------------------------------------------------

const INTENT_COLOR_MAP: Record<IntentionType, { border: string; bg: string; text: string }> = {
  convert:      { border: 'border-intent-convert',      bg: 'bg-intent-convert/10',      text: 'text-intent-convert' },
  awareness:    { border: 'border-intent-awareness',    bg: 'bg-intent-awareness/10',    text: 'text-intent-awareness' },
  editorial:    { border: 'border-intent-editorial',    bg: 'bg-intent-editorial/10',    text: 'text-intent-editorial' },
  campaign:     { border: 'border-intent-campaign',     bg: 'bg-intent-campaign/10',     text: 'text-intent-campaign' },
  branding:     { border: 'border-intent-branding',     bg: 'bg-intent-branding/10',     text: 'text-intent-branding' },
  urgency:      { border: 'border-intent-urgency',      bg: 'bg-intent-urgency/10',      text: 'text-intent-urgency' },
  social_proof: { border: 'border-intent-socialproof',  bg: 'bg-intent-socialproof/10',  text: 'text-intent-socialproof' },
};

export function IntentionSelector() {
  const { intention, setIntention } = useSessionStore();

  const handleSelect = useCallback(
    (id: IntentionType) => {
      setIntention(id);
    },
    [setIntention],
  );

  return (
    <div>
      <SectionLabel>Intencion</SectionLabel>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5">
        {INTENTIONS.map((intent) => {
          const isSelected = intention === intent.id;
          const colors = INTENT_COLOR_MAP[intent.id];

          return (
            <button
              key={intent.id}
              onClick={() => handleSelect(intent.id)}
              className={`
                relative flex flex-col items-start gap-3 p-6 rounded-2xl
                border text-left cursor-pointer
                transition-all duration-150
                ${
                  isSelected
                    ? `${colors.border} ${colors.bg} border-2`
                    : 'border-border bg-card hover:border-muted-foreground hover:bg-accent/5'
                }
              `}
            >
              {/* Icon + Name row */}
              <div className="flex items-center gap-2">
                <IntentionIcon id={intent.id} className={isSelected ? colors.text : 'text-muted-foreground'} />
                <span
                  className={`
                    font-sans text-sm font-semibold
                    ${isSelected ? colors.text : 'text-foreground'}
                  `}
                >
                  {intent.name}
                </span>
              </div>

              {/* Description */}
              <p className="font-sans text-xs text-muted-foreground leading-relaxed line-clamp-2 mt-1">
                {intent.description}
              </p>

              {/* Active indicator dot */}
              {isSelected && (
                <span
                  className={`
                    absolute top-2.5 right-2.5 w-2 h-2 rounded-full
                    ${colors.border.replace('border-', 'bg-')}
                  `}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
