import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CircleCheck,
  Clock,
  Globe,
  Link2,
  MapPin,
  ShieldCheck,
  Star,
  Zap,
} from 'lucide-react';
import HireModal from '../components/HireModal';
import Lightbox from '../components/Lightbox';
import RatingStars from '../components/RatingStars';
import { CATEGORY_LABELS } from '../data/creators';
import { fmtDate, inr } from '../lib/utils';
import { useStore } from '../store/Store';
import type { Service } from '../lib/types';

type TabId = 'portfolio' | 'services' | 'reviews' | 'about';

export default function Profile() {
  const { id } = useParams();
  const { getCreator } = useStore();
  const creator = id ? getCreator(id) : undefined;

  const [tab, setTab] = useState<TabId>('portfolio');
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [hireOpen, setHireOpen] = useState(false);
  const [hireService, setHireService] = useState<Service | null>(null);
  const [copied, setCopied] = useState(false);

  const activeServices = useMemo(
    () => creator?.services.filter((s) => s.active) ?? [],
    [creator],
  );

  if (!creator) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold text-ink">प्रोफ़ाइल नहीं मिली</h1>
        <p className="mt-3 text-ink-soft">हो सकता है यह क्रिएटर हटा दिया गया हो या लिंक ग़लत हो।</p>
        <Link to="/explore" className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-bold text-paper hover:bg-clay">
          <ArrowLeft size={16} /> सभी क्रिएटर्स देखें
        </Link>
      </div>
    );
  }

  const cover = creator.portfolio[0]?.image;

  const openHire = (s: Service | null = null) => {
    setHireService(s);
    setHireOpen(true);
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: 'portfolio', label: 'पोर्टफोलियो', count: creator.portfolio.length },
    { id: 'services', label: 'सर्विसेज़ और फीस', count: activeServices.length },
    { id: 'reviews', label: 'रिव्यूज़', count: creator.reviews.length },
    { id: 'about', label: 'परिचय' },
  ];

  return (
    <div className="pb-16">
      {/* cover */}
      <div className="relative h-52 overflow-hidden bg-ink md:h-72">
        {cover ? (
          <img src={cover} alt="" className="h-full w-full object-cover opacity-80" />
        ) : (
          <div className="dots-bg h-full w-full" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent" />
        <div className="absolute left-4 top-4 sm:left-6 sm:top-6">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 rounded-full bg-paper/15 px-4 py-2 text-xs font-bold text-paper backdrop-blur transition hover:bg-paper/25"
          >
            <ArrowLeft size={14} /> वापस एक्सप्लोर पर
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* header card */}
        <div className="relative -mt-14 rounded-3xl border border-ink/10 bg-white p-5 shadow-lg sm:p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-start">
            <img
              src={creator.avatar}
              alt={creator.name}
              className="h-24 w-24 shrink-0 rounded-3xl border-4 border-paper object-cover shadow-md sm:-mt-16 sm:h-32 sm:w-32"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">{creator.name}</h1>
                {creator.verified && <BadgeCheck size={22} className="fill-clay text-paper" />}
                {creator.online ? (
                  <span className="flex items-center gap-1.5 rounded-full bg-moss/10 px-3 py-1 text-[11px] font-bold text-moss">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-moss" /> अभी ऑनलाइन
                  </span>
                ) : (
                  <span className="rounded-full bg-sand/70 px-3 py-1 text-[11px] font-bold text-ink-soft">ऑफ़लाइन</span>
                )}
              </div>
              <p className="mt-1 text-sm font-semibold text-ink-soft sm:text-base">
                {creator.role} · {CATEGORY_LABELS[creator.category]}
              </p>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-soft sm:text-sm">
                <span className="flex items-center gap-1.5"><MapPin size={14} className="text-clay" /> {creator.location}</span>
                <span className="flex items-center gap-1.5"><Clock size={14} className="text-clay" /> जवाब {creator.responseTime} में</span>
                <span className="flex items-center gap-1.5"><CalendarDays size={14} className="text-clay" /> {creator.joined} से Workflow पर</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {creator.tags.map((t) => (
                  <span key={t} className="rounded-full bg-cream px-3 py-1 text-[11px] font-semibold text-ink-soft">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="shrink-0 rounded-2xl bg-cream/80 p-4 text-center md:w-56">
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">शुरुआती फीस</p>
              <p className="mt-0.5 font-display text-3xl font-bold text-clay">{inr(creator.startingPrice)}</p>
              <div className="mt-1.5 flex items-center justify-center gap-1.5 text-xs font-bold text-ink">
                <Star size={13} className="fill-gold text-gold" />
                {creator.rating.toFixed(1)}
                <span className="font-medium text-ink-soft">({creator.reviewsCount} रिव्यू)</span>
              </div>
              <button
                onClick={() => openHire(null)}
                className="mt-3 w-full rounded-xl bg-clay px-4 py-3 text-sm font-bold text-paper shadow-sm transition hover:bg-clay-deep"
              >
                हायर करें
              </button>
            </div>
          </div>
        </div>

        {/* tabs */}
        <div className="no-scrollbar mt-6 flex w-full gap-1 overflow-x-auto rounded-full bg-cream p-1.5 sm:w-max">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold transition sm:px-5 ${
                tab === t.id ? 'bg-ink text-paper shadow-sm' : 'text-ink-soft hover:text-ink'
              }`}
            >
              {t.label}
              {typeof t.count === 'number' && (
                <span className={`rounded-full px-1.5 text-[10px] font-bold ${tab === t.id ? 'bg-paper/20 text-paper' : 'bg-ink/10 text-ink-soft'}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
          {/* main column */}
          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                {tab === 'portfolio' && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {creator.portfolio.map((p, i) => (
                      <button
                        key={p.id}
                        onClick={() => setLightbox(i)}
                        className="group relative overflow-hidden rounded-3xl border border-ink/10 bg-white text-left shadow-sm transition hover:shadow-lg"
                      >
                        <div className="aspect-[4/3] overflow-hidden bg-cream">
                          <img
                            src={p.image}
                            alt={p.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <div className="flex items-center justify-between gap-3 p-4">
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-clay">{p.tag} · {p.year}</p>
                            <h3 className="truncate font-display text-base font-bold text-ink">{p.title}</h3>
                          </div>
                          <span className="shrink-0 rounded-lg bg-cream px-2.5 py-1 text-xs font-bold text-ink">
                            {inr(p.price)}
                          </span>
                        </div>
                      </button>
                    ))}
                    {creator.portfolio.length === 0 && (
                      <p className="col-span-full rounded-2xl border border-dashed border-ink/20 p-10 text-center text-sm text-ink-soft">
                        अभी कोई काम अपलोड नहीं किया गया।
                      </p>
                    )}
                  </div>
                )}

                {tab === 'services' && (
                  <div className="space-y-4">
                    {activeServices.map((s) => (
                      <div
                        key={s.id}
                        className={`rounded-3xl border bg-white p-5 shadow-sm sm:p-6 ${
                          s.popular ? 'border-clay/40 ring-1 ring-clay/20' : 'border-ink/10'
                        }`}
                      >
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-display text-xl font-bold text-ink">{s.title}</h3>
                              {s.popular && (
                                <span className="rounded-full bg-clay px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-paper">
                                  सबसे लोकप्रिय
                                </span>
                              )}
                            </div>
                            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{s.description}</p>
                            <div className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                              {s.deliverables.map((d) => (
                                <span key={d} className="flex items-start gap-2 text-sm text-ink">
                                  <CircleCheck size={16} className="mt-0.5 shrink-0 text-moss" /> {d}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="shrink-0 border-t border-ink/10 pt-4 text-left sm:border-0 sm:pt-0 sm:text-right">
                            <p className="font-display text-2xl font-bold text-clay">{inr(s.price)}</p>
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-soft sm:justify-end">
                              <Clock size={12} /> {s.duration}
                            </p>
                            <button
                              onClick={() => openHire(s)}
                              className="mt-3 rounded-xl bg-ink px-5 py-2.5 text-sm font-bold text-paper transition hover:bg-clay"
                            >
                              बुक करें
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {activeServices.length === 0 && (
                      <p className="rounded-2xl border border-dashed border-ink/20 p-10 text-center text-sm text-ink-soft">
                        अभी कोई सर्विस उपलब्ध नहीं — थोड़ी देर में फिर देखें।
                      </p>
                    )}
                  </div>
                )}

                {tab === 'reviews' && (
                  <div>
                    <div className="flex items-center gap-5 rounded-3xl border border-ink/10 bg-white p-6 shadow-sm">
                      <p className="font-display text-5xl font-bold text-ink">{creator.rating.toFixed(1)}</p>
                      <div>
                        <RatingStars rating={creator.rating} size={18} />
                        <p className="mt-1 text-sm text-ink-soft">{creator.reviewsCount} वेरीफाइड रिव्यू</p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-4">
                      {creator.reviews.map((r) => (
                        <div key={r.id} className="rounded-3xl border border-ink/10 bg-white p-5 shadow-sm sm:p-6">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className="grid h-11 w-11 place-items-center rounded-full bg-clay/10 font-display text-lg font-bold text-clay">
                                {r.name.charAt(0)}
                              </span>
                              <div>
                                <p className="text-sm font-bold text-ink">{r.name}</p>
                                {r.role && <p className="text-xs text-ink-soft">{r.role}</p>}
                              </div>
                            </div>
                            <div className="text-right">
                              <RatingStars rating={r.rating} />
                              <p className="mt-1 text-[11px] text-ink-soft">{fmtDate(r.date)}</p>
                            </div>
                          </div>
                          <p className="mt-3 text-sm leading-relaxed text-ink">{r.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tab === 'about' && (
                  <div className="rounded-3xl border border-ink/10 bg-white p-6 shadow-sm sm:p-8">
                    <h3 className="font-display text-xl font-bold text-ink">{creator.name} के बारे में</h3>
                    <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-ink-soft sm:text-base">
                      {creator.about}
                    </p>
                    <div className="mt-6 grid grid-cols-3 gap-3">
                      {[
                        { v: String(creator.projects), l: 'प्रोजेक्ट पूरे' },
                        { v: creator.responseTime, l: 'जवाब देने का समय' },
                        { v: creator.joined, l: 'से सक्रिय' },
                      ].map((s) => (
                        <div key={s.l} className="rounded-2xl bg-cream/80 p-4 text-center">
                          <p className="font-display text-xl font-bold text-ink">{s.v}</p>
                          <p className="mt-0.5 text-[11px] text-ink-soft">{s.l}</p>
                        </div>
                      ))}
                    </div>
                    <p className="mt-6 flex items-center gap-2 text-sm text-ink-soft">
                      <Globe size={15} className="text-clay" />
                      भाषाएँ: {creator.languages.join(', ')}
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-3xl border border-ink/10 bg-ink p-5 text-paper shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-paper/50">शुरुआती फीस</p>
              <p className="font-display text-3xl font-bold">{inr(creator.startingPrice)}</p>
              <p className="mt-1 text-xs text-paper/60">सर्विस के हिसाब से अंतिम फीस तय होगी</p>
              <button
                onClick={() => openHire(null)}
                className="mt-4 w-full rounded-xl bg-clay px-4 py-3 text-sm font-bold text-paper transition hover:bg-clay-deep"
              >
                {creator.name.split(' ')[0]} को हायर करें
              </button>
              <button
                onClick={share}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-paper/20 px-4 py-2.5 text-xs font-bold text-paper transition hover:bg-paper/10"
              >
                <Link2 size={14} />
                {copied ? 'लिंक कॉपी हो गया!' : 'प्रोफ़ाइल शेयर करें'}
              </button>
            </div>

            <div className="space-y-3 rounded-3xl border border-ink/10 bg-white p-5 shadow-sm">
              {[
                { icon: ShieldCheck, text: 'पहचान और पोर्टफोलियो Workflow द्वारा वेरीफाइड' },
                { icon: Clock, text: `औसत जवाब: ${creator.responseTime}` },
                { icon: Zap, text: '24 घंटे के भीतर फ्री कैंसलेशन' },
              ].map((f) => (
                <p key={f.text} className="flex items-start gap-2.5 text-xs leading-relaxed text-ink-soft">
                  <f.icon size={15} className="mt-0.5 shrink-0 text-moss" />
                  {f.text}
                </p>
              ))}
            </div>
          </aside>
        </div>
      </div>

      {lightbox !== null && creator.portfolio.length > 0 && (
        <Lightbox
          items={creator.portfolio}
          index={lightbox}
          onClose={() => setLightbox(null)}
          onNav={(dir) =>
            setLightbox((i) => {
              if (i === null) return 0;
              const len = creator.portfolio.length;
              return (i + dir + len) % len;
            })
          }
        />
      )}

      {hireOpen && (
        <HireModal creator={creator} initialService={hireService} onClose={() => setHireOpen(false)} />
      )}
    </div>
  );
}
