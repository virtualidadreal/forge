import type { BrandDNA } from '../../types/brandDNA.types';
import { SectionLabel } from '../shared';

interface BrandDNAPreviewProps {
  brandDNA: BrandDNA;
}

const HEADING_WEIGHT_LABELS: Record<string, string> = {
  heavy: 'Heavy (900)',
  bold: 'Bold (700)',
  medium: 'Medium (500)',
  light: 'Light (300)',
};

const HEADING_CASE_LABELS: Record<string, string> = {
  uppercase: 'UPPERCASE',
  mixed: 'Mixed Case',
  lowercase: 'lowercase',
};

const DENSITY_LABELS: Record<string, string> = {
  dense: 'Densa',
  balanced: 'Equilibrada',
  'editorial-sparse': 'Editorial dispersa',
};

const ALIGNMENT_LABELS: Record<string, string> = {
  left: 'Izquierda',
  center: 'Centro',
  right: 'Derecha',
};

function ConfidenceBadge({ score }: { score: number }) {
  const percent = Math.round(score * 100);
  const color =
    percent >= 80
      ? 'text-intent-awareness'
      : percent >= 60
        ? 'text-foreground'
        : 'text-muted-foreground';

  return (
    <span className={`font-mono text-xs font-light tabular-nums ${color}`}>
      {percent}% confianza
    </span>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-secondary/50 px-4 py-3">
      <p className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] mb-0.5">
        {label}
      </p>
      <p className="font-mono text-xs text-foreground">{value}</p>
    </div>
  );
}

export function BrandDNAPreview({ brandDNA }: BrandDNAPreviewProps) {
  const { palette, typography, composition, signature_elements, copy_tone, confidence_score } =
    brandDNA;

  const paletteColors = [
    { label: 'BG', value: palette.background },
    { label: 'Text', value: palette.text_primary },
    { label: 'Text 2', value: palette.text_secondary },
    { label: 'Accent', value: palette.accent },
    { label: 'Pill BG', value: palette.pill_background },
    { label: 'Pill Text', value: palette.pill_text },
  ].filter((c) => c.value !== null);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <SectionLabel>Brand DNA</SectionLabel>
        <ConfidenceBadge score={confidence_score} />
      </div>

      <div>
        <SectionLabel>Paleta de colores</SectionLabel>
        <div className="flex gap-2 flex-wrap">
          {paletteColors.map((c, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className="h-9 w-9 rounded-full border border-border/50 shadow-subtle"
                style={{ backgroundColor: c.value! }}
              />
              <span className="font-mono text-[10px] text-muted-foreground">{c.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Tipografia</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          <InfoCell label="Peso heading" value={HEADING_WEIGHT_LABELS[typography.heading_weight] ?? typography.heading_weight} />
          <InfoCell label="Caja" value={HEADING_CASE_LABELS[typography.heading_case] ?? typography.heading_case} />
          <InfoCell label="Estilo fuente" value={typography.preferred_font_style} />
          <InfoCell label="Italicas" value={typography.uses_italic ? 'Si' : 'No'} />
        </div>
      </div>

      <div>
        <SectionLabel>Composicion</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          <InfoCell label="Densidad" value={DENSITY_LABELS[composition.density] ?? composition.density} />
          <InfoCell label="Alineacion" value={ALIGNMENT_LABELS[composition.alignment] ?? composition.alignment} />
          <div className="col-span-2">
            <InfoCell label="Zona de texto" value={composition.text_zone} />
          </div>
        </div>
      </div>

      <div>
        <SectionLabel>Tono del copy</SectionLabel>
        <div className="grid grid-cols-3 gap-2">
          <InfoCell label="Formalidad" value={copy_tone.formality} />
          <InfoCell label="Emocion" value={copy_tone.emotional_weight} />
          <InfoCell label="Urgencia" value={copy_tone.urgency_level} />
        </div>
      </div>

      {signature_elements.length > 0 && (
        <div>
          <SectionLabel>Elementos de firma</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {signature_elements.map((el, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-light text-secondary-foreground border border-border/50"
              >
                {el}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
