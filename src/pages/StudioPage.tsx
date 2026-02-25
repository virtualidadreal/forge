import { BrandDNAWizard } from '../components/StudioSetup/BrandDNAWizard';
import { BrandList } from '../components/StudioSetup/BrandList';
import { useState } from 'react';

export function StudioPage() {
  const [showWizard, setShowWizard] = useState(false);

  return (
    <div className="px-8 py-12 max-w-6xl mx-auto animate-in">
      <div className="mb-12">
        <h1 className="font-serif text-4xl font-medium tracking-tight text-foreground">Brand Studio</h1>
        <p className="mt-3 font-sans text-lg text-muted-foreground">Configura el ADN visual de tus marcas</p>
      </div>

      {showWizard ? (
        <BrandDNAWizard onComplete={() => setShowWizard(false)} onCancel={() => setShowWizard(false)} />
      ) : (
        <BrandList onCreateNew={() => setShowWizard(true)} onEdit={() => setShowWizard(true)} />
      )}
    </div>
  );
}
