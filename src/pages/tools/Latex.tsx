import { useMemo, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import ToolPage from '../../components/ToolPage';
import { useLang } from '../../lib/i18n';

const SNIPPETS: { label: string; code: string }[] = [
  { label: '½', code: '\\frac{a}{b}' },
  { label: '√', code: '\\sqrt{x}' },
  { label: 'x²', code: 'x^{2}' },
  { label: '∑', code: '\\sum_{i=1}^{n} i' },
  { label: '∫', code: '\\int_{a}^{b} f(x)\\,dx' },
  { label: 'lim', code: '\\lim_{x \\to \\infty}' },
  { label: 'αβ', code: '\\alpha \\beta \\gamma \\theta' },
  { label: 'matrix', code: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
  { label: 'cases', code: 'f(x) = \\begin{cases} 1 & x > 0 \\\\ 0 & x \\le 0 \\end{cases}' },
  { label: '≠ ≤ ≥', code: '\\neq \\leq \\geq \\approx' },
];

const DEFAULT = 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}';

export default function Latex() {
  const { tr } = useLang();
  const [code, setCode] = useState(DEFAULT);
  const [copied, setCopied] = useState(false);

  const html = useMemo(() => {
    try {
      return { ok: true, out: katex.renderToString(code, { displayMode: true, throwOnError: true }) };
    } catch (e: any) {
      return { ok: false, out: e.message as string };
    }
  }, [code]);

  return (
    <ToolPage id="latex" wide>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {SNIPPETS.map((s) => (
          <button key={s.label} onClick={() => setCode((c) => c + (c ? ' ' : '') + s.code)}
            className="text-sm bg-white border border-stone-200 rounded-lg px-2.5 py-1 hover:border-teal-600 hover:bg-teal-50 font-mono">
            {s.label}
          </button>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card !p-0 overflow-hidden">
          <div className="px-4 py-2 bg-stone-800 text-stone-300 text-xs font-mono flex justify-between items-center">
            <span>LaTeX</span>
            <button onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
              className="flex items-center gap-1 hover:text-white">
              {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? tr({ ar: 'تم النسخ', en: 'Copied' }) : tr({ ar: 'نسخ', en: 'Copy' })}
            </button>
          </div>
          <textarea dir="ltr" value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false}
            className="w-full h-72 p-4 font-mono text-sm bg-stone-900 text-emerald-200 resize-none" />
        </div>
        <div className="card min-h-72 flex flex-col">
          <p className="text-xs font-bold text-stone-400 mb-3">{tr({ ar: 'معاينة فورية', en: 'Live preview' })}</p>
          {html.ok ? (
            <div dir="ltr" className="flex-1 flex items-center justify-center text-xl overflow-x-auto" dangerouslySetInnerHTML={{ __html: html.out }} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-rose-500 text-sm font-mono" dir="ltr">{html.out}</div>
          )}
        </div>
      </div>
    </ToolPage>
  );
}
