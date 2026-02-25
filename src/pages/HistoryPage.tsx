import { useHistoryStore } from '../store/history.store';
import { useEffect } from 'react';
import { Button } from '../components/shared';

export function HistoryPage() {
  const { campaigns, isLoaded, loadCampaigns, deleteCampaign } = useHistoryStore();

  useEffect(() => {
    if (!isLoaded) loadCampaigns();
  }, [isLoaded, loadCampaigns]);

  return (
    <div className="px-6 py-20 md:px-12 md:py-32 max-w-7xl mx-auto animate-in">
      <div className="mb-16">
        <h1 className="font-serif text-3xl italic leading-tight md:text-5xl text-foreground">Historial</h1>
        <p className="mt-4 text-lg font-light leading-relaxed text-muted-foreground md:text-xl">Campanas generadas anteriormente</p>
      </div>

      {campaigns.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="bg-card p-8 shadow-subtle rounded-2xl max-w-md w-full flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary mb-6">
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
            <p className="font-serif text-2xl italic leading-tight text-foreground mb-3">No hay campanas en el historial</p>
            <p className="text-sm font-light leading-relaxed text-muted-foreground">Las campanas que generes apareceran aqui</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map(campaign => (
            <div
              key={campaign.campaign_id}
              className="bg-card p-6 shadow-subtle rounded-2xl transition-shadow duration-300 hover:shadow-elevated"
            >
              <h3 className="font-sans text-base font-medium text-foreground mb-1">{campaign.campaign_name}</h3>
              <p className="text-sm font-light leading-relaxed text-muted-foreground mb-2">{campaign.brand_name}</p>
              <div className="flex items-center gap-2 mb-5">
                <span className="font-mono text-xs text-muted-foreground">
                  {new Date(campaign.created_at).toLocaleDateString('es-ES')}
                </span>
                <span
                  className="text-[10px] font-medium uppercase tracking-[0.1em]"
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
