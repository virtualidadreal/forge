import { useState } from 'react';
import { SectionLabel, Slider, ColorPicker } from '../../shared';

export function ColorControls() {
  const [bgColor, setBgColor] = useState('#F2EFE6');
  const [bgOpacity, setBgOpacity] = useState(100);
  const [borderEnabled, setBorderEnabled] = useState(false);
  const [borderColor, setBorderColor] = useState('#D4CEC3');

  return (
    <div className="flex flex-col gap-4">
      <SectionLabel>Color</SectionLabel>

      {/* Background color */}
      <ColorPicker
        label="Color de fondo"
        value={bgColor}
        onChange={setBgColor}
        palette={['#F0EEE9', '#F2EFE6', '#1A1A1A', '#FFFFFF', '#E6E0D4', '#DDD8CE']}
      />

      {/* Opacity */}
      <Slider
        label="Opacidad"
        value={bgOpacity}
        onChange={setBgOpacity}
        min={0}
        max={100}
        step={1}
        formatValue={(v) => `${v}%`}
      />

      {/* Border toggle */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="font-sans text-[11px] text-muted-foreground uppercase tracking-wider">
            Borde
          </label>
          <button
            type="button"
            onClick={() => setBorderEnabled(!borderEnabled)}
            className={`relative w-9 h-5 rounded-full transition-colors ${
              borderEnabled ? 'bg-primary' : 'bg-border'
            }`}
            aria-label={borderEnabled ? 'Desactivar borde' : 'Activar borde'}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-card shadow-sm transition-transform ${
                borderEnabled ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {borderEnabled && (
          <ColorPicker
            value={borderColor}
            onChange={setBorderColor}
            palette={['#D4CEC3', '#1A1A1A', '#FFFFFF', '#666666']}
          />
        )}
      </div>
    </div>
  );
}
