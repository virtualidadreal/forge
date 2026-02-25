import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CopyInput, IntentionType } from '../types/composition.types';
import { V1_FORMAT_IDS, FORMAT_PACKS } from '../constants/formats';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SessionState {
  imageDataUrl: string | null;
  imageFileName: string | null;
  copy: CopyInput;
  intention: IntentionType;
  selectedFormats: string[];
  isGenerating: boolean;
  generationProgress: number;
}

interface SessionActions {
  setImage: (dataUrl: string, fileName: string) => void;
  clearImage: () => void;
  setCopy: (copy: CopyInput) => void;
  updateCopyField: (field: keyof CopyInput, value: string) => void;
  setIntention: (intention: IntentionType) => void;
  toggleFormat: (formatId: string) => void;
  setSelectedFormats: (formatIds: string[]) => void;
  selectFormatPack: (packId: string) => void;
  setGenerating: (generating: boolean) => void;
  setGenerationProgress: (progress: number) => void;
  reset: () => void;
}

export type SessionStore = SessionState & SessionActions;

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const EMPTY_COPY: CopyInput = {
  heading: '',
  subheading: '',
  cta: '',
  tagline: '',
  disclaimer: '',
};

const DEFAULT_INTENTION: IntentionType = 'editorial';
const DEFAULT_FORMATS: string[] = [...V1_FORMAT_IDS];

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      // -- State ---------------------------------------------------------------
      imageDataUrl: null,
      imageFileName: null,
      copy: { ...EMPTY_COPY },
      intention: DEFAULT_INTENTION,
      selectedFormats: DEFAULT_FORMATS,
      isGenerating: false,
      generationProgress: 0,

      // -- Actions -------------------------------------------------------------
      setImage: (dataUrl, fileName) => {
        set({ imageDataUrl: dataUrl, imageFileName: fileName });
      },

      clearImage: () => {
        set({ imageDataUrl: null, imageFileName: null });
      },

      setCopy: (copy) => {
        set({ copy });
      },

      updateCopyField: (field, value) => {
        set((state) => ({
          copy: { ...state.copy, [field]: value },
        }));
      },

      setIntention: (intention) => {
        set({ intention });
      },

      toggleFormat: (formatId) => {
        set((state) => {
          const exists = state.selectedFormats.includes(formatId);
          return {
            selectedFormats: exists
              ? state.selectedFormats.filter((id) => id !== formatId)
              : [...state.selectedFormats, formatId],
          };
        });
      },

      setSelectedFormats: (formatIds) => {
        set({ selectedFormats: formatIds });
      },

      selectFormatPack: (packId) => {
        const pack = FORMAT_PACKS.find((p) => p.id === packId);
        if (!pack) return;
        set({ selectedFormats: [...pack.format_ids] });
      },

      setGenerating: (generating) => {
        set({ isGenerating: generating });
      },

      setGenerationProgress: (progress) => {
        set({ generationProgress: Math.min(100, Math.max(0, progress)) });
      },

      reset: () => {
        const { intention, selectedFormats } = get();
        set({
          imageDataUrl: null,
          imageFileName: null,
          copy: { ...EMPTY_COPY },
          intention,
          selectedFormats,
          isGenerating: false,
          generationProgress: 0,
        });
      },
    }),
    {
      name: 'forge-session',
      // Exclude imageDataUrl from persistence — it can be very large (Base64)
      partialize: (state) => {
        const { imageDataUrl, ...rest } = state;
        return rest;
      },
    },
  ),
);
