import { useCallback } from 'react';
import { useSessionStore } from '../../store/session.store';
import { INTENTIONS } from '../../constants/intentions';
import type { IntentionType } from '../../types/composition.types';
import { SectionLabel } from '../shared';

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

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {INTENTIONS.map((intent) => {
          const isSelected = intention === intent.id;
          const colors = INTENT_COLOR_MAP[intent.id];

          return (
            <button
              key={intent.id}
              onClick={() => handleSelect(intent.id)}
              className={`
                relative flex flex-col items-start gap-1.5 p-4 rounded-xl
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
                <span className="text-lg leading-none">{intent.icon}</span>
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
              <p className="font-sans text-xs text-muted-foreground leading-relaxed line-clamp-2">
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
