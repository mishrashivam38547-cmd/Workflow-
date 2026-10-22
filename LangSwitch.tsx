import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Languages } from 'lucide-react';
import { LANGUAGES, useLang } from '../i18n/Lang';

export default function LangSwitch() {
  const { lang, setLang, tr } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find((l) => l.id === lang)!;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={tr('भाषा चुनें', 'Select language')}
        className="inline-flex h-10 items-center gap-1.5 rounded-full border border-ink/15 px-3 text-sm font-semibold text-ink transition hover:border-clay hover:text-clay"
      >
        <Languages size={16} />
        <span className="hidden sm:inline">{current.native}</span>
        <ChevronDown size={14} className={`transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul role="listbox" className="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-2xl border border-ink/10 bg-white p-1 shadow-xl">
          {LANGUAGES.map((l) => (
            <li key={l.id}>
              <button
                role="option"
                aria-selected={l.id === lang}
                onClick={() => {
                  setLang(l.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold transition hover:bg-cream ${
                  l.id === lang ? 'text-clay' : 'text-ink'
                }`}
              >
                {l.native}
                {l.id === lang && <Check size={15} />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
