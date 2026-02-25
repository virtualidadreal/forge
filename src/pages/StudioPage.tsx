import { BrandDNAWizard } from '../components/StudioSetup/BrandDNAWizard';
import { BrandList } from '../components/StudioSetup/BrandList';
import { useState } from 'react';

export function StudioPage() {
  const [showWizard, setShowWizard] = useState(false);

  return (
    <div className="px-6 py-20 md:px-12 md:py-32 max-w-7xl mx-auto animate-in">
      <div className="mb-16">
        <h1 className="font-serif text-3xl italic leading-tight md:text-5xl text-foreground">Brand Studio</h1>
        <p className="mt-4 text-lg font-light leading-relaxed text-muted-foreground md:text-xl">Configura el ADN visual de tus marcas</p>
      </div>

      {showWizard ? (
        <BrandDNAWizard onComplete={() => setShowWizard(false)} onCancel={() => setShowWizard(false)} />
      ) : (
        <BrandList onCreateNew={() => setShowWizard(true)} onEdit={() => setShowWizard(true)} />
      )}
    </div>
  );
}
