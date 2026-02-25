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

  if (brands.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
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
          <p className="font-serif text-xl italic text-foreground">
            No tienes marcas configuradas
          </p>
          <p className="font-light text-base text-muted-foreground mt-2 max-w-sm leading-relaxed">
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
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
          Tus marcas
        </h2>
        <Button onClick={onCreateNew} size="sm" variant="secondary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
          Nueva marca
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                group relative flex flex-col gap-4 rounded-2xl p-6
                transition-shadow duration-300 cursor-pointer
                ${
                  isActive
                    ? 'bg-card shadow-elevated'
                    : 'bg-card shadow-subtle hover:shadow-elevated'
                }
              `}
              onClick={() => setActiveBrand(brand.brand_id)}
            >
              {isActive && (
                <div className="absolute -top-px -left-px -right-px h-0.5 rounded-t-2xl bg-primary" />
              )}

              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-sm font-medium text-card-foreground truncate">
                    {brand.brand_name}
                  </h3>
                  <span className="text-xs font-light text-muted-foreground">
                    {createdDate}
                  </span>
                </div>
                <span className="font-mono text-xs text-muted-foreground tabular-nums shrink-0 ml-2">
                  {Math.round(brand.confidence_score * 100)}%
                </span>
              </div>

              <div className="flex gap-1.5">
                {paletteColors.map((color, i) => (
                  <div
                    key={i}
                    className="h-4 w-4 rounded-full border border-border/50"
                    style={{ backgroundColor: color! }}
                  />
                ))}
              </div>

              <div className="flex gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(brand); }}
                  className="inline-flex items-center gap-1 text-xs font-light text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-secondary transition-all duration-300"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Editar
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); duplicateBrand(brand.brand_id); }}
                  className="inline-flex items-center gap-1 text-xs font-light text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-secondary transition-all duration-300"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                  Duplicar
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteTarget(brand.brand_id); }}
                  className="inline-flex items-center gap-1 text-xs font-light text-destructive hover:text-destructive px-2 py-1 rounded-md hover:bg-destructive/10 transition-all duration-300"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
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

      <Modal open={deleteTarget !== null} onClose={() => setDeleteTarget(null)} title="Eliminar marca" size="sm">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-light text-muted-foreground leading-relaxed">
            Esta accion no se puede deshacer. Se eliminara el Brand DNA y todas
            las configuraciones asociadas.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button variant="destructive" size="sm" onClick={confirmDelete}>Eliminar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
