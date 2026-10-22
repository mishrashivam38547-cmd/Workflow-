import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CircleCheck,
  Clock,
  Eye,
  ImagePlus,
  Inbox,
  Link2,
  Mail,
  Pencil,
  Plus,
  Star,
  Trash2,
  Wallet,
  X,
} from 'lucide-react';
import { PRESET_IMAGES } from '../data/creators';
import { fmtDate, inr } from '../lib/utils';
import { useStore } from '../store/Store';
import { useAuth } from '../auth/Auth';
import { useLang } from '../i18n/Lang';
import { useUi } from '../ui/Ui';
import { buildCreator } from '../lib/newCreator';
import { CATEGORIES } from '../data/creators';
import { uid } from '../lib/utils';
import type { Creator, RequestStatus, Service } from '../lib/types';

type TabId = 'requests' | 'portfolio' | 'services' | 'profile';

const field =
  'w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/50 transition focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/20';

const STATUS_META: Record<RequestStatus, { label: string; cls: string }> = {
  new: { label: 'नया अनुरोध', cls: 'bg-clay/10 text-clay' },
  accepted: { label: 'स्वीकृत', cls: 'bg-moss/10 text-moss' },
  done: { label: 'पूर्ण', cls: 'bg-ink/10 text-ink' },
  declined: { label: 'अस्वीकृत', cls: 'bg-sand text-ink-soft' },
};

const STATUS_EN: Record<RequestStatus, string> = { new: 'New request', accepted: 'Accepted', done: 'Completed', declined: 'Declined' };

/* ---------------- shared bits ---------------- */

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-paper p-6 shadow-2xl sm:rounded-3xl"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-bold text-ink">{title}</h3>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full border border-ink/15 text-ink hover:bg-cream" aria-label="बंद करें">
            <X size={18} />
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </motion.div>
    </div>
  );
}

/* ---------------- portfolio modal ---------------- */

