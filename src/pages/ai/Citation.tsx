import { useState } from 'react';
import { Loader2, Copy, Check, Quote } from 'lucide-react';
import ToolPage from '../../components/ToolPage';
import AiNotice from '../../components/AiNotice';
import { callAI, parseAiJson } from '../../lib/ai';
import { useLang } from '../../lib/i18n';

const STYLES = ['APA 7', 'MLA 9', 'Harvard', 'IEEE'] as const;

export default function Citation() {
  const { tr } = useLang();
  const [type, setType] = useState<'book' | 'article' | 'website'>('article');
  const [f, setF] = useState({ authors: '', title: '', year: '', source: '', publisher: '', url: '', pages: '', volume: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [results, setResults] = useState<Record<string, string> | null>(null);
  const [copied, setCopied] = useState('');

  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  const generate = async () => {
    if (!f.title.trim() || !f.authors.trim()) { setError(new Error(tr({ ar: 'العنوان والمؤلف مطلوبان', en: 'Title & authors are required' }))); return; }
    setBusy(true); setError(null); setResults(null);
    try {
      const raw = await callAI({
        task: 'citation',
        json: true,
        system: 'You are a citation formatter. Return STRICT JSON: {"APA 7":"...","MLA 9":"...","Harvard":"...","IEEE":"..."}. Format each reference exactly per style rules, with correct italics markers omitted (plain text).',
        prompt: `Source type: ${type}\nAuthors: ${f.authors}\nTitle: ${f.title}\nYear: ${f.year}\n${type === 'article' ? `Journal: ${f.source}\nVolume: ${f.volume}\nPages: ${f.pages}` : ''}${type === 'book' ? `Publisher: ${f.publisher}` : ''}${type === 'website' ? `Website: ${f.source}\nURL: ${f.url}` : ''}`,
      });
      setResults(parseAiJson<Record<string, string>>(raw));
    } catch (e: any) { setError(e); }
    setBusy(false);
  };

  return (
    <ToolPage id="citation">
      <div className="card">
        <div className="flex gap-2 mb-4">
          {(['article', 'book', 'website'] as const).map((t) => (
            <button key={t} onClick={() => setType(t)} className={`px-4 py-1.5 rounded-xl text-sm font-bold border ${type === t ? 'bg-violet-600 text-white border-violet-600' : 'bg-white border-stone-300'}`}>
              {t === 'article' ? tr({ ar: 'مقال علمي', en: 'Journal article' }) : t === 'book' ? tr({ ar: 'كتاب', en: 'Book' }) : tr({ ar: 'موقع إلكتروني', en: 'Website' })}
            </button>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          <input className="field" placeholder={tr({ ar: 'المؤلفون (مثل: أحمد محمد، سارة علي) *', en: 'Authors (e.g. Smith J., Lee K.) *' })} value={f.authors} onChange={(e) => set('authors', e.target.value)} />
          <input className="field" placeholder={tr({ ar: 'العنوان *', en: 'Title *' })} value={f.title} onChange={(e) => set('title', e.target.value)} />
          <input className="field" placeholder={tr({ ar: 'سنة النشر', en: 'Year' })} value={f.year} onChange={(e) => set('year', e.target.value)} />
          {type === 'article' && <>
            <input className="field" placeholder={tr({ ar: 'اسم المجلة', en: 'Journal name' })} value={f.source} onChange={(e) => set('source', e.target.value)} />
            <input className="field" placeholder={tr({ ar: 'المجلد', en: 'Volume' })} value={f.volume} onChange={(e) => set('volume', e.target.value)} />
            <input className="field" placeholder={tr({ ar: 'الصفحات', en: 'Pages' })} value={f.pages} onChange={(e) => set('pages', e.target.value)} />
          </>}
          {type === 'book' && <input className="field" placeholder={tr({ ar: 'دار النشر', en: 'Publisher' })} value={f.publisher} onChange={(e) => set('publisher', e.target.value)} />}
          {type === 'website' && <>
            <input className="field" placeholder={tr({ ar: 'اسم الموقع', en: 'Website name' })} value={f.source} onChange={(e) => set('source', e.target.value)} />
            <input className="field" dir="ltr" placeholder="URL" value={f.url} onChange={(e) => set('url', e.target.value)} />
          </>}
        </div>
        <button className="btn mt-4" onClick={generate} disabled={busy}>
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Quote size={16} />} {tr({ ar: 'توليد المراجع بكل الأنماط', en: 'Generate all styles' })}
        </button>
      </div>
      <AiNotice error={error} />

      {results && (
        <div className="space-y-3 mt-5">
          {STYLES.map((s) => results[s] && (
            <div key={s} className="card !py-3">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-violet-600 bg-violet-50 rounded-full px-2.5 py-0.5">{s}</span>
                <button onClick={() => { navigator.clipboard.writeText(results[s]); setCopied(s); setTimeout(() => setCopied(''), 1500); }} className="text-stone-400 hover:text-violet-600">
                  {copied === s ? <Check size={15} /> : <Copy size={15} />}
                </button>
              </div>
              <p className="text-sm leading-relaxed" dir="ltr" style={{ textAlign: 'left' }}>{results[s]}</p>
            </div>
          ))}
        </div>
      )}
    </ToolPage>
  );
}
