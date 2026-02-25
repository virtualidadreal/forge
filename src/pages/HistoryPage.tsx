import { useHistoryStore } from '../store/history.store';
import { useEffect } from 'react';
import { Button } from '../components/shared';

export function HistoryPage() {
  const { campaigns, isLoaded, loadCampaigns, deleteCampaign } = useHistoryStore();

  useEffect(() => {
    if (!isLoaded) loadCampaigns();
  }, [isLoaded, loadCampaigns]);

  return (
    <div className="px-10 lg:px-16 py-12 max-w-6xl mx-auto animate-in">
      <div className="mb-12">
        <h1 className="font-serif text-4xl font-medium tracking-tight">Historial</h1>
        <p className="text-sm font-light text-muted-foreground mt-4">Campanas generadas anteriormente</p>
      </div>

      {campaigns.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <div className="bg-card rounded-3xl p-8 shadow-subtle max-w-md w-full flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary mb-8">
              <svg
                width="28"
                height="28"
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
            <p className="font-serif text-2xl font-medium text-foreground mb-4">No hay campanas en el historial</p>
            <p className="text-sm font-light leading-relaxed text-muted-foreground">Las campanas que generes apareceran aqui</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map(campaign => (
            <div
              key={campaign.campaign_id}
              className="bg-card rounded-3xl border border-border p-8 shadow-subtle hover:shadow-elevated transition-shadow duration-300"
            >
              <h3 className="font-serif text-lg font-medium mb-2">{campaign.campaign_name}</h3>
              <p className="text-sm font-light text-muted-foreground mb-3">{campaign.brand_name}</p>
              <div className="flex items-center gap-3 mb-6">
                <span className="font-mono text-[11px] font-light text-muted-foreground">
                  {new Date(campaign.created_at).toLocaleDateString('es-ES')}
                </span>
                <span
                  className="text-xs font-medium uppercase tracking-[0.2em]"
                  style={{ color: `var(--intent-${campaign.intention.replace('_', '')})` }}
                >
                  {campaign.intention}
                </span>
              </div>
              <div className="flex gap-3">
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
