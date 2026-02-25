import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type ChangeEvent,
} from 'react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  palette?: string[];
}

export function ColorPicker({
  value,
  onChange,
  label,
  palette,
}: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [hexInput, setHexInput] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHexInput(value);
  }, [value]);

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, handleClickOutside]);

  const handleHexChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setHexInput(raw);
    if (/^#[0-9A-Fa-f]{6}$/.test(raw)) {
      onChange(raw);
    }
  };

  const handleHexBlur = () => {
    if (!/^#[0-9A-Fa-f]{6}$/.test(hexInput)) {
      setHexInput(value);
    }
  };

  const handleNativeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    onChange(color);
    setHexInput(color);
  };

  return (
    <div ref={containerRef} className="relative inline-block">
      {label && (
        <p className="font-sans text-xs font-semibold text-muted-foreground tracking-widest uppercase mb-2">
          {label}
        </p>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-1.5 transition-colors hover:bg-muted"
      >
        <span
          className="block w-5 h-5 rounded-md border border-border shrink-0"
          style={{ backgroundColor: value }}
        />
        <span className="font-mono text-xs text-foreground uppercase">
          {value}
        </span>
      </button>

      {open && (
        <div
          className="absolute left-0 top-full mt-2 w-56 rounded-xl border border-border bg-card p-3 flex flex-col gap-3"
          style={{
            zIndex: 'var(--z-dropdown)',
            boxShadow: 'var(--shadow-elevated)',
          }}
        >
          {palette && palette.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {palette.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    onChange(color);
                    setHexInput(color);
                  }}
                  className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
                    value.toLowerCase() === color.toLowerCase()
                      ? 'border-primary scale-110'
                      : 'border-border'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <label className="relative w-8 h-8 shrink-0 cursor-pointer">
              <input
                type="color"
                value={value}
                onChange={handleNativeChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <span
                className="block w-full h-full rounded-lg border border-border"
                style={{ backgroundColor: value }}
              />
            </label>
            <input
              type="text"
              value={hexInput}
              onChange={handleHexChange}
              onBlur={handleHexBlur}
              maxLength={7}
              className="flex-1 rounded-lg border border-border bg-background px-2.5 py-1.5 font-mono text-xs text-foreground uppercase focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="#000000"
            />
          </div>
        </div>
      )}
    </div>
  );
}
