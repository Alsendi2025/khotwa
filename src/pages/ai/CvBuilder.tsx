import { useState } from 'react';
import { Loader2, Download, Briefcase, Mail } from 'lucide-react';
import ToolPage from '../../components/ToolPage';
import AiNotice from '../../components/AiNotice';
import { callAI } from '../../lib/ai';
import { textToPdf } from '../../lib/pdf';
import { useLang } from '../../lib/i18n';

export default function CvBuilder() {
  const { tr, lang } = useLang();
  const [tab, setTab] = useState<'cv' | 'letter'>('cv');
  const [f, setF] = useState({ name: '', email: '', phone: '', education: '', skills: '', experience: '', target: '', program: '', motivation: '' });
  const [out, setOut] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [exporting, setExporting] = useState(false);

  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  const generate = async () => {
    if (!f.name.trim()) { setError(new Error(tr({ ar: 'الاسم مطلوب', en: 'Name is required' }))); return; }
    setBusy(true); setError(null); setOut('');
    try {
      const isCv = tab === 'cv';
      const text = await callAI({
        task: 'cv',
        system: `You write professional ${isCv ? 'student CVs/resumes' : 'motivation letters'} in ${lang === 'ar' ? 'Arabic' : 'English'}. Output PLAIN TEXT only. Use "## " prefix for section headings. No markdown besides that. Be concise, achievement-oriented, and professional. Improve and polish the raw input.`,
        prompt: isCv
          ? `Create a one-page CV.\nName: ${f.name}\nEmail: ${f.email}\nPhone: ${f.phone}\nTarget role/field: ${f.target}\nEducation: ${f.education}\nSkills: ${f.skills}\nExperience/Projects: ${f.experience}`
          : `Write a motivation letter.\nApplicant: ${f.name}\nApplying to: ${f.program}\nBackground: ${f.education}\nWhy applying / motivation notes: ${f.motivation}\nSkills: ${f.skills}`,
      });
      setOut(text);
    } catch (e: any) { setError(e); }
    setBusy(false);
  };

  const exportPdf = async () => {
    setExporting(true);
    const rtl = /[\u0600-\u06FF]/.test(out);
    await textToPdf(f.name, out, rtl, tab === 'cv' ? 'khotwa-cv.pdf' : 'khotwa-letter.pdf');
    setExporting(false);
  };

  return (
    <ToolPage id="cv" wide>
      <div className="flex gap-2 mb-5">
        <button onClick={() => { setTab('cv'); setOut(''); }} className={`px-4 py-2 rounded-xl text-sm font-bold border flex items-center gap-2 ${tab === 'cv' ? 'bg-violet-600 text-white border-violet-600' : 'bg-white border-stone-300'}`}>
          <Briefcase size={16} /> {tr({ ar: 'سيرة ذاتية', en: 'CV / Resume' })}
        </button>
        <button onClick={() => { setTab('letter'); setOut(''); }} className={`px-4 py-2 rounded-xl text-sm font-bold border flex items-center gap-2 ${tab === 'letter' ? 'bg-violet-600 text-white border-violet-600' : 'bg-white border-stone-300'}`}>
          <Mail size={16} /> {tr({ ar: 'رسالة دافع', en: 'Motivation letter' })}
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card space-y-2">
          <input className="field" placeholder={tr({ ar: 'الاسم الكامل *', en: 'Full name *' })} value={f.name} onChange={(e) => set('name', e.target.value)} />
          {tab === 'cv' ? (
            <>
              <div className="grid grid-cols-2 gap-2">
                <input className="field" type="email" placeholder={tr({ ar: 'البريد', en: 'Email' })} value={f.email} onChange={(e) => set('email', e.target.value)} />
                <input className="field" placeholder={tr({ ar: 'الهاتف', en: 'Phone' })} value={f.phone} onChange={(e) => set('phone', e.target.value)} />
              </div>
              <input className="field" placeholder={tr({ ar: 'الوظيفة/المجال المستهدف', en: 'Target role / field' })} value={f.target} onChange={(e) => set('target', e.target.value)} />
              <textarea className="field min-h-20" placeholder={tr({ ar: 'التعليم (الجامعة، التخصص، السنوات...)', en: 'Education (university, major, years...)' })} value={f.education} onChange={(e) => set('education', e.target.value)} />
              <textarea className="field min-h-16" placeholder={tr({ ar: 'المهارات (افصل بفاصلة)', en: 'Skills (comma-separated)' })} value={f.skills} onChange={(e) => set('skills', e.target.value)} />
              <textarea className="field min-h-24" placeholder={tr({ ar: 'الخبرات والمشاريع', en: 'Experience & projects' })} value={f.experience} onChange={(e) => set('experience', e.target.value)} />
            </>
          ) : (
            <>
              <input className="field" placeholder={tr({ ar: 'البرنامج/المنحة/الجامعة المتقدم لها', en: 'Program / scholarship / university' })} value={f.program} onChange={(e) => set('program', e.target.value)} />
              <textarea className="field min-h-20" placeholder={tr({ ar: 'خلفيتك الدراسية', en: 'Your academic background' })} value={f.education} onChange={(e) => set('education', e.target.value)} />
              <textarea className="field min-h-16" placeholder={tr({ ar: 'مهاراتك', en: 'Your skills' })} value={f.skills} onChange={(e) => set('skills', e.target.value)} />
              <textarea className="field min-h-24" placeholder={tr({ ar: 'لماذا تتقدم؟ نقاط دافعك الخام', en: 'Why are you applying? Raw motivation notes' })} value={f.motivation} onChange={(e) => set('motivation', e.target.value)} />
            </>
          )}
          <button className="btn w-full" onClick={generate} disabled={busy}>
            {busy ? <Loader2 size={16} className="animate-spin" /> : null} {tr({ ar: 'توليد بالذكاء الاصطناعي', en: 'Generate with AI' })}
          </button>
        </div>

        <div className="card flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-bold text-stone-400">{tr({ ar: 'المعاينة (قابلة للتعديل)', en: 'Preview (editable)' })}</p>
            <button className="btn-soft !py-1" disabled={!out || exporting} onClick={exportPdf}>
              {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} {tr({ ar: 'تصدير PDF', en: 'Export PDF' })}
            </button>
          </div>
          <textarea className="flex-1 min-h-96 w-full rounded-xl bg-stone-50 border border-stone-100 p-4 text-sm leading-relaxed resize-none" value={out} onChange={(e) => setOut(e.target.value)}
            placeholder={tr({ ar: 'ستظهر النتيجة هنا ويمكنك تعديلها قبل التصدير...', en: 'Result appears here — edit freely before exporting...' })} />
        </div>
      </div>
      <AiNotice error={error} />
    </ToolPage>
  );
}
