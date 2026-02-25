import { useHistoryStore } from '../store/history.store';
import { useEffect } from 'react';
import { Button } from '../components/shared';

export function HistoryPage() {
  const { campaigns, isLoaded, loadCampaigns, deleteCampaign } = useHistoryStore();

  useEffect(() => {
    if (!isLoaded) loadCampaigns();
  }, [isLoaded, loadCampaigns]);

  return (
    <div className="px-8 py-12 max-w-6xl mx-auto animate-in">
      <div className="mb-12">
        <h1 className="font-serif text-4xl font-medium tracking-tight text-foreground">Historial</h1>
        <p className="mt-3 font-sans text-lg text-muted-foreground">Campanas generadas anteriormente</p>
      </div>

      {campaigns.length === 0 ? (
        <div className="flex items-center justify-center py-20">
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
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <p className="font-serif text-2xl font-medium text-foreground mb-3">No hay campanas en el historial</p>
            <p className="font-sans text-sm text-muted-foreground">Las campanas que generes apareceran aqui</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map(campaign => (
            <div
              key={campaign.campaign_id}
              className="rounded-xl bg-card border border-border p-6 shadow-subtle transition-all duration-[150ms] hover:shadow-elevated hover:border-muted-foreground/30"
            >
              <h3 className="font-sans text-base font-medium text-foreground mb-1">{campaign.campaign_name}</h3>
              <p className="font-sans text-sm text-muted-foreground mb-2">{campaign.brand_name}</p>
              <div className="flex items-center gap-2 mb-5">
                <span className="font-mono text-xs text-muted-foreground">
                  {new Date(campaign.created_at).toLocaleDateString('es-ES')}
                </span>
                <span
                  className="font-sans text-xs font-semibold uppercase tracking-widest"
                  style={{ color: `var(--intent-${campaign.intention.replace('_', '')})` }}
                >
                  {campaign.intention}
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm">Abrir</Button>
                <Button variant="ghost" size="sm" onClick={() => deleteCampaign(campaign.campaign_id)}>Eliminar</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
