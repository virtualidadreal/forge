import { create } from 'zustand';
import type { CampaignEntry } from '../types/canvas.types';

// ---------------------------------------------------------------------------
// IndexedDB helpers
// ---------------------------------------------------------------------------

const DB_NAME = 'forge-db';
const STORE_NAME = 'campaigns';
const DB_VERSION = 1;
const MAX_CAMPAIGNS = 50;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'campaign_id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getAll(db: IDBDatabase): Promise<CampaignEntry[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result as CampaignEntry[]);
    request.onerror = () => reject(request.error);
  });
}

function put(db: IDBDatabase, item: CampaignEntry): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(item);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function deleteItem(db: IDBDatabase, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface HistoryState {
  campaigns: CampaignEntry[];
  isLoaded: boolean;
}

interface HistoryActions {
  loadCampaigns: () => Promise<void>;
  addCampaign: (campaign: CampaignEntry) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
  getCampaignById: (id: string) => CampaignEntry | undefined;
}

export type HistoryStore = HistoryState & HistoryActions;

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useHistoryStore = create<HistoryStore>()((set, get) => ({
  // -- State -----------------------------------------------------------------
  campaigns: [],
  isLoaded: false,

  // -- Actions ---------------------------------------------------------------
  loadCampaigns: async () => {
    try {
      const db = await openDB();
      const all = await getAll(db);

      // Sort by created_at descending (newest first)
      all.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

      set({ campaigns: all, isLoaded: true });
    } catch (error) {
      console.error('[FORGE] Failed to load campaigns from IndexedDB:', error);
      set({ campaigns: [], isLoaded: true });
    }
  },

  addCampaign: async (campaign) => {
    try {
      const db = await openDB();

      // Get current list sorted newest-first
      const current = [...get().campaigns];
      current.unshift(campaign);

      // Enforce the 50-campaign limit — remove oldest entries
      const toRemove = current.slice(MAX_CAMPAIGNS);
      for (const entry of toRemove) {
        await deleteItem(db, entry.campaign_id);
      }

      const kept = current.slice(0, MAX_CAMPAIGNS);
      await put(db, campaign);

      set({ campaigns: kept });
    } catch (error) {
      console.error('[FORGE] Failed to add campaign to IndexedDB:', error);
    }
  },

  deleteCampaign: async (id) => {
    try {
      const db = await openDB();
      await deleteItem(db, id);

      set((state) => ({
        campaigns: state.campaigns.filter((c) => c.campaign_id !== id),
      }));
    } catch (error) {
      console.error(
        '[FORGE] Failed to delete campaign from IndexedDB:',
        error,
      );
    }
  },

  getCampaignById: (id) => {
    return get().campaigns.find((c) => c.campaign_id === id);
  },
}));
