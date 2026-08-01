import { useState } from 'react';
import { Loader2, Copy, Check, Wand2 } from 'lucide-react';
import ToolPage from '../../components/ToolPage';
import AiNotice from '../../components/AiNotice';
import { callAI } from '../../lib/ai';
import { useLang } from '../../lib/i18n';

type Action = 'proofread' | 'rephrase' | 'formal' | 'expand' | 'shorten';

export default function Writing() {
  const { tr, lang } = useLang();
  const [text, setText] = useState('');
  const [out, setOut] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [copied, setCopied] = useState(false);
  const [action, setAction] = useState<Action>('proofread');

  const ACTIONS: { id: Action; label: { ar: string; en: string }; inst: string }[] = [
    { id: 'proofread', label: { ar: 'تدقيق لغوي', en: 'Proofread' }, inst: 'Proofread and correct grammar, spelling, and punctuation. Keep the meaning and language identical. After the corrected text, add a short bullet list of what was fixed.' },
    { id: 'rephrase', label: { ar: 'إعادة صياغة', en: 'Rephrase' }, inst: 'Rephrase in clear academic style while preserving meaning and language.' },
    { id: 'formal', label: { ar: 'أسلوب أكاديمي رسمي', en: 'Make formal' }, inst: 'Rewrite in a formal academic tone suitable for a thesis, same language.' },
    { id: 'expand', label: { ar: 'توسيع', en: 'Expand' }, inst: 'Expand with more detail and supporting sentences, same language and style.' },
    { id: 'shorten', label: { ar: 'تلخيص', en: 'Shorten' }, inst: 'Condense to roughly half the length keeping all key ideas, same language.' },
  ];

  const run = async () => {
    if (text.trim().length < 10) { setError(new Error(tr({ ar: 'أدخل نصاً أطول', en: 'Enter longer text' }))); return; }
    setBusy(true); setError(null); setOut('');
    try {
      const a = ACTIONS.find((x) => x.id === action)!;
      const result = await callAI({
        task: 'writing',
        system: `You are an academic writing assistant for Arabic and English. ${a.inst} Output only the result (and the fix list if proofreading), no preamble. Respond primarily in the same language as the input text; UI language is ${lang}.`,
        prompt: text.slice(0, 12000),
      });
      setOut(result);
    } catch (e: any) { setError(e); }
    setBusy(false);
  };

  return (
    <ToolPage id="writing" wide>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {ACTIONS.map((a) => (
          <button key={a.id} onClick={() => setAction(a.id)}
            className={`px-3.5 py-1.5 rounded-xl text-sm font-bold border ${action === a.id ? 'bg-violet-600 text-white border-violet-600' : 'bg-white border-stone-300 hover:border-violet-400'}`}>
            {tr(a.label)}
          </button>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card flex flex-col">
          <p className="text-xs font-bold text-stone-400 mb-2">{tr({ ar: 'النص الأصلي', en: 'Original text' })} ({text.length})</p>
          <textarea className="flex-1 min-h-72 w-full rounded-xl border border-stone-200 p-3 text-sm leading-relaxed resize-none" value={text} onChange={(e) => setText(e.target.value)}
            placeholder={tr({ ar: 'الصق فقرتك أو مقدمة بحثك هنا...', en: 'Paste your paragraph or research intro here...' })} />
          <button className="btn mt-3" onClick={run} disabled={busy}>
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />} {tr({ ar: 'تحسين النص', en: 'Improve text' })}
          </button>
        </div>
        <div className="card flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-bold text-stone-400">{tr({ ar: 'النتيجة', en: 'Result' })}</p>
            <button disabled={!out} onClick={() => { navigator.clipboard.writeText(out); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="btn-soft !py-1 !px-2.5">
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
          <div className="flex-1 min-h-72 rounded-xl bg-stone-50 border border-stone-100 p-3 text-sm leading-relaxed whitespace-pre-wrap overflow-y-auto">
            {busy ? <Loader2 size={20} className="animate-spin text-violet-600 mt-2" /> : out || <span className="text-stone-300">{tr({ ar: 'ستظهر النتيجة هنا...', en: 'Result appears here...' })}</span>}
          </div>
        </div>
      </div>
      <AiNotice error={error} />
    </ToolPage>
  );
}
