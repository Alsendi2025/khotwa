import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Plus, MessagesSquare, Send, ArrowRight, ArrowLeft } from 'lucide-react';
import ToolPage from '../../components/ToolPage';
import { useAuth, authHeaders } from '../../contexts/AuthContext';
import { useLang } from '../../lib/i18n';

type Thread = { id: number; title: string; body: string; category: string; author_name: string; created_at: string };
type Reply = { id: number; body: string; author_name: string; created_at: string };

const CATS = [
  { id: 'general', ar: 'عام', en: 'General' },
  { id: 'math', ar: 'رياضيات', en: 'Math' },
  { id: 'cs', ar: 'برمجة وحاسب', en: 'CS & Coding' },
  { id: 'science', ar: 'علوم', en: 'Science' },
  { id: 'languages', ar: 'لغات', en: 'Languages' },
  { id: 'exams', ar: 'اختبارات وقبول', en: 'Exams & Admission' },
];

export default function Forums() {
  const { tr, lang } = useLang();
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cat, setCat] = useState('all');
  const [open, setOpen] = useState<Thread | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [reply, setReply] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', category: 'general' });
  const Back = lang === 'ar' ? ArrowRight : ArrowLeft;

  const load = () => fetch('/api/community?resource=forum').then((r) => r.json()).then((d) => setThreads(Array.isArray(d) ? d : [])).catch(() => setError(tr({ ar: 'تعذر التحميل', en: 'Failed to load' }))).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openThread = async (t: Thread) => {
    setOpen(t); setRepliesLoading(true);
    const d = await fetch(`/api/community?resource=replies&thread_id=${t.id}`).then((r) => r.json()).catch(() => []);
    setReplies(Array.isArray(d) ? d : []);
    setRepliesLoading(false);
  };

  const post = async () => {
    if (!form.title.trim() || !form.body.trim()) { setError(tr({ ar: 'العنوان والمحتوى مطلوبان', en: 'Title & body required' })); return; }
    setSaving(true); setError('');
    const res = await fetch('/api/community?resource=forum', { method: 'POST', headers: await authHeaders(), body: JSON.stringify(form) });
    setSaving(false);
    if (res.ok) { setShowForm(false); setForm({ title: '', body: '', category: 'general' }); load(); }
    else setError(tr({ ar: 'فشل النشر — سجّل دخولك', en: 'Failed — sign in first' }));
  };

  const sendReply = async () => {
    if (!reply.trim() || !open) return;
    setSaving(true);
    const res = await fetch('/api/community?resource=replies', { method: 'POST', headers: await authHeaders(), body: JSON.stringify({ thread_id: open.id, body: reply }) });
    setSaving(false);
    if (res.ok) { setReply(''); openThread(open); }
    else setError(tr({ ar: 'سجّل دخولك للرد', en: 'Sign in to reply' }));
  };

  const shown = threads.filter((t) => cat === 'all' || t.category === cat);
  const catName = (id: string) => { const c = CATS.find((x) => x.id === id); return c ? tr(c) : id; };

  if (open) {
    return (
      <ToolPage id="forums" wide>
        <button onClick={() => setOpen(null)} className="flex items-center gap-1.5 text-sm text-teal-800 font-medium mb-4"><Back size={16} /> {tr({ ar: 'كل المواضيع', en: 'All threads' })}</button>
        <div className="card mb-4">
          <span className="text-[10px] font-bold bg-sky-50 text-sky-700 rounded-full px-2 py-0.5">{catName(open.category)}</span>
          <h2 className="font-display text-xl font-bold mt-2">{open.title}</h2>
          <p className="text-sm text-stone-600 mt-2 leading-relaxed whitespace-pre-wrap">{open.body}</p>
          <p className="text-xs text-stone-400 mt-3">{open.author_name} · {new Date(open.created_at).toLocaleDateString(lang === 'ar' ? 'ar' : 'en')}</p>
        </div>
        <h3 className="font-bold mb-3">{tr({ ar: `الردود (${replies.length})`, en: `Replies (${replies.length})` })}</h3>
        {repliesLoading ? <Loader2 className="animate-spin text-sky-700" size={24} /> : (
          <div className="space-y-3 mb-4">
            {replies.map((r) => (
              <div key={r.id} className="card !py-3">
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{r.body}</p>
                <p className="text-[10px] text-stone-400 mt-2">{r.author_name} · {new Date(r.created_at).toLocaleDateString(lang === 'ar' ? 'ar' : 'en')}</p>
              </div>
            ))}
            {replies.length === 0 && <p className="text-sm text-stone-400">{tr({ ar: 'لا ردود بعد — كن أول من يرد', en: 'No replies yet — be the first' })}</p>}
          </div>
        )}
        {user ? (
          <div className="flex gap-2">
            <input className="field flex-1" placeholder={tr({ ar: 'اكتب ردك...', en: 'Write a reply...' })} value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendReply()} />
            <button className="btn !px-4" onClick={sendReply} disabled={saving || !reply.trim()}><Send size={16} /></button>
          </div>
        ) : <Link to="/login" className="btn-soft">{tr({ ar: 'سجّل دخولك للرد', en: 'Sign in to reply' })}</Link>}
        {error && <p className="text-rose-600 text-sm mt-2">{error}</p>}
      </ToolPage>
    );
  }

  return (
    <ToolPage id="forums" wide>
      <div className="flex flex-wrap gap-1.5 mb-4">
        <button onClick={() => setCat('all')} className={`px-3 py-1.5 rounded-full text-xs font-bold border ${cat === 'all' ? 'bg-sky-700 text-white border-sky-700' : 'bg-white border-stone-300'}`}>{tr({ ar: 'الكل', en: 'All' })}</button>
        {CATS.map((c) => (
          <button key={c.id} onClick={() => setCat(c.id)} className={`px-3 py-1.5 rounded-full text-xs font-bold border ${cat === c.id ? 'bg-sky-700 text-white border-sky-700' : 'bg-white border-stone-300'}`}>{tr(c)}</button>
        ))}
        <span className="flex-1" />
        {user ? (
          <button className="btn !py-1.5" onClick={() => setShowForm(!showForm)}><Plus size={15} /> {tr({ ar: 'موضوع جديد', en: 'New thread' })}</button>
        ) : <Link to="/login" className="btn-soft !py-1.5">{tr({ ar: 'سجّل دخولك للمشاركة', en: 'Sign in to post' })}</Link>}
      </div>

      {showForm && (
        <div className="card mb-5 space-y-2">
          <input className="field" placeholder={tr({ ar: 'عنوان الموضوع *', en: 'Thread title *' })} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <select className="field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATS.map((c) => <option key={c.id} value={c.id}>{tr(c)}</option>)}
          </select>
          <textarea className="field min-h-24" placeholder={tr({ ar: 'اطرح سؤالك أو نقاشك... *', en: 'Your question or discussion... *' })} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          <button className="btn" onClick={post} disabled={saving}>{saving ? <Loader2 size={16} className="animate-spin" /> : null} {tr({ ar: 'نشر', en: 'Post' })}</button>
        </div>
      )}
      {error && <p className="text-rose-600 text-sm mb-3">{error}</p>}

      {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-sky-700" size={32} /></div> : (
        <div className="space-y-2">
          {shown.map((t) => (
            <button key={t.id} onClick={() => openThread(t)} className="card !py-3.5 w-full text-start flex items-center gap-3 hover:border-sky-500 transition-colors">
              <MessagesSquare size={20} className="text-sky-700 shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm truncate">{t.title}</h3>
                <p className="text-xs text-stone-400">{catName(t.category)} · {t.author_name} · {new Date(t.created_at).toLocaleDateString(lang === 'ar' ? 'ar' : 'en')}</p>
              </div>
            </button>
          ))}
          {shown.length === 0 && <p className="text-center text-stone-400 py-10">{tr({ ar: 'لا مواضيع في هذا القسم بعد', en: 'No threads in this category yet' })}</p>}
        </div>
      )}
    </ToolPage>
  );
}
