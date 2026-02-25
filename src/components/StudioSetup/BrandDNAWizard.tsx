import { useState, useCallback, useRef, useEffect } from 'react';
import { Button, SectionLabel } from '../shared';
import { AssetUploader } from './AssetUploader';
import { AnalysisProgress } from './AnalysisProgress';
import { BrandDNAPreview } from './BrandDNAPreview';
import { useBrandDNAStore } from '../../store/brandDNA.store';
import { extractBrandDNAFromDataUrls } from '../../services/brandDNA.service';
import type { BrandDNA } from '../../types/brandDNA.types';

interface BrandDNAWizardProps {
  editingBrand?: BrandDNA | null;
  onComplete: () => void;
  onCancel: () => void;
}

const inputClasses =
  'w-full rounded-lg border border-input bg-card px-3 py-2.5 font-sans text-base text-foreground placeholder:text-muted-foreground transition-colors duration-[100ms] focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring hover:border-muted-foreground';

export function BrandDNAWizard({
  editingBrand,
  onComplete,
  onCancel,
}: BrandDNAWizardProps) {
  const { addBrand, updateBrand } = useBrandDNAStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [assets, setAssets] = useState<string[]>([]);
  const [brandName, setBrandName] = useState(editingBrand?.brand_name ?? '');
  const [tagline, setTagline] = useState(editingBrand?.tagline ?? '');
  const [logo, setLogo] = useState<string | null>(editingBrand?.logo_url ?? null);
  const [_isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [extractedDNA, setExtractedDNA] = useState<BrandDNA | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startAnalysis = useCallback(async () => {
    setStep(2);
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisStep(0);
    setAnalysisError(null);

    let currentStep = 0;
    timerRef.current = setInterval(() => {
      currentStep += 1;
      if (currentStep <= 4) {
        setAnalysisProgress(currentStep * 20);
        setAnalysisStep(currentStep);
      }
    }, 800);

    try {
      const dna = await extractBrandDNAFromDataUrls(assets, brandName, tagline || undefined);

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;

      setAnalysisProgress(100);
      setAnalysisStep(5);
      setExtractedDNA(dna);
      setIsAnalyzing(false);

      setTimeout(() => setStep(3), 300);
    } catch (error) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      setIsAnalyzing(false);
      setAnalysisError(
        error instanceof Error ? error.message : 'Error analyzing brand assets',
      );
    }
  }, [assets, brandName, tagline]);

  const handleSave = useCallback(() => {
    if (!extractedDNA) return;

    const finalDNA: BrandDNA = {
      ...extractedDNA,
      brand_name: brandName || extractedDNA.brand_name,
      tagline: tagline || extractedDNA.tagline,
      logo_url: logo ?? extractedDNA.logo_url,
    };

    if (editingBrand) {
      updateBrand(editingBrand.brand_id, {
        ...finalDNA,
        brand_id: editingBrand.brand_id,
        created_at: editingBrand.created_at,
      });
    } else {
      addBrand(finalDNA);
    }

    onComplete();
  }, [extractedDNA, brandName, tagline, logo, editingBrand, addBrand, updateBrand, onComplete]);

  const stepLabels = ['Assets', 'Analisis', 'Confirmar'];

  const handleLogoUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const { fileToBase64 } = await import('../../utils/imageUtils');
      const base64 = await fileToBase64(file);
      setLogo(base64);
      e.target.value = '';
    },
    [],
  );

  return (
    <div className="flex flex-col gap-10 max-w-lg mx-auto py-6">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2">
        {stepLabels.map((label, i) => {
          const stepNum = (i + 1) as 1 | 2 | 3;
          const isActive = step === stepNum;
          const isComplete = step > stepNum;
          return (
            <div key={i} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div
                  className={`
                    flex h-6 w-6 items-center justify-center rounded-full
                    font-mono text-xs transition-all duration-[150ms]
                    ${isComplete ? 'bg-primary text-primary-foreground' : ''}
                    ${isActive ? 'bg-primary text-primary-foreground' : ''}
                    ${!isActive && !isComplete ? 'bg-secondary text-muted-foreground' : ''}
                  `}
                >
                  {isComplete ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    stepNum
                  )}
                </div>
                <span
                  className={`font-sans text-xs uppercase tracking-widest transition-colors duration-[150ms] ${
                    isActive || isComplete ? 'text-foreground font-semibold' : 'text-muted-foreground font-medium'
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < stepLabels.length - 1 && (
                <div className={`w-8 h-px transition-colors duration-[150ms] ${step > stepNum ? 'bg-primary' : 'bg-border'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step 1: Upload references */}
      {step === 1 && (
        <div className="flex flex-col gap-8 rounded-2xl bg-card border border-border p-6 shadow-subtle">
          <div className="text-center">
            <h2 className="font-serif text-3xl font-medium tracking-tight text-foreground">
              Sube tus assets de marca
            </h2>
            <p className="font-sans text-base text-muted-foreground mt-2 max-w-sm mx-auto">
              Posts de Instagram, stories, banners, packaging... cualquier pieza
              que represente tu identidad visual.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <SectionLabel>Nombre de la marca</SectionLabel>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Mi Marca"
                className={inputClasses}
              />
            </div>
            <div>
              <SectionLabel>Tagline (opcional)</SectionLabel>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Tu propuesta de valor en una frase"
                className={inputClasses}
              />
            </div>
          </div>

          <div>
            <SectionLabel>Logo (opcional)</SectionLabel>
            <div className="flex items-center gap-3 mt-1">
              {logo ? (
                <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-border">
                  <img src={logo} alt="Logo" className="h-full w-full object-contain" />
                  <button
                    onClick={() => setLogo(null)}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity"
                    aria-label="Quitar logo"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ) : (
                <label className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-border cursor-pointer hover:border-muted-foreground hover:bg-secondary/30 transition-all duration-[100ms]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                    <path d="M12 5v14" />
                    <path d="M5 12h14" />
                  </svg>
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </label>
              )}
              <span className="font-sans text-xs text-muted-foreground">
                PNG o SVG transparente recomendado
              </span>
            </div>
          </div>

          <AssetUploader assets={assets} onAssetsChange={setAssets} />

          <div className="flex justify-between pt-4">
            <Button variant="ghost" size="md" onClick={onCancel}>
              Cancelar
            </Button>
            <Button size="md" disabled={assets.length < 3} onClick={startAnalysis}>
              Analizar marca
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Analysis */}
      {step === 2 && (
        <div className="rounded-2xl bg-card border border-border p-6 shadow-subtle">
          {analysisError ? (
            <div className="flex flex-col items-center gap-4 py-6">
              <p className="font-sans text-sm text-destructive text-center">{analysisError}</p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => { setStep(1); setAnalysisError(null); }}
                >
                  Volver
                </Button>
                <Button size="md" onClick={startAnalysis}>
                  Reintentar
                </Button>
              </div>
            </div>
          ) : (
            <AnalysisProgress progress={analysisProgress} currentStep={analysisStep} />
          )}
        </div>
      )}

      {/* Step 3: Confirm & Save */}
      {step === 3 && extractedDNA && (
        <div className="flex flex-col gap-8 rounded-2xl bg-card border border-border p-6 shadow-subtle">
          <div className="text-center">
            <h2 className="font-serif text-3xl font-medium tracking-tight text-foreground">
              Tu Brand DNA
            </h2>
            <p className="font-sans text-sm text-muted-foreground mt-2">
              Revisa el ADN extraido y ajusta lo que necesites.
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-xl bg-secondary/30 p-5 border border-border">
            <div>
              <SectionLabel>Nombre</SectionLabel>
              <input type="text" value={brandName} onChange={(e) => setBrandName(e.target.value)} className={inputClasses} />
            </div>
            <div>
              <SectionLabel>Tagline</SectionLabel>
              <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Tagline de la marca" className={inputClasses} />
            </div>
          </div>

          <div className="rounded-xl bg-card border border-border p-5 shadow-subtle">
            <BrandDNAPreview brandDNA={extractedDNA} />
          </div>

          <div className="flex justify-between pt-4">
            <Button
              variant="ghost"
              size="md"
              onClick={() => { setStep(1); setExtractedDNA(null); setAnalysisProgress(0); setAnalysisStep(0); }}
            >
              Volver a assets
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" size="md" onClick={onCancel}>Cancelar</Button>
              <Button size="md" onClick={handleSave}>
                {editingBrand ? 'Guardar cambios' : 'Guardar Brand DNA'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
