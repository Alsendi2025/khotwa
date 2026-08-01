import { useMemo, useState } from 'react';
import { Plus, Trash2, TrendingUp } from 'lucide-react';
import ToolPage from '../../components/ToolPage';
import { useLang } from '../../lib/i18n';

type Scale = '4' | '5' | '100';
type Row = { name: string; grade: string; credits: string };

const GRADES: Record<Scale, { label: string; value: number }[]> = {
  '4': [
    { label: 'A+', value: 4 }, { label: 'A', value: 4 }, { label: 'A-', value: 3.7 },
    { label: 'B+', value: 3.3 }, { label: 'B', value: 3 }, { label: 'B-', value: 2.7 },
    { label: 'C+', value: 2.3 }, { label: 'C', value: 2 }, { label: 'C-', value: 1.7 },
    { label: 'D+', value: 1.3 }, { label: 'D', value: 1 }, { label: 'F', value: 0 },
  ],
  '5': [
    { label: 'A+', value: 5 }, { label: 'A', value: 4.75 }, { label: 'B+', value: 4.5 },
    { label: 'B', value: 4 }, { label: 'C+', value: 3.5 }, { label: 'C', value: 3 },
    { label: 'D+', value: 2.5 }, { label: 'D', value: 2 }, { label: 'F', value: 1 },
  ],
  '100': Array.from({ length: 21 }, (_, i) => ({ label: String(100 - i * 5), value: 100 - i * 5 })),
};

