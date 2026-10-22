import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Database, LayoutDashboard, LogIn, LogOut, Menu, UserPlus, X } from 'lucide-react';
import LangSwitch from './LangSwitch';
import { useAuth } from '../auth/Auth';
import { useLang } from '../i18n/Lang';
import { useUi } from '../ui/Ui';

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-clay text-paper shadow-sm">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m14.5 12.5-8 8a2.12 2.12 0 1 1-3-3l8-8" />
          <path d="m16 16 6-6" />
          <path d="m8 8 6-6" />
          <path d="m9 7 8 8" />
        </svg>
      </span>
      <span className="leading-none">
        <span className={`block font-display text-xl font-bold tracking-tight ${dark ? 'text-paper' : 'text-ink'}`}>
          Workflow
        </span>
        <span className={`block text-[10px] font-semibold uppercase tracking-[0.18em] ${dark ? 'text-paper/60' : 'text-ink-soft'}`}>
          Creative Marketplace
        </span>
      </span>
    </span>
  );
}

const useLinks = () => {
  const { tr } = useLang();
  return [
    { to: '/', label: tr('होम', 'Home'), match: (p: string) => p === '/' },
    { to: '/explore', label: tr('एक्सप्लोर करें', 'Explore'), match: (p: string) => p.startsWith('/explore') },
    { to: '/dashboard', label: tr('सेलर डैशबोर्ड', 'Seller dashboard'), match: (p: string) => p.startsWith('/dashboard') },
  ];
};

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const LINKS = useLinks();
  const { tr } = useLang();
  const { user, logout } = useAuth();
  const { openAuth, openSettings } = useUi();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search]);

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" aria-label={tr('Workflow होम', 'Workflow home')}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                l.match(location.pathname)
                  ? 'bg-ink text-paper'
                  : 'text-ink-soft hover:bg-cream hover:text-ink'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LangSwitch />
          <button
            onClick={openSettings}
            title={tr('डेटाबेस सेटिंग्स', 'Database settings')}
            aria-label={tr('डेटाबेस सेटिंग्स', 'Database settings')}
            className="hidden h-10 w-10 place-items-center rounded-full border border-ink/15 text-ink transition hover:border-clay hover:text-clay sm:grid"
          >
            <Database size={16} />
          </button>
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="hidden max-w-[10rem] items-center gap-2 truncate rounded-full bg-clay px-4 py-2 text-sm font-bold text-paper shadow-sm transition hover:bg-clay-deep md:inline-flex"
              >
                <LayoutDashboard size={16} className="shrink-0" />
                <span className="truncate">{user.name}</span>
              </Link>
              <button
                onClick={() => void logout()}
                title={tr('लॉगआउट', 'Log out')}
                aria-label={tr('लॉगआउट', 'Log out')}
                className="hidden h-10 w-10 place-items-center rounded-full border border-ink/15 text-ink transition hover:border-clay hover:text-clay md:grid"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => openAuth('login')}
                className="hidden items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold text-ink transition hover:border-clay hover:text-clay md:inline-flex"
              >
                <LogIn size={16} />
                {tr('लॉगिन', 'Log in')}
              </button>
              <button
                onClick={() => openAuth('register')}
                className="hidden items-center gap-2 rounded-full bg-clay px-4 py-2 text-sm font-bold text-paper shadow-sm transition hover:bg-clay-deep md:inline-flex"
              >
                <UserPlus size={16} />
                {tr('रजिस्टर', 'Register')}
              </button>
            </>
          )}
          <button
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full border border-ink/15 text-ink md:hidden"
            aria-label={tr('मेनू', 'Menu')}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-ink/10 bg-paper px-4 pb-4 pt-2 md:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`block rounded-xl px-4 py-3 text-sm font-semibold ${
                l.match(location.pathname) ? 'bg-ink text-paper' : 'text-ink hover:bg-cream'
              }`}
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-2 grid gap-2">
            {user ? (
              <>
                <Link to="/dashboard" className="flex items-center justify-center gap-2 rounded-xl bg-clay px-4 py-3 text-sm font-bold text-paper">
                  <LayoutDashboard size={16} />
                  {user.name}
                </Link>
                <button onClick={() => void logout()} className="flex items-center justify-center gap-2 rounded-xl border border-ink/15 px-4 py-3 text-sm font-bold text-ink">
                  <LogOut size={16} />
                  {tr('लॉगआउट', 'Log out')}
                </button>
              </>
            ) : (
              <>
                <button onClick={() => openAuth('register')} className="flex items-center justify-center gap-2 rounded-xl bg-clay px-4 py-3 text-sm font-bold text-paper">
                  <UserPlus size={16} />
                  {tr('फ्री में रजिस्टर करें', 'Register for free')}
                </button>
                <button onClick={() => openAuth('login')} className="flex items-center justify-center gap-2 rounded-xl border border-ink/15 px-4 py-3 text-sm font-bold text-ink">
                  <LogIn size={16} />
                  {tr('लॉगिन', 'Log in')}
                </button>
              </>
            )}
            <button onClick={openSettings} className="flex items-center justify-center gap-2 rounded-xl border border-ink/15 px-4 py-3 text-sm font-bold text-ink">
              <Database size={16} />
              {tr('डेटाबेस सेटिंग्स', 'Database settings')}
            </button>
            <Link to="/explore" className="flex items-center justify-center gap-2 rounded-xl border border-ink/15 px-4 py-3 text-sm font-bold text-ink">
              <Compass size={16} />
              {tr('क्रिएटर खोजें', 'Find creators')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
