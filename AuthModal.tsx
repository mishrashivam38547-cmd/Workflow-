import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, X } from 'lucide-react';
import { authErrorMessage, useAuth, type Role } from '../auth/Auth';
import { useLang } from '../i18n/Lang';
import { useStore } from '../store/Store';
import { buildCreator } from '../lib/newCreator';
import { CATEGORIES } from '../data/creators';
import { uid } from '../lib/utils';
import type { CategoryId } from '../lib/types';
import type { AuthMode } from '../ui/Ui';

const field =
  'w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/50 transition focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/20';

export default function AuthModal({
  initialMode,
  redirectTo,
  onClose,
}: {
  initialMode: AuthMode;
  redirectTo?: string;
  onClose: () => void;
}) {
  const { tr } = useLang();
  const { register, login, loginWithGoogle, linkCreator, backend } = useAuth();
  const { createCreator } = useStore();
  const navigate = useNavigate();

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [role, setRole] = useState<Role>('client');
  const [category, setCategory] = useState<CategoryId>('designer');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const finish = (to?: string) => {
    onClose();
    if (to) navigate(to);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    if (!email.trim() || !password) {
      setErr(tr('ईमेल और पासवर्ड ज़रूरी हैं।', 'Email and password are required.'));
      return;
    }
    if (mode === 'register') {
      if (!name.trim()) {
        setErr(tr('अपना नाम लिखें।', 'Please enter your name.'));
        return;
      }
      if (password.length < 6) {
        setErr(tr('पासवर्ड कम से कम 6 अक्षर का रखें।', 'Password must be at least 6 characters.'));
        return;
      }
    }
    setBusy(true);
    try {
      if (mode === 'register') {
        const u = await register({ name, email, password, role });
        if (role === 'creator') {
          const cat = CATEGORIES.find((c) => c.id === category)!;
          const creatorId = 'c-' + uid().slice(0, 8);
          createCreator(buildCreator({ id: creatorId, ownerId: u.id, name: u.name, category, role: cat.label }));
          await linkCreator(creatorId);
          finish('/dashboard');
        } else {
          finish(redirectTo);
        }
      } else {
        const u = await login(email, password);
        finish(redirectTo ?? (u.role === 'creator' ? '/dashboard' : undefined));
      }
    } catch (ex) {
      setErr(authErrorMessage(ex, tr));
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setErr('');
    setBusy(true);
    try {
      const u = await loginWithGoogle();
      finish(redirectTo ?? (u.role === 'creator' ? '/dashboard' : undefined));
    } catch (ex) {
      setErr(authErrorMessage(ex, tr));
    } finally {
      setBusy(false);
    }
  };

  const isReg = mode === 'register';

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/60 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        className="max-h-[94vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-paper p-6 shadow-2xl sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-2xl font-bold text-ink">
              {isReg ? tr('Workflow पर रजिस्टर करें', 'Create your Workflow account') : tr('Workflow में लॉगिन', 'Log in to Workflow')}
            </h3>
            <p className="mt-1 text-xs text-ink-soft">
              {backend === 'firebase'
                ? tr('Firebase क्लाउड अकाउंट', 'Cloud account (Firebase)')
                : tr('लोकल अकाउंट — सिर्फ़ इस ब्राउज़र में सेव होगा', 'Local account — saved in this browser only')}
            </p>
          </div>
          <button onClick={onClose} aria-label={tr('बंद करें', 'Close')} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-ink/15 text-ink hover:bg-cream">
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-1 rounded-full bg-cream p-1">
          {(['login', 'register'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setErr('');
              }}
              className={`rounded-full py-2 text-sm font-bold transition ${mode === m ? 'bg-ink text-paper shadow-sm' : 'text-ink-soft hover:text-ink'}`}
            >
              {m === 'login' ? tr('लॉगिन', 'Log in') : tr('रजिस्टर', 'Register')}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="mt-5 space-y-4">
          {isReg && (
            <div>
              <label className="mb-1.5 block text-xs font-bold text-ink">{tr('पूरा नाम *', 'Full name *')}</label>
              <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={field} />
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-ink">{tr('ईमेल *', 'Email *')}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@example.com" className={field} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-ink">{tr('पासवर्ड *', 'Password *')}</label>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isReg ? 'new-password' : 'current-password'}
                className={`${field} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? tr('पासवर्ड छिपाएं', 'Hide password') : tr('पासवर्ड दिखाएं', 'Show password')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink"
              >
                {show ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {isReg && (
            <>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-ink">{tr('आप कौन हैं?', 'I am a…')}</label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      ['client', tr('ग्राहक — काम करवाना है', 'Client — I want to hire')],
                      ['creator', tr('क्रिएटर — काम बेचना है', 'Creator — I want to sell')],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setRole(id)}
                      className={`rounded-xl border px-3 py-2.5 text-left text-xs font-bold transition ${
                        role === id ? 'border-clay bg-clay/10 text-clay' : 'border-ink/15 text-ink hover:border-clay'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {role === 'creator' && (
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-ink">{tr('आपकी श्रेणी', 'Your category')}</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value as CategoryId)} className={field}>
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          {err && <p role="alert" className="rounded-lg bg-clay/10 px-3 py-2 text-xs font-semibold text-clay">{err}</p>}

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-clay px-4 py-3 text-sm font-bold text-paper transition hover:bg-clay-deep disabled:opacity-60"
          >
            {busy && <Loader2 size={16} className="animate-spin" />}
            {isReg ? tr('अकाउंट बनाएं', 'Create account') : tr('लॉगिन करें', 'Log in')}
          </button>

          {backend === 'firebase' && (
            <button
              type="button"
              onClick={google}
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm font-bold text-ink transition hover:border-clay disabled:opacity-60"
            >
              {tr('Google से जारी रखें', 'Continue with Google')}
            </button>
          )}

          {backend === 'local' && !isReg && (
            <p className="rounded-lg bg-cream px-3 py-2 text-[11px] leading-relaxed text-ink-soft">
              {tr('डेमो क्रिएटर लॉगिन:', 'Demo creator login:')} <b>demo@workflow.app</b> / <b>demo1234</b>
            </p>
          )}
        </form>
      </motion.div>
    </div>
  );
}
