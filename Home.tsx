import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Brush,
  Building2,
  CircleCheck,
  ImagePlus,
  Inbox,
  LayoutDashboard,
  PenTool,
  Search,
  Smartphone,
  Sparkles,
  Star,
  TrendingUp,
  User,
  type LucideIcon,
} from 'lucide-react';
import CreatorCard from '../components/CreatorCard';
import { CATEGORIES } from '../data/creators';
import { useStore } from '../store/Store';
import { inr } from '../lib/utils';
import type { CategoryId } from '../lib/types';

const CAT_ICONS: Record<CategoryId, LucideIcon> = {
  artist: Brush,
  designer: PenTool,
  architect: Building2,
};

const CAT_ACCENTS: Record<CategoryId, string> = {
  artist: 'bg-clay/10 text-clay',
  designer: 'bg-gold/15 text-gold',
  architect: 'bg-moss/10 text-moss',
};

const MARQUEE = [
  'लोगो डिज़ाइन',
  'ब्रांडिंग',
  '3D आर्ट',
  'पैकेजिंग',
  'UI/UX डिज़ाइन',
  'होम इंटीरियर',
  'वॉटरकलर',
  'फ़ेसाड डिज़ाइन',
  'बुक कवर',
  'पोर्ट्रेट',
  '3D वॉकथ्रू',
  'वेडिंग कार्ड',
];

