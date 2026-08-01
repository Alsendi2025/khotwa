import { useEffect, useState } from 'react';
import { Plus, Trash2, CalendarClock, Loader2 } from 'lucide-react';
import ToolPage from '../../components/ToolPage';
import { useLang } from '../../lib/i18n';

type Ev = { id: number; title: string; day: number; start_time: string; end_time: string; location: string; kind: string; exam_date: string | null; note: string };

const DAYS = [
  { ar: 'الأحد', en: 'Sunday' }, { ar: 'الإثنين', en: 'Monday' }, { ar: 'الثلاثاء', en: 'Tuesday' },
  { ar: 'الأربعاء', en: 'Wednesday' }, { ar: 'الخميس', en: 'Thursday' }, { ar: 'الجمعة', en: 'Friday' }, { ar: 'السبت', en: 'Saturday' },
];

const COLORS = ['bg-teal-100 border-teal-300 text-teal-900', 'bg-amber-100 border-amber-300 text-amber-900', 'bg-sky-100 border-sky-300 text-sky-900', 'bg-rose-100 border-rose-300 text-rose-900', 'bg-violet-100 border-violet-300 text-violet-900'];

export default function Schedule() {
  const { tr, lang } = useLang();
  const [events, setEvents] = useState<Ev[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', day: 0, start_time: '08:00', end_time: '09:30', location: '', kind: 'class', exam_date: '', note: '' });

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/schedule');
      if (!res.ok) throw new Error('fetch failed');
      setEvents(await res.json());
    } catch { setError(tr({ ar: 'تعذر تحميل الجدول', en: 'Failed to load schedule' })); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchEvents(); }, []);

  const add = async () => {
    if (!form.title.trim()) { setError(tr({ ar: 'أدخل اسم المادة أو النشاط', en: 'Enter a title' })); return; }
    setSaving(true); setError('');
    const res = await fetch('/api/schedule', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, exam_date: form.kind === 'exam' ? form.exam_date || null : null }),
    });
    setSaving(false);
    if (res.ok) { setForm((f) => ({ ...f, title: '', location: '', note: '' })); fetchEvents(); }
    else setError(tr({ ar: 'فشل الحفظ', en: 'Save failed' }));
  };

  const del = async (id: number) => {
    await fetch('/api/schedule', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    fetchEvents();
  };

  const exams = events.filter((e) => e.kind === 'exam');
  const classes = events.filter((e) => e.kind !== 'exam');
  const daysUntil = (d: string) => Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);

  return (
    <ToolPage id="schedule" wide>
      <div className="card mb-6">
        <h3 className="font-bold mb-3">{tr({ ar: 'إضافة محاضرة أو اختبار', en: 'Add a class or exam' })}</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <input className="field" placeholder={tr({ ar: 'اسم المادة *', en: 'Course title *' })} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <select className="field" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
            <option value="class">{tr({ ar: 'محاضرة', en: 'Class' })}</option>
            <option value="lab">{tr({ ar: 'معمل', en: 'Lab' })}</option>
            <option value="exam">{tr({ ar: 'اختبار', en: 'Exam' })}</option>
          </select>
          {form.kind === 'exam' ? (
            <input className="field" type="date" value={form.exam_date} onChange={(e) => setForm({ ...form, exam_date: e.target.value })} />
          ) : (
            <select className="field" value={form.day} onChange={(e) => setForm({ ...form, day: +e.target.value })}>
              {DAYS.map((d, i) => <option key={i} value={i}>{tr(d)}</option>)}
            </select>
          )}
          <input className="field" placeholder={tr({ ar: 'القاعة / المكان', en: 'Room / location' })} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <div className="flex gap-2 items-center">
            <input className="field" type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
            <span className="text-stone-400">→</span>
            <input className="field" type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
          </div>
          <input className="field lg:col-span-2" placeholder={tr({ ar: 'ملاحظة (اختياري)', en: 'Note (optional)' })} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          <button className="btn" onClick={add} disabled={saving}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} {tr({ ar: 'إضافة', en: 'Add' })}
          </button>
        </div>
        {error && <p className="text-rose-600 text-sm mt-2">{error}</p>}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-teal-700" size={32} /></div>
      ) : (
        <>
          {exams.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold flex items-center gap-2 mb-3"><CalendarClock size={18} className="text-rose-600" /> {tr({ ar: 'تذكيرات الاختبارات', en: 'Exam reminders' })}</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {exams.sort((a, b) => (a.exam_date || '').localeCompare(b.exam_date || '')).map((e) => {
                  const d = e.exam_date ? daysUntil(e.exam_date) : null;
                  return (
                    <div key={e.id} className={`rounded-xl border-2 p-3 ${d !== null && d <= 3 ? 'border-rose-300 bg-rose-50' : 'border-amber-200 bg-amber-50'}`}>
                      <div className="flex justify-between items-start">
                        <p className="font-bold">{e.title}</p>
                        <button onClick={() => del(e.id)} className="text-stone-400 hover:text-rose-600"><Trash2 size={15} /></button>
                      </div>
                      <p className="text-sm text-stone-600">{e.exam_date && new Date(e.exam_date).toLocaleDateString(lang === 'ar' ? 'ar' : 'en', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                      {d !== null && <p className={`text-xs font-bold mt-1 ${d <= 3 ? 'text-rose-600' : 'text-amber-700'}`}>
                        {d < 0 ? tr({ ar: 'انتهى', en: 'Passed' }) : d === 0 ? tr({ ar: 'اليوم!', en: 'Today!' }) : tr({ ar: `بعد ${d} يوم`, en: `In ${d} day${d > 1 ? 's' : ''}` })}
                      </p>}
                      {e.note && <p className="text-xs text-stone-500 mt-1">{e.note}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <h3 className="font-bold mb-3">{tr({ ar: 'الجدول الأسبوعي', en: 'Weekly timetable' })}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2">
            {DAYS.map((d, di) => {
              const dayEvents = classes.filter((e) => e.day === di).sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));
              return (
                <div key={di} className="bg-white rounded-xl border border-stone-200 p-2 min-h-28">
                  <p className="text-xs font-bold text-center text-stone-500 pb-2 border-b border-stone-100 mb-2">{tr(d)}</p>
                  <div className="space-y-1.5">
                    {dayEvents.length === 0 && <p className="text-[10px] text-stone-300 text-center pt-2">—</p>}
                    {dayEvents.map((e) => (
                      <div key={e.id} className={`rounded-lg border p-1.5 text-xs relative group ${COLORS[e.id % COLORS.length]}`}>
                        <p className="font-bold leading-tight">{e.title}</p>
                        <p className="text-[10px] opacity-75" dir="ltr">{e.start_time?.slice(0, 5)}–{e.end_time?.slice(0, 5)}</p>
                        {e.location && <p className="text-[10px] opacity-75">{e.location}</p>}
                        <button onClick={() => del(e.id)} className="absolute top-1 end-1 opacity-0 group-hover:opacity-100 text-rose-600"><Trash2 size={12} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </ToolPage>
  );
}
