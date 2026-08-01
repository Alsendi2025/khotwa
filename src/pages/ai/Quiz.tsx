import { useState } from 'react';
import { Loader2, ListChecks, Layers3, RotateCw, Check, X } from 'lucide-react';
import ToolPage from '../../components/ToolPage';
import AiNotice from '../../components/AiNotice';
import { callAI, parseAiJson } from '../../lib/ai';
import { useLang } from '../../lib/i18n';

type Mcq = { question: string; options: string[]; answer: number; explanation: string };
type Card = { front: string; back: string };

export default function Quiz() {
  const { tr, lang } = useLang();
  const [text, setText] = useState('');
  const [mode, setMode] = useState<'quiz' | 'cards'>('quiz');
  const [count, setCount] = useState(5);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [mcqs, setMcqs] = useState<Mcq[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});

  const generate = async () => {
    if (text.trim().length < 30) { setError(new Error(tr({ ar: 'أدخل نصاً أطول (30 حرفاً على الأقل)', en: 'Enter longer text (min 30 chars)' }))); return; }
    setBusy(true); setError(null); setMcqs([]); setCards([]); setAnswers({}); setFlipped({});
    try {
      if (mode === 'quiz') {
        const raw = await callAI({
          task: 'quiz',
          json: true,
          system: `Generate multiple-choice questions from study material. Language: ${lang === 'ar' ? 'Arabic' : 'English'}. Return STRICT JSON: {"questions":[{"question":"...","options":["a","b","c","d"],"answer":0,"explanation":"..."}]}. answer is the 0-based index.`,
          prompt: `Create ${count} MCQs from:\n${text.slice(0, 10000)}`,
        });
        const data = parseAiJson<{ questions: Mcq[] }>(raw);
        setMcqs(data.questions || []);
      } else {
        const raw = await callAI({
          task: 'flashcards',
          json: true,
          system: `Generate study flashcards. Language: ${lang === 'ar' ? 'Arabic' : 'English'}. Return STRICT JSON: {"cards":[{"front":"term/question","back":"definition/answer"}]}.`,
          prompt: `Create ${count} flashcards from:\n${text.slice(0, 10000)}`,
        });
        const data = parseAiJson<{ cards: Card[] }>(raw);
        setCards(data.cards || []);
      }
    } catch (e: any) { setError(e); }
    setBusy(false);
  };

  const score = mcqs.length ? mcqs.filter((m, i) => answers[i] === m.answer).length : 0;
  const answered = Object.keys(answers).length;

  return (
    <ToolPage id="quiz" wide>
      <div className="card mb-5">
        <textarea className="w-full min-h-32 rounded-xl border border-stone-300 p-3 text-sm" value={text} onChange={(e) => setText(e.target.value)}
          placeholder={tr({ ar: 'الصق محتوى الدرس أو الملزمة هنا...', en: 'Paste your lesson or study material here...' })} />
        <div className="flex flex-wrap items-center gap-3 mt-3">
          <div className="flex gap-1.5">
            <button onClick={() => setMode('quiz')} className={`px-3.5 py-1.5 rounded-xl text-sm font-bold border flex items-center gap-1.5 ${mode === 'quiz' ? 'bg-violet-600 text-white border-violet-600' : 'bg-white border-stone-300'}`}><ListChecks size={15} /> {tr({ ar: 'اختبار', en: 'Quiz' })}</button>
            <button onClick={() => setMode('cards')} className={`px-3.5 py-1.5 rounded-xl text-sm font-bold border flex items-center gap-1.5 ${mode === 'cards' ? 'bg-violet-600 text-white border-violet-600' : 'bg-white border-stone-300'}`}><Layers3 size={15} /> {tr({ ar: 'بطاقات', en: 'Flashcards' })}</button>
          </div>
          <select className="field !w-auto" value={count} onChange={(e) => setCount(+e.target.value)}>
            {[3, 5, 8, 10].map((n) => <option key={n} value={n}>{n} {tr({ ar: 'أسئلة/بطاقات', en: 'items' })}</option>)}
          </select>
          <button className="btn" onClick={generate} disabled={busy}>
            {busy ? <Loader2 size={16} className="animate-spin" /> : null} {tr({ ar: 'توليد', en: 'Generate' })}
          </button>
        </div>
      </div>
      <AiNotice error={error} />

      {mcqs.length > 0 && (
        <div className="space-y-4">
          {answered === mcqs.length && (
            <div className="card !bg-violet-600 !border-violet-600 text-white text-center font-display text-xl font-bold">
              {tr({ ar: `نتيجتك: ${score} / ${mcqs.length}`, en: `Score: ${score} / ${mcqs.length}` })} {score === mcqs.length ? '🏆' : score >= mcqs.length / 2 ? '👏' : '💪'}
            </div>
          )}
          {mcqs.map((m, i) => {
            const picked = answers[i];
            return (
              <div key={i} className="card">
                <p className="font-bold mb-3"><span className="text-violet-600">{i + 1}.</span> {m.question}</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {m.options.map((o, oi) => {
                    const isPicked = picked === oi, isRight = m.answer === oi, revealed = picked !== undefined;
                    return (
                      <button key={oi} disabled={revealed} onClick={() => setAnswers((a) => ({ ...a, [i]: oi }))}
                        className={`text-start text-sm rounded-xl border-2 px-3 py-2.5 transition-all flex items-center gap-2 ${
                          revealed && isRight ? 'border-teal-500 bg-teal-50' :
                          revealed && isPicked ? 'border-rose-400 bg-rose-50' :
                          'border-stone-200 hover:border-violet-400 disabled:opacity-60'
                        }`}>
                        {revealed && isRight && <Check size={15} className="text-teal-600 shrink-0" />}
                        {revealed && isPicked && !isRight && <X size={15} className="text-rose-500 shrink-0" />}
                        {o}
                      </button>
                    );
                  })}
                </div>
                {picked !== undefined && <p className="text-xs text-stone-500 mt-3 bg-stone-50 rounded-xl p-2.5">{m.explanation}</p>}
              </div>
            );
          })}
        </div>
      )}

      {cards.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c, i) => (
            <button key={i} onClick={() => setFlipped((f) => ({ ...f, [i]: !f[i] }))}
              className={`rounded-2xl border-2 p-5 min-h-36 flex flex-col items-center justify-center text-center transition-all ${flipped[i] ? 'bg-violet-600 border-violet-600 text-white' : 'bg-white border-violet-200 hover:border-violet-400'}`}>
              <p className="text-sm font-semibold leading-relaxed">{flipped[i] ? c.back : c.front}</p>
              <span className={`text-[10px] mt-3 flex items-center gap-1 ${flipped[i] ? 'text-violet-200' : 'text-stone-400'}`}><RotateCw size={11} /> {tr({ ar: 'انقر للقلب', en: 'Tap to flip' })}</span>
            </button>
          ))}
        </div>
      )}
    </ToolPage>
  );
}
