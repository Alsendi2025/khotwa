import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Search, Plus, Tag, Phone } from 'lucide-react';
import ToolPage from '../../components/ToolPage';
import { useAuth, authHeaders } from '../../contexts/AuthContext';
import { useLang } from '../../lib/i18n';

type Item = { id: number; title: string; description: string; price: number; condition: string; category: string; contact: string; image_url: string; seller_name: string };

const CATS = [
  { id: 'books', ar: 'كتب', en: 'Books' },
  { id: 'lab', ar: 'أدوات معمل', en: 'Lab gear' },
  { id: 'electronics', ar: 'إلكترونيات', en: 'Electronics' },
  { id: 'stationery', ar: 'قرطاسية', en: 'Stationery' },
  { id: 'other', ar: 'أخرى', en: 'Other' },
];

export default function Market() {
  const { tr } = useLang();
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', price: '', condition: 'جيد', category: 'books', contact: '' });
  const [img, setImg] = useState<File | null>(null);

  const load = () => fetch('/api/community?resource=market').then((r) => r.json()).then((d) => setItems(Array.isArray(d) ? d : [])).catch(() => setError(tr({ ar: 'تعذر التحميل', en: 'Failed to load' }))).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const submit = async () => {
    const price = parseFloat(form.price);
    if (!form.title.trim() || isNaN(price) || price < 0) { setError(tr({ ar: 'أدخل عنواناً وسعراً صالحاً', en: 'Enter a valid title & price' })); return; }
    if (!form.contact.trim()) { setError(tr({ ar: 'أدخل وسيلة تواصل', en: 'Enter contact info' })); return; }
    setSaving(true); setError('');
    try {
      const headers = await authHeaders();
      let image_url = '';
      if (img) {
        if (img.size > 4 * 1024 * 1024) throw new Error(tr({ ar: 'الصورة أكبر من 4 ميجا', en: 'Image over 4MB' }));
        const base64 = await new Promise<string>((res, rej) => {
          const r = new FileReader(); r.onload = () => res((r.result as string).split(',')[1]); r.onerror = rej; r.readAsDataURL(img);
        });
        const up = await fetch('/api/upload', { method: 'POST', headers, body: JSON.stringify({ fileName: img.name, fileBase64: base64, contentType: img.type, folder: 'market' }) });
        const upData = await up.json();
        if (!up.ok) throw new Error(upData.error);
        image_url = upData.url;
      }
      const res = await fetch('/api/community?resource=market', { method: 'POST', headers, body: JSON.stringify({ ...form, price, image_url }) });
      if (!res.ok) throw new Error(tr({ ar: 'فشل النشر — سجّل دخولك', en: 'Failed — sign in first' }));
      setShowForm(false); setForm({ title: '', description: '', price: '', condition: 'جيد', category: 'books', contact: '' }); setImg(null); load();
    } catch (e: any) { setError(e.message); }
    setSaving(false);
  };

  const shown = items.filter((i) => (cat === 'all' || i.category === cat) && (!q || (i.title + i.description).toLowerCase().includes(q.toLowerCase())));
  const catName = (id: string) => { const c = CATS.find((x) => x.id === id); return c ? tr(c) : id; };

  return (
    <ToolPage id="market" wide>
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input className="field !ps-9" placeholder={tr({ ar: 'ابحث عن كتاب أو أداة...', en: 'Search books or gear...' })} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="field !w-auto" value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="all">{tr({ ar: 'كل الفئات', en: 'All categories' })}</option>
          {CATS.map((c) => <option key={c.id} value={c.id}>{tr(c)}</option>)}
        </select>
        {user ? (
          <button className="btn" onClick={() => setShowForm(!showForm)}><Plus size={16} /> {tr({ ar: 'أضف إعلاناً', en: 'Sell item' })}</button>
        ) : <Link to="/login" className="btn-soft">{tr({ ar: 'سجّل دخولك للبيع', en: 'Sign in to sell' })}</Link>}
      </div>

      {showForm && (
        <div className="card mb-5 space-y-2">
          <input className="field" placeholder={tr({ ar: 'اسم السلعة *', en: 'Item title *' })} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <input className="field" type="number" min="0" placeholder={tr({ ar: 'السعر *', en: 'Price *' })} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <select className="field" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
              {['جديد', 'ممتاز', 'جيد', 'مقبول'].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATS.map((c) => <option key={c.id} value={c.id}>{tr(c)}</option>)}
            </select>
            <input className="field" placeholder={tr({ ar: 'وسيلة التواصل *', en: 'Contact info *' })} value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
          </div>
          <textarea className="field min-h-16" placeholder={tr({ ar: 'الوصف والحالة', en: 'Description & condition' })} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input type="file" accept="image/*" onChange={(e) => setImg(e.target.files?.[0] || null)}
            className="block w-full text-sm text-stone-500 file:me-3 file:rounded-xl file:border-0 file:bg-teal-800 file:text-white file:px-4 file:py-2 file:text-sm file:font-semibold" />
          <button className="btn" onClick={submit} disabled={saving}>{saving ? <Loader2 size={16} className="animate-spin" /> : null} {tr({ ar: 'نشر الإعلان', en: 'Publish listing' })}</button>
        </div>
      )}
      {error && <p className="text-rose-600 text-sm mb-3">{error}</p>}

      {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-sky-700" size={32} /></div> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {shown.map((i) => (
            <div key={i.id} className="card !p-0 overflow-hidden flex flex-col hover:border-sky-500 transition-colors">
              <div className="h-36 bg-stone-100 flex items-center justify-center overflow-hidden">
                {i.image_url ? <img src={i.image_url} alt={i.title} className="w-full h-full object-cover" /> : <Tag size={32} className="text-stone-300" />}
              </div>
              <div className="p-3.5 flex flex-col flex-1">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold text-sm">{i.title}</h3>
                  <span className="font-display font-bold text-teal-800 shrink-0" dir="ltr">{i.price}</span>
                </div>
                <p className="text-xs text-stone-500 mt-1 flex-1 line-clamp-2">{i.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  <span className="text-[10px] bg-stone-100 rounded-full px-2 py-0.5">{catName(i.category)}</span>
                  <span className="text-[10px] bg-amber-50 text-amber-700 rounded-full px-2 py-0.5">{i.condition}</span>
                </div>
                <p className="text-[10px] text-stone-400 mt-2 flex items-center gap-1"><Phone size={10} /> {i.contact} · {i.seller_name}</p>
              </div>
            </div>
          ))}
          {shown.length === 0 && <p className="col-span-full text-center text-stone-400 py-10">{tr({ ar: 'لا إعلانات بعد', en: 'No listings yet' })}</p>}
        </div>
      )}
    </ToolPage>
  );
}
