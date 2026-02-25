import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BrandDNA } from '../types/brandDNA.types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BrandDNAState {
  brands: BrandDNA[];
  activeBrandId: string | null;
}

interface BrandDNAActions {
  getActiveBrand: () => BrandDNA | undefined;
  addBrand: (brand: BrandDNA) => void;
  updateBrand: (id: string, updates: Partial<BrandDNA>) => void;
  deleteBrand: (id: string) => void;
  setActiveBrand: (id: string) => void;
  duplicateBrand: (id: string) => void;
}

export type BrandDNAStore = BrandDNAState & BrandDNAActions;

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useBrandDNAStore = create<BrandDNAStore>()(
  persist(
    (set, get) => ({
      // -- State ---------------------------------------------------------------
      brands: [],
      activeBrandId: null,

      // -- Derived -------------------------------------------------------------
      getActiveBrand: () => {
        const { brands, activeBrandId } = get();
        if (!activeBrandId) return undefined;
        return brands.find((b) => b.brand_id === activeBrandId);
      },

      // -- Actions -------------------------------------------------------------
      addBrand: (brand) => {
        set((state) => ({
          brands: [...state.brands, brand],
          // Auto-activate if it's the first brand
          activeBrandId: state.activeBrandId ?? brand.brand_id,
        }));
      },

      updateBrand: (id, updates) => {
        set((state) => ({
          brands: state.brands.map((b) =>
            b.brand_id === id
              ? { ...b, ...updates, updated_at: new Date().toISOString() }
              : b,
          ),
        }));
      },

      deleteBrand: (id) => {
        set((state) => {
          const remaining = state.brands.filter((b) => b.brand_id !== id);
          return {
            brands: remaining,
            activeBrandId:
              state.activeBrandId === id
                ? (remaining[0]?.brand_id ?? null)
                : state.activeBrandId,
          };
        });
      },

      setActiveBrand: (id) => {
        set({ activeBrandId: id });
      },

      duplicateBrand: (id) => {
        const { brands } = get();
        const source = brands.find((b) => b.brand_id === id);
        if (!source) return;

        const now = new Date().toISOString();
        const duplicate: BrandDNA = {
          ...structuredClone(source),
          brand_id: crypto.randomUUID(),
          brand_name: `${source.brand_name} (copia)`,
          created_at: now,
          updated_at: now,
        };

        set((state) => ({
          brands: [...state.brands, duplicate],
        }));
      },
    }),
    {
      name: 'forge-brand-dna',
    },
  ),
);
