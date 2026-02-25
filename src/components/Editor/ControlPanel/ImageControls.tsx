import { useState } from 'react';
import { SectionLabel, Slider, Button } from '../../shared';
import { COLOR_GRADING_PRESETS } from '../../../constants/imageTreatments';

type TreatmentType = 'none' | 'overlay' | 'duotone' | 'grain' | 'grading';

const TREATMENT_OPTIONS: { value: TreatmentType; label: string }[] = [
  { value: 'none', label: 'Ninguno' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'duotone', label: 'Duotono' },
  { value: 'grain', label: 'Grain' },
  { value: 'grading', label: 'Grading' },
];

export function ImageControls() {
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [scale, setScale] = useState(100);
  const [treatment, setTreatment] = useState<TreatmentType>('none');
  const [intensity, setIntensity] = useState(50);
  const [gradingPreset, setGradingPreset] = useState('clean_neutral');

  return (
    <div className="flex flex-col gap-4">
      <SectionLabel>Imagen</SectionLabel>

      {/* Position */}
      <div className="flex flex-col gap-1.5">
        <label className="font-sans text-[11px] text-muted-foreground uppercase tracking-wider">
          Posicion
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] text-muted-foreground w-3">X</span>
            <input
              type="number"
              value={posX}
              onChange={(e) => setPosX(Number(e.target.value))}
              className="w-full rounded-lg border border-border bg-secondary px-2.5 py-1.5 font-mono text-xs text-foreground text-center focus:outline-none focus:ring-2 focus:ring-ring [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] text-muted-foreground w-3">Y</span>
            <input
              type="number"
              value={posY}
              onChange={(e) => setPosY(Number(e.target.value))}
              className="w-full rounded-lg border border-border bg-secondary px-2.5 py-1.5 font-mono text-xs text-foreground text-center focus:outline-none focus:ring-2 focus:ring-ring [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>
      </div>

      {/* Scale */}
      <Slider
        label="Escala"
        value={scale}
        onChange={setScale}
        min={10}
        max={300}
        step={1}
        formatValue={(v) => `${v}%`}
      />

      {/* Crop button */}
      <Button variant="secondary" size="sm" className="w-full">
        Editar crop
      </Button>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Treatment selector */}
      <div className="flex flex-col gap-1.5">
        <label className="font-sans text-[11px] text-muted-foreground uppercase tracking-wider">
          Tratamiento
        </label>
        <div className="flex flex-wrap gap-1.5">
          {TREATMENT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTreatment(opt.value)}
              className={`px-2.5 py-1.5 rounded-lg font-sans text-xs transition-colors ${
                treatment === opt.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground border border-border hover:bg-muted'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Intensity (when treatment is not none) */}
      {treatment !== 'none' && (
        <Slider
          label="Intensidad"
          value={intensity}
          onChange={setIntensity}
          min={0}
          max={100}
          step={1}
          formatValue={(v) => `${v}%`}
        />
      )}

      {/* Grading preset (when treatment is grading) */}
      {treatment === 'grading' && (
        <div className="flex flex-col gap-1.5">
          <label className="font-sans text-[11px] text-muted-foreground uppercase tracking-wider">
            Preset
          </label>
          <select
            value={gradingPreset}
            onChange={(e) => setGradingPreset(e.target.value)}
            className="w-full rounded-lg border border-border bg-secondary px-3 py-2 font-sans text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer"
          >
            {COLOR_GRADING_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
