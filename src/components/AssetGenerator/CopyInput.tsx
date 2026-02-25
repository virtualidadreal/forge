import { useState, useMemo, useCallback, type ChangeEvent } from 'react';
import { useSessionStore } from '../../store/session.store';
import type { CopyRole } from '../../types/composition.types';
import { SectionLabel } from '../shared';

// ---------------------------------------------------------------------------
// Heuristic auto-classification for free mode
// ---------------------------------------------------------------------------

interface ClassifiedChunk {
  text: string;
  role: CopyRole;
}

const ACTION_VERBS = [
  'compra', 'descubre', 'prueba', 'regist', 'descarga', 'empieza',
  'unete', 'suscri', 'reserva', 'consigue', 'pide', 'activa',
  'llama', 'contacta', 'agenda', 'buy', 'shop', 'get', 'start',
  'try', 'sign', 'subscribe', 'join', 'order', 'book', 'claim',
];

function classifyFreeText(raw: string): ClassifiedChunk[] {
  const lines = raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  const chunks: ClassifiedChunk[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const wordCount = line.split(/\s+/).length;
    const lower = line.toLowerCase();

    // Tagline detection: contains separator characters
    if (/[·—|]/.test(line)) {
      chunks.push({ text: line, role: 'tagline' });
      continue;
    }

    // CTA detection: short + starts with action verb
    if (wordCount <= 5 && ACTION_VERBS.some((v) => lower.startsWith(v))) {
      chunks.push({ text: line, role: 'cta' });
      continue;
    }

    // First unassigned line is heading
    if (!chunks.some((c) => c.role === 'heading')) {
      chunks.push({ text: line, role: 'heading' });
      continue;
    }

    // Small text at the end is disclaimer
    if (i === lines.length - 1 && wordCount <= 8 && /[*©®]/.test(line)) {
      chunks.push({ text: line, role: 'disclaimer' });
      continue;
    }

    // Everything else is subheading
    chunks.push({ text: line, role: 'subheading' });
  }

  return chunks;
}

// ---------------------------------------------------------------------------
// Role chip colors mapped to intent tokens
// ---------------------------------------------------------------------------

const ROLE_STYLES: Record<CopyRole, { label: string; bg: string; text: string }> = {
  heading:     { label: 'Titular',     bg: 'bg-intent-editorial/15', text: 'text-intent-editorial' },
  subheading:  { label: 'Subtitulo',   bg: 'bg-intent-campaign/15',  text: 'text-intent-campaign' },
  cta:         { label: 'CTA',         bg: 'bg-intent-convert/15',   text: 'text-intent-convert' },
  tagline:     { label: 'Tagline',     bg: 'bg-intent-branding/15',  text: 'text-intent-branding' },
  disclaimer:  { label: 'Disclaimer',  bg: 'bg-muted',              text: 'text-muted-foreground' },
};

// ---------------------------------------------------------------------------
// Structured mode field config
// ---------------------------------------------------------------------------

