import { ResultsGrid } from '../components/Results/ResultsGrid';
import { useResultsStore } from '../store/results.store';
import { useSessionStore } from '../store/session.store';
import { useBrandDNAStore } from '../store/brandDNA.store';
import { exportPieces, exportSinglePiece } from '../services/export.service';
import { useNavigate } from 'react-router-dom';
import type { GeneratedPiece } from '../types/composition.types';

export function ResultsPage() {
  const { pieces } = useResultsStore();
  const { imageDataUrl, intention } = useSessionStore();
  const { getActiveBrand } = useBrandDNAStore();
  const navigate = useNavigate();

  const brand = getActiveBrand();

  const handleExportAll = async () => {
    if (!imageDataUrl || !brand) return;
    try {
      await exportPieces(
        pieces,
        'campaign',
        brand.brand_name,
        intention,
        imageDataUrl,
        brand.logo_url || undefined,
      );
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleExportPiece = async (piece: GeneratedPiece) => {
    if (!imageDataUrl) return;
    try {
      await exportSinglePiece(piece, imageDataUrl, brand?.logo_url || undefined);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleEditPiece = (_piece: GeneratedPiece) => {
    navigate('/editor');
  };

  const handleRegenerateAll = () => {
    navigate('/generator');
  };

  const handleChangeIntention = () => {
    navigate('/generator');
  };

  if (pieces.length === 0) {
    return (
      <div className="flex items-center justify-center h-full px-8 py-12">
        <div className="rounded-xl bg-card border border-border p-8 shadow-subtle max-w-md w-full flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary mb-6">
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
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
          </div>
          <p className="font-serif text-2xl font-medium text-foreground mb-3">No hay piezas generadas</p>
          <p className="font-sans text-sm text-muted-foreground">Genera assets desde el panel de creacion para ver tus piezas aqui</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 py-12 max-w-7xl mx-auto animate-in">
      <ResultsGrid
        onExportAll={handleExportAll}
        onExportPiece={handleExportPiece}
        onEditPiece={handleEditPiece}
        onRegenerateAll={handleRegenerateAll}
        onChangeIntention={handleChangeIntention}
      />
    </div>
  );
}
