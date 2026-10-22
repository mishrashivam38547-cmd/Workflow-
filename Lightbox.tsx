import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { inr } from '../lib/utils';
import type { PortfolioItem } from '../lib/types';

interface Props {
  items: PortfolioItem[];
  index: number;
  onClose: () => void;
  onNav: (dir: 1 | -1) => void;
}

export default function Lightbox({ items, index, onClose, onNav }: Props) {
  const item = items[index];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNav(1);
      if (e.key === 'ArrowLeft') onNav(-1);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, onNav]);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/85 p-4 backdrop-blur-sm" onClick={onClose}>
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-paper/10 text-paper transition hover:bg-paper/20"
        aria-label="बंद करें"
      >
        <X size={20} />
      </button>

      {items.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onNav(-1); }}
            className="absolute left-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-paper/10 text-paper transition hover:bg-paper/20 sm:left-6"
            aria-label="पिछला"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNav(1); }}
            className="absolute right-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-paper/10 text-paper transition hover:bg-paper/20 sm:right-6"
            aria-label="अगला"
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-3xl"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={item.image}
            alt={item.title}
            className="max-h-[62vh] w-full rounded-2xl object-cover shadow-2xl"
          />
          <div className="mt-4 flex flex-col justify-between gap-3 rounded-2xl bg-paper p-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-clay">{item.tag} · {item.year}</p>
              <h3 className="mt-1 font-display text-xl font-bold text-ink">{item.title}</h3>
              <p className="mt-1 text-sm text-ink-soft">{item.description}</p>
            </div>
            <div className="shrink-0 rounded-xl bg-cream px-4 py-3 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-soft">इसी तरह का काम</p>
              <p className="font-display text-xl font-bold text-clay">{inr(item.price)}</p>
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-paper/60">
            {index + 1} / {items.length} — एस्केप से बंद करें, ऐरो कीज़ से नेविगेट करें
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
