import { type ChangeEvent, useId } from 'react';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  formatValue?: (v: number) => string;
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showValue = true,
  formatValue,
}: SliderProps) {
  const id = useId();
  const percent = ((value - min) / (max - min)) * 100;
  const displayValue = formatValue ? formatValue(value) : String(value);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  return (
    <div className="flex flex-col gap-2">
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={id}
              className="font-sans text-xs font-semibold text-muted-foreground tracking-widest uppercase"
            >
              {label}
            </label>
          )}
          {showValue && (
            <span className="font-mono text-xs text-foreground tabular-nums">
              {displayValue}
            </span>
          )}
        </div>
      )}
      <div className="relative flex items-center h-4">
        <div className="absolute inset-x-0 h-px bg-border" />
        <div
          className="absolute left-0 h-px bg-primary"
          style={{ width: `${percent}%` }}
        />
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="relative w-full appearance-none bg-transparent cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-primary
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-background
            [&::-webkit-slider-thumb]:shadow-sm
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:duration-150
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:appearance-none
            [&::-moz-range-thumb]:w-4
            [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-primary
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-background
            [&::-moz-range-thumb]:shadow-sm
            [&::-webkit-slider-runnable-track]:appearance-none
            [&::-webkit-slider-runnable-track]:bg-transparent
            [&::-webkit-slider-runnable-track]:h-px
            [&::-moz-range-track]:appearance-none
            [&::-moz-range-track]:bg-transparent
            [&::-moz-range-track]:h-px
          "
        />
      </div>
    </div>
  );
}
