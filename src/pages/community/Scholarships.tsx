import { useEffect, useMemo, useState } from 'react';
import { Loader2, Search, CalendarClock, Globe2, GraduationCap, BellRing } from 'lucide-react';
import ToolPage from '../../components/ToolPage';
import { useLang } from '../../lib/i18n';

type Sch = { id: number; title_ar: string; title_en: string; provider: string; country: string; degree: string; funding: string; deadline: string; link: string; description_ar: string; description_en: string };

export default function Scholarships() {
  const { tr, lang } = useLang();
  const [items, setItems] = useState<Sch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [degree, setDegree] = useState('all');

  useEffect(() => {
    fetch('/api/community?resource=scholarships')
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d) ? d : []))
      .catch(() => setError(tr({ ar: 'تعذر التحميل', en: 'Failed to load' })))
      .finally(() => setLoading(false));
  }, []);

  const degrees = useMemo(() => [...new Set(items.map((i) => i.degree))], [items]);
  const shown = items.filter((s) =>
    (degree === 'all' || s.degree === degree) &&
    (!q || (s.title_ar + s.title_en + s.provider + s.country).toLowerCase().includes(q.toLowerCase())));

  const daysLeft = (d: string) => Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);

  return (
    <ToolPage id="scholarships" wide>
      <div className="flex flex-wrap gap-2 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input className="field !ps-9" placeholder={tr({ ar: 'ابحث عن منحة، دولة، جهة...', en: 'Search scholarship, country, provider...' })} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="field !w-auto" value={degree} onChange={(e) => setDegree(e.target.value)}>
          <option value="all">{tr({ ar: 'كل الدرجات', en: 'All degrees' })}</option>
          {degrees.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-sky-700" size={32} /></div> :
       error ? <p className="text-rose-600 text-center py-10">{error}</p> : (
        <div className="grid md:grid-cols-2 gap-4">
          {shown.map((s) => {
            const d = daysLeft(s.deadline);
            return (
              <div key={s.id} className="card hover:border-sky-500 transition-colors flex flex-col">
                <div className="flex justify-between items-start gap-2 mb-1">
                  <h3 className="font-bold">{lang === 'ar' ? s.title_ar : s.title_en}</h3>
                  <span className={`shrink-0 text-[11px] font-bold rounded-full px-2.5 py-1 flex items-center gap-1 ${d <= 14 ? 'bg-rose-50 text-rose-600' : 'bg-teal-50 text-teal-700'}`}>
                    <BellRing size={11} />
                    {d < 0 ? tr({ ar: 'مغلقة', en: 'Closed' }) : tr({ ar: `متبقي ${d} يوم`, en: `${d} days left` })}
                  </span>
                </div>
                <p className="text-xs text-stone-400 mb-2">{s.provider}</p>
                <p className="text-sm text-stone-600 leading-relaxed flex-1">{lang === 'ar' ? s.description_ar : s.description_en}</p>
                <div className="flex flex-wrap gap-2 mt-3 text-xs">
                  <span className="flex items-center gap-1 bg-stone-100 rounded-full px-2.5 py-1"><Globe2 size={12} /> {s.country}</span>
                  <span className="flex items-center gap-1 bg-stone-100 rounded-full px-2.5 py-1"><GraduationCap size={12} /> {s.degree}</span>
                  <span className="flex items-center gap-1 bg-amber-50 text-amber-700 rounded-full px-2.5 py-1 font-semibold">{s.funding}</span>
                  <span className="flex items-center gap-1 bg-stone-100 rounded-full px-2.5 py-1"><CalendarClock size={12} /> {new Date(s.deadline).toLocaleDateString(lang === 'ar' ? 'ar' : 'en')}</span>
                </div>
                <a href={s.link} target="_blank" rel="noreferrer" className="btn-soft mt-3 w-fit !py-1.5 text-xs">{tr({ ar: 'التقديم والتفاصيل', en: 'Apply & details' })}</a>
              </div>
            );
          })}
          {shown.length === 0 && <p className="col-span-full text-center text-stone-400 py-10">{tr({ ar: 'لا نتائج', en: 'No results' })}</p>}
        </div>
      )}
    </ToolPage>
  );
}
