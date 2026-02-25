import { useState, useEffect, useRef } from 'react';
import { Button } from '../shared';

interface GenerationProgressProps {
  progress: number;
  formats: string[];
  completedFormats: string[];
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
      <div className="w-full max-w-[480px] mx-4 rounded-3xl bg-card p-10 shadow-elevated animate-in">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="font-serif italic text-xl font-medium text-card-foreground mb-1">
            Generando piezas
          </h2>
          <p className="font-sans text-sm font-light text-muted-foreground">
            {completedFormats.length} de {formats.length} formatos &middot; {formatTime(elapsed)}
          </p>
        </div>

        {/* Progress bar */}
        <div className="relative h-1.5 rounded-full bg-secondary overflow-hidden mb-8">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-foreground transition-all duration-300 ease-out"
            style={{ width: `${Math.max(progress, 2)}%` }}
          />
          <div
            className="absolute inset-0 progress-shimmer opacity-40 rounded-full"
            style={{ width: `${Math.max(progress, 2)}%` }}
          />
        </div>

        {/* Percentage */}
        <p className="text-center font-mono text-xs font-light text-muted-foreground mb-8">
          {Math.round(progress)}%
        </p>

        {/* Format list */}
        <div className="max-h-[200px] overflow-y-auto space-y-1 mb-6">
          {formats.map((name) => {
            const isDone = completedFormats.includes(name);

            return (
              <div
                key={name}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors duration-300 ${isDone ? 'bg-secondary/50' : ''}`}
              >
                {isDone ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-intent-awareness shrink-0"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-border/50 shrink-0" />
                )}

                <span
                  className={`font-sans text-xs font-light ${isDone ? 'text-muted-foreground line-through' : 'text-foreground'}`}
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
