/**
 * Firebase is loaded lazily (dynamic import) so the app works with zero
 * Firebase setup in "local" mode.
 *
 * Config can come from:
 *   1. .env  → VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID,
 *              VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID
 *   2. the in-app Settings → Database panel (saved in this browser's localStorage)
 */
import type { FirebaseApp } from 'firebase/app';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
}

export type BackendMode = 'local' | 'firebase';

const LS_BACKEND = 'workflow-backend';
const LS_FB_CONFIG = 'workflow-firebase-config';

const env = import.meta.env as Record<string, string | undefined>;

function envConfig(): FirebaseConfig | null {
  if (!env.VITE_FIREBASE_API_KEY || !env.VITE_FIREBASE_PROJECT_ID || !env.VITE_FIREBASE_APP_ID) return null;
  return {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN ?? `${env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  };
}

export function getSavedFirebaseConfig(): FirebaseConfig | null {
  try {
    const raw = localStorage.getItem(LS_FB_CONFIG);
    if (raw) {
      const c = JSON.parse(raw) as FirebaseConfig;
      if (c.apiKey && c.projectId && c.appId) return c;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function saveFirebaseConfig(c: FirebaseConfig | null) {
  try {
    if (c) localStorage.setItem(LS_FB_CONFIG, JSON.stringify(c));
    else localStorage.removeItem(LS_FB_CONFIG);
  } catch {
    /* ignore */
  }
}

export function getFirebaseConfig(): FirebaseConfig | null {
  return getSavedFirebaseConfig() ?? envConfig();
}

/** Active backend. Falls back to local if firebase is selected but not configured. */
export function getBackendMode(): BackendMode {
  try {
    const m = localStorage.getItem(LS_BACKEND);
    if (m === 'firebase' && getFirebaseConfig()) return 'firebase';
    if (m === 'local') return 'local';
  } catch {
    /* ignore */
  }
  return 'local';
}

export function setBackendMode(m: BackendMode) {
  try {
    localStorage.setItem(LS_BACKEND, m);
  } catch {
    /* ignore */
  }
}

let appPromise: Promise<FirebaseApp> | null = null;

export function getFirebaseApp(): Promise<FirebaseApp> {
  if (!appPromise) {
    appPromise = (async () => {
      const cfg = getFirebaseConfig();
      if (!cfg) throw new Error('Firebase config missing');
      const { initializeApp, getApps } = await import('firebase/app');
      return getApps()[0] ?? initializeApp(cfg);
    })();
  }
  return appPromise;
}
