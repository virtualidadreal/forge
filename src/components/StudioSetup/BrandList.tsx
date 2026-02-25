import { useState } from 'react';
import { useBrandDNAStore } from '../../store/brandDNA.store';
import { Button, Modal } from '../shared';
import type { BrandDNA } from '../../types/brandDNA.types';

interface BrandListProps {
  onCreateNew: () => void;
  onEdit: (brand: BrandDNA) => void;
}

export function BrandList({ onCreateNew, onEdit }: BrandListProps) {
  const { brands, activeBrandId, setActiveBrand, duplicateBrand, deleteBrand } =
    useBrandDNAStore();

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteBrand(deleteTarget);
      setDeleteTarget(null);
    }
  };

  // Empty state
  if (brands.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-5">
        {/* Empty illustration */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
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
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12h8" />
            <path d="M12 8v8" />
          </svg>
        </div>
        <div className="text-center">
          <p className="font-serif text-lg font-semibold text-foreground">
            No tienes marcas configuradas
          </p>
          <p className="font-sans text-sm text-muted-foreground mt-1 max-w-xs">
            Sube assets de tu marca y extraeremos el ADN visual automaticamente.
          </p>
        </div>
        <Button onClick={onCreateNew} size="lg">
          Crear Brand DNA
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg font-semibold text-foreground">
          Tus marcas
        </h2>
        <Button onClick={onCreateNew} size="sm" variant="secondary">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
          Nueva marca
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {brands.map((brand) => {
          const isActive = brand.brand_id === activeBrandId;
          const paletteColors = [
            brand.palette.background,
            brand.palette.text_primary,
            brand.palette.accent,
          ].filter(Boolean);

          const createdDate = new Date(brand.created_at).toLocaleDateString(
            'es-ES',
            { day: 'numeric', month: 'short', year: 'numeric' },
          );

          return (
            <div
              key={brand.brand_id}
              className={`
                group relative flex flex-col gap-3 rounded-xl border p-4
                transition-all duration-150 cursor-pointer
                ${
                  isActive
                    ? 'border-primary bg-card shadow-sm'
                    : 'border-border bg-card/50 hover:bg-card hover:border-muted-foreground/30'
                }
              `}
              style={{ boxShadow: isActive ? 'var(--shadow-subtle)' : undefined }}
              onClick={() => setActiveBrand(brand.brand_id)}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -top-px -left-px -right-px h-0.5 rounded-t-xl bg-primary" />
              )}

              {/* Brand name + confidence */}
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-0.5">
                  <h3 className="font-sans text-sm font-semibold text-card-foreground truncate">
                    {brand.brand_name}
                  </h3>
                  <span className="font-sans text-[11px] text-muted-foreground">
                    {createdDate}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-muted-foreground tabular-nums shrink-0 ml-2">
                  {Math.round(brand.confidence_score * 100)}%
                </span>
              </div>

              {/* Palette dots */}
              <div className="flex gap-1.5">
                {paletteColors.map((color, i) => (
                  <div
                    key={i}
                    className="h-4 w-4 rounded-full border border-border"
                    style={{ backgroundColor: color! }}
                  />
                ))}
              </div>

              {/* Actions row — visible on hover */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(brand);
                  }}
                  className="font-sans text-[11px] text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-secondary transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateBrand(brand.brand_id);
                  }}
                  className="font-sans text-[11px] text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-secondary transition-colors"
                >
                  Duplicar
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(brand.brand_id);
                  }}
                  className="font-sans text-[11px] text-destructive hover:text-destructive px-2 py-1 rounded-md hover:bg-destructive/10 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete confirmation modal */}
      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar marca"
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <p className="font-sans text-sm text-muted-foreground">
            Esta accion no se puede deshacer. Se eliminara el Brand DNA y todas
            las configuraciones asociadas.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteTarget(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={confirmDelete}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
