import { useRef, useState } from 'react';
import { Send, Loader2, GraduationCap, User } from 'lucide-react';
import ToolPage from '../../components/ToolPage';
import AiNotice from '../../components/AiNotice';
import { callAI } from '../../lib/ai';
import { useLang } from '../../lib/i18n';

type Msg = { role: 'user' | 'ai'; text: string };

export default function Tutor() {
  const { tr, lang } = useLang();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [level, setLevel] = useState('university');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const send = async () => {
    const q = input.trim();
    if (!q || busy) return;
    setInput(''); setError(null);
    const hist = [...msgs, { role: 'user' as const, text: q }];
    setMsgs(hist);
    setBusy(true);
    try {
      const context = hist.slice(-6).map((m) => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.text}`).join('\n');
      const text = await callAI({
        task: 'tutor',
        system: `You are Khotwa's AI tutor. Explain concepts step-by-step, simply and interactively for a ${level} student. Respond in ${lang === 'ar' ? 'Arabic' : 'English'}. Use numbered steps, simple analogies, and end with one short check-understanding question. Keep it concise.`,
        prompt: context,
      });
      setMsgs((m) => [...m, { role: 'ai', text }]);
    } catch (e: any) { setError(e); setMsgs((m) => m.slice(0, -1)); setInput(q); }
    setBusy(false);
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  return (
    <ToolPage id="ai-tutor">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-bold text-stone-600">{tr({ ar: 'المستوى:', en: 'Level:' })}</span>
        <select className="field !w-auto" value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="middle school">{tr({ ar: 'متوسط', en: 'Middle school' })}</option>
          <option value="high school">{tr({ ar: 'ثانوي', en: 'High school' })}</option>
          <option value="university">{tr({ ar: 'جامعي', en: 'University' })}</option>
          <option value="graduate">{tr({ ar: 'دراسات عليا', en: 'Graduate' })}</option>
        </select>
      </div>

      <div className="card !p-0 overflow-hidden flex flex-col" style={{ minHeight: 420 }}>
        <div className="flex-1 p-4 space-y-4 overflow-y-auto" style={{ maxHeight: 480 }}>
          {msgs.length === 0 && (
            <div className="text-center py-14 text-stone-400">
              <GraduationCap size={40} className="mx-auto mb-3 text-teal-300" />
              <p className="text-sm">{tr({ ar: 'اسأل عن أي مفهوم: التكامل، البرمجة، الفيزياء، الاقتصاد...', en: 'Ask about any concept: calculus, coding, physics, economics...' })}</p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {[{ ar: 'اشرح لي التفاضل ببساطة', en: 'Explain derivatives simply' }, { ar: 'ما هو الـ recursion؟', en: 'What is recursion?' }, { ar: 'قانون نيوتن الثاني', en: "Newton's 2nd law" }].map((s, i) => (
                  <button key={i} onClick={() => setInput(tr(s))} className="text-xs bg-teal-50 text-teal-800 border border-teal-200 rounded-full px-3 py-1.5 hover:bg-teal-100">{tr(s)}</button>
                ))}
              </div>
            </div>
          )}
          {msgs.map((m, i) => (
            <div key={i} className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'ai' ? 'bg-teal-800 text-amber-300' : 'bg-stone-200 text-stone-600'}`}>
                {m.role === 'ai' ? <GraduationCap size={16} /> : <User size={16} />}
              </span>
              <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap max-w-[85%] ${m.role === 'ai' ? 'bg-stone-100' : 'bg-teal-800 text-white'}`}>{m.text}</div>
            </div>
          ))}
          {busy && <div className="flex gap-2.5"><span className="w-8 h-8 rounded-full bg-teal-800 text-amber-300 flex items-center justify-center"><GraduationCap size={16} /></span><div className="rounded-2xl px-4 py-3 bg-stone-100"><Loader2 size={16} className="animate-spin text-teal-700" /></div></div>}
          <div ref={endRef} />
        </div>
        <div className="border-t border-stone-100 p-3 flex gap-2">
          <input className="field flex-1" placeholder={tr({ ar: 'اكتب سؤالك...', en: 'Type your question...' })}
            value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} />
          <button className="btn !px-4" onClick={send} disabled={busy || !input.trim()}><Send size={17} /></button>
        </div>
      </div>
      <AiNotice error={error} />
    </ToolPage>
  );
}