const STRUCTURED_FIELDS: {
  key: 'heading' | 'subheading' | 'cta' | 'tagline' | 'disclaimer';
  label: string;
  placeholder: string;
  rows: number;
}[] = [
  { key: 'heading',    label: 'Titular',     placeholder: 'El texto principal de tu pieza',           rows: 2 },
  { key: 'subheading', label: 'Subtitulo',   placeholder: 'Texto secundario de soporte',              rows: 2 },
  { key: 'cta',        label: 'CTA',         placeholder: 'Compra ahora, Descubre mas...',            rows: 1 },
  { key: 'tagline',    label: 'Tagline',     placeholder: 'Eslogan o linea de marca',                 rows: 1 },
  { key: 'disclaimer', label: 'Disclaimer',  placeholder: 'Texto legal, condiciones...',              rows: 1 },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CopyInput() {
  const { copy, setCopy, updateCopyField, intention } = useSessionStore();

  const [mode, setMode] = useState<'free' | 'structured'>('free');
  const [freeText, setFreeText] = useState('');
  const [noCopy, setNoCopy] = useState(false);

  const isBranding = intention === 'branding';

  // Auto-classification from free text
  const classified = useMemo(() => classifyFreeText(freeText), [freeText]);

  const handleFreeChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setFreeText(value);

      // Sync classified chunks to the session store
      const chunks = classifyFreeText(value);
      const next = {
        heading: '',
        subheading: '',
        cta: '',
        tagline: '',
        disclaimer: '',
      };

      for (const chunk of chunks) {
        if (next[chunk.role]) {
          next[chunk.role] += '\n' + chunk.text;
        } else {
          next[chunk.role] = chunk.text;
        }
      }
      setCopy(next);
    },
    [setCopy],
  );

  const handleStructuredChange = useCallback(
    (field: keyof typeof copy, e: ChangeEvent<HTMLTextAreaElement>) => {
      updateCopyField(field, e.target.value);
    },
    [updateCopyField],
  );

  const toggleMode = useCallback(() => {
    if (mode === 'free') {
      // Switch to structured: data already synced in store
      setMode('structured');
    } else {
      // Switch to free: reconstruct free text from structured fields
      const parts = [copy.heading, copy.subheading, copy.cta, copy.tagline, copy.disclaimer]
        .filter(Boolean);
      setFreeText(parts.join('\n'));
      setMode('free');
    }
  }, [mode, copy]);

  const handleNoCopyToggle = useCallback(() => {
    const next = !noCopy;
    setNoCopy(next);
    if (next) {
      setCopy({ heading: '', subheading: '', cta: '', tagline: '', disclaimer: '' });
      setFreeText('');
    }
  }, [noCopy, setCopy]);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <SectionLabel>Copy</SectionLabel>
        <div className="flex items-center gap-3">
          {/* No copy toggle (for branding or by choice) */}
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={noCopy}
              onChange={handleNoCopyToggle}
              className="w-3.5 h-3.5 accent-foreground rounded"
            />
            <span className="font-sans text-xs text-muted-foreground">
              Sin copy{isBranding ? ' (Branding)' : ''}
            </span>
          </label>

          {/* Mode toggle */}
          {!noCopy && (
            <button
              onClick={toggleMode}
              className="font-sans text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
            >
              {mode === 'free' ? 'Modo estructurado' : 'Modo libre'}
            </button>
          )}
        </div>
      </div>

      {noCopy ? (
        <div className="flex items-center justify-center h-20 rounded-xl border border-dashed border-border bg-card">
          <p className="font-sans text-sm text-muted-foreground">
            La pieza se generara solo con imagen y marca
          </p>
        </div>
      ) : mode === 'free' ? (
        /* ----- Free mode ----- */
        <div className="space-y-3">
          <textarea
            value={freeText}
            onChange={handleFreeChange}
            placeholder="Pega todo tu copy aqui. Cada linea se clasificara automaticamente como titular, subtitulo, CTA..."
            rows={5}
            className="
              w-full resize-none rounded-xl border border-border bg-card px-4 py-3
              font-sans text-sm text-foreground placeholder:text-muted-foreground
              focus:outline-none focus:ring-2 focus:ring-ring
              transition-all duration-150
            "
          />

          {/* Classification preview chips */}
          {classified.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {classified.map((chunk, i) => {
                const style = ROLE_STYLES[chunk.role];
                return (
                  <span
                    key={i}
                    className={`
                      inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                      font-sans text-xs font-medium
                      ${style.bg} ${style.text}
                    `}
                  >
                    <span className="opacity-60">{style.label}</span>
                    <span className="truncate max-w-[180px]">{chunk.text}</span>
                  </span>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ----- Structured mode ----- */
        <div className="space-y-3">
          {STRUCTURED_FIELDS.map((field) => (
            <div key={field.key}>
              <label className="block font-sans text-xs font-medium text-muted-foreground mb-1">
                {field.label}
              </label>
              <textarea
                value={copy[field.key] ?? ''}
                onChange={(e) => handleStructuredChange(field.key, e)}
                placeholder={field.placeholder}
                rows={field.rows}
                className="
                  w-full resize-none rounded-lg border border-border bg-card px-3 py-2
                  font-sans text-sm text-foreground placeholder:text-muted-foreground
                  focus:outline-none focus:ring-2 focus:ring-ring
                  transition-all duration-150
                "
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
