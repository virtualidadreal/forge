import { useState, useEffect, useRef } from 'react';
import { Button } from '../shared';

interface GenerationProgressProps {
  progress: number;           // 0-100
  formats: string[];          // All format names being generated
  completedFormats: string[]; // Format names already done
  onCancel: () => void;
}

export function GenerationProgress({
  progress,
  formats,
  completedFormats,
  onCancel,
}: GenerationProgressProps) {
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Elapsed timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm" style={{ zIndex: 'var(--z-modal)' }}>
      <div
        className="w-full max-w-[520px] mx-4 bg-card rounded-3xl border border-border p-12 animate-in"
        style={{ boxShadow: 'var(--shadow-xl)' }}
      >
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="font-serif text-xl font-semibold text-card-foreground mb-1">
            Generando piezas
          </h2>
          <p className="font-sans text-sm font-light text-muted-foreground">
            {completedFormats.length} de {formats.length} formatos &middot; {formatTime(elapsed)}
          </p>
        </div>

        {/* Progress bar */}
        <div className="relative h-2 rounded-full bg-secondary overflow-hidden mb-10">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-foreground transition-all duration-300 ease-out"
            style={{ width: `${Math.max(progress, 2)}%` }}
          />
          {/* Shimmer overlay */}
          <div
            className="absolute inset-0 progress-shimmer opacity-40 rounded-full"
            style={{ width: `${Math.max(progress, 2)}%` }}
          />
        </div>

        {/* Percentage */}
        <p className="text-center font-mono text-xs text-muted-foreground mb-10">
          {Math.round(progress)}%
        </p>

        {/* Format list */}
        <div className="max-h-[220px] overflow-y-auto space-y-1.5 mb-8">
          {formats.map((name) => {
            const isDone = completedFormats.includes(name);

            return (
              <div
                key={name}
                className={`flex items-center gap-3 px-5 py-2.5 rounded-lg ${isDone ? 'bg-secondary/50' : ''}`}
              >
                {/* Status icon */}
                {isDone ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-intent-awareness shrink-0"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-border shrink-0" />
                )}

                <span
                  className={`
                    font-sans text-xs
                    ${isDone ? 'text-muted-foreground line-through' : 'text-foreground'}
                  `}
                >
                  {name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Cancel */}
        <div className="flex justify-center">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
