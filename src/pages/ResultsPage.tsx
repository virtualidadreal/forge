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
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="font-serif text-2xl text-muted-foreground mb-4">No hay piezas generadas</p>
          <p className="text-muted-foreground text-sm">Genera assets desde el panel de creacion</p>
        </div>
      </div>
    );
  }

  return (
    <ResultsGrid
      onExportAll={handleExportAll}
      onExportPiece={handleExportPiece}
      onEditPiece={handleEditPiece}
      onRegenerateAll={handleRegenerateAll}
      onChangeIntention={handleChangeIntention}
    />
  );
}
