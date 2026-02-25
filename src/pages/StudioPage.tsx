import { BrandDNAWizard } from '../components/StudioSetup/BrandDNAWizard';
import { BrandList } from '../components/StudioSetup/BrandList';
import { useState } from 'react';

export function StudioPage() {
  const [showWizard, setShowWizard] = useState(false);

  return (
    <div className="p-10 max-w-5xl mx-auto">
      <div className="mb-12">
        <h1 className="font-serif text-5xl font-medium tracking-tight mb-2">Brand Studio</h1>
        <p className="text-muted-foreground text-base mt-1">Configura el ADN visual de tus marcas</p>
      </div>

      {showWizard ? (
        <BrandDNAWizard onComplete={() => setShowWizard(false)} onCancel={() => setShowWizard(false)} />
      ) : (
        <BrandList onCreateNew={() => setShowWizard(true)} onEdit={() => setShowWizard(true)} />
      )}
    </div>
  );
}
