import { useState, useRef, useCallback, type DragEvent } from 'react';
import { fileToBase64, validateImageFile } from '../../utils/imageUtils';

interface AssetUploaderProps {
  assets: string[];
  onAssetsChange: (assets: string[]) => void;
}

const MIN_ASSETS = 3;
const RECOMMENDED_ASSETS = 5;

export function AssetUploader({ assets, onAssetsChange }: AssetUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      setError(null);
      const newAssets: string[] = [];

      for (const file of Array.from(files)) {
        const validation = validateImageFile(file);
        if (!validation.valid) {
          setError(validation.error ?? 'Archivo no valido.');
          continue;
        }
        try {
          const base64 = await fileToBase64(file);
          newAssets.push(base64);
        } catch {
          setError('Error al procesar una imagen.');
        }
      }

      if (newAssets.length > 0) {
        onAssetsChange([...assets, ...newAssets]);
      }
    },
    [assets, onAssetsChange],
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles],
  );

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const removeAsset = (index: number) => {
    const updated = assets.filter((_, i) => i !== index);
    onAssetsChange(updated);
  };

  const assetCount = assets.length;
  const meetsMinimum = assetCount >= MIN_ASSETS;
  const meetsRecommended = assetCount >= RECOMMENDED_ASSETS;

  return (
    <div className="flex flex-col gap-4">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleClick();
        }}
        className={`
          relative flex flex-col items-center justify-center gap-3
          rounded-2xl border-2 border-dashed p-8
          cursor-pointer transition-all duration-150
          ${
            isDragOver
              ? 'border-primary bg-secondary/50 scale-[1.01]'
              : 'border-border hover:border-muted-foreground hover:bg-secondary/30'
          }
        `}
      >
        {/* Upload icon */}
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>

        <div className="text-center">
          <p className="font-sans text-sm font-medium text-foreground">
            Arrastra tus assets de marca aqui
          </p>
          <p className="font-sans text-xs text-muted-foreground mt-1">
            JPG, PNG, WebP o HEIC — hasta 20 MB por archivo
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Asset count indicator */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`
                h-1.5 w-6 rounded-full transition-colors duration-150
                ${
                  i < assetCount
                    ? meetsRecommended
                      ? 'bg-intent-awareness'
                      : meetsMinimum
                        ? 'bg-primary'
                        : 'bg-muted-foreground'
                    : 'bg-border'
                }
              `}
            />
          ))}
        </div>
        <span className="font-sans text-xs text-muted-foreground">
          {assetCount} / {MIN_ASSETS} min
          {!meetsRecommended && assetCount >= MIN_ASSETS && (
            <span className="ml-1 opacity-60">
              ({RECOMMENDED_ASSETS}+ recomendado)
            </span>
          )}
          {meetsRecommended && (
            <span className="ml-1 text-intent-awareness">Excelente</span>
          )}
        </span>
      </div>

      {/* Error message */}
      {error && (
        <p className="font-sans text-xs text-destructive">{error}</p>
      )}

      {/* Thumbnail grid */}
      {assets.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {assets.map((asset, index) => (
            <div
              key={index}
              className="group relative aspect-square overflow-hidden rounded-xl border border-border"
              style={{ boxShadow: 'var(--shadow-subtle)' }}
            >
              <img
                src={asset}
                alt={`Asset ${index + 1}`}
                className="h-full w-full object-cover"
              />
              {/* Delete overlay */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeAsset(index);
                }}
                className="
                  absolute top-1.5 right-1.5
                  flex h-6 w-6 items-center justify-center
                  rounded-full bg-black/60 text-white
                  opacity-0 group-hover:opacity-100
                  transition-opacity duration-150
                  hover:bg-black/80
                "
                aria-label={`Eliminar asset ${index + 1}`}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              {/* Index badge */}
              <span className="absolute bottom-1.5 left-1.5 font-mono text-[10px] text-white bg-black/40 rounded px-1">
                {index + 1}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
