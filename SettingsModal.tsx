import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Cloud, Database, HardDrive, RotateCcw, X } from 'lucide-react';
import { useLang } from '../i18n/Lang';
import { useStore } from '../store/Store';
import {
  getBackendMode,
  getFirebaseConfig,
  saveFirebaseConfig,
  setBackendMode,
  type BackendMode,
  type FirebaseConfig,
} from '../services/firebase';

const field =
  'w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-xs text-ink placeholder:text-ink-soft/50 transition focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/20';

const EMPTY: FirebaseConfig = { apiKey: '', authDomain: '', projectId: '', storageBucket: '', messagingSenderId: '', appId: '' };

/** accepts plain JSON, or the JS object literal copied from the Firebase console */
function parseConfig(text: string): Partial<FirebaseConfig> | null {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end < start) return null;
  const body = text.slice(start, end + 1);
  const out: Record<string, string> = {};
  const re = /["']?(\w+)["']?\s*:\s*["']([^"']*)["']/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body))) out[m[1]] = m[2];
  return Object.keys(out).length ? (out as Partial<FirebaseConfig>) : null;
}

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const { tr } = useLang();
  const { syncError, creators, requests } = useStore();
  const active = getBackendMode();
  const [mode, setMode] = useState<BackendMode>(active);
  const [cfg, setCfg] = useState<FirebaseConfig>(() => getFirebaseConfig() ?? EMPTY);
  const [paste, setPaste] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const applyPaste = (text: string) => {
    setPaste(text);
    const parsed = parseConfig(text);
    if (parsed) setCfg((c) => ({ ...c, ...parsed }));
  };

  const save = () => {
    setErr('');
    if (mode === 'firebase') {
      if (!cfg.apiKey || !cfg.projectId || !cfg.appId) {
        setErr(tr('Firebase के लिए apiKey, projectId और appId ज़रूरी हैं।', 'Firebase needs apiKey, projectId and appId.'));
        return;
      }
      saveFirebaseConfig({ ...cfg, authDomain: cfg.authDomain || `${cfg.projectId}.firebaseapp.com` });
    }
    setBackendMode(mode);
    window.location.reload();
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ creators, requests }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'workflow-data.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const resetLocal = () => {
    if (!window.confirm(tr('लोकल डेटा (प्रोफ़ाइल, अनुरोध, अकाउंट) मिटा दें?', 'Erase local data (profiles, requests, accounts)?'))) return;
    ['workflow-store-v1', 'kalasetu-store-v1', 'workflow-users-v1', 'workflow-session-v1'].forEach((k) => localStorage.removeItem(k));
    window.location.reload();
  };

  const fields: [keyof FirebaseConfig, string][] = [
    ['apiKey', 'apiKey *'],
    ['authDomain', 'authDomain'],
    ['projectId', 'projectId *'],
    ['storageBucket', 'storageBucket'],
    ['messagingSenderId', 'messagingSenderId'],
    ['appId', 'appId *'],
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/60 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        className="max-h-[94vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-paper p-6 shadow-2xl sm:rounded-3xl"
      >
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-display text-xl font-bold text-ink">
            <Database size={20} className="text-clay" /> {tr('डेटाबेस सेटिंग्स', 'Database settings')}
          </h3>
          <button onClick={onClose} aria-label={tr('बंद करें', 'Close')} className="grid h-9 w-9 place-items-center rounded-full border border-ink/15 text-ink hover:bg-cream">
            <X size={18} />
          </button>
        </div>

        <p className="mt-2 text-xs text-ink-soft">
          {tr('अभी चालू:', 'Currently active:')} <b className="text-ink">{active === 'firebase' ? 'Firebase (Firestore + Auth)' : tr('लोकल (ब्राउज़र)', 'Local (browser)')}</b>
        </p>
        {syncError && <p className="mt-2 rounded-lg bg-clay/10 px-3 py-2 text-xs font-semibold text-clay">Firebase: {syncError}</p>}

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {(
            [
              ['local', HardDrive, tr('लोकल डेटाबेस', 'Local database'), tr('कोई सेटअप नहीं, ऑफ़लाइन चलता है, डेटा इसी ब्राउज़र में रहता है।', 'No setup, works offline, data stays in this browser.')],
              ['firebase', Cloud, 'Firebase', tr('क्लाउड सिंक, रियल-टाइम, हर डिवाइस से लॉगिन।', 'Cloud sync, realtime, login from any device.')],
            ] as const
          ).map(([id, Icon, title, desc]) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={`rounded-2xl border p-4 text-left transition ${mode === id ? 'border-clay bg-clay/10' : 'border-ink/15 bg-white hover:border-clay'}`}
            >
              <Icon size={18} className={mode === id ? 'text-clay' : 'text-ink'} />
              <p className="mt-2 text-sm font-bold text-ink">{title}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-ink-soft">{desc}</p>
            </button>
          ))}
        </div>

        {mode === 'firebase' && (
          <div className="mt-4 space-y-3 rounded-2xl border border-ink/10 bg-white p-4">
            <p className="text-[11px] leading-relaxed text-ink-soft">
              {tr(
                'Firebase Console → Project settings → Your apps → Web app से config कॉपी करके नीचे पेस्ट करें (या .env में VITE_FIREBASE_* रखें)। Authentication में Email/Password और Firestore Database चालू होना चाहिए।',
                'Copy the config from Firebase Console → Project settings → Your apps → Web app and paste it below (or set VITE_FIREBASE_* in .env). Enable Email/Password in Authentication and create a Firestore Database.',
              )}
            </p>
            <textarea
              value={paste}
              onChange={(e) => applyPaste(e.target.value)}
              rows={3}
              placeholder={'const firebaseConfig = { apiKey: "…", projectId: "…", … }'}
              className={`${field} resize-none font-mono`}
            />
            <div className="grid gap-2 sm:grid-cols-2">
              {fields.map(([k, label]) => (
                <div key={k}>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-ink-soft">{label}</label>
                  <input value={cfg[k] ?? ''} onChange={(e) => setCfg({ ...cfg, [k]: e.target.value })} className={`${field} font-mono`} />
                </div>
              ))}
            </div>
          </div>
        )}

        {err && <p role="alert" className="mt-3 rounded-lg bg-clay/10 px-3 py-2 text-xs font-semibold text-clay">{err}</p>}

        <button onClick={save} className="mt-5 w-full rounded-xl bg-clay px-4 py-3 text-sm font-bold text-paper transition hover:bg-clay-deep">
          {tr('सेव करें और रीलोड करें', 'Save & reload')}
        </button>

        <div className="mt-5 flex flex-wrap gap-2 border-t border-ink/10 pt-4">
          <button onClick={exportData} className="rounded-xl border border-ink/15 px-3 py-2 text-xs font-bold text-ink transition hover:border-clay hover:text-clay">
            {tr('डेटा एक्सपोर्ट (JSON)', 'Export data (JSON)')}
          </button>
          {active === 'local' && (
            <button onClick={resetLocal} className="flex items-center gap-1.5 rounded-xl border border-ink/15 px-3 py-2 text-xs font-bold text-clay transition hover:border-clay">
              <RotateCcw size={13} /> {tr('लोकल डेटा रीसेट', 'Reset local data')}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
