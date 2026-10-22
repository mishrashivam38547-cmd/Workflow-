import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Logo } from './Navbar';
import { CATEGORIES } from '../data/creators';
import { useLang } from '../i18n/Lang';

export default function Footer() {
  const { tr } = useLang();
  return (
    <footer className="mt-20 border-t border-ink/10 bg-ink text-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <Link to="/">
            <Logo dark />
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-paper/70">
            {tr('भारत के कलाकारों, डिज़ाइनरों और आर्किटेक्ट्स को सीधे ग्राहकों से जोड़ने वाला पारदर्शी मार्केटप्लेस — फीस पहले से साफ, बिचौलिया नहीं।', 'A transparent marketplace connecting India’s artists, designers and architects directly with clients — upfront fees, no middlemen.')}
          </p>
        </div>

        <div>
          <h4 className="font-display text-lg text-gold">{tr('एक्सप्लोर', 'Explore')}</h4>
          <ul className="mt-3 space-y-2 text-sm text-paper/70">
            <li><Link className="hover:text-paper" to="/explore">{tr('सभी क्रिएटर्स', 'All creators')}</Link></li>
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link className="hover:text-paper" to={`/explore?cat=${c.id}`}>{c.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg text-gold">{tr('क्रिएटर्स के लिए', 'For creators')}</h4>
          <ul className="mt-3 space-y-2 text-sm text-paper/70">
            <li><Link className="hover:text-paper" to="/dashboard">{tr('सेलर डैशबोर्ड', 'Seller dashboard')}</Link></li>
            <li><Link className="hover:text-paper" to="/dashboard">{tr('फीस और सर्विस मैनेज करें', 'Manage fees & services')}</Link></li>
            <li><Link className="hover:text-paper" to="/dashboard">{tr('पोर्टफोलियो अपलोड करें', 'Upload portfolio')}</Link></li>
            <li><Link className="hover:text-paper" to="/#how">{tr('कैसे काम करता है', 'How it works')}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg text-gold">{tr('संपर्क', 'Contact')}</h4>
          <ul className="mt-3 space-y-3 text-sm text-paper/70">
            <li className="flex items-center gap-2"><Mail size={15} className="text-clay" /> hello@workflow.in</li>
            <li className="flex items-center gap-2"><Phone size={15} className="text-clay" /> +91 98290 12345</li>
            <li className="flex items-start gap-2"><MapPin size={15} className="mt-0.5 shrink-0 text-clay" /> {tr('सी-स्कीम, जयपुर, राजस्थान 302001', 'C-Scheme, Jaipur, Rajasthan 302001')}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-paper/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-paper/50 sm:flex-row sm:px-6">
          <span>{tr('© 2026 Workflow. सभी अधिकार सुरक्षित।', '© 2026 Workflow. All rights reserved.')}</span>
          <span>{tr('भारत में बना, भारत के क्रिएटर्स के लिए।', 'Made in India, for India’s creators.')}</span>
        </div>
      </div>
    </footer>
  );
}
