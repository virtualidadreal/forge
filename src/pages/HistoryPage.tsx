import { useHistoryStore } from '../store/history.store';
import { useEffect } from 'react';
import { Button } from '../components/shared';

export function HistoryPage() {
  const { campaigns, isLoaded, loadCampaigns, deleteCampaign } = useHistoryStore();

  useEffect(() => {
    if (!isLoaded) loadCampaigns();
  }, [isLoaded, loadCampaigns]);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-medium tracking-tight mb-2">Historial</h1>
        <p className="text-muted-foreground">Campanas generadas anteriormente</p>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No hay campanas en el historial</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map(campaign => (
            <div key={campaign.campaign_id} className="bg-card rounded-xl border border-border p-4 shadow-subtle">
              <h3 className="font-serif text-lg font-medium mb-1">{campaign.campaign_name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{campaign.brand_name}</p>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-mono text-muted-foreground">
                  {new Date(campaign.created_at).toLocaleDateString('es-ES')}
                </span>
                <span className="text-xs uppercase tracking-wide font-semibold" style={{ color: `var(--intent-${campaign.intention.replace('_', '')})` }}>
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
