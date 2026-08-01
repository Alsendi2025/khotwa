import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Loader2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import ToolPage from '../../components/ToolPage';
import { useLang } from '../../lib/i18n';

type Entry = { id: number; label: string; amount: number; kind: 'income' | 'expense'; category: string; created_at: string };

const CATS = [
  { id: 'food', ar: 'طعام', en: 'Food' },
  { id: 'transport', ar: 'مواصلات', en: 'Transport' },
  { id: 'books', ar: 'كتب ودراسة', en: 'Books & Study' },
  { id: 'housing', ar: 'سكن', en: 'Housing' },
  { id: 'fun', ar: 'ترفيه', en: 'Fun' },
  { id: 'other', ar: 'أخرى', en: 'Other' },
];

export default function Budget() {
  const { tr } = useLang();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ label: '', amount: '', kind: 'expense' as 'income' | 'expense', category: 'food' });

  const fetchEntries = async () => {
    try {
      const res = await fetch('/api/budget');
      if (!res.ok) throw new Error();
      setEntries(await res.json());
    } catch { setError(tr({ ar: 'تعذر التحميل', en: 'Failed to load' })); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchEntries(); }, []);

  const add = async () => {
    const amt = parseFloat(form.amount);
    if (!form.label.trim() || isNaN(amt) || amt <= 0) { setError(tr({ ar: 'أدخل وصفاً ومبلغاً صالحاً', en: 'Enter a valid label & amount' })); return; }
    setSaving(true); setError('');
    const res = await fetch('/api/budget', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: form.label, amount: amt, kind: form.kind, category: form.kind === 'income' ? 'income' : form.category }),
    });
    setSaving(false);
    if (res.ok) { setForm((f) => ({ ...f, label: '', amount: '' })); fetchEntries(); }
    else setError(tr({ ar: 'فشل الحفظ', en: 'Save failed' }));
  };

  const del = async (id: number) => {
    await fetch('/api/budget', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    fetchEntries();
  };

  const { income, expense, byCat } = useMemo(() => {
    let inc = 0, exp = 0;
    const bc: Record<string, number> = {};
    for (const e of entries) {
      if (e.kind === 'income') inc += +e.amount;
      else { exp += +e.amount; bc[e.category] = (bc[e.category] || 0) + +e.amount; }
    }
    return { income: inc, expense: exp, byCat: bc };
  }, [entries]);

  const balance = income - expense;

  return (
    <ToolPage id="budget" wide>
      <div className="grid sm:grid-cols-3 gap-3 mb-5">
        <div className="card !bg-teal-900 !border-teal-900 text-white">
          <p className="text-teal-300 text-xs font-bold">{tr({ ar: 'الرصيد', en: 'Balance' })}</p>
          <p className={`font-display text-3xl font-bold ${balance < 0 ? 'text-rose-300' : 'text-amber-300'}`} dir="ltr">{balance.toFixed(2)}</p>
        </div>
        <div className="card">
          <p className="text-xs font-bold text-stone-500 flex items-center gap-1"><ArrowUpCircle size={14} className="text-teal-600" /> {tr({ ar: 'الدخل', en: 'Income' })}</p>
          <p className="font-display text-3xl font-bold text-teal-700" dir="ltr">{income.toFixed(2)}</p>
        </div>
        <div className="card">
          <p className="text-xs font-bold text-stone-500 flex items-center gap-1"><ArrowDownCircle size={14} className="text-rose-500" /> {tr({ ar: 'المصروفات', en: 'Expenses' })}</p>
          <p className="font-display text-3xl font-bold text-rose-600" dir="ltr">{expense.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <div className="card mb-4">
            <div className="grid sm:grid-cols-5 gap-2">
              <input className="field sm:col-span-2" placeholder={tr({ ar: 'الوصف (مثل: غداء الجامعة)', en: 'Label (e.g. campus lunch)' })} value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
              <input className="field" type="number" min="0" step="0.01" placeholder={tr({ ar: 'المبلغ', en: 'Amount' })} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              <select className="field" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as any })}>
                <option value="expense">{tr({ ar: 'مصروف', en: 'Expense' })}</option>
                <option value="income">{tr({ ar: 'دخل', en: 'Income' })}</option>
              </select>
              {form.kind === 'expense' ? (
                <select className="field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATS.map((c) => <option key={c.id} value={c.id}>{tr(c)}</option>)}
                </select>
              ) : <div />}
            </div>
            <button className="btn mt-3" onClick={add} disabled={saving}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} {tr({ ar: 'تسجيل', en: 'Record' })}
            </button>
            {error && <p className="text-rose-600 text-sm mt-2">{error}</p>}
          </div>

          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-teal-700" size={30} /></div>
          ) : entries.length === 0 ? (
            <p className="text-center text-stone-400 py-8 text-sm">{tr({ ar: 'لا توجد حركات بعد — سجّل أول مصروف', en: 'No entries yet — record your first one' })}</p>
          ) : (
            <div className="space-y-2">
              {entries.map((e) => {
                const cat = CATS.find((c) => c.id === e.category);
                return (
                  <div key={e.id} className="card !py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {e.kind === 'income' ? <ArrowUpCircle size={20} className="text-teal-600 shrink-0" /> : <ArrowDownCircle size={20} className="text-rose-500 shrink-0" />}
                      <div>
                        <p className="font-semibold text-sm">{e.label}</p>
                        <p className="text-xs text-stone-400">{cat ? tr(cat) : e.kind === 'income' ? tr({ ar: 'دخل', en: 'Income' }) : e.category} · {new Date(e.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`font-bold ${e.kind === 'income' ? 'text-teal-700' : 'text-rose-600'}`} dir="ltr">{e.kind === 'income' ? '+' : '−'}{(+e.amount).toFixed(2)}</span>
                      <button onClick={() => del(e.id)} className="text-stone-300 hover:text-rose-600"><Trash2 size={16} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card h-fit">
          <h3 className="font-bold mb-3">{tr({ ar: 'المصروفات حسب الفئة', en: 'Spending by category' })}</h3>
          {expense === 0 ? <p className="text-sm text-stone-400">{tr({ ar: 'لا مصروفات بعد', en: 'No expenses yet' })}</p> : (
            <div className="space-y-3">
              {Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([cid, amt]) => {
                const cat = CATS.find((c) => c.id === cid);
                const pct = (amt / expense) * 100;
                return (
                  <div key={cid}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{cat ? tr(cat) : cid}</span>
                      <span className="text-stone-500" dir="ltr">{amt.toFixed(2)} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-700 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ToolPage>
  );
}
