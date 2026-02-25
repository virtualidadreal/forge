import { useCallback, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  const [showBrandPicker, setShowBrandPicker] = useState(false);
  const [completedFormatNames, setCompletedFormatNames] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const cancelRef = useRef(false);

  const selectedFormatSpecs = V1_FORMATS.filter((f) => selectedFormats.includes(f.id));
  const selectedFormatNames = selectedFormatSpecs.map((f) => f.name);
  const activeIntention = INTENTIONS.find((i) => i.id === intention);
  const canGenerate = !!imageDataUrl && selectedFormats.length > 0 && !!activeBrand;

  const handleGenerate = useCallback(async () => {
    if (!canGenerate || !activeBrand) return;
    setErrorMessage(null);
    cancelRef.current = false;
    setGenerating(true);
    setGenerationProgress(0);
    setCompletedFormatNames([]);

    try {
      const imageBase64 = imageDataUrl!.split(',')[1] || imageDataUrl!;

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

        if (format && (i + 1) % 3 === 0) {
          setCompletedFormatNames(prev => [...prev, format.name]);
        }
      }

      if (!cancelRef.current) {
        setPieces(pieces);
        navigate('/results');
      }
    } catch (error) {
      console.error('Generation failed:', error);
      const msg = error instanceof Error ? error.message : 'Error desconocido';
      setErrorMessage(`Error al generar: ${msg}`);
    } finally {
      setGenerating(false);
      setGenerationProgress(0);
      setCompletedFormatNames([]);
    }
  }, [canGenerate, activeBrand, imageDataUrl, intention, copy, selectedFormats, setGenerating, setGenerationProgress, setPieces, navigate]);

  const handleCancel = useCallback(() => {
    cancelRef.current = true;
    setGenerating(false);
    setGenerationProgress(0);
    setCompletedFormatNames([]);
  }, [setGenerating, setGenerationProgress]);

  return (
    <div className="flex gap-12 max-w-[var(--max-content-width)] mx-auto px-8 py-12 min-h-[calc(100vh-var(--header-height))]">
      {/* LEFT COLUMN — Steps */}
      <div className="flex-[3] min-w-0 space-y-10">
        {/* Brand DNA indicator */}
        <div className="relative">
          {activeBrand ? (
            <div
              className="flex items-center justify-between p-5 rounded-xl border border-border bg-card shadow-subtle cursor-pointer transition-all duration-[150ms] hover:shadow-elevated hover:border-muted-foreground/30 overflow-hidden"
              onClick={() => setShowBrandPicker((v) => !v)}
            >
              <div className="flex items-center gap-3">
                {activeBrand.logo_url ? (
                  <img
                    src={activeBrand.logo_url}
                    alt={activeBrand.brand_name}
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                    <span className="font-serif text-sm font-semibold text-foreground">
                      {activeBrand.brand_name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-sans text-sm font-medium text-foreground truncate">
                    {activeBrand.brand_name}
                  </p>
                  {activeBrand.tagline && (
                    <p className="font-sans text-xs text-muted-foreground truncate">{activeBrand.tagline}</p>
                  )}
                </div>
              </div>
              <span className="font-sans text-xs text-muted-foreground shrink-0">Cambiar</span>
            </div>
          ) : (
            <div
              className="flex items-center justify-between p-5 rounded-xl border-2 border-dashed border-destructive/30 bg-destructive/5 cursor-pointer hover:border-destructive/50 transition-all duration-[150ms] overflow-hidden"
              onClick={() => navigate('/studio')}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="font-sans text-sm font-medium text-foreground truncate">Sin marca configurada</p>
                  <p className="font-sans text-xs text-muted-foreground truncate">Configura tu Brand DNA para poder generar</p>
                </div>
              </div>
              <span className="font-sans text-xs font-medium text-destructive">Configurar</span>
            </div>
          )}

          {showBrandPicker && brands.length > 1 && (
            <div
              className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-border bg-card shadow-elevated overflow-hidden"
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
                    w-full flex items-center gap-3 px-5 py-3 text-left
                    hover:bg-accent/10 transition-colors duration-[100ms]
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

        <ImageUploader />
        <CopyInput />
        <IntentionSelector />
        <FormatSelector />

        {/* Generate button */}
        <div className="sticky bottom-0 py-5 bg-gradient-to-t from-background via-background/95 to-transparent">
          <Button
            variant="primary"
            size="lg"
            className="w-full btn-generate"
            disabled={!canGenerate}
            loading={isGenerating}
            onClick={handleGenerate}
          >
            Generar {selectedFormats.length} pieza{selectedFormats.length !== 1 ? 's' : ''}
          </Button>

          {!canGenerate && (
            <p className="font-sans text-xs text-muted-foreground text-center mt-2">
              {!activeBrand
                ? 'Configura una marca primero'
                : !imageDataUrl
                  ? 'Sube una imagen para continuar'
                  : 'Selecciona al menos un formato'}
            </p>
          )}

          {errorMessage && (
            <div className="mt-3 p-4 rounded-xl bg-destructive/5 border border-destructive/20">
              <p className="font-sans text-sm text-destructive text-center">{errorMessage}</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN — Preview panel */}
      <aside className="flex-[2] min-w-0 hidden lg:block">
        <div className="sticky top-8 space-y-8">
          <div>
            <SectionLabel>Vista previa</SectionLabel>
            {imageDataUrl ? (
              <div className="rounded-xl overflow-hidden border border-border bg-card shadow-subtle">
                <img
                  src={imageDataUrl}
                  alt={imageFileName ?? 'Preview'}
                  className="w-full max-h-[260px] object-cover"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 rounded-xl border border-dashed border-border bg-card">
                <p className="font-sans text-sm text-muted-foreground">Sin imagen</p>
              </div>
            )}
          </div>

          <div>
            <SectionLabel>Resumen</SectionLabel>
            <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-subtle transition-all duration-[150ms] hover:shadow-elevated hover:border-muted-foreground/30">
              <SummaryRow label="Marca" value={activeBrand?.brand_name ?? 'No definida'} />
              <SummaryRow label="Intencion" value={activeIntention ? activeIntention.name : 'No seleccionada'} />
              <SummaryRow label="Formatos" value={`${selectedFormats.length} seleccionado${selectedFormats.length !== 1 ? 's' : ''}`} />

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

              {selectedFormats.length > 0 && (
                <SummaryRow label="Tiempo est." value={`~${selectedFormats.length * 3}s`} mono />
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Generation progress overlay */}
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

function SummaryRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-sans text-xs text-muted-foreground">{label}</span>
      <span className={`text-xs font-medium text-foreground ${mono ? 'font-mono' : 'font-sans'}`}>
        {value}
      </span>
    </div>
  );
}
