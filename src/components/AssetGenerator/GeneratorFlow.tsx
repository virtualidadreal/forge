import { useCallback, useState, useRef } from 'react';
import { useSessionStore } from '../../store/session.store';
import { useBrandDNAStore } from '../../store/brandDNA.store';
import { useResultsStore } from '../../store/results.store';
import { V1_FORMATS } from '../../constants/formats';
import { INTENTIONS } from '../../constants/intentions';
import type { GeneratedPiece } from '../../types/composition.types';
import { Button, SectionLabel } from '../shared';
import { ImageUploader } from './ImageUploader';
import { CopyInput } from './CopyInput';
import { IntentionSelector } from './IntentionSelector';
import { FormatSelector } from './FormatSelector';
import { GenerationProgress } from './GenerationProgress';
import { generateCompositions } from '../../services/composer.service';
import { renderPiece, renderToDataUrl } from '../../services/renderer.service';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function GeneratorFlow() {
  const {
    imageDataUrl,
    imageFileName,
    selectedFormats,
    intention,
    copy,
    isGenerating,
    setGenerating,
    setGenerationProgress,
    generationProgress,
  } = useSessionStore();

  const { getActiveBrand, brands, setActiveBrand } = useBrandDNAStore();
  const { setPieces } = useResultsStore();

  const activeBrand = getActiveBrand();

  const [showBrandPicker, setShowBrandPicker] = useState(false);
  const [completedFormatNames, setCompletedFormatNames] = useState<string[]>([]);
  const cancelRef = useRef(false);

  // Resolve selected format specs
  const selectedFormatSpecs = V1_FORMATS.filter((f) => selectedFormats.includes(f.id));
  const selectedFormatNames = selectedFormatSpecs.map((f) => f.name);

  // Active intention details
  const activeIntention = INTENTIONS.find((i) => i.id === intention);

  // Can generate?
  const canGenerate = !!imageDataUrl && selectedFormats.length > 0;

  // ---------- Generate with real services ----------
  const handleGenerate = useCallback(async () => {
    if (!canGenerate || !activeBrand) return;
    cancelRef.current = false;
    setGenerating(true);
    setGenerationProgress(0);
    setCompletedFormatNames([]);

    try {
      // Strip data URI prefix for the API call
      const imageBase64 = imageDataUrl!.split(',')[1] || imageDataUrl!;

      // Step 1: Generate compositions via AI (single API call)
      setGenerationProgress(10);
      const instructions = await generateCompositions(
        imageBase64,
        activeBrand,
        intention,
        copy,
        selectedFormats,
      );

      if (cancelRef.current) { setGenerating(false); return; }
      setGenerationProgress(30);

      // Step 2: Render each instruction to get preview thumbnails
      const pieces: GeneratedPiece[] = [];
      const totalInstructions = instructions.length;

      for (let i = 0; i < totalInstructions; i++) {
        if (cancelRef.current) break;

        const instruction = instructions[i];
        const format = V1_FORMATS.find(f => f.id === instruction.format);

        try {
          const canvas = await renderPiece(instruction, imageDataUrl!, activeBrand.logo_url || undefined);
          const previewDataUrl = renderToDataUrl(canvas, 'jpeg', 0.7);
          canvas.dispose();

          pieces.push({
            id: `${instruction.format}-v${instruction.variation_seed}-${Date.now()}`,
            format_id: instruction.format,
            variation: instruction.variation_seed,
            composition: instruction,
            preview_data_url: previewDataUrl,
            edited: false,
          });
        } catch (err) {
          console.error(`Failed to render ${instruction.format} v${instruction.variation_seed}:`, err);
          // Still add piece without preview
          pieces.push({
            id: `${instruction.format}-v${instruction.variation_seed}-${Date.now()}`,
            format_id: instruction.format,
            variation: instruction.variation_seed,
            composition: instruction,
            edited: false,
          });
        }

        const progressPct = 30 + Math.round(((i + 1) / totalInstructions) * 70);
        setGenerationProgress(progressPct);

        // Update completed format names (once per format, every 3 variations)
        if (format && (i + 1) % 3 === 0) {
          setCompletedFormatNames(prev => [...prev, format.name]);
        }
      }

      if (!cancelRef.current) {
        setPieces(pieces);
      }
    } catch (error) {
      console.error('Generation failed:', error);
      // TODO: show toast
    } finally {
      setGenerating(false);
      setGenerationProgress(0);
      setCompletedFormatNames([]);
    }
  }, [canGenerate, activeBrand, imageDataUrl, intention, copy, selectedFormats, setGenerating, setGenerationProgress, setPieces]);

  const handleCancel = useCallback(() => {
    cancelRef.current = true;
    setGenerating(false);
    setGenerationProgress(0);
    setCompletedFormatNames([]);
  }, [setGenerating, setGenerationProgress]);

  return (
    <div className="flex gap-8 max-w-[var(--max-content-width)] mx-auto px-6 py-8 min-h-[calc(100vh-var(--header-height))]">
      {/* ================================================================= */}
      {/* LEFT COLUMN — Steps (60%) */}
      {/* ================================================================= */}
      <div className="flex-[3] min-w-0 space-y-8">
        {/* ---- Step 0: Brand DNA indicator ---- */}
        <div className="relative">
          <div
            className="flex items-center justify-between p-4 rounded-xl border border-border bg-card cursor-pointer hover:border-muted-foreground transition-all duration-150"
            onClick={() => setShowBrandPicker((v) => !v)}
          >
            <div className="flex items-center gap-3">
              {/* Brand logo or placeholder */}
              {activeBrand?.logo_url ? (
                <img
                  src={activeBrand.logo_url}
                  alt={activeBrand.brand_name}
                  className="w-8 h-8 rounded-lg object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                  <span className="font-serif text-sm font-semibold text-foreground">
                    {activeBrand?.brand_name?.charAt(0) ?? '?'}
                  </span>
                </div>
              )}
              <div>
                <p className="font-sans text-sm font-medium text-foreground">
                  {activeBrand?.brand_name ?? 'Sin marca activa'}
                </p>
                {activeBrand?.tagline && (
                  <p className="font-sans text-xs text-muted-foreground">{activeBrand.tagline}</p>
                )}
              </div>
            </div>

            <span className="font-sans text-xs text-muted-foreground">
              Cambiar
            </span>
          </div>

          {/* Brand picker dropdown */}
          {showBrandPicker && brands.length > 1 && (
            <div
              className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-border bg-card shadow-lg overflow-hidden"
              style={{ zIndex: 'var(--z-dropdown)' }}
            >
              {brands.map((brand) => (
                <button
                  key={brand.brand_id}
                  onClick={() => {
                    setActiveBrand(brand.brand_id);
                    setShowBrandPicker(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 text-left
                    hover:bg-accent/10 transition-colors
                    ${brand.brand_id === activeBrand?.brand_id ? 'bg-accent/15' : ''}
                  `}
                >
                  <div className="w-6 h-6 rounded bg-secondary flex items-center justify-center shrink-0">
                    <span className="font-serif text-xs font-semibold">
                      {brand.brand_name.charAt(0)}
                    </span>
                  </div>
                  <span className="font-sans text-sm text-foreground">{brand.brand_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ---- Step 1: Image upload ---- */}
        <ImageUploader />

        {/* ---- Step 2: Copy input ---- */}
        <CopyInput />

        {/* ---- Step 3: Intention selector ---- */}
        <IntentionSelector />

        {/* ---- Step 4: Format selector ---- */}
        <FormatSelector />

        {/* ---- Step 5: Generate button ---- */}
        <div className="sticky bottom-0 py-4 bg-gradient-to-t from-background via-background to-transparent">
          <Button
            variant="primary"
            size="lg"
            className="w-full text-base"
            disabled={!canGenerate}
            loading={isGenerating}
            onClick={handleGenerate}
          >
            Generar {selectedFormats.length} pieza{selectedFormats.length !== 1 ? 's' : ''}
          </Button>

          {!canGenerate && (
            <p className="font-sans text-xs text-muted-foreground text-center mt-2">
              {!imageDataUrl
                ? 'Sube una imagen para continuar'
                : 'Selecciona al menos un formato'}
            </p>
          )}
        </div>
      </div>

      {/* ================================================================= */}
      {/* RIGHT COLUMN — Preview panel (40%) */}
      {/* ================================================================= */}
      <aside className="flex-[2] min-w-0 hidden lg:block">
        <div className="sticky top-[calc(var(--header-height)+2rem)] space-y-6">
          {/* Image preview */}
          <div>
            <SectionLabel>Vista previa</SectionLabel>
            {imageDataUrl ? (
              <div className="rounded-2xl overflow-hidden border border-border bg-card">
                <img
                  src={imageDataUrl}
                  alt={imageFileName ?? 'Preview'}
                  className="w-full max-h-[280px] object-cover"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 rounded-2xl border border-dashed border-border bg-card">
                <p className="font-sans text-sm text-muted-foreground">Sin imagen</p>
              </div>
            )}
          </div>

          {/* Summary */}
          <div>
            <SectionLabel>Resumen</SectionLabel>
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              {/* Brand */}
              <SummaryRow
                label="Marca"
                value={activeBrand?.brand_name ?? 'No definida'}
              />

              {/* Intention */}
              <SummaryRow
                label="Intencion"
                value={
                  activeIntention
                    ? `${activeIntention.icon} ${activeIntention.name}`
                    : 'No seleccionada'
                }
              />

              {/* Formats */}
              <SummaryRow
                label="Formatos"
                value={`${selectedFormats.length} seleccionado${selectedFormats.length !== 1 ? 's' : ''}`}
              />

              {/* Format chips */}
              {selectedFormatSpecs.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedFormatSpecs.slice(0, 6).map((fmt) => (
                    <span
                      key={fmt.id}
                      className="px-2 py-0.5 rounded-full bg-secondary font-sans text-[10px] text-muted-foreground"
                    >
                      {fmt.name}
                    </span>
                  ))}
                  {selectedFormatSpecs.length > 6 && (
                    <span className="px-2 py-0.5 rounded-full bg-secondary font-sans text-[10px] text-muted-foreground">
                      +{selectedFormatSpecs.length - 6} mas
                    </span>
                  )}
                </div>
              )}

              {/* Estimated time */}
              {selectedFormats.length > 0 && (
                <SummaryRow
                  label="Tiempo est."
                  value={`~${selectedFormats.length * 3}s`}
                  mono
                />
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* ================================================================= */}
      {/* Generation progress overlay */}
      {/* ================================================================= */}
      {isGenerating && (
        <GenerationProgress
          progress={generationProgress}
          formats={selectedFormatNames}
          completedFormats={completedFormatNames}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small helper component for the summary panel
// ---------------------------------------------------------------------------

function SummaryRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-sans text-xs text-muted-foreground">{label}</span>
      <span
        className={`text-xs font-medium text-foreground ${mono ? 'font-mono' : 'font-sans'}`}
      >
        {value}
      </span>
    </div>
  );
}
