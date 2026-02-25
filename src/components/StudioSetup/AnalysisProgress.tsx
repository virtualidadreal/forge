import { useEffect, useState } from 'react';

interface AnalysisProgressProps {
  progress: number;
  currentStep: number;
}

const ANALYSIS_STEPS = [
  'Paleta de colores detectada',
  'Sistema tipografico inferido',
  'Elementos de firma identificados',
  'Logica compositiva analizada',
  'Tono del copy extraido',
];

type StepStatus = 'pending' | 'active' | 'complete';

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      className={`animate-spin ${className ?? ''}`}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2.5"
        className="opacity-20"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="opacity-80"
      />
    </svg>
  );
}

export function AnalysisProgress({
  progress,
  currentStep,
}: AnalysisProgressProps) {
  // Animate step statuses with a small delay for visual polish
  const [animatedSteps, setAnimatedSteps] = useState<StepStatus[]>(
    ANALYSIS_STEPS.map(() => 'pending'),
  );

  useEffect(() => {
    setAnimatedSteps(
      ANALYSIS_STEPS.map((_, i) => {
        if (i < currentStep) return 'complete';
        if (i === currentStep) return 'active';
        return 'pending';
      }),
    );
  }, [currentStep]);

  return (
    <div className="flex flex-col items-center gap-10 py-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="font-serif text-2xl font-semibold text-foreground">
          Analizando tu marca
        </h3>
        <p className="font-sans text-sm text-muted-foreground mt-2">
          Extrayendo el ADN visual de tus assets
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-sm">
        <div className="relative h-2 rounded-full bg-secondary overflow-hidden">
          <div
            className="progress-shimmer absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-out"
            style={{
              width: `${progress}%`,
              background:
                progress >= 100
                  ? 'var(--primary)'
                  : undefined,
            }}
          />
        </div>
        <div className="flex justify-between mt-3">
          <span className="font-mono text-xs text-muted-foreground tabular-nums">
            {Math.round(progress)}%
          </span>
          <span className="font-sans text-xs text-muted-foreground">
            {progress >= 100 ? 'Completo' : 'Procesando...'}
          </span>
        </div>
      </div>

      {/* Step checklist */}
      <div className="w-full max-w-sm flex flex-col gap-1.5">
        {ANALYSIS_STEPS.map((label, i) => {
          const status = animatedSteps[i];
          return (
            <div
              key={i}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg
                transition-all duration-300
                ${status === 'active' ? 'bg-secondary/60' : ''}
                ${status === 'complete' ? 'opacity-100' : ''}
                ${status === 'pending' ? 'opacity-40' : ''}
              `}
            >
              {/* Status icon */}
              <div
                className={`
                  flex h-5 w-5 items-center justify-center rounded-full shrink-0
                  transition-all duration-300
                  ${status === 'complete' ? 'bg-primary text-primary-foreground' : ''}
                  ${status === 'active' ? 'text-primary' : ''}
                  ${status === 'pending' ? 'border border-border text-transparent' : ''}
                `}
              >
                {status === 'complete' && <CheckIcon />}
                {status === 'active' && <SpinnerIcon />}
                {status === 'pending' && (
                  <div className="h-1.5 w-1.5 rounded-full bg-border" />
                )}
              </div>

              {/* Label */}
              <span
                className={`
                  font-sans text-sm transition-colors duration-300
                  ${status === 'complete' ? 'text-foreground font-medium' : ''}
                  ${status === 'active' ? 'text-foreground font-medium' : ''}
                  ${status === 'pending' ? 'text-muted-foreground' : ''}
                `}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
