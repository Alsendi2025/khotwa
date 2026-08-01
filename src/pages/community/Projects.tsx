import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Search, Plus, Lightbulb, ListOrdered, Wrench, X } from 'lucide-react';
import ToolPage from '../../components/ToolPage';
import { useAuth, authHeaders } from '../../contexts/AuthContext';
import { useLang } from '../../lib/i18n';

type Proj = { id: number; title: string; field: string; difficulty: string; description: string; steps: string; tools: string; author_name: string };

export default function Projects() {
  const { tr } = useLang();
  const { user } = useAuth();
  const [items, setItems] = useState<Proj[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<Proj | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', field: 'علوم حاسب', difficulty: 'متوسط', description: '', steps: '', tools: '' });

  const load = () => fetch('/api/community?resource=projects').then((r) => r.json()).then((d) => setItems(Array.isArray(d) ? d : [])).catch(() => setError(tr({ ar: 'تعذر التحميل', en: 'Failed to load' }))).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.title.trim() || !form.description.trim()) { setError(tr({ ar: 'العنوان والوصف مطلوبان', en: 'Title & description required' })); return; }
    setSaving(true); setError('');
    const res = await fetch('/api/community?resource=projects', { method: 'POST', headers: await authHeaders(), body: JSON.stringify(form) });
    setSaving(false);
    if (res.ok) { setShowForm(false); setForm({ ...form, title: '', description: '', steps: '', tools: '' }); load(); }
    else setError(tr({ ar: 'فشل النشر — سجّل دخولك أولاً', en: 'Post failed — sign in first' }));
  };

  const shown = items.filter((p) => !q || (p.title + p.field + p.description).toLowerCase().includes(q.toLowerCase()));

  return (
    <ToolPage id="projects" wide>
      <div className="flex flex-wrap gap-2 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input className="field !ps-9" placeholder={tr({ ar: 'ابحث عن فكرة...', en: 'Search ideas...' })} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {user ? (
          <button className="btn" onClick={() => setShowForm(!showForm)}><Plus size={16} /> {tr({ ar: 'شارك فكرة', en: 'Share idea' })}</button>
        ) : (
          <Link to="/login" className="btn-soft">{tr({ ar: 'سجّل دخولك للمشاركة', en: 'Sign in to share' })}</Link>
        )}
      </div>

      {showForm && (
        <div className="card mb-5 space-y-2">
          <input className="field" placeholder={tr({ ar: 'عنوان المشروع *', en: 'Project title *' })} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <input className="field" placeholder={tr({ ar: 'المجال', en: 'Field' })} value={form.field} onChange={(e) => setForm({ ...form, field: e.target.value })} />
            <select className="field" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
              {['سهل', 'متوسط', 'متقدم'].map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <textarea className="field min-h-20" placeholder={tr({ ar: 'وصف الفكرة *', en: 'Idea description *' })} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <textarea className="field min-h-20" placeholder={tr({ ar: 'خطوات التنفيذ (سطر لكل خطوة)', en: 'Implementation steps (one per line)' })} value={form.steps} onChange={(e) => setForm({ ...form, steps: e.target.value })} />
          <input className="field" placeholder={tr({ ar: 'الأدوات والتقنيات', en: 'Tools & technologies' })} value={form.tools} onChange={(e) => setForm({ ...form, tools: e.target.value })} />
          <button className="btn" onClick={submit} disabled={saving}>{saving ? <Loader2 size={16} className="animate-spin" /> : null} {tr({ ar: 'نشر', en: 'Publish' })}</button>
        </div>
      )}
      {error && <p className="text-rose-600 text-sm mb-3">{error}</p>}

      {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-sky-700" size={32} /></div> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shown.map((p) => (
            <button key={p.id} onClick={() => setOpen(p)} className="card text-start hover:border-sky-500 hover:-translate-y-0.5 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb size={16} className="text-amber-500" />
                <span className="text-[10px] font-bold bg-sky-50 text-sky-700 rounded-full px-2 py-0.5">{p.field}</span>
                <span className="text-[10px] font-bold bg-stone-100 rounded-full px-2 py-0.5">{p.difficulty}</span>
              </div>
              <h3 className="font-bold text-sm">{p.title}</h3>
              <p className="text-xs text-stone-500 mt-1 line-clamp-3 leading-relaxed">{p.description}</p>
              <p className="text-[10px] text-stone-400 mt-2">{tr({ ar: 'بواسطة', en: 'by' })} {p.author_name}</p>
            </button>
          ))}
          {shown.length === 0 && <p className="col-span-full text-center text-stone-400 py-10">{tr({ ar: 'لا مشاريع بعد', en: 'No projects yet' })}</p>}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setOpen(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-3">
              <h2 className="font-display text-xl font-bold">{open.title}</h2>
              <button onClick={() => setOpen(null)} className="text-stone-400 hover:text-rose-600"><X size={20} /></button>
            </div>
            <p className="text-sm leading-relaxed text-stone-600">{open.description}</p>
            {open.steps && (
              <div className="mt-4">
                <h4 className="font-bold text-sm flex items-center gap-1.5 mb-2"><ListOrdered size={15} className="text-sky-700" /> {tr({ ar: 'خطوات التنفيذ', en: 'Steps' })}</h4>
                <ol className="space-y-1.5">{open.steps.split('\n').filter(Boolean).map((s, i) => (
                  <li key={i} className="text-sm flex gap-2"><span className="w-5 h-5 rounded-full bg-sky-100 text-sky-800 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span> {s}</li>
                ))}</ol>
              </div>
            )}
            {open.tools && (
              <div className="mt-4">
                <h4 className="font-bold text-sm flex items-center gap-1.5 mb-2"><Wrench size={15} className="text-sky-700" /> {tr({ ar: 'الأدوات', en: 'Tools' })}</h4>
                <div className="flex flex-wrap gap-1.5">{open.tools.split(',').map((t, i) => <span key={i} className="text-xs bg-stone-100 rounded-full px-2.5 py-1">{t.trim()}</span>)}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </ToolPage>
  );
}
