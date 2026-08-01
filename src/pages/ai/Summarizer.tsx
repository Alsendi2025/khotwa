import { useRef, useState } from 'react';
import { Loader2, Send, FileText, Sparkles } from 'lucide-react';
import ToolPage from '../../components/ToolPage';
import AiNotice from '../../components/AiNotice';
import FileDrop from '../../components/FileDrop';
import { callAI } from '../../lib/ai';
import { extractPdfText } from '../../lib/pdf';
import { useLang } from '../../lib/i18n';

export default function Summarizer() {
  const { tr, lang } = useLang();
  const [docText, setDocText] = useState('');
  const [fileName, setFileName] = useState('');
  const [summary, setSummary] = useState('');
  const [busy, setBusy] = useState(false);
  const [qaBusy, setQaBusy] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [question, setQuestion] = useState('');
  const [qa, setQa] = useState<{ q: string; a: string }[]>([]);
  const qaEnd = useRef<HTMLDivElement>(null);

  const pick = async (fs: File[]) => {
    const f = fs[0];
    setError(null); setSummary(''); setQa([]);
    setBusy(true);
    try {
      let text = '';
      if (f.type === 'application/pdf') text = await extractPdfText(await f.arrayBuffer());
      else text = (await f.text()).slice(0, 16000);
      if (!text.trim()) throw new Error(tr({ ar: 'لم يُعثر على نص في الملف (ربما صور ممسوحة؟ جرب أداة OCR)', en: 'No text found (scanned images? try the OCR tool)' }));
      setDocText(text); setFileName(f.name);
      const s = await callAI({
        task: 'summarize',
        system: `You summarize academic documents. Respond in ${lang === 'ar' ? 'Arabic' : 'English'}. Output: a 2-3 sentence overview, then "•" bullet key points (5-8), then key terms. Be faithful to the document.`,
        prompt: `Summarize this document:\n\n${text}`,
      });
      setSummary(s);
    } catch (e: any) { setError(e); }
    setBusy(false);
  };

  const ask = async () => {
    const q = question.trim();
    if (!q || qaBusy) return;
    setQuestion(''); setError(null); setQaBusy(true);
    try {
      const a = await callAI({
        task: 'qa',
        system: `Answer questions ONLY from the provided document context. Respond in ${lang === 'ar' ? 'Arabic' : 'English'}. If the answer isn't in the document, say so.`,
        prompt: `Document:\n${docText}\n\nQuestion: ${q}`,
      });
      setQa((p) => [...p, { q, a }]);
      setTimeout(() => qaEnd.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (e: any) { setError(e); setQuestion(q); }
    setQaBusy(false);
  };

  return (
    <ToolPage id="summarizer" wide>
      {!docText && !busy && <FileDrop accept="application/pdf,.txt,.md" onFiles={pick} label={tr({ ar: 'ارفع PDF أو ملف نصي', en: 'Upload a PDF or text file' })} />}
      {busy && !summary && (
        <div className="card flex items-center justify-center gap-3 py-14 text-teal-800">
          <Loader2 className="animate-spin" size={26} /> {tr({ ar: 'جاري استخراج النص والتلخيص...', en: 'Extracting & summarizing...' })}
        </div>
      )}
      <AiNotice error={error} />

      {summary && (
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold flex items-center gap-2"><Sparkles size={17} className="text-amber-500" /> {tr({ ar: 'الملخص', en: 'Summary' })}</h3>
              <span className="text-xs text-stone-400 flex items-center gap-1" dir="ltr"><FileText size={13} /> {fileName}</span>
            </div>
            <div className="text-sm leading-relaxed whitespace-pre-wrap">{summary}</div>
            <button className="text-sm text-stone-500 underline mt-4" onClick={() => { setDocText(''); setSummary(''); setQa([]); }}>{tr({ ar: 'مستند آخر', en: 'Another document' })}</button>
          </div>

          <div className="card flex flex-col">
            <h3 className="font-bold mb-3">{tr({ ar: 'اسأل عن المستند', en: 'Ask about the document' })}</h3>
            <div className="flex-1 space-y-3 overflow-y-auto mb-3" style={{ maxHeight: 380 }}>
              {qa.length === 0 && <p className="text-sm text-stone-400">{tr({ ar: 'مثال: ما المنهجية المستخدمة؟ ما أهم النتائج؟', en: 'e.g. What methodology was used? Key findings?' })}</p>}
              {qa.map((x, i) => (
                <div key={i}>
                  <p className="text-sm font-bold text-teal-900 bg-teal-50 rounded-xl px-3 py-2">{x.q}</p>
                  <p className="text-sm mt-1.5 px-3 whitespace-pre-wrap leading-relaxed">{x.a}</p>
                </div>
              ))}
              {qaBusy && <Loader2 size={18} className="animate-spin text-teal-700" />}
              <div ref={qaEnd} />
            </div>
            <div className="flex gap-2">
              <input className="field flex-1" value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && ask()}
                placeholder={tr({ ar: 'سؤالك عن المحتوى...', en: 'Your question...' })} />
              <button className="btn !px-4" onClick={ask} disabled={qaBusy || !question.trim()}><Send size={17} /></button>
            </div>
          </div>
        </div>
      )}
    </ToolPage>
  );
}
