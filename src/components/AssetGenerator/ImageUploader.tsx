import { useCallback, useRef, useState, type DragEvent, type ChangeEvent } from 'react';
import { useSessionStore } from '../../store/session.store';
import { fileToBase64, validateImageFile, getImageDimensions } from '../../utils/imageUtils';
import { Button, SectionLabel } from '../shared';

export function ImageUploader() {
  const { imageDataUrl, imageFileName, setImage, clearImage } = useSessionStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setError(validation.error ?? 'Archivo no valido');
        return;
      }
      try {
        const dataUrl = await fileToBase64(file);
        const dims = await getImageDimensions(dataUrl);
        setDimensions(dims);
        setImage(dataUrl, file.name);
      } catch {
        setError('Error al procesar la imagen');
      }
    },
    [setImage],
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      // Reset input value so the same file can be re-selected
      e.target.value = '';
    },
    [processFile],
  );

  const handleClear = useCallback(() => {
    clearImage();
    setDimensions(null);
    setError(null);
  }, [clearImage]);

  // ---------- Loaded state ----------
  if (imageDataUrl) {
    return (
      <div>
        <SectionLabel>Imagen</SectionLabel>
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-subtle)]">
          <img
            src={imageDataUrl}
            alt={imageFileName ?? 'Imagen subida'}
            className="w-full max-h-[280px] object-cover"
          />
          <div className="flex items-center justify-between px-8 py-5 border-t border-border bg-card/80 backdrop-blur-sm">
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-sans text-sm font-medium text-foreground truncate max-w-[200px]">
                {imageFileName}
              </span>
              {dimensions && (
                <span className="font-mono text-xs text-muted-foreground shrink-0">
                  {dimensions.width} x {dimensions.height}
                </span>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={handleClear}>
              Cambiar imagen
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Empty / drop state ----------
  return (
    <div>
      <SectionLabel>Imagen</SectionLabel>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`
          flex flex-col items-center justify-center gap-6
          min-h-[240px] rounded-3xl border-2 border-dashed cursor-pointer
          transition-all duration-150
          ${
            dragging
              ? 'border-foreground bg-accent/30 scale-[1.01]'
              : 'border-border bg-card hover:border-muted-foreground hover:bg-accent/10'
          }
        `}
      >
        {/* Upload icon */}
        <div className="flex items-center justify-center w-[72px] h-[72px] rounded-2xl bg-secondary">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
        </div>

        <div className="text-center px-8">
          <p className="font-sans text-sm font-medium text-foreground">
            Arrastra tu imagen aqui
          </p>
          <p className="font-sans text-xs font-light text-muted-foreground mt-2">
            JPG, PNG, WebP o HEIC &middot; Max 20 MB
          </p>
        </div>

        <Button variant="secondary" size="sm">
          Seleccionar archivo
        </Button>

        {error && (
          <p className="font-sans text-xs text-destructive mt-1">{error}</p>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          onChange={handleInputChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
