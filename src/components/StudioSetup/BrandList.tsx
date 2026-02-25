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
      <div className="flex flex-col items-center justify-center py-20 gap-6">
        {/* Empty illustration */}
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary">
          <svg
            width="32"
            height="32"
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
          <p className="font-serif text-xl font-semibold text-foreground">
            No tienes marcas configuradas
          </p>
          <p className="font-sans text-sm text-muted-foreground mt-2 max-w-sm">
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
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl font-semibold text-foreground">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                group relative flex flex-col gap-4 rounded-2xl border p-5
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
                <div className="absolute -top-px -left-px -right-px h-0.5 rounded-t-2xl bg-primary" />
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

              {/* Actions row -- visible on hover */}
              <div className="flex gap-1.5 pt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(brand);
                  }}
                  className="inline-flex items-center gap-1.5 font-sans text-[11px] text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-lg hover:bg-secondary transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Editar
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateBrand(brand.brand_id);
                  }}
                  className="inline-flex items-center gap-1.5 font-sans text-[11px] text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-lg hover:bg-secondary transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                  Duplicar
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(brand.brand_id);
                  }}
                  className="inline-flex items-center gap-1.5 font-sans text-[11px] text-destructive hover:text-destructive px-2.5 py-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
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
