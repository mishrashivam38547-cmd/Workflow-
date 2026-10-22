import { useEffect, useState } from 'react';
import { useAuth } from '../auth/Auth';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, CircleCheck, Clock, Send, X } from 'lucide-react';
import { inr } from '../lib/utils';
import { useStore } from '../store/Store';
import type { Creator, Service } from '../lib/types';

interface Props {
  creator: Creator;
  initialService?: Service | null;
  onClose: () => void;
}

export default function HireModal({ creator, initialService, onClose }: Props) {
  const { addRequest } = useStore();
  const activeServices = creator.services.filter((s) => s.active);
  const [serviceId, setServiceId] = useState(initialService?.id ?? activeServices[0]?.id ?? '');
  const selected = activeServices.find((s) => s.id === serviceId) ?? null;

  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [contact, setContact] = useState(user?.email ?? '');
  const [budget, setBudget] = useState(String(selected?.price ?? creator.startingPrice));
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (selected) setBudget(String(selected.price));
  }, [serviceId]);

  const today = new Date().toISOString().slice(0, 10);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !selected) {
      setError('कृपया अपना नाम और सर्विस ज़रूर भरें।');
      return;
    }
    addRequest({
      creatorId: creator.id,
      serviceTitle: selected.title,
      clientName: name.trim(),
      contact: contact.trim(),
      budget: Number(budget) || selected.price,
      date,
      message: message.trim(),
    });
    setSent(true);
  };

  const field =
    'w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/50 focus:border-clay focus:ring-2 focus:ring-clay/20 transition';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <AnimatePresence mode="wait">
        <motion.div
          key={sent ? 'sent' : 'form'}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
          className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-paper p-6 shadow-2xl sm:rounded-3xl"
        >
          {sent ? (
            <div className="py-8 text-center">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-moss/10 text-moss">
                <CircleCheck size={36} />
              </span>
              <h3 className="mt-4 font-display text-2xl font-bold text-ink">अनुरोध भेज दिया गया!</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
                {creator.name} को आपका अनुरोध मिल गया है। आमतौर पर जवाब{' '}
                <span className="font-bold text-ink">{creator.responseTime}</span> में आ जाता है। आपको ईमेल/SMS से सूचना मिलेगी।
              </p>
              <div className="mx-auto mt-4 flex max-w-xs items-center justify-center gap-2 rounded-xl bg-cream px-4 py-2.5 text-xs font-semibold text-ink">
                <Clock size={14} className="text-clay" /> स्थिति: डैशबोर्ड में «नया अनुरोध» के रूप में दिखेगा
              </div>
              <button
                onClick={onClose}
                className="mt-6 w-full rounded-xl bg-ink px-4 py-3 text-sm font-bold text-paper transition hover:bg-clay"
              >
                ठीक है
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={creator.avatar} alt={creator.name} className="h-12 w-12 rounded-xl object-cover" />
                  <div>
                    <h3 className="font-display text-xl font-bold text-ink">{creator.name} को हायर करें</h3>
                    <p className="flex items-center gap-1 text-xs text-ink-soft">
                      <Clock size={12} /> जवाब: {creator.responseTime} में
                    </p>
                  </div>
                </div>
                <button onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-ink/15 text-ink hover:bg-cream" aria-label="बंद करें">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={submit} className="mt-5 space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-ink">कौन सी सर्विस चाहिए? *</label>
                  <div className="space-y-2">
                    {activeServices.map((s) => (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => setServiceId(s.id)}
                        className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition ${
                          serviceId === s.id
                            ? 'border-clay bg-clay/5 ring-1 ring-clay'
                            : 'border-ink/15 bg-white hover:border-ink/30'
                        }`}
                      >
                        <span>
                          <span className="block text-sm font-bold text-ink">{s.title}</span>
                          <span className="block text-xs text-ink-soft">{s.duration}</span>
                        </span>
                        <span className="font-display text-base font-bold text-clay">{inr(s.price)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-ink">आपका नाम *</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="जैसे — रोहन अग्रवाल" className={field} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-ink">मोबाइल / ईमेल</label>
                    <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="+91 … या ईमेल" className={field} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-ink">बजट (₹)</label>
                    <input type="number" min={0} value={budget} onChange={(e) => setBudget(e.target.value)} className={field} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-ink">कब तक चाहिए?</label>
                    <div className="relative">
                      <CalendarDays size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
                      <input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} className={`${field} pl-10`} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-ink">प्रोजेक्ट के बारे में बताएं</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    placeholder="क्या बनवाना है, कितना बड़ा, कैसी स्टाइल पसंद है…"
                    className={`${field} resize-none`}
                  />
                </div>

                {error && <p className="rounded-lg bg-clay/10 px-3 py-2 text-xs font-semibold text-clay">{error}</p>}

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-clay px-4 py-3.5 text-sm font-bold text-paper shadow-sm transition hover:bg-clay-deep"
                >
                  <Send size={16} />
                  अनुरोध भेजें {selected ? `— ${inr(Number(budget) || selected.price)}` : ''}
                </button>
                <p className="text-center text-[11px] text-ink-soft">
                  अभी कोई भुगतान नहीं — पहले बात करें, फिर फ़ैसला करें।
                </p>
              </form>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
