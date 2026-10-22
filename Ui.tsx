import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import AuthModal from '../components/AuthModal';
import SettingsModal from '../components/SettingsModal';

export type AuthMode = 'login' | 'register';

interface UiValue {
  openAuth: (mode?: AuthMode, redirectTo?: string) => void;
  openSettings: () => void;
}

const UiContext = createContext<UiValue | null>(null);

export function UiProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<{ mode: AuthMode; redirectTo?: string } | null>(null);
  const [settings, setSettings] = useState(false);

  const openAuth = useCallback((mode: AuthMode = 'login', redirectTo?: string) => setAuth({ mode, redirectTo }), []);
  const openSettings = useCallback(() => setSettings(true), []);
  const value = useMemo(() => ({ openAuth, openSettings }), [openAuth, openSettings]);

  return (
    <UiContext.Provider value={value}>
      {children}
      {auth && <AuthModal initialMode={auth.mode} redirectTo={auth.redirectTo} onClose={() => setAuth(null)} />}
      {settings && <SettingsModal onClose={() => setSettings(false)} />}
    </UiContext.Provider>
  );
}

export function useUi(): UiValue {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error('useUi must be used within UiProvider');
  return ctx;
}
