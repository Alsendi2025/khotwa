import { useEffect, useState } from 'react';
import { Loader2, HeartHandshake, X, Clock3 } from 'lucide-react';
import ToolPage from '../../components/ToolPage';
import { useLang } from '../../lib/i18n';

type Article = { id: number; title_ar: string; title_en: string; topic: string; read_minutes: number; body_ar: string; body_en: string };

const TOPICS: Record<string, { ar: string; en: string; color: string }> = {
  time: { ar: 'إدارة الوقت', en: 'Time management', color: 'bg-teal-100 text-teal-800' },
  stress: { ar: 'ضغط الدراسة', en: 'Study stress', color: 'bg-rose-100 text-rose-700' },
  focus: { ar: 'التركيز', en: 'Focus', color: 'bg-sky-100 text-sky-700' },
  motivation: { ar: 'الدافعية', en: 'Motivation', color: 'bg-amber-100 text-amber-700' },
};

export default function Guide() {
  const { tr, lang } = useLang();
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState<Article | null>(null);

  useEffect(() => {
    fetch('/api/community?resource=articles')
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d) ? d : []))
      .catch(() => setError(tr({ ar: 'تعذر التحميل', en: 'Failed to load' })))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ToolPage id="guide" wide>
      {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-sky-700" size={32} /></div> :
       error ? <p className="text-rose-600 text-center py-10">{error}</p> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((a) => {
            const t = TOPICS[a.topic] || TOPICS.focus;
            return (
              <button key={a.id} onClick={() => setOpen(a)} className="card text-start hover:border-sky-500 hover:-translate-y-0.5 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <HeartHandshake size={16} className="text-rose-500" />
                  <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${t.color}`}>{tr(t)}</span>
                  <span className="text-[10px] text-stone-400 flex items-center gap-0.5"><Clock3 size={10} /> {a.read_minutes} {tr({ ar: 'د', en: 'min' })}</span>
                </div>
                <h3 className="font-bold text-sm leading-snug">{lang === 'ar' ? a.title_ar : a.title_en}</h3>
                <p className="text-xs text-stone-500 mt-1.5 line-clamp-3 leading-relaxed">{(lang === 'ar' ? a.body_ar : a.body_en).slice(0, 140)}...</p>
              </button>
            );
          })}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setOpen(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="font-display text-2xl font-bold">{lang === 'ar' ? open.title_ar : open.title_en}</h2>
              <button onClick={() => setOpen(null)} className="text-stone-400 hover:text-rose-600 shrink-0"><X size={22} /></button>
            </div>
            <div className="text-sm leading-loose text-stone-700 whitespace-pre-wrap">{lang === 'ar' ? open.body_ar : open.body_en}</div>
          </div>
        </div>
      )}
    </ToolPage>
  );
}