function PortfolioModal({ creator, onClose, onDone }: { creator: Creator; onClose: () => void; onDone: (m: string) => void }) {
  const { addPortfolio } = useStore();
  const [title, setTitle] = useState('');
  const [tag, setTag] = useState(creator.tags[0] ?? 'काम');
  const [price, setPrice] = useState('');
  const [year, setYear] = useState('2026');
  const [desc, setDesc] = useState('');
  const [img, setImg] = useState(PRESET_IMAGES[0]);
  const [custom, setCustom] = useState('');
  const [err, setErr] = useState('');

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const image = custom.trim() || img;
    if (!title.trim() || !(Number(price) > 0)) {
      setErr('टाइटल और सही कीमत (₹) ज़रूरी हैं।');
      return;
    }
    addPortfolio(creator.id, {
      title: title.trim(),
      tag: tag.trim() || 'काम',
      price: Number(price),
      year: year.trim() || '2026',
      description: desc.trim() || 'Workflow क्रिएटर का ओरिजिनल काम।',
      image,
    });
    onDone('नया काम पोर्टफोलियो में जुड़ गया');
    onClose();
  };

  return (
    <ModalShell title="पोर्टफोलियो में नया काम जोड़ें" onClose={onClose}>
      <form onSubmit={save} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-bold text-ink">काम का टाइटल *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="जैसे — कॉफ़ी ब्रांड का लोगो" className={field} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-ink">टैग</label>
            <input value={tag} onChange={(e) => setTag(e.target.value)} className={field} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-ink">कीमत (₹) *</label>
            <input type="number" min={1} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="15000" className={field} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-ink">साल</label>
            <input value={year} onChange={(e) => setYear(e.target.value)} className={field} />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold text-ink">छोटा विवरण</label>
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} placeholder="क्या बनाया, किसके लिए, क्या खास था…" className={`${field} resize-none`} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold text-ink">फोटो चुनें (अपलोड गैलरी से)</label>
          <div className="grid grid-cols-5 gap-1.5">
            {PRESET_IMAGES.map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => { setImg(p); setCustom(''); }}
                className={`aspect-[4/3] overflow-hidden rounded-lg border-2 transition ${img === p && !custom ? 'border-clay' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                <img src={p} alt="" loading="lazy" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="या अपनी इमेज का URL डालें (https://…)" className={`${field} mt-2`} />
        </div>
        {err && <p className="rounded-lg bg-clay/10 px-3 py-2 text-xs font-semibold text-clay">{err}</p>}
        <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-clay px-4 py-3 text-sm font-bold text-paper transition hover:bg-clay-deep">
          <ImagePlus size={16} /> पोर्टफोलियो में जोड़ें
        </button>
      </form>
    </ModalShell>
  );
}

/* ---------------- service modal ---------------- */

function ServiceModal({
  creator,
  service,
  onClose,
  onDone,
}: {
  creator: Creator;
  service: Service | null;
  onClose: () => void;
  onDone: (m: string) => void;
}) {
  const { addService, updateService } = useStore();
  const [title, setTitle] = useState(service?.title ?? '');
  const [price, setPrice] = useState(service ? String(service.price) : '');
  const [duration, setDuration] = useState(service?.duration ?? '');
  const [description, setDescription] = useState(service?.description ?? '');
  const [deliverables, setDeliverables] = useState(service?.deliverables.join('\n') ?? '');
  const [popular, setPopular] = useState(service?.popular ?? false);
  const [err, setErr] = useState('');

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !(Number(price) > 0) || !duration.trim()) {
      setErr('सर्विस का नाम, फीस (₹) और अवधि — तीनों ज़रूरी हैं।');
      return;
    }
    const payload = {
      title: title.trim(),
      price: Number(price),
      duration: duration.trim(),
      description: description.trim() || 'डिटेल चैट में डिस्कस करेंगे।',
      deliverables: deliverables.split(/[\n,]+/).map((d) => d.trim()).filter(Boolean),
      popular,
      active: service?.active ?? true,
    };
    if (service) {
      updateService(creator.id, service.id, payload);
      onDone('सर्विस अपडेट हो गई');
    } else {
      addService(creator.id, payload);
      onDone('नई सर्विस पब्लिश हो गई');
    }
    onClose();
  };

  return (
    <ModalShell title={service ? 'सर्विस एडिट करें' : 'नई सर्विस जोड़ें'} onClose={onClose}>
      <form onSubmit={save} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-bold text-ink">सर्विस का नाम *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="जैसे — लोगो डिज़ाइन" className={field} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-ink">फीस (₹) *</label>
            <input type="number" min={1} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="14999" className={field} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-ink">डिलीवरी समय *</label>
            <input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="जैसे — 5–7 दिन" className={field} />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold text-ink">विवरण</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="ग्राहक को क्या मिलेगा, एक लाइन में…" className={`${field} resize-none`} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold text-ink">क्या-क्या शामिल (हर लाइन में एक)</label>
          <textarea value={deliverables} onChange={(e) => setDeliverables(e.target.value)} rows={4} placeholder={'3 कॉन्सेप्ट\n2 रिविज़न राउंड\nप्रिंट-रेडी फाइल्स'} className={field} />
        </div>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink/15 bg-white px-4 py-3">
          <input type="checkbox" checked={popular} onChange={(e) => setPopular(e.target.checked)} className="h-4 w-4 accent-[#C2482B]" />
          <span className="text-sm font-semibold text-ink">"सबसे लोकप्रिय" बैज दिखाएं</span>
        </label>
        {err && <p className="rounded-lg bg-clay/10 px-3 py-2 text-xs font-semibold text-clay">{err}</p>}
        <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-clay px-4 py-3 text-sm font-bold text-paper transition hover:bg-clay-deep">
          <Plus size={16} /> {service ? 'सेव करें' : 'सर्विस पब्लिश करें'}
        </button>
      </form>
    </ModalShell>
  );
}

/* ---------------- profile form ---------------- */

function ProfileForm({ creator, onSaved }: { creator: Creator; onSaved: (m: string) => void }) {
  const { updateCreator } = useStore();
  const [name, setName] = useState(creator.name);
  const [role, setRole] = useState(creator.role);
  const [location, setLocation] = useState(creator.location);
  const [startingPrice, setStartingPrice] = useState(String(creator.startingPrice));
  const [responseTime, setResponseTime] = useState(creator.responseTime);
  const [tags, setTags] = useState(creator.tags.join(', '));
  const [languages, setLanguages] = useState(creator.languages.join(', '));
  const [about, setAbout] = useState(creator.about);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    updateCreator(creator.id, {
      name: name.trim() || creator.name,
      role: role.trim() || creator.role,
      location: location.trim() || creator.location,
      startingPrice: Number(startingPrice) || creator.startingPrice,
      responseTime: responseTime.trim() || creator.responseTime,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      languages: languages.split(',').map((l) => l.trim()).filter(Boolean),
      about: about.trim() || creator.about,
    });
    onSaved('प्रोफ़ाइल सेव हो गई — बदलाव तुरंत लाइव');
  };

  return (
    <form onSubmit={save} className="rounded-3xl border border-ink/10 bg-white p-5 shadow-sm sm:p-7">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-bold text-ink">पूरा नाम</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={field} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold text-ink">पेशा / टाइटल</label>
          <input value={role} onChange={(e) => setRole(e.target.value)} className={field} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold text-ink">शहर</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} className={field} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold text-ink">शुरुआती फीस (₹)</label>
          <input type="number" min={0} value={startingPrice} onChange={(e) => setStartingPrice(e.target.value)} className={field} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold text-ink">जवाब देने का औसत समय</label>
          <input value={responseTime} onChange={(e) => setResponseTime(e.target.value)} placeholder="जैसे — ~1 घंटा" className={field} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold text-ink">भाषाएँ (कॉमा से अलग)</label>
          <input value={languages} onChange={(e) => setLanguages(e.target.value)} className={field} />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-bold text-ink">स्किल टैग (कॉमा से अलग)</label>
          <input value={tags} onChange={(e) => setTags(e.target.value)} className={field} />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-bold text-ink">अपने बारे में (परिचय)</label>
          <textarea value={about} onChange={(e) => setAbout(e.target.value)} rows={5} className={field} />
        </div>
      </div>
      <button type="submit" className="mt-5 rounded-xl bg-clay px-6 py-3 text-sm font-bold text-paper transition hover:bg-clay-deep">
        प्रोफ़ाइल सेव करें
      </button>
    </form>
  );
}

/* ---------------- main dashboard ---------------- */

export default function Dashboard() {
  const { user, loading, linkCreator } = useAuth();
  const { openAuth } = useUi();
  const { tr } = useLang();
  const { getCreator, createCreator } = useStore();

  if (loading) {
    return <div className="mx-auto max-w-6xl px-4 py-24 text-center text-sm text-ink-soft">{tr('लोड हो रहा है…', 'Loading…')}</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold text-ink">{tr('सेलर डैशबोर्ड', 'Seller dashboard')}</h1>
        <p className="mt-3 text-sm text-ink-soft">
          {tr('अपनी प्रोफ़ाइल, सर्विसेज़ और अनुरोध मैनेज करने के लिए लॉगिन करें।', 'Log in to manage your profile, services and requests.')}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={() => openAuth('login', '/dashboard')} className="rounded-xl bg-clay px-6 py-3 text-sm font-bold text-paper transition hover:bg-clay-deep">
            {tr('लॉगिन', 'Log in')}
          </button>
          <button onClick={() => openAuth('register', '/dashboard')} className="rounded-xl border border-ink/15 px-6 py-3 text-sm font-bold text-ink transition hover:border-clay hover:text-clay">
            {tr('रजिस्टर', 'Register')}
          </button>
        </div>
      </div>
    );
  }

  const mine = user.creatorId ? getCreator(user.creatorId) : undefined;
  if (!mine) {
    const become = async () => {
      const id = 'c-' + uid().slice(0, 8);
      const cat = CATEGORIES[1];
      createCreator(buildCreator({ id, ownerId: user.id, name: user.name, category: cat.id, role: cat.label }));
      await linkCreator(id);
    };
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold text-ink">{tr('क्रिएटर प्रोफ़ाइल बनाएं', 'Create your creator profile')}</h1>
        <p className="mt-3 text-sm text-ink-soft">
          {tr('आपका अकाउंट अभी ग्राहक के रूप में है। प्रोफ़ाइल बनाकर काम बेचना शुरू करें।', 'Your account is a client account. Create a profile to start selling your work.')}
        </p>
        <button onClick={() => void become()} className="mt-6 rounded-xl bg-clay px-6 py-3 text-sm font-bold text-paper transition hover:bg-clay-deep">
          {tr('प्रोफ़ाइल बनाएं', 'Create profile')}
        </button>
      </div>
    );
  }

  return <DashboardInner creatorId={mine.id} />;
}

function DashboardInner({ creatorId }: { creatorId: string }) {
  const { tr } = useLang();
  const { creators, requests, getCreator, setRequestStatus, removePortfolio, updateService, removeService } = useStore();
  const cid = creatorId;
  const [tab, setTab] = useState<TabId>('requests');
  const [pfModal, setPfModal] = useState(false);
  const [svcModal, setSvcModal] = useState<{ service: Service | null } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const creator = getCreator(cid) ?? creators[0];

  const myRequests = useMemo(
    () =>
      requests
        .filter((r) => r.creatorId === creator.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [requests, creator.id],
  );

  const newCount = myRequests.filter((r) => r.status === 'new').length;
  const liveEarnings =
    creator.earnings +
    myRequests.filter((r) => r.status === 'accepted' || r.status === 'done').reduce((s, r) => s + r.budget, 0);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const stats = [
    { icon: Wallet, label: tr('कुल कमाई','Total earnings'), value: inr(liveEarnings), hint: tr('इस माह +12%','+12% this month'), accent: 'bg-clay/10 text-clay' },
    { icon: Eye, label: tr('प्रोफ़ाइल व्यूज़','Profile views'), value: creator.profileViews.toLocaleString('en-IN'), hint: tr('पिछले 30 दिन','Last 30 days'), accent: 'bg-gold/15 text-gold' },
    { icon: Inbox, label: tr('नए अनुरोध','New requests'), value: String(newCount), hint: newCount > 0 ? tr('तुरंत जवाब दें','Reply soon') : tr('सब देख लिए','All caught up'), accent: 'bg-moss/10 text-moss' },
    { icon: Star, label: tr('औसत रेटिंग','Average rating'), value: creator.rating.toFixed(1), hint: `${creator.reviewsCount} ${tr('रिव्यू','reviews')}`, accent: 'bg-ink/10 text-ink' },
  ];

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: 'requests', label: tr('प्रोजेक्ट अनुरोध','Project requests'), count: newCount },
    { id: 'portfolio', label: tr('पोर्टफोलियो','Portfolio'), count: creator.portfolio.length },
    { id: 'services', label: tr('सर्विसेज़','Services'), count: creator.services.length },
    { id: 'profile', label: tr('प्रोफ़ाइल एडिट','Edit profile') },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* header */}
      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <img src={creator.avatar} alt={creator.name} className="h-16 w-16 rounded-2xl border-2 border-white object-cover shadow-md" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">{tr('नमस्ते,','Hello,')}</p>
            <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">{creator.name}</h1>
            <p className="text-sm text-ink-soft">{creator.role}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Link
            to={`/creator/${creator.id}`}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm font-bold text-ink transition hover:border-clay hover:text-clay sm:mt-5"
          >
            <Link2 size={15} /> {tr('पब्लिक प्रोफ़ाइल','Public profile')}
          </Link>
        </div>
      </div>

      {/* stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-ink/10 bg-white p-4 shadow-sm sm:p-5">
            <span className={`inline-grid h-10 w-10 place-items-center rounded-xl ${s.accent}`}>
              <s.icon size={19} />
            </span>
            <p className="mt-3 font-display text-xl font-bold leading-tight text-ink sm:text-2xl">{s.value}</p>
            <p className="text-xs font-semibold text-ink-soft">{s.label}</p>
            <p className="mt-1 text-[10px] text-ink-soft/70">{s.hint}</p>
          </div>
        ))}
      </div>

      {/* tabs */}
      <div className="no-scrollbar mt-8 flex w-full max-w-full gap-1 overflow-x-auto rounded-full bg-cream p-1.5 sm:w-max">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold transition sm:px-5 ${
              tab === t.id ? 'bg-ink text-paper shadow-sm' : 'text-ink-soft hover:text-ink'
            }`}
          >
            {t.label}
            {typeof t.count === 'number' && t.count > 0 && (
              <span className={`rounded-full px-1.5 text-[10px] font-bold ${tab === t.id ? 'bg-clay text-paper' : 'bg-clay/15 text-clay'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab + creator.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }} className="mt-6">
          {/* ---------- requests ---------- */}
          {tab === 'requests' && (
            <div className="space-y-4">
              {myRequests.length === 0 && (
                <div className="rounded-3xl border border-dashed border-ink/20 bg-white/60 px-6 py-16 text-center">
                  <Inbox size={40} className="mx-auto text-ink-soft/60" />
                  <h3 className="mt-4 font-display text-xl font-bold text-ink">अभी कोई अनुरोध नहीं</h3>
                  <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">
                    अपनी पब्लिक प्रोफ़ाइल का लिंक शेयर करें — जैसे ही ग्राहक बुकिंग भेजेगा, वह यहाँ दिखेगा।
                  </p>
                </div>
              )}
              {myRequests.map((r) => (
                <div key={r.id} className="rounded-3xl border border-ink/10 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-11 w-11 place-items-center rounded-full bg-clay/10 font-display text-lg font-bold text-clay">
                        {r.clientName.charAt(0)}
                      </span>
                      <div>
                        <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-ink sm:text-base">
                          {r.clientName}
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${STATUS_META[r.status].cls}`}>
                            {tr(STATUS_META[r.status].label, STATUS_EN[r.status])}
                          </span>
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-soft">
                          <Clock size={11} /> {fmtDate(r.createdAt)} को आया
                        </p>
                      </div>
                    </div>
                    <p className="font-display text-xl font-bold text-clay">{inr(r.budget)}</p>
                  </div>

                  <p className="mt-3 text-sm font-semibold text-ink">{r.serviceTitle}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-soft">
                    <span>शुरुआत: {r.date ? fmtDate(r.date) : 'तय नहीं'}</span>
                    {r.contact && (
                      <span className="flex items-center gap-1">
                        <Mail size={11} /> {r.contact}
                      </span>
                    )}
                  </p>
                  {r.message && (
                    <p className="mt-3 rounded-xl bg-cream/80 px-4 py-3 text-sm italic leading-relaxed text-ink-soft">
                      "{'"'}{r.message}{'"'}"
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    {r.status === 'new' && (
                      <>
                        <button
                          onClick={() => { setRequestStatus(r.id, 'declined'); }}
                          className="rounded-xl border border-ink/15 px-4 py-2 text-xs font-bold text-ink-soft transition hover:border-clay hover:text-clay"
                        >
                          अस्वीकारें
                        </button>
                        <button
                          onClick={() => { setRequestStatus(r.id, 'accepted'); setToast('अनुरोध स्वीकारा गया — ग्राहक को सूचना चली गई'); }}
                          className="flex items-center gap-1.5 rounded-xl bg-moss px-4 py-2 text-xs font-bold text-white transition hover:bg-moss-deep"
                        >
                          <CircleCheck size={14} /> स्वीकारें
                        </button>
                      </>
                    )}
                    {r.status === 'accepted' && (
                      <>
                        <button
                          onClick={() => setRequestStatus(r.id, 'declined')}
                          className="rounded-xl border border-ink/15 px-4 py-2 text-xs font-bold text-ink-soft transition hover:border-clay hover:text-clay"
                        >
                          अस्वीकारें
                        </button>
                        <button
                          onClick={() => { setRequestStatus(r.id, 'done'); setToast('बधाई! प्रोजेक्ट पूर्ण चिह्नित हुआ'); }}
                          className="flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2 text-xs font-bold text-paper transition hover:bg-clay"
                        >
                          <CircleCheck size={14} /> पूर्ण चिह्नित करें
                        </button>
                      </>
                    )}
                    {r.status === 'done' && (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-moss">
                        <CircleCheck size={14} /> डिलीवर हो चुका — कमाई में जुड़ गया
                      </span>
                    )}
                    {r.status === 'declined' && (
                      <span className="text-xs font-semibold text-ink-soft/70">अस्वीकार किया गया</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ---------- portfolio ---------- */}
          {tab === 'portfolio' && (
            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-ink-soft">
                  {creator.portfolio.length} {tr('काम पब्लिक हैं — ग्राहक इन्हीं को देखकर फ़ैसला करते हैं।','works are public — clients decide based on these.')}
                </p>
                <button
                  onClick={() => setPfModal(true)}
                  className="flex shrink-0 items-center gap-1.5 rounded-xl bg-clay px-4 py-2.5 text-xs font-bold text-paper transition hover:bg-clay-deep sm:text-sm"
                >
                  <Plus size={15} /> {tr('नया काम जोड़ें','Add work')}
                </button>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {creator.portfolio.map((p) => (
                  <div key={p.id} className="group relative overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-sm">
                    <div className="aspect-[4/3] overflow-hidden bg-cream">
                      <img src={p.image} alt={p.title} loading="lazy" className="h-full w-full object-cover" />
                    </div>
                    <button
                      onClick={() => removePortfolio(creator.id, p.id)}
                      title="हटाएं"
                      className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-clay opacity-100 shadow transition hover:bg-clay hover:text-paper sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="flex items-center justify-between gap-3 p-4">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-clay">{p.tag} · {p.year}</p>
                        <h3 className="truncate font-display text-base font-bold text-ink">{p.title}</h3>
                      </div>
                      <span className="shrink-0 rounded-lg bg-cream px-2.5 py-1 text-xs font-bold text-ink">{inr(p.price)}</span>
                    </div>
                  </div>
                ))}
                {creator.portfolio.length === 0 && (
                  <p className="col-span-full rounded-2xl border border-dashed border-ink/20 p-10 text-center text-sm text-ink-soft">
                    {tr('पोर्टफोलियो खाली है — "नया काम जोड़ें" से शुरुआत करें।','Portfolio is empty — start with "Add work".')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ---------- services ---------- */}
          {tab === 'services' && (
            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-ink-soft">{tr('फीस पारदर्शी रखें — इसीलिए ग्राहक Workflow पर भरोसा करते हैं।','Keep fees transparent — that is why clients trust Workflow.')}</p>
                <button
                  onClick={() => setSvcModal({ service: null })}
                  className="flex shrink-0 items-center gap-1.5 rounded-xl bg-clay px-4 py-2.5 text-xs font-bold text-paper transition hover:bg-clay-deep sm:text-sm"
                >
                  <Plus size={15} /> {tr('नई सर्विस','New service')}
                </button>
              </div>
              <div className="mt-4 space-y-3">
                {creator.services.map((s) => (
                  <div key={s.id} className={`rounded-2xl border bg-white p-4 shadow-sm sm:p-5 ${s.active ? 'border-ink/10' : 'border-ink/10 opacity-60'}`}>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-display text-lg font-bold text-ink">{s.title}</h3>
                          {s.popular && (
                            <span className="rounded-full bg-clay px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-paper">{tr('लोकप्रिय','Popular')}</span>
                          )}
                          {!s.active && (
                            <span className="rounded-full bg-sand px-2.5 py-0.5 text-[10px] font-bold text-ink-soft">{tr('छिपी हुई','Hidden')}</span>
                          )}
                        </div>
                        <p className="mt-1 truncate text-sm text-ink-soft">{s.description}</p>
                        <p className="mt-1 text-xs text-ink-soft">
                          <Clock size={11} className="mr-1 inline" />{s.duration} · {s.deliverables.length} {tr('डिलीवरेबल','deliverables')}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-4 md:justify-end">
                        <p className="font-display text-xl font-bold text-clay">{inr(s.price)}</p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateService(creator.id, s.id, { active: !s.active })}
                            title={s.active ? 'छिपाएं' : 'दिखाएं'}
                            className={`relative h-6 w-11 rounded-full transition ${s.active ? 'bg-moss' : 'bg-sand'}`}
                          >
                            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${s.active ? 'left-[22px]' : 'left-0.5'}`} />
                          </button>
                          <button
                            onClick={() => setSvcModal({ service: s })}
                            title="एडिट करें"
                            className="grid h-9 w-9 place-items-center rounded-xl border border-ink/15 text-ink transition hover:border-clay hover:text-clay"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => removeService(creator.id, s.id)}
                            title="हटाएं"
                            className="grid h-9 w-9 place-items-center rounded-xl border border-ink/15 text-ink transition hover:border-clay hover:text-clay"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {creator.services.length === 0 && (
                  <p className="rounded-2xl border border-dashed border-ink/20 p-10 text-center text-sm text-ink-soft">
                    {tr('कोई सर्विस नहीं — "नई सर्विस" से अपनी पहली फीस जोड़ें।','No services yet — add your first fee with "New service".')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ---------- profile ---------- */}
          {tab === 'profile' && <ProfileForm key={creator.id} creator={creator} onSaved={setToast} />}
        </motion.div>
      </AnimatePresence>

      {/* modals */}
      {pfModal && <PortfolioModal creator={creator} onClose={() => setPfModal(false)} onDone={setToast} />}
      {svcModal && <ServiceModal creator={creator} service={svcModal.service} onClose={() => setSvcModal(null)} onDone={setToast} />}

      {/* toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="fixed bottom-5 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-2xl bg-ink px-5 py-3.5 text-sm font-semibold text-paper shadow-2xl"
          >
            <CircleCheck size={17} className="text-gold" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
