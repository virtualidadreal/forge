import { useCallback, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../../store/session.store';
import { useBrandDNAStore } from '../../store/brandDNA.store';
import { useResultsStore } from '../../store/results.store';
import { V1_FORMATS, getFormatById } from '../../constants/formats';
import { INTENTIONS } from '../../constants/intentions';
import type { GeneratedPiece } from '../../types/composition.types';
import type { VariationMode } from '../../services/generativePrompts.service';
import { Button, SectionLabel } from '../shared';
import { ImageUploader } from './ImageUploader';
import { CopyInput } from './CopyInput';
import { IntentionSelector } from './IntentionSelector';
import { FormatSelector } from './FormatSelector';
import { GenerationProgress } from './GenerationProgress';
import { generateCompositions } from '../../services/composer.service';
import { renderPiece, renderToDataUrl } from '../../services/renderer.service';
import { generateWithNanoBanana } from '../../services/nanoBanana.service';
import { buildGenerativePrompt } from '../../services/generativePrompts.service';
import { buildReferenceImages } from '../../services/referenceBuilder.service';

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
    generationMode,
    setGenerationMode,
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
            generation_mode: 'compositor',
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
            generation_mode: 'compositor',
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

  const handleGenerateGenerative = useCallback(async () => {
    if (!canGenerate || !activeBrand) return;
    setErrorMessage(null);
    cancelRef.current = false;
    setGenerating(true);
    setGenerationProgress(0);
    setCompletedFormatNames([]);

    try {
      const imageBase64 = imageDataUrl!.split(',')[1] || imageDataUrl!;

      // Build reference images once for all formats
      const refs = buildReferenceImages({
        userPhotoBase64: imageBase64,
        brandStyleReferences: activeBrand.reference_assets || [],
        logoDataUrl: activeBrand.logo_url || undefined,
        intention,
      });

      setGenerationProgress(5);

      const selectedSpecs = selectedFormats
        .map((id) => getFormatById(id))
        .filter(Boolean) as import('../../types/format.types').FormatSpec[];

      const variationModes: VariationMode[] = ['clean', 'rich', 'bold'];
      const totalJobs = selectedSpecs.length * variationModes.length;
      const pieces: GeneratedPiece[] = [];
      let completed = 0;

      for (const format of selectedSpecs) {
        if (cancelRef.current) break;

        for (let vi = 0; vi < variationModes.length; vi++) {
          if (cancelRef.current) break;

          const variationMode = variationModes[vi];
          const variationSeed = (vi + 1) as 1 | 2 | 3;

          const prompt = buildGenerativePrompt({
            intention,
            copy,
            brandDNA: activeBrand,
            format,
            variationMode,
          });

          const base64Image = await generateWithNanoBanana({
            prompt,
            referenceImages: refs,
            aspectRatio: format.aspect_ratio,
          });

          const previewDataUrl = `data:image/png;base64,${base64Image}`;

          pieces.push({
            id: `${format.id}-v${variationSeed}-${Date.now()}`,
            format_id: format.id,
            variation: variationSeed,
            generation_mode: 'generative',
            preview_data_url: previewDataUrl,
            edited: false,
          });

          completed++;
          const pct = 5 + Math.round((completed / totalJobs) * 95);
          setGenerationProgress(pct);

          if (completed % 3 === 0) {
            setCompletedFormatNames((prev) => [...prev, format.name]);
          }
        }
      }

      if (!cancelRef.current) {
        setPieces(pieces);
        navigate('/results');
      }
    } catch (error) {
      console.error('Generative generation failed:', error);
      const msg = error instanceof Error ? error.message : 'Error desconocido';
      setErrorMessage(`Error al generar: ${msg}`);
    } finally {
      setGenerating(false);
      setGenerationProgress(0);
      setCompletedFormatNames([]);
    }
  }, [canGenerate, activeBrand, imageDataUrl, intention, copy, selectedFormats, setGenerating, setGenerationProgress, setPieces, navigate]);

  const handleGenerateClick = useCallback(() => {
    if (generationMode === 'generative') {
      handleGenerateGenerative();
    } else {
      handleGenerate();
    }
  }, [generationMode, handleGenerate, handleGenerateGenerative]);

  return (
    <div className="flex gap-16 max-w-[var(--max-content-width)] mx-auto px-6 py-20 md:px-12 min-h-[calc(100vh-var(--header-height))]">
      {/* LEFT COLUMN — Steps */}
      <div className="flex-[3] min-w-0 space-y-12">
        {/* Brand DNA indicator */}
        <div className="relative">
          {activeBrand ? (
            <div
              className="flex items-center justify-between p-6 rounded-2xl bg-card shadow-subtle cursor-pointer transition-shadow duration-300 hover:shadow-elevated overflow-hidden"
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
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary">
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
                    <p className="font-sans text-xs font-light text-muted-foreground truncate">{activeBrand.tagline}</p>
                  )}
                </div>
              </div>
              <span className="font-sans text-xs font-light text-muted-foreground shrink-0">Cambiar</span>
            </div>
          ) : (
            <div
              className="flex items-center justify-between p-6 rounded-2xl border-2 border-dashed border-destructive/30 bg-destructive/5 cursor-pointer hover:border-destructive/50 transition-shadow duration-300 overflow-hidden"
              onClick={() => navigate('/studio')}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="text-destructive">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="font-sans text-sm font-medium text-foreground truncate">Sin marca configurada</p>
                  <p className="font-sans text-xs font-light text-muted-foreground truncate">Configura tu Brand DNA para poder generar</p>
                </div>
              </div>
              <span className="font-sans text-xs font-medium text-destructive">Configurar</span>
            </div>
          )}

          {showBrandPicker && brands.length > 1 && (
            <div
              className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-card shadow-elevated overflow-hidden"
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
                    hover:bg-accent/10 transition-colors duration-300
                    ${brand.brand_id === activeBrand?.brand_id ? 'bg-accent/15' : ''}
                  `}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary shrink-0">
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

        {/* Mode selector */}
        <div>
          <SectionLabel>Modo de generacion</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            {([
              {
                mode: 'compositor' as const,
                label: 'Rapido',
                desc: 'Pone tu copy sobre la foto con el estilo de tu marca. 1 variacion por formato.',
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="9" y1="21" x2="9" y2="9" />
                  </svg>
                ),
              },
              {
                mode: 'generative' as const,
                label: 'Agencia',
                desc: 'La IA genera piezas nuevas transformando tu foto con el estilo de marca. 3 variaciones por formato.',
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                ),
              },
            ]).map(({ mode, label, desc, icon }) => {
              const selected = generationMode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setGenerationMode(mode)}
                  className={`
                    flex items-start gap-3 p-5 rounded-2xl border-2 text-left transition-all duration-300
                    ${selected
                      ? 'border-foreground bg-accent/10 shadow-subtle'
                      : 'border-border/50 bg-card hover:border-muted-foreground'}
                  `}
                >
                  {/* Radio indicator */}
                  <div className={`
                    mt-0.5 shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors duration-300
                    ${selected ? 'border-foreground' : 'border-muted-foreground/50'}
                  `}>
                    {selected && <div className="w-2 h-2 rounded-full bg-foreground" />}
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      {icon}
                      <span className="font-sans text-sm font-medium text-foreground">{label}</span>
                    </div>
                    <p className="font-sans text-xs font-light text-muted-foreground leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Generate button */}
        <div className="sticky bottom-0 py-6 bg-gradient-to-t from-background via-background/95 to-transparent">
          <Button
            variant="primary"
            size="lg"
            className="w-full btn-generate"
            disabled={!canGenerate}
            loading={isGenerating}
            onClick={handleGenerateClick}
          >
            {generationMode === 'generative'
              ? `Generar ${selectedFormats.length * 3} pieza${selectedFormats.length * 3 !== 1 ? 's' : ''}`
              : `Generar ${selectedFormats.length} pieza${selectedFormats.length !== 1 ? 's' : ''}`}
          </Button>

          {!canGenerate && (
            <p className="font-sans text-xs font-light text-muted-foreground text-center mt-2">
              {!activeBrand
                ? 'Configura una marca primero'
                : !imageDataUrl
                  ? 'Sube una imagen para continuar'
                  : 'Selecciona al menos un formato'}
            </p>
          )}

          {errorMessage && (
            <div className="mt-3 p-4 rounded-2xl bg-destructive/5 border border-border/50">
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
              <div className="rounded-2xl overflow-hidden bg-card shadow-subtle transition-shadow duration-300 hover:shadow-elevated">
                <div className="relative">
                  <img
                    src={imageDataUrl}
                    alt={imageFileName ?? 'Preview'}
                    className="w-full object-contain"
                  />
                  {/* Live copy overlay */}
                  {(copy.heading || copy.subheading || copy.cta || copy.tagline) && (
                    <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                      {copy.tagline && (
                        <span
                          className="inline-block self-start px-3 py-1 rounded-full text-[10px] font-medium uppercase tracking-[0.15em] mb-3"
                          style={{
                            backgroundColor: activeBrand?.palette.pill_background || 'rgba(255,255,255,0.2)',
                            color: activeBrand?.palette.pill_text || '#FFFFFF',
                          }}
                        >
                          {copy.tagline}
                        </span>
                      )}
                      {copy.heading && (
                        <p
                          className="font-serif text-xl font-bold leading-tight mb-1"
                          style={{ color: activeBrand?.palette.text_primary || '#FFFFFF' }}
                        >
                          {activeBrand?.typography.uses_uppercase_headlines ? copy.heading.toUpperCase() : copy.heading}
                        </p>
                      )}
                      {copy.subheading && (
                        <p
                          className="font-sans text-sm font-light leading-relaxed mb-3"
                          style={{ color: activeBrand?.palette.text_secondary || 'rgba(255,255,255,0.8)' }}
                        >
                          {copy.subheading}
                        </p>
                      )}
                      {copy.cta && (
                        <span
                          className="inline-block self-start px-4 py-1.5 rounded-full text-[11px] font-medium uppercase tracking-[0.15em]"
                          style={{
                            backgroundColor: activeBrand?.palette.accent || '#FFFFFF',
                            color: activeBrand?.palette.background || '#000000',
                          }}
                        >
                          {copy.cta}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 rounded-2xl border border-dashed border-border/50 bg-card">
                <p className="font-sans text-sm font-light text-muted-foreground">Sin imagen</p>
              </div>
            )}
          </div>

          <div>
            <SectionLabel>Resumen</SectionLabel>
            <div className="rounded-2xl bg-card p-6 space-y-4 shadow-subtle transition-shadow duration-300 hover:shadow-elevated">
              <SummaryRow label="Marca" value={activeBrand?.brand_name ?? 'No definida'} />
              <SummaryRow label="Modo" value={generationMode === 'generative' ? 'Agencia (IA)' : 'Rapido'} />
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
                <SummaryRow
                  label="Tiempo est."
                  value={generationMode === 'generative'
                    ? `~${selectedFormats.length * 3 * 8}s`
                    : `~${selectedFormats.length * 3}s`}
                  mono
                />
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
      <span className="font-sans text-xs font-light tracking-[0.15em] text-muted-foreground">{label}</span>
      <span className={`text-xs font-medium text-foreground ${mono ? 'font-mono' : 'font-sans'}`}>
        {value}
      </span>
    </div>
  );
}