export default function Gpa() {
  const { tr } = useLang();
  const [scale, setScale] = useState<Scale>('4');
  const [rows, setRows] = useState<Row[]>([{ name: '', grade: '', credits: '3' }]);
  const [prevGpa, setPrevGpa] = useState('');
  const [prevCredits, setPrevCredits] = useState('');
  const [target, setTarget] = useState('');

  const max = scale === '4' ? 4 : scale === '5' ? 5 : 100;

  const { termGpa, termCredits, cumGpa, cumCredits } = useMemo(() => {
    let pts = 0, cr = 0;
    for (const r of rows) {
      const g = parseFloat(r.grade), c = parseFloat(r.credits);
      if (!isNaN(g) && !isNaN(c) && c > 0) { pts += g * c; cr += c; }
    }
    const tg = cr ? pts / cr : 0;
    const pg = parseFloat(prevGpa), pc = parseFloat(prevCredits);
    let cg = tg, cc = cr;
    if (!isNaN(pg) && !isNaN(pc) && pc > 0) {
      cc = cr + pc;
      cg = cc ? (pts + pg * pc) / cc : 0;
    }
    return { termGpa: tg, termCredits: cr, cumGpa: cg, cumCredits: cc };
  }, [rows, prevGpa, prevCredits]);

  const prediction = useMemo(() => {
    const t = parseFloat(target);
    const pg = parseFloat(prevGpa), pc = parseFloat(prevCredits);
    if (isNaN(t) || isNaN(pg) || isNaN(pc) || termCredits <= 0) return null;
    const needed = (t * (pc + termCredits) - pg * pc) / termCredits;
    return needed;
  }, [target, prevGpa, prevCredits, termCredits]);

  const set = (i: number, k: keyof Row, v: string) =>
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, [k]: v } : r)));

  const color = (g: number) => (g >= max * 0.85 ? 'text-teal-700' : g >= max * 0.6 ? 'text-amber-600' : 'text-rose-600');

  return (
    <ToolPage id="gpa">
      <div className="flex gap-2 mb-5">
        {(['4', '5', '100'] as Scale[]).map((s) => (
          <button key={s} onClick={() => { setScale(s); setRows((rs) => rs.map((r) => ({ ...r, grade: '' }))); }}
            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${scale === s ? 'bg-teal-800 text-white border-teal-800' : 'bg-white border-stone-300 text-stone-600 hover:border-teal-600'}`}>
            {s === '100' ? tr({ ar: 'نسبة مئوية', en: 'Percentage' }) : tr({ ar: `نظام ${s}.0`, en: `${s}.0 scale` })}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 card">
          <h3 className="font-bold mb-3">{tr({ ar: 'مواد الفصل الحالي', en: 'Current term courses' })}</h3>
          <div className="space-y-2">
            {rows.map((r, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input className="field flex-1" placeholder={tr({ ar: 'اسم المادة', en: 'Course name' })}
                  value={r.name} onChange={(e) => set(i, 'name', e.target.value)} />
                <select className="field w-28" value={r.grade} onChange={(e) => set(i, 'grade', e.target.value)}>
                  <option value="">{tr({ ar: 'التقدير', en: 'Grade' })}</option>
                  {GRADES[scale].map((g) => <option key={g.label} value={g.value}>{g.label}</option>)}
                </select>
                <input className="field w-20" type="number" min="0" placeholder={tr({ ar: 'ساعات', en: 'Cr.' })}
                  value={r.credits} onChange={(e) => set(i, 'credits', e.target.value)} />
                <button onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))} disabled={rows.length === 1}
                  className="text-stone-400 hover:text-rose-600 disabled:opacity-30 p-1"><Trash2 size={17} /></button>
              </div>
            ))}
          </div>
          <button onClick={() => setRows((rs) => [...rs, { name: '', grade: '', credits: '3' }])} className="btn-soft mt-3">
            <Plus size={16} /> {tr({ ar: 'إضافة مادة', en: 'Add course' })}
          </button>

          <div className="mt-5 pt-4 border-t border-stone-100">
            <h4 className="text-sm font-bold text-stone-600 mb-2">{tr({ ar: 'المعدل السابق (اختياري للتراكمي)', en: 'Previous GPA (optional, for cumulative)' })}</h4>
            <div className="flex gap-2">
              <input className="field" type="number" step="0.01" placeholder={tr({ ar: 'المعدل السابق', en: 'Previous GPA' })} value={prevGpa} onChange={(e) => setPrevGpa(e.target.value)} />
              <input className="field" type="number" placeholder={tr({ ar: 'الساعات المنجزة', en: 'Completed credits' })} value={prevCredits} onChange={(e) => setPrevCredits(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card bg-teal-900 border-teal-900 text-white">
            <p className="text-teal-200 text-sm">{tr({ ar: 'معدل الفصل', en: 'Term GPA' })}</p>
            <p className="font-display text-4xl font-bold mt-1">{termCredits ? termGpa.toFixed(2) : '—'}</p>
            <p className="text-teal-300 text-xs mt-1">{termCredits} {tr({ ar: 'ساعة', en: 'credits' })}</p>
            <div className="mt-4 pt-3 border-t border-teal-800">
              <p className="text-teal-200 text-sm">{tr({ ar: 'المعدل التراكمي', en: 'Cumulative GPA' })}</p>
              <p className={`font-display text-3xl font-bold mt-1 text-amber-300`}>{cumCredits ? cumGpa.toFixed(2) : '—'}</p>
            </div>
          </div>

          <div className="card">
            <h4 className="font-bold flex items-center gap-2 mb-2"><TrendingUp size={17} className="text-teal-700" /> {tr({ ar: 'التنبؤ بالمعدل', en: 'GPA Prediction' })}</h4>
            <p className="text-xs text-stone-500 mb-2">{tr({ ar: 'ما المعدل الفصلي المطلوب للوصول لهدفك؟ (أدخل المعدل السابق والساعات أولاً)', en: 'What term GPA do you need to hit your goal? (enter previous GPA & credits first)' })}</p>
            <input className="field" type="number" step="0.01" placeholder={tr({ ar: 'المعدل المستهدف', en: 'Target GPA' })} value={target} onChange={(e) => setTarget(e.target.value)} />
            {prediction !== null && (
              <div className="mt-3 text-sm">
                {prediction > max ? (
                  <p className="text-rose-600 font-semibold">{tr({ ar: `تحتاج ${prediction.toFixed(2)} — أعلى من الحد الأقصى، الهدف غير ممكن هذا الفصل`, en: `You'd need ${prediction.toFixed(2)} — above the max, not achievable this term` })}</p>
                ) : prediction <= 0 ? (
                  <p className="text-teal-700 font-semibold">{tr({ ar: 'هدفك محقق بالفعل 🎉', en: 'Goal already achieved 🎉' })}</p>
                ) : (
                  <p className="font-semibold">{tr({ ar: 'تحتاج معدل فصلي: ', en: 'Required term GPA: ' })}<span className={color(prediction)}>{prediction.toFixed(2)}</span></p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolPage>
  );
}
