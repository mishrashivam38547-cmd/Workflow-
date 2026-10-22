import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, BadgeCheck, MapPin, Star } from 'lucide-react';
import { inr } from '../lib/utils';
import { CATEGORY_LABELS } from '../data/creators';
import type { Creator } from '../lib/types';

export default function CreatorCard({ creator }: { creator: Creator }) {
  const cover = creator.portfolio[0]?.image;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <Link
        to={`/creator/${creator.id}`}
        className="group block overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      >
        <div className="relative h-44 overflow-hidden bg-cream">
          {cover ? (
            <img
              src={cover}
              alt={creator.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="dots-bg h-full w-full bg-cream" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
          <span className="absolute left-3 top-3 rounded-full bg-paper/90 px-3 py-1 text-[11px] font-bold text-ink backdrop-blur">
            {CATEGORY_LABELS[creator.category]}
          </span>
          {creator.online && (
            <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-moss px-3 py-1 text-[11px] font-bold text-white">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              अभी ऑनलाइन
            </span>
          )}
          <div className="absolute -bottom-1 left-4 flex items-end gap-3">
            <img
              src={creator.avatar}
              alt={creator.name}
              loading="lazy"
              className="h-14 w-14 rounded-2xl border-4 border-white object-cover shadow-md"
            />
          </div>
        </div>

        <div className="p-4 pt-3">
          <div className="flex items-start justify-between gap-2">
            <div className="mt-2">
              <h3 className="flex items-center gap-1.5 font-display text-lg font-bold leading-tight text-ink">
                {creator.name}
                {creator.verified && <BadgeCheck size={16} className="shrink-0 fill-clay text-paper" />}
              </h3>
              <p className="text-sm text-ink-soft">{creator.role}</p>
            </div>
            <span className="mt-2 flex items-center gap-1 rounded-full bg-cream px-2.5 py-1 text-xs font-bold text-ink">
              <Star size={12} className="fill-gold text-gold" />
              {creator.rating.toFixed(1)}
            </span>
          </div>

          <p className="mt-1.5 flex items-center gap-1 text-xs text-ink-soft">
            <MapPin size={12} /> {creator.location} · {creator.projects} प्रोजेक्ट
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {creator.tags.slice(0, 3).map((t) => (
              <span key={t} className="rounded-full border border-ink/10 bg-paper px-2.5 py-0.5 text-[11px] font-semibold text-ink-soft">
                {t}
              </span>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-ink/10 pt-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-soft">शुरुआती फीस</p>
              <p className="font-display text-lg font-bold text-clay">{inr(creator.startingPrice)}</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-ink px-3.5 py-2 text-xs font-bold text-paper transition-colors group-hover:bg-clay">
              प्रोफ़ाइल देखें
              <ArrowUpRight size={14} />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
