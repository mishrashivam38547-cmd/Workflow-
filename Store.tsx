import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { CREATORS, DEMO_REQUESTS } from '../data/creators';
import { uid } from '../lib/utils';
import { getBackendMode, getFirebaseApp } from '../services/firebase';
import type { Creator, HireRequest, PortfolioItem, RequestStatus, Service } from '../lib/types';

const LS_KEY = 'workflow-store-v1';
const LEGACY_KEY = 'kalasetu-store-v1';

interface StoreValue {
  creators: Creator[];
  requests: HireRequest[];
  /** 'local' = browser localStorage, 'firebase' = Cloud Firestore (realtime) */
  backend: 'local' | 'firebase';
  syncError: string | null;
  getCreator: (id: string) => Creator | undefined;
  createCreator: (c: Creator) => void;
  addRequest: (r: { creatorId: string; serviceTitle: string; clientName: string; contact: string; budget: number; date: string; message: string }) => void;
  setRequestStatus: (id: string, status: RequestStatus) => void;
  updateCreator: (id: string, patch: Partial<Creator>) => void;
  addPortfolio: (creatorId: string, item: Omit<PortfolioItem, 'id'>) => void;
  removePortfolio: (creatorId: string, itemId: string) => void;
  addService: (creatorId: string, svc: Omit<Service, 'id'>) => void;
  updateService: (creatorId: string, svcId: string, patch: Partial<Service>) => void;
  removeService: (creatorId: string, svcId: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

let cache: { creators: Creator[]; requests: HireRequest[] } | null = null;

function load(): { creators: Creator[]; requests: HireRequest[] } {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(LS_KEY) ?? localStorage.getItem(LEGACY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { creators?: Creator[]; requests?: HireRequest[] };
      if (Array.isArray(parsed.creators) && parsed.creators.length > 0) {
        cache = {
          creators: parsed.creators,
          requests: Array.isArray(parsed.requests) ? parsed.requests : [],
        };
        return cache;
      }
    }
  } catch {
    // ignore parse errors, fall back to defaults
  }
  cache = { creators: CREATORS, requests: DEMO_REQUESTS };
  return cache;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const backend = getBackendMode();
  const [creators, setCreators] = useState<Creator[]>(() => load().creators);
  const [requests, setRequests] = useState<HireRequest[]>(() => load().requests);
  const [syncError, setSyncError] = useState<string | null>(null);

  // last JSON we know Firestore holds, per doc id (prevents write/echo loops)
  const remoteCreators = useRef(new Map<string, string>());
  const remoteRequests = useRef(new Map<string, string>());
  const fsReady = useRef(false);
  const fsRef = useRef<null | {
    save: (col: 'creators' | 'requests', id: string, data: unknown) => Promise<void>;
  }>(null);

  /* ---------- local mode: always mirror to localStorage ---------- */
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ creators, requests }));
    } catch {
      // storage full or unavailable — keep app working in memory
    }
  }, [creators, requests]);

  /* ---------- firebase mode: realtime subscribe ---------- */
  useEffect(() => {
    if (backend !== 'firebase') return;
    let unsubs: Array<() => void> = [];
    let cancelled = false;

    (async () => {
      try {
        const app = await getFirebaseApp();
        const fs = await import('firebase/firestore');
        const db = fs.getFirestore(app);
        if (cancelled) return;

        fsRef.current = {
          save: async (col, id, data) => {
            // Firestore rejects `undefined` — strip it via JSON round-trip
            await fs.setDoc(fs.doc(db, col, id), JSON.parse(JSON.stringify(data)));
          },
        };

        const u1 = fs.onSnapshot(
          fs.collection(db, 'creators'),
          (snap) => {
            const list: Creator[] = [];
            snap.forEach((d) => {
              const c = d.data() as Creator;
              remoteCreators.current.set(c.id, JSON.stringify(c));
              list.push(c);
            });
            if (list.length === 0 && !fsReady.current) {
              // empty database → seed with starter data
              CREATORS.forEach((c) => {
                remoteCreators.current.set(c.id, JSON.stringify(c));
                fsRef.current?.save('creators', c.id, c).catch((e) => setSyncError(String(e)));
              });
              DEMO_REQUESTS.forEach((r) => {
                remoteRequests.current.set(r.id, JSON.stringify(r));
                fsRef.current?.save('requests', r.id, r).catch((e) => setSyncError(String(e)));
              });
              fsReady.current = true;
              return;
            }
            fsReady.current = true;
            setCreators(list);
            setSyncError(null);
          },
          (e) => setSyncError(e.message),
        );
        const u2 = fs.onSnapshot(
          fs.collection(db, 'requests'),
          (snap) => {
            const list: HireRequest[] = [];
            snap.forEach((d) => {
              const r = d.data() as HireRequest;
              remoteRequests.current.set(r.id, JSON.stringify(r));
              list.push(r);
            });
            if (list.length > 0 || fsReady.current) setRequests(list);
          },
          (e) => setSyncError(e.message),
        );
        unsubs = [u1, u2];
      } catch (e) {
        setSyncError(e instanceof Error ? e.message : String(e));
      }
    })();

    return () => {
      cancelled = true;
      unsubs.forEach((u) => u());
    };
  }, [backend]);

  /* ---------- firebase mode: push local changes up ---------- */
  useEffect(() => {
    if (backend !== 'firebase' || !fsReady.current || !fsRef.current) return;
    creators.forEach((c) => {
      const j = JSON.stringify(c);
      if (remoteCreators.current.get(c.id) !== j) {
        remoteCreators.current.set(c.id, j);
        fsRef.current!.save('creators', c.id, c).catch((e) => setSyncError(String(e)));
      }
    });
  }, [creators, backend]);

  useEffect(() => {
    if (backend !== 'firebase' || !fsReady.current || !fsRef.current) return;
    requests.forEach((r) => {
      const j = JSON.stringify(r);
      if (remoteRequests.current.get(r.id) !== j) {
        remoteRequests.current.set(r.id, j);
        fsRef.current!.save('requests', r.id, r).catch((e) => setSyncError(String(e)));
      }
    });
  }, [requests, backend]);

  const value = useMemo<StoreValue>(
    () => ({
      creators,
      requests,
      backend,
      syncError,
      getCreator: (id) => creators.find((c) => c.id === id),
      createCreator: (c) => setCreators((prev) => (prev.some((x) => x.id === c.id) ? prev : [...prev, c])),
      addRequest: (r) =>
        setRequests((prev) => [
          { ...r, id: uid(), status: 'new' as RequestStatus, createdAt: new Date().toISOString() },
          ...prev,
        ]),
      setRequestStatus: (id, status) =>
        setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r))),
      updateCreator: (id, patch) =>
        setCreators((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c))),
      addPortfolio: (creatorId, item) =>
        setCreators((prev) =>
          prev.map((c) =>
            c.id === creatorId
              ? { ...c, portfolio: [...c.portfolio, { ...item, id: uid() }] }
              : c,
          ),
        ),
      removePortfolio: (creatorId, itemId) =>
        setCreators((prev) =>
          prev.map((c) =>
            c.id === creatorId
              ? { ...c, portfolio: c.portfolio.filter((p) => p.id !== itemId) }
              : c,
          ),
        ),
      addService: (creatorId, svc) =>
        setCreators((prev) =>
          prev.map((c) =>
            c.id === creatorId
              ? { ...c, services: [...c.services, { ...svc, id: uid() }] }
              : c,
          ),
        ),
      updateService: (creatorId, svcId, patch) =>
        setCreators((prev) =>
          prev.map((c) =>
            c.id === creatorId
              ? {
                  ...c,
                  services: c.services.map((s) => (s.id === svcId ? { ...s, ...patch } : s)),
                }
              : c,
          ),
        ),
      removeService: (creatorId, svcId) =>
        setCreators((prev) =>
          prev.map((c) =>
            c.id === creatorId
              ? { ...c, services: c.services.filter((s) => s.id !== svcId) }
              : c,
          ),
        ),
    }),
    [creators, requests, backend, syncError],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
