import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SearchX } from 'lucide-react';
import CreatorCard from '../components/CreatorCard';
import { CATEGORIES, CATEGORY_LABELS } from '../data/creators';
import { useStore } from '../store/Store';

type SortKey = 'recommended' | 'rating' | 'low' | 'high';

const SORTS: { id: SortKey; label: string }[] = [
  { id: 'recommended', label: 'सुझाए गए' },
  { id: 'rating', label: 'सबसे ज़्यादा रेटिंग' },
  { id: 'low', label: 'कम फीस पहले' },
  { id: 'high', label: 'ज़्यादा फीस पहले' },
];

export default function Explore() {
  const { creators } = useStore();
  const [params, setParams] = useSearchParams();
  const cat = params.get('cat') ?? 'all';
  const [query, setQuery] = useState(params.get('q') ?? '');
  const [sort, setSort] = useState<SortKey>('recommended');

  useEffect(() => {
    setQuery(params.get('q') ?? '');
  }, [params]);

  const setFilter = (key: 'cat' | 'q', value: string) => {
    const next = new URLSearchParams(params);
    if (value && value !== 'all') next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const results = useMemo(() => {
    const ql = query.trim().toLowerCase();
    let list = creators.filter((c) => {
      const catOk = cat === 'all' || c.category === cat;
      if (!catOk) return false;
      if (!ql) return true;
      const hay = [c.name, c.role, c.location, CATEGORY_LABELS[c.category], ...c.tags]
        .join(' ')
        .toLowerCase();
      return hay.includes(ql);
    });
    switch (sort) {
      case 'rating':
        list = [...list].sort((a, b) => b.rating - a.rating);
        break;
      case 'low':
        list = [...list].sort((a, b) => a.startingPrice - b.startingPrice);
        break;
      case 'high':
        list = [...list].sort((a, b) => b.startingPrice - a.startingPrice);
        break;
      default:
        list = [...list].sort(
          (a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating,
        );
    }
    return list;
  }, [creators, cat, query, sort]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">क्रिएटर्स एक्सप्लोर करें</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft sm:text-base">
          हर क्रिएटर की फीस सार्वजनिक है — पोर्टफोलियो देखें, तुलना करें और सीधे जुड़ें।
        </p>
      </div>

      {/* controls */}
      <div className="mt-7 flex flex-col gap-3 lg:flex-row lg:items-center">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setFilter('q', query.trim());
          }}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-ink/15 bg-white px-4 py-3 shadow-sm focus-within:border-clay"
        >
          <Search size={18} className="shrink-0 text-ink-soft" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="नाम, कौशल या शहर खोजें…"
            className="w-full bg-transparent text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none"
          />
        </form>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm font-semibold text-ink shadow-sm focus:border-clay focus:outline-none"
        >
          {SORTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilter('cat', 'all')}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
            cat === 'all' ? 'bg-ink text-paper' : 'border border-ink/15 bg-white text-ink-soft hover:text-ink'
          }`}
        >
          सभी
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setFilter('cat', c.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
              cat === c.id ? 'bg-clay text-paper' : 'border border-ink/15 bg-white text-ink-soft hover:text-ink'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <p className="mt-6 text-xs font-bold uppercase tracking-wider text-ink-soft">
        {results.length} {results.length === 1 ? 'क्रिएटर मिला' : 'क्रिएटर्स मिले'}
      </p>

      {results.length > 0 ? (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((c) => (
            <CreatorCard key={c.id} creator={c} />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-3xl border border-dashed border-ink/20 bg-white/60 px-6 py-16 text-center">
          <SearchX size={40} className="mx-auto text-ink-soft/60" />
          <h3 className="mt-4 font-display text-xl font-bold text-ink">कुछ नहीं मिला</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">
            कोशिश करें — वर्तनी बदलें, छोटा शब्द लिखें या कैटेगरी फ़िल्टर हटाएं।
          </p>
          <button
            onClick={() => {
              setQuery('');
              setParams(new URLSearchParams(), { replace: true });
            }}
            className="mt-5 rounded-full bg-ink px-6 py-2.5 text-sm font-bold text-paper transition hover:bg-clay"
          >
            सभी फ़िल्टर हटाएं
          </button>
        </div>
      )}
    </div>
  );
}
