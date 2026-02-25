import { useState } from 'react';
import { SectionLabel, Slider, ColorPicker } from '../../shared';

const FONT_FAMILIES = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Bebas Neue', label: 'Bebas Neue' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'DM Sans', label: 'DM Sans' },
];

const FONT_WEIGHTS = [
  { value: 300, label: 'Light' },
  { value: 400, label: 'Regular' },
  { value: 500, label: 'Medium' },
  { value: 600, label: 'Semibold' },
  { value: 700, label: 'Bold' },
  { value: 800, label: 'Extrabold' },
  { value: 900, label: 'Black' },
];

type TextAlign = 'left' | 'center' | 'right';
type TextCase = 'uppercase' | 'capitalize' | 'lowercase';

export function TypographyControls() {
  const [fontFamily, setFontFamily] = useState('Inter');
  const [fontWeight, setFontWeight] = useState(400);
  const [fontSize, setFontSize] = useState(48);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.2);
  const [textAlign, setTextAlign] = useState<TextAlign>('left');
  const [textCase, setTextCase] = useState<TextCase>('capitalize');
  const [textColor, setTextColor] = useState('#1A1A1A');

  const adjustFontSize = (delta: number) => {
    setFontSize((prev) => Math.max(8, Math.min(200, prev + delta)));
  };

  return (
    <div className="flex flex-col gap-4">
      <SectionLabel>Tipografia</SectionLabel>

      {/* Font family */}
      <div className="flex flex-col gap-1.5">
        <label className="font-sans text-[11px] text-muted-foreground uppercase tracking-wider">
          Familia
        </label>
        <select
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
          className="w-full rounded-lg border border-border bg-secondary px-3 py-2 font-sans text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer"
          style={{ fontFamily }}
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {/* Font weight */}
      <div className="flex flex-col gap-1.5">
        <label className="font-sans text-[11px] text-muted-foreground uppercase tracking-wider">
          Peso
        </label>
        <select
          value={fontWeight}
          onChange={(e) => setFontWeight(Number(e.target.value))}
          className="w-full rounded-lg border border-border bg-secondary px-3 py-2 font-sans text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer"
        >
          {FONT_WEIGHTS.map((w) => (
            <option key={w.value} value={w.value}>
              {w.label} ({w.value})
            </option>
          ))}
        </select>
      </div>

      {/* Font size with +/- */}
      <div className="flex flex-col gap-1.5">
        <label className="font-sans text-[11px] text-muted-foreground uppercase tracking-wider">
          Tamano
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => adjustFontSize(-1)}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-secondary text-foreground hover:bg-muted transition-colors font-mono text-sm"
          >
            -
          </button>
          <input
            type="number"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value) || 8)}
            min={8}
            max={200}
            className="flex-1 rounded-lg border border-border bg-secondary px-3 py-1.5 font-mono text-sm text-foreground text-center focus:outline-none focus:ring-2 focus:ring-ring [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={() => adjustFontSize(1)}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-secondary text-foreground hover:bg-muted transition-colors font-mono text-sm"
          >
            +
          </button>
          <span className="font-mono text-xs text-muted-foreground">px</span>
        </div>
      </div>

      {/* Letter spacing */}
      <Slider
        label="Espaciado"
        value={letterSpacing}
        onChange={setLetterSpacing}
        min={-5}
        max={20}
        step={0.5}
        formatValue={(v) => `${v > 0 ? '+' : ''}${v}`}
      />

      {/* Line height */}
      <Slider
        label="Interlineado"
        value={lineHeight}
        onChange={setLineHeight}
        min={0.8}
        max={2.5}
        step={0.05}
        formatValue={(v) => v.toFixed(2)}
      />

      {/* Alignment */}
      <div className="flex flex-col gap-1.5">
        <label className="font-sans text-[11px] text-muted-foreground uppercase tracking-wider">
          Alineacion
        </label>
        <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary border border-border">
          {(['left', 'center', 'right'] as TextAlign[]).map((align) => (
            <button
              key={align}
              type="button"
              onClick={() => setTextAlign(align)}
              className={`flex-1 flex items-center justify-center py-1.5 rounded-md transition-colors ${
                textAlign === align
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label={`Alinear ${align}`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {align === 'left' && (
                  <>
                    <line x1="17" y1="10" x2="3" y2="10" />
                    <line x1="21" y1="6" x2="3" y2="6" />
                    <line x1="21" y1="14" x2="3" y2="14" />
                    <line x1="17" y1="18" x2="3" y2="18" />
                  </>
                )}
                {align === 'center' && (
                  <>
                    <line x1="18" y1="10" x2="6" y2="10" />
                    <line x1="21" y1="6" x2="3" y2="6" />
                    <line x1="21" y1="14" x2="3" y2="14" />
                    <line x1="18" y1="18" x2="6" y2="18" />
                  </>
                )}
                {align === 'right' && (
                  <>
                    <line x1="21" y1="10" x2="7" y2="10" />
                    <line x1="21" y1="6" x2="3" y2="6" />
                    <line x1="21" y1="14" x2="3" y2="14" />
                    <line x1="21" y1="18" x2="7" y2="18" />
                  </>
                )}
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Case buttons */}
      <div className="flex flex-col gap-1.5">
        <label className="font-sans text-[11px] text-muted-foreground uppercase tracking-wider">
          Mayusculas
        </label>
        <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary border border-border">
          {([
            { value: 'uppercase' as TextCase, label: 'AA' },
            { value: 'capitalize' as TextCase, label: 'Aa' },
            { value: 'lowercase' as TextCase, label: 'aa' },
          ]).map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTextCase(value)}
              className={`flex-1 py-1.5 rounded-md font-sans text-sm font-medium transition-colors ${
                textCase === value
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Text color */}
      <ColorPicker
        label="Color de texto"
        value={textColor}
        onChange={setTextColor}
        palette={['#1A1A1A', '#FFFFFF', '#666666', '#F0EEE9', '#B91C1C']}
      />
    </div>
  );
}
