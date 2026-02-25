import { create } from 'zustand';
import type { GeneratedPiece } from '../types/composition.types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ResultsState {
  pieces: GeneratedPiece[];
  activeFormatId: string | null;
  activeVariation: 1 | 2 | 3;
}

interface ResultsActions {
  setPieces: (pieces: GeneratedPiece[]) => void;
  setActiveFormat: (formatId: string) => void;
  setActiveVariation: (variation: 1 | 2 | 3) => void;
  getActivePiece: () => GeneratedPiece | undefined;
  getPiecesByFormat: (formatId: string) => GeneratedPiece[];
  updatePieceCanvas: (pieceId: string, canvasState: string) => void;
  markPieceEdited: (pieceId: string) => void;
  clearResults: () => void;
}

export type ResultsStore = ResultsState & ResultsActions;

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useResultsStore = create<ResultsStore>()((set, get) => ({
  // -- State -----------------------------------------------------------------
  pieces: [],
  activeFormatId: null,
  activeVariation: 1,

  // -- Actions ---------------------------------------------------------------
  setPieces: (pieces) => {
    set({
      pieces,
      // Auto-select the first format when pieces arrive
      activeFormatId: pieces.length > 0 ? pieces[0].format_id : null,
      activeVariation: 1,
    });
  },

  setActiveFormat: (formatId) => {
    set({ activeFormatId: formatId });
  },

  setActiveVariation: (variation) => {
    set({ activeVariation: variation });
  },

  getActivePiece: () => {
    const { pieces, activeFormatId, activeVariation } = get();
    if (!activeFormatId) return undefined;
    return pieces.find(
      (p) => p.format_id === activeFormatId && p.variation === activeVariation,
    );
  },

  getPiecesByFormat: (formatId) => {
    return get().pieces.filter((p) => p.format_id === formatId);
  },

  updatePieceCanvas: (pieceId, canvasState) => {
    set((state) => ({
      pieces: state.pieces.map((p) =>
        p.id === pieceId ? { ...p, canvas_state: canvasState } : p,
      ),
    }));
  },

  markPieceEdited: (pieceId) => {
    set((state) => ({
      pieces: state.pieces.map((p) =>
        p.id === pieceId ? { ...p, edited: true } : p,
      ),
    }));
  },

  clearResults: () => {
    set({
      pieces: [],
      activeFormatId: null,
      activeVariation: 1,
    });
  },
}));
