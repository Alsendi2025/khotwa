import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Search, UploadCloud, Download, FileText } from 'lucide-react';
import ToolPage from '../../components/ToolPage';
import { useAuth, authHeaders } from '../../contexts/AuthContext';
import { useLang } from '../../lib/i18n';

type Note = { id: number; title: string; subject: string; description: string; file_url: string; file_name: string; uploader_name: string; downloads: number };

export default function Notes() {
  const { tr } = useLang();
  const { user } = useAuth();
  const [items, setItems] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', subject: '', description: '' });
  const [file, setFile] = useState<File | null>(null);

  const load = () => fetch('/api/community?resource=notes').then((r) => r.json()).then((d) => setItems(Array.isArray(d) ? d : [])).catch(() => setError(tr({ ar: 'تعذر التحميل', en: 'Failed to load' }))).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.title.trim() || !file) { setError(tr({ ar: 'العنوان والملف مطلوبان', en: 'Title & file required' })); return; }
    if (file.size > 4 * 1024 * 1024) { setError(tr({ ar: 'الحد الأقصى 4 ميجا', en: 'Max file size is 4MB' })); return; }
    setSaving(true); setError('');
    try {
      const base64 = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = () => res((r.result as string).split(',')[1]);
        r.onerror = rej;
        r.readAsDataURL(file);
      });
      const headers = await authHeaders();
      const up = await fetch('/api/upload', { method: 'POST', headers, body: JSON.stringify({ fileName: file.name, fileBase64: base64, contentType: file.type, folder: 'notes' }) });
      const upData = await up.json();
      if (!up.ok) throw new Error(upData.error || 'upload failed');
      const res = await fetch('/api/community?resource=notes', { method: 'POST', headers, body: JSON.stringify({ ...form, file_url: upData.url, file_name: file.name }) });
      if (!res.ok) throw new Error('post failed');
      setShowForm(false); setForm({ title: '', subject: '', description: '' }); setFile(null); load();
    } catch (e: any) {
      setError(e.message === 'unauthorized' ? tr({ ar: 'سجّل دخولك أولاً', en: 'Sign in first' }) : e.message);
    }
    setSaving(false);
  };

  const dl = async (n: Note) => {
    fetch('/api/community?resource=note-download', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: n.id }) }).then(load);
    window.open(n.file_url, '_blank');
  };

  const shown = items.filter((n) => !q || (n.title + n.subject + n.description).toLowerCase().includes(q.toLowerCase()));

  return (
    <ToolPage id="notes" wide>
      <div className="flex flex-wrap gap-2 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input className="field !ps-9" placeholder={tr({ ar: 'ابحث عن ملخص أو مادة...', en: 'Search notes or subjects...' })} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {user ? (
          <button className="btn" onClick={() => setShowForm(!showForm)}><UploadCloud size={16} /> {tr({ ar: 'ارفع ملخصاً', en: 'Upload notes' })}</button>
        ) : (
          <Link to="/login" className="btn-soft">{tr({ ar: 'سجّل دخولك للرفع', en: 'Sign in to upload' })}</Link>
        )}
      </div>

      {showForm && (
        <div className="card mb-5 space-y-2">
          <input className="field" placeholder={tr({ ar: 'عنوان الملخص *', en: 'Title *' })} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className="field" placeholder={tr({ ar: 'المادة (مثل: تفاضل 101)', en: 'Subject (e.g. Calculus 101)' })} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          <textarea className="field min-h-16" placeholder={tr({ ar: 'وصف مختصر', en: 'Short description' })} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md,image/*" onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-stone-500 file:me-3 file:rounded-xl file:border-0 file:bg-teal-800 file:text-white file:px-4 file:py-2 file:text-sm file:font-semibold" />
          <p className="text-xs text-stone-400">{tr({ ar: 'الحد الأقصى: 4 ميجابايت', en: 'Max: 4MB' })}</p>
          <button className="btn" onClick={submit} disabled={saving}>{saving ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />} {tr({ ar: 'رفع ونشر', en: 'Upload & publish' })}</button>
        </div>
      )}
      {error && <p className="text-rose-600 text-sm mb-3">{error}</p>}

      {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-sky-700" size={32} /></div> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shown.map((n) => (
            <div key={n.id} className="card flex flex-col hover:border-sky-500 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={16} className="text-sky-700" />
                {n.subject && <span className="text-[10px] font-bold bg-sky-50 text-sky-700 rounded-full px-2 py-0.5">{n.subject}</span>}
              </div>
              <h3 className="font-bold text-sm">{n.title}</h3>
              {n.description && <p className="text-xs text-stone-500 mt-1 flex-1 leading-relaxed">{n.description}</p>}
              <div className="flex items-center justify-between mt-3">
                <span className="text-[10px] text-stone-400">{n.uploader_name} · {n.downloads} {tr({ ar: 'تنزيل', en: 'downloads' })}</span>
                <button onClick={() => dl(n)} className="btn-soft !py-1 !px-2.5 text-xs"><Download size={13} /> {tr({ ar: 'تنزيل', en: 'Get' })}</button>
              </div>
            </div>
          ))}
          {shown.length === 0 && <p className="col-span-full text-center text-stone-400 py-10">{tr({ ar: 'لا ملفات بعد — كن أول من يشارك!', en: 'No files yet — be the first to share!' })}</p>}
        </div>
      )}
    </ToolPage>
  );
}