function SectionHead({ kicker, title, sub, dark = false }: { kicker: string; title: string; sub?: string; dark?: boolean }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] ${dark ? 'bg-paper/10 text-gold' : 'bg-clay/10 text-clay'}`}>
        <Sparkles size={12} />
        {kicker}
      </p>
      <h2 className={`mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl ${dark ? 'text-paper' : 'text-ink'}`}>{title}</h2>
      {sub && <p className={`mt-3 text-sm leading-relaxed sm:text-base ${dark ? 'text-paper/70' : 'text-ink-soft'}`}>{sub}</p>}
    </div>
  );
}

export default function Home() {
  const { creators } = useStore();
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  const featured = creators.filter((c) => c.featured).slice(0, 3);
  const meera = creators.find((c) => c.id === 'meera') ?? creators[0];

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(q.trim() ? `/explore?q=${encodeURIComponent(q.trim())}` : '/explore');
  };

  const stats = [
    { value: '12,400+', label: 'रजिस्टर्ड क्रिएटर्स' },
    { value: '48,000+', label: 'प्रोजेक्ट पूरे' },
    { value: '4.9', label: 'औसत रेटिंग', star: true },
    { value: '28', label: 'शहरों में सक्रिय' },
  ];

  return (
    <div>
      {/* ---------- HERO ---------- */}
      <section className="dots-bg relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-2 lg:items-center lg:pb-24 lg:pt-20">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-clay/25 bg-clay/10 px-4 py-1.5 text-xs font-bold text-clay">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-clay" />
              भारत का क्रिएटिव मार्केटप्लेस
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.15] tracking-tight text-ink sm:text-5xl lg:text-[3.4rem]">
              कमाल के क्रिएटर्स।
              <br />
              <span className="italic text-clay">पारदर्शी फीस।</span> सीधी
              <br />
              बातचीत।
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-soft sm:text-lg">
              आर्टिस्ट, ग्राफ़िक डिज़ाइनर और आर्किटेक्ट — हर क्रिएटर का पोर्टफोलियो और हर सर्विस की फीस{' '}
              <span className="font-semibold text-ink">पहले से साफ।</span>{' '}
              काम देखें, तुलना करें, सीधे बुक करें।
            </p>

            <form onSubmit={search} className="mt-7 flex max-w-lg items-center gap-2 rounded-2xl border border-ink/15 bg-white p-2 shadow-sm focus-within:border-clay sm:rounded-full">
              <Search size={18} className="ml-3 shrink-0 text-ink-soft" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="क्या बनवाना है? जैसे — लोगो, घर का नक्शा…"
                className="w-full bg-transparent text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none"
              />
              <button type="submit" className="shrink-0 rounded-xl bg-clay px-5 py-2.5 text-sm font-bold text-paper transition hover:bg-clay-deep sm:rounded-full">
                खोजें
              </button>
            </form>

            <div className="mt-4 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.id}
                  to={`/explore?cat=${c.id}`}
                  className="rounded-full border border-ink/15 bg-white px-4 py-1.5 text-xs font-semibold text-ink-soft transition hover:border-clay hover:text-clay"
                >
                  {c.label}
                </Link>
              ))}
            </div>

            <div className="mt-10 grid max-w-md grid-cols-4 gap-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="flex items-center gap-1 font-display text-xl font-bold text-ink sm:text-2xl">
                    {s.value}
                    {s.star && <Star size={15} className="fill-gold text-gold" />}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-tight text-ink-soft">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* collage */}
          <div className="relative hidden h-[500px] lg:block">
            <motion.img
              src="/img/work/arjun-3.jpg"
              alt="विला आर्किटेक्चर"
              initial={{ opacity: 0, y: 30, rotate: 6 }}
              animate={{ opacity: 1, y: 0, rotate: 3 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="absolute right-0 top-0 w-64 rounded-3xl border-4 border-white object-cover shadow-xl"
            />
            <motion.img
              src="/img/work/aarav-3.jpg"
              alt="डिजिटल आर्ट"
              initial={{ opacity: 0, y: 30, rotate: -8 }}
              animate={{ opacity: 1, y: 0, rotate: -6 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="absolute left-2 top-28 w-56 rounded-3xl border-4 border-white object-cover shadow-xl"
            />
            <motion.img
              src="/img/work/meera-1.jpg"
              alt="ब्रांड डिज़ाइन"
              initial={{ opacity: 0, y: 30, rotate: 4 }}
              animate={{ opacity: 1, y: 0, rotate: 2 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="absolute bottom-2 right-24 w-60 rounded-3xl border-4 border-white object-cover shadow-xl"
            />
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute left-6 top-2 flex items-center gap-3 rounded-2xl bg-white p-3 pr-5 shadow-xl"
            >
              <img src={meera?.avatar} alt={meera?.name} className="h-11 w-11 rounded-xl object-cover" />
              <div>
                <p className="flex items-center gap-1 text-sm font-bold text-ink">
                  {meera?.name}
                </p>
                <p className="flex items-center gap-1 text-xs text-ink-soft">
                  <Star size={11} className="fill-gold text-gold" /> 4.9 · 212 रिव्यू
                </p>
              </div>
            </motion.div>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-24 left-0 flex items-center gap-2.5 rounded-2xl bg-ink p-3.5 pr-5 text-paper shadow-xl"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-moss text-white">
                <CircleCheck size={18} />
              </span>
              <div>
                <p className="text-xs text-paper/60">अभी-अभि अनुरोध स्वीकार</p>
                <p className="text-sm font-bold">₹50,000 — ब्रांड किट</p>
              </div>
            </motion.div>
          </div>

          {/* mobile collage */}
          <div className="grid grid-cols-2 gap-3 lg:hidden">
            <img src="/img/work/arjun-3.jpg" alt="आर्किटेक्चर" className="h-36 w-full rotate-1 rounded-2xl border-4 border-white object-cover shadow-md" />
            <img src="/img/work/aarav-3.jpg" alt="डिजिटल आर्ट" className="h-36 w-full -rotate-1 rounded-2xl border-4 border-white object-cover shadow-md" />
          </div>
        </div>
      </section>

      {/* ---------- MARQUEE ---------- */}
      <div className="overflow-hidden border-y border-ink/10 bg-ink py-3.5">
        <div className="animate-marquee flex w-max items-center">
          {[...MARQUEE, ...MARQUEE].map((t, i) => (
            <span key={i} className="mx-5 flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-paper/80">
              <Sparkles size={12} className="text-gold" />
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ---------- CATEGORIES ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <SectionHead
          kicker="कैटेगरी"
          title="जिस तरह का काम, उस तरह का क्रिएटर"
          sub="तीनों कौशल के वेरिफाइड प्रोफ़ेशनल्स — सभी की फीस सार्वजनिक, सभी के पोर्टफोलियो खुले।"
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {CATEGORIES.map((c, idx) => {
            const Icon = CAT_ICONS[c.id];
            const count = creators.filter((k) => k.category === c.id).length;
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: idx * 0.08 }}
              >
                <Link
                  to={`/explore?cat=${c.id}`}
                  className="group block h-full rounded-3xl border border-ink/10 bg-white p-7 shadow-sm transition-all hover:-translate-y-1.5 hover:border-clay/40 hover:shadow-xl"
                >
                  <div className="flex items-start justify-between">
                    <span className={`grid h-14 w-14 place-items-center rounded-2xl ${CAT_ACCENTS[c.id]}`}>
                      <Icon size={26} />
                    </span>
                    <span className="font-display text-4xl font-bold text-sand transition-colors group-hover:text-clay/30">
                      0{idx + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-bold text-ink">{c.label}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{c.desc}</p>
                  <div className="mt-5 flex items-center justify-between border-t border-ink/10 pt-4">
                    <span className="text-xs font-semibold text-ink-soft">{count} प्रोफ़ाइल · 4,100+ कुल</span>
                    <span className="flex items-center gap-1 text-sm font-bold text-clay">
                      देखें <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ---------- FEATURED ---------- */}
      <section className="bg-cream/60 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHead
            kicker="टॉप रेटेड"
            title="इस हफ़्ते के फ़ीचर्ड क्रिएटर्स"
            sub="रेटिंग, समय पर डिलीवरी और ग्राहकों की पसंद के आधार पर चुने गए।"
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((c) => (
              <CreatorCard key={c.id} creator={c} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm font-bold text-paper shadow-sm transition hover:bg-clay"
            >
              सभी क्रिएटर्स एक्सप्लोर करें
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section id="how" className="bg-ink py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHead
            dark
            kicker="प्रोसेस"
            title="तीन कदम में काम शुरू"
            sub="न कोई भाव-तोल, न छिपे चार्ज — जो फीस दिखे, वही चुकाएं।"
          />
          <div className="mt-14 grid gap-10 lg:grid-cols-2">
            <div>
              <h3 className="mb-6 inline-block rounded-full bg-clay px-4 py-1.5 text-sm font-bold text-paper">ग्राहकों के लिए</h3>
              {[
                { t: 'खोजें और तुलना करें', d: 'कैटेगरी, शहर और बजट के हिसाब से फ़िल्टर करें — हर प्रोफ़ाइल में असली काम और असली फीस।' },
                { t: 'फीस पहले से देखें', d: 'हर सर्विस की कीमत, डिलीवरी समय और मिलने वाली चीज़ें लिखी हुई हैं — कोई सुरप्राइज़ नहीं।' },
                { t: 'सीधे बुक करें', d: 'अनुरोध भेजें, क्रिएटर से सीधे बात करें और काम शुरू करवाएं — बिचौलिया नहीं।' },
              ].map((s, i) => (
                <motion.div
                  key={s.t}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="mb-4 flex gap-4 rounded-2xl border border-paper/10 bg-paper/5 p-5"
                >
                  <span className="font-display text-3xl font-bold text-clay">0{i + 1}</span>
                  <div>
                    <h4 className="font-display text-lg font-bold text-paper">{s.t}</h4>
                    <p className="mt-1 text-sm leading-relaxed text-paper/65">{s.d}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div>
              <h3 className="mb-6 inline-block rounded-full bg-gold px-4 py-1.5 text-sm font-bold text-ink">क्रिएटर्स के लिए</h3>
              {[
                { t: 'प्रोफ़ाइल बनाएं', d: 'अपनी फोटो, बायो और बेहतरीन काम अपलोड करें — 10 मिनट में दुनिया के सामने।' },
                { t: 'सर्विस और फीस टायप करें', d: 'जो काम करते हैं, उसकी कीमत अपने हाथ में — जब चाहें अपडेट करें।' },
                { t: 'अनुरोध पाएं, कमाएं', d: 'नए अनुरोध की तुरंत सूचना — स्वीकारें या अस्वीकारें, फ़ैसला आपका।' },
              ].map((s, i) => (
                <motion.div
                  key={s.t}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="mb-4 flex gap-4 rounded-2xl border border-paper/10 bg-paper/5 p-5"
                >
                  <span className="font-display text-3xl font-bold text-gold">0{i + 1}</span>
                  <div>
                    <h4 className="font-display text-lg font-bold text-paper">{s.t}</h4>
                    <p className="mt-1 text-sm leading-relaxed text-paper/65">{s.d}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- MOBILE MANAGE ---------- */}
      <section className="dots-bg overflow-hidden py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-moss/10 px-4 py-1.5 text-xs font-bold text-moss">
              <Smartphone size={14} />
              मोबाइल-फ़र्स्ट डैशबोर्ड
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
              आपकी पूरी दुकान,
              <br />
              अब आपकी <span className="italic text-clay">जेब में</span>
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-soft sm:text-base">
              सुबह की चाय पीते-पीते नए अनुरोध देखें, लाइन में खड़े होकर फीस अपडेट करें — पूरा डैशबोर्ड आपके फ़ोन के ब्राउज़र में।
            </p>
            <ul className="mt-6 space-y-3">
              {[
                'नए ग्राहक अनुरोध — एक टैप में स्वीकार/अस्वीकार',
                'पोर्टफोलियो में नया काम जोड़ें — सीधे गैलरी से',
                'सर्विस की फीस और उपलब्धता तुरंत बदलें',
                'कमाई, व्यूज़ और रेटिंग का लाइव हिसाब',
              ].map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm font-medium text-ink">
                  <CircleCheck size={18} className="mt-0.5 shrink-0 text-moss" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              to="/dashboard"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-clay px-6 py-3 text-sm font-bold text-paper shadow-sm transition hover:bg-clay-deep"
            >
              <LayoutDashboard size={16} />
              डैशबोर्ड खोलें
            </Link>
          </div>

          {/* CSS phone mockup */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative mx-auto w-full max-w-[320px]"
          >
            <div className="rounded-[2.8rem] border-[10px] border-ink bg-paper shadow-2xl">
              <div className="flex items-center justify-center pt-2">
                <span className="h-5 w-24 rounded-full bg-ink" />
              </div>
              <div className="px-4 pb-3 pt-4">
                <div className="flex items-center gap-2.5">
                  <img src={meera?.avatar} alt="" className="h-10 w-10 rounded-xl object-cover" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-ink-soft">नमस्ते,</p>
                    <p className="truncate font-display text-sm font-bold text-ink">{meera?.name}</p>
                  </div>
                  <span className="ml-auto grid h-8 w-8 place-items-center rounded-full bg-clay/10 text-clay">
                    <Inbox size={14} />
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-ink p-3 text-paper">
                    <p className="flex items-center gap-1 text-[9px] uppercase tracking-wide text-paper/50">
                      <TrendingUp size={10} /> कुल कमाई
                    </p>
                    <p className="mt-0.5 font-display text-sm font-bold">{meera ? inr(meera.earnings) : '—'}</p>
                  </div>
                  <div className="rounded-xl bg-cream p-3">
                    <p className="text-[9px] font-semibold uppercase tracking-wide text-ink-soft">प्रोफ़ाइल व्यूज़</p>
                    <p className="mt-0.5 font-display text-sm font-bold text-ink">{meera?.profileViews.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <div className="mt-3 rounded-xl border border-clay/30 bg-clay/5 p-3">
                  <p className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wide text-clay">
                    नया अनुरोध <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-clay" />
                  </p>
                  <p className="mt-1 text-xs font-bold text-ink">कम्पलीट ब्रांड किट · ₹50,000</p>
                  <p className="text-[10px] text-ink-soft">रोहन अग्रवाल — 28 अक्टूबर तक</p>
                  <div className="mt-2 flex gap-1.5">
                    <span className="flex-1 rounded-lg bg-moss py-1.5 text-center text-[10px] font-bold text-white">स्वीकारें</span>
                    <span className="flex-1 rounded-lg border border-ink/15 py-1.5 text-center text-[10px] font-bold text-ink">बाद में</span>
                  </div>
                </div>

                <div className="mt-3">
                  <p className="mb-1.5 text-[9px] font-bold uppercase tracking-wide text-ink-soft">पोर्टफोलियो</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {meera?.portfolio.slice(0, 3).map((p) => (
                      <img key={p.id} src={p.image} alt={p.title} className="h-14 w-full rounded-lg object-cover" />
                    ))}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-around rounded-full bg-cream px-2 py-2">
                  <LayoutDashboard size={15} className="text-clay" />
                  <ImagePlus size={15} className="text-ink-soft" />
                  <Inbox size={15} className="text-ink-soft" />
                  <User size={15} className="text-ink-soft" />
                </div>
              </div>
            </div>
            <div className="absolute -right-6 top-16 hidden rotate-90 rounded-full bg-gold px-4 py-1.5 text-[10px] font-bold text-ink shadow-lg sm:block">
              100% मोबाइल रेडी
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="mx-auto max-w-6xl px-4 pb-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-clay to-clay-deep px-6 py-14 text-center text-paper sm:px-16"
        >
          <div className="dots-bg absolute inset-0 opacity-20" />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
              आपकी प्रतिभा, आपकी कीमत।
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-paper/80 sm:text-base">
              आज ही अपनी पब्लिक प्रोफ़ाइल बनाएं — पोर्टफोलियो दिखाएं, फीस लिखें और सीधे ग्राहक पाएं। शुरुआती प्लान पर कमीशन शून्य।
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/dashboard" className="rounded-full bg-paper px-7 py-3.5 text-sm font-bold text-ink shadow-lg transition hover:bg-cream">
                फ्री में प्रोफ़ाइल बनाएं
              </Link>
              <Link to="/explore" className="rounded-full border-2 border-paper/40 px-7 py-3.5 text-sm font-bold text-paper transition hover:border-paper hover:bg-paper/10">
                पहले क्रिएटर देखें
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
