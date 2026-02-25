import type { ReactNode } from 'react';

type Variation = 1 | 2 | 3;

interface VariationNavigatorProps {
  current: Variation;
  onChange: (v: Variation) => void;
}

function ArrowIcon({ direction }: { direction: 'left' | 'right' }): ReactNode {
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
      {direction === 'left' ? (
        <polyline points="15 18 9 12 15 6" />
      ) : (
        <polyline points="9 6 15 12 9 18" />
      )}
    </svg>
  );
}

export function VariationNavigator({ current, onChange }: VariationNavigatorProps) {
  const prev = () => {
    const next = current === 1 ? 3 : ((current - 1) as Variation);
    onChange(next);
  };

  const next = () => {
    const nextVal = current === 3 ? 1 : ((current + 1) as Variation);
    onChange(nextVal);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={prev}
        className="flex items-center justify-center w-6 h-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        aria-label="Variacion anterior"
      >
        <ArrowIcon direction="left" />
      </button>

      <div className="flex items-center gap-1.5">
        {([1, 2, 3] as Variation[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              v === current
                ? 'bg-foreground scale-125'
                : 'bg-border hover:bg-muted-foreground'
            }`}
            aria-label={`Variacion ${v}`}
          />
        ))}
      </div>

      <span className="font-mono text-xs text-muted-foreground tabular-nums min-w-[24px] text-center">
        {current}/3
      </span>

      <button
        type="button"
        onClick={next}
        className="flex items-center justify-center w-6 h-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        aria-label="Siguiente variacion"
      >
        <ArrowIcon direction="right" />
      </button>
    </div>
  );
}
