import { BrandDNAWizard } from '../components/StudioSetup/BrandDNAWizard';
import { BrandList } from '../components/StudioSetup/BrandList';
import { useState } from 'react';

export function StudioPage() {
  const [showWizard, setShowWizard] = useState(false);

  return (
    <div className="px-10 lg:px-16 py-16 max-w-6xl mx-auto animate-in">
      <div className="mb-16">
        <h1 className="font-serif text-4xl italic">Brand Studio</h1>
        <p className="mt-6 text-lg font-light leading-relaxed text-muted-foreground">Configura el ADN visual de tus marcas</p>
      </div>

      {showWizard ? (
        <BrandDNAWizard onComplete={() => setShowWizard(false)} onCancel={() => setShowWizard(false)} />
      ) : (
        <BrandList onCreateNew={() => setShowWizard(true)} onEdit={() => setShowWizard(true)} />
      )}
    </div>
  );
}
