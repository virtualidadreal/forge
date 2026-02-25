import type { BrandDNA } from '../../types/brandDNA.types';
import { SectionLabel } from '../shared';

interface BrandDNAPreviewProps {
  brandDNA: BrandDNA;
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

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
    <span className={`font-mono text-xs tabular-nums ${color}`}>
      {percent}% confianza
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

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
      {/* Confidence */}
      <div className="flex items-center justify-between">
        <SectionLabel>Brand DNA</SectionLabel>
        <ConfidenceBadge score={confidence_score} />
      </div>

      {/* Color palette */}
      <div>
        <SectionLabel>Paleta de colores</SectionLabel>
        <div className="flex gap-2 flex-wrap">
          {paletteColors.map((c, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div
                className="h-10 w-10 rounded-full border border-border"
                style={{
                  backgroundColor: c.value!,
                  boxShadow: 'var(--shadow-subtle)',
                }}
              />
              <span className="font-mono text-[10px] text-muted-foreground">
                {c.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div>
        <SectionLabel>Tipografia</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-secondary/50 px-3 py-2.5">
            <p className="font-sans text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
              Peso heading
            </p>
            <p className="font-mono text-xs text-foreground">
              {HEADING_WEIGHT_LABELS[typography.heading_weight] ?? typography.heading_weight}
            </p>
          </div>
          <div className="rounded-xl bg-secondary/50 px-3 py-2.5">
            <p className="font-sans text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
              Caja
            </p>
            <p className="font-mono text-xs text-foreground">
              {HEADING_CASE_LABELS[typography.heading_case] ?? typography.heading_case}
            </p>
          </div>
          <div className="rounded-xl bg-secondary/50 px-3 py-2.5">
            <p className="font-sans text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
              Estilo fuente
            </p>
            <p className="font-mono text-xs text-foreground">
              {typography.preferred_font_style}
            </p>
          </div>
          <div className="rounded-xl bg-secondary/50 px-3 py-2.5">
            <p className="font-sans text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
              Italicas
            </p>
            <p className="font-mono text-xs text-foreground">
              {typography.uses_italic ? 'Si' : 'No'}
            </p>
          </div>
        </div>
      </div>

      {/* Composition */}
      <div>
        <SectionLabel>Composicion</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-secondary/50 px-3 py-2.5">
            <p className="font-sans text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
              Densidad
            </p>
            <p className="font-mono text-xs text-foreground">
              {DENSITY_LABELS[composition.density] ?? composition.density}
            </p>
          </div>
          <div className="rounded-xl bg-secondary/50 px-3 py-2.5">
            <p className="font-sans text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
              Alineacion
            </p>
            <p className="font-mono text-xs text-foreground">
              {ALIGNMENT_LABELS[composition.alignment] ?? composition.alignment}
            </p>
          </div>
          <div className="rounded-xl bg-secondary/50 px-3 py-2.5 col-span-2">
            <p className="font-sans text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
              Zona de texto
            </p>
            <p className="font-mono text-xs text-foreground">
              {composition.text_zone}
            </p>
          </div>
        </div>
      </div>

      {/* Copy tone */}
      <div>
        <SectionLabel>Tono del copy</SectionLabel>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-secondary/50 px-3 py-2.5">
            <p className="font-sans text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
              Formalidad
            </p>
            <p className="font-mono text-xs text-foreground capitalize">
              {copy_tone.formality}
            </p>
          </div>
          <div className="rounded-xl bg-secondary/50 px-3 py-2.5">
            <p className="font-sans text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
              Emocion
            </p>
            <p className="font-mono text-xs text-foreground capitalize">
              {copy_tone.emotional_weight}
            </p>
          </div>
          <div className="rounded-xl bg-secondary/50 px-3 py-2.5">
            <p className="font-sans text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
              Urgencia
            </p>
            <p className="font-mono text-xs text-foreground capitalize">
              {copy_tone.urgency_level}
            </p>
          </div>
        </div>
      </div>

      {/* Signature elements */}
      {signature_elements.length > 0 && (
        <div>
          <SectionLabel>Elementos de firma</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {signature_elements.map((el, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-full bg-secondary px-3 py-1 font-sans text-xs text-secondary-foreground border border-border"
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
