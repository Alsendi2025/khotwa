import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Keyboard, ChevronDown, ChevronUp, Wand2, ListOrdered, Spline, Sigma,
  Loader2, Download, ZoomIn, ZoomOut, Maximize, Target, Equal, Sparkles,
} from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import ToolPage from '../../components/ToolPage';
import AiNotice from '../../components/AiNotice';
import { useLang } from '../../lib/i18n';
import { analyzeLocal, aiSteps } from '../../lib/mathEngine';
import type { StepsResponse } from '../../lib/mathEngine';
import { toEasternDigits, toArabicExpr } from '../../lib/mathArabic';

/* ==================== لوحة الرموز الرياضية ==================== */

type KeyDef = { label: string; insert: string; tex?: string };
const KEY_TABS: { id: string; ar: string; en: string; keys: KeyDef[] }[] = [
  {
    id: 'basic', ar: 'أساسي', en: 'Basic',
    keys: [
      { label: '٧', insert: '7' }, { label: '٨', insert: '8' }, { label: '٩', insert: '9' }, { label: '÷', insert: '/' },
      { label: '٤', insert: '4' }, { label: '٥', insert: '5' }, { label: '٦', insert: '6' }, { label: '×', insert: '*' },
      { label: '١', insert: '1' }, { label: '٢', insert: '2' }, { label: '٣', insert: '3' }, { label: '−', insert: '-' },
      { label: '٠', insert: '0' }, { label: '.', insert: '.' }, { label: '=', insert: ' = ' }, { label: '+', insert: '+' },
      { label: '(', insert: '(' }, { label: ')', insert: ')' },
    ],
  },
  {
    id: 'algebra', ar: 'جبر', en: 'Algebra',
    keys: [
      { label: 'س', insert: 'x' }, { label: 'ص', insert: 'y' }, { label: 'ع', insert: 'z' },
      { label: 'س²', insert: 'x^2' }, { label: 'س³', insert: 'x^3' }, { label: 'سⁿ', insert: 'x^' },
      { label: '√', insert: 'sqrt(' }, { label: '∛', insert: 'cbrt(' },
      { label: '|س|', insert: 'abs(x)' }, { label: 'كسر', insert: '()/()' },
    ],
  },
  {
    id: 'calculus', ar: 'تفاضل وتكامل', en: 'Calculus',
    keys: [
      { label: 'd/dx', insert: 'derivative(' }, { label: '∫', insert: 'integral ' },
      { label: 'eˣ', insert: 'e^x' }, { label: 'ln', insert: 'log(' },
      { label: 'log₁₀', insert: 'log10(' }, { label: 'نهاية', insert: 'limit ' },
    ],
  },
  {
    id: 'symbols', ar: 'رموز ودوال', en: 'Symbols',
    keys: [
      { label: 'جا', insert: 'sin(' }, { label: 'جتا', insert: 'cos(' }, { label: 'ظا', insert: 'tan(' },
      { label: 'sin⁻¹', insert: 'asin(' }, { label: 'cos⁻¹', insert: 'acos(' }, { label: 'tan⁻¹', insert: 'atan(' },
      { label: 'π', insert: 'pi' }, { label: 'θ', insert: 'theta' }, { label: 'e', insert: 'e' }, { label: '∞', insert: 'Infinity' },
    ],
  },
];

/* ==================== معرض الأمثلة ==================== */

const PRESETS: { cat: { ar: string; en: string }; items: { label: string; expr: string }[] }[] = [
  { cat: { ar: 'خطية', en: 'Linear' }, items: [
    { label: '٢س + ٥ = ١١', expr: '2x + 5 = 11' },
    { label: '٣س − ٧ = س + ١', expr: '3x - 7 = x + 1' },
  ]},
  { cat: { ar: 'تربيعية', en: 'Quadratic' }, items: [
    { label: 'س² − ٤س + ٤ = ٠', expr: 'x^2 - 4x + 4 = 0' },
    { label: 'س² − س − ٦ = ٠', expr: 'x^2 - x - 6 = 0' },
  ]},
  { cat: { ar: 'دوال ورسم', en: 'Functions' }, items: [
    { label: 'جا(س) × س', expr: 'sin(x) * x' },
    { label: 'س³ − ٣س', expr: 'x^3 - 3x' },
    { label: 'eˣ ÷ (١+eˣ)', expr: 'e^x / (1 + e^x)' },
  ]},
  { cat: { ar: 'تفاضل وتكامل', en: 'Calculus' }, items: [
    { label: '٣س² + ٢س', expr: '3x^2 + 2x' },
    { label: 'س × جتا(س)', expr: 'x * cos(x)' },
  ]},
];

/* ==================== مساعدات العرض ==================== */

function Tex({ tex, block, eastern }: { tex: string; block?: boolean; eastern?: boolean }) {
  const html = useMemo(() => {
    try {
      let t = tex;
      if (eastern) t = toEasternDigits(t);
      return katex.renderToString(t, { displayMode: !!block, throwOnError: false });
    } catch { return tex; }
  }, [tex, block, eastern]);
  return <span dir="ltr" className="katex-holder overflow-x-auto max-w-full inline-block align-middle" dangerouslySetInnerHTML={{ __html: html }} />;
}

function StepsView({ data, eastern }: { data: StepsResponse; eastern: boolean }) {
  return (
    <div className="space-y-2.5">
      {data.title && <p className="font-bold text-sm text-teal-900">{eastern ? toEasternDigits(data.title) : data.title}</p>}
      <ol className="space-y-2">
        {data.steps?.map((s, i) => (
          <li key={i} className="flex gap-2.5 items-start bg-stone-50 rounded-xl p-3">
            <span className="w-6 h-6 rounded-full bg-teal-800 text-amber-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              {eastern ? toEasternDigits(String(i + 1)) : i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-stone-600 mb-1">{s.rule}</p>
              <Tex tex={s.expr} eastern={eastern} />
            </div>
          </li>
        ))}
      </ol>
      {(data.resultTex || data.result) && (
        <div className="rounded-xl bg-teal-900 text-white p-3.5 flex items-center gap-3 flex-wrap">
          <span className="text-xs font-bold text-amber-300 shrink-0">الناتج النهائي</span>
          <span className="[&_.katex]:text-white text-lg">
            {data.resultTex ? <Tex tex={data.resultTex} eastern={eastern} /> : <span dir="ltr">{data.result}</span>}
          </span>
        </div>
      )}
      {data.note && <p className="text-xs text-stone-500 bg-amber-50 border border-amber-100 rounded-xl p-2.5">💡 {data.note}</p>}
    </div>
  );
}

/* ==================== المكوّن الرئيسي ==================== */

type SectionState = { loading: boolean; data: StepsResponse | null; error: Error | null };
const emptySection: SectionState = { loading: false, data: null, error: null };

export default function MathSolver() {
  const { tr, lang } = useLang();
  const [expr, setExpr] = useState('x^2 - 4x + 4 = 0');
  const [eastern, setEastern] = useState(lang === 'ar');
  const [kbOpen, setKbOpen] = useState(false);
  const [kbTab, setKbTab] = useState('basic');
  const inputRef = useRef<HTMLInputElement>(null);

  const [simplify, setSimplify] = useState<SectionState>(emptySection);
  const [solve, setSolve] = useState<SectionState>(emptySection);
  const [deriv, setDeriv] = useState<SectionState>(emptySection);
  const [integ, setInteg] = useState<SectionState>(emptySection);
  const [intFrom, setIntFrom] = useState('');
  const [intTo, setIntTo] = useState('');

  const local = useMemo(() => analyzeLocal(expr), [expr]);

  // إدراج رمز من اللوحة عند موضع المؤشر
  const insertAtCursor = (text: string) => {
    const el = inputRef.current;
    if (!el) { setExpr((e) => e + text); return; }
    const start = el.selectionStart ?? expr.length;
    const end = el.selectionEnd ?? expr.length;
    const next = expr.slice(0, start) + text + expr.slice(end);
    setExpr(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + text.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const loadPreset = (e: string) => {
    setExpr(e);
    setSimplify(emptySection); setSolve(emptySection); setDeriv(emptySection); setInteg(emptySection);
  };

  const runAi = async (kind: 'simplify' | 'solve' | 'derivative' | 'integral', setter: (s: SectionState) => void, opts?: { from?: string; to?: string; order?: 1 | 2 }) => {
    if (!local.ok) return;
    setter({ loading: true, data: null, error: null });
    try {
      const data = await aiSteps(kind, local.normalized, opts);
      setter({ loading: false, data, error: null });
    } catch (e) {
      setter({ loading: false, data: null, error: e as Error });
    }
  };

  /* ==================== الرسم البياني التفاعلي ==================== */
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [viewBox, setViewBox] = useState({ cx: 0, cy: 0, scale: 40 }); // scale = بكسل لكل وحدة
  const dragRef = useRef<{ x: number; y: number; cx: number; cy: number } | null>(null);

  const drawGraph = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = rect.width * dpr;
    c.height = rect.height * dpr;
    const ctx = c.getContext('2d')!;
    ctx.scale(dpr, dpr);
    const W = rect.width, H = rect.height;
    const { cx, cy, scale } = viewBox;

    const px = (x: number) => W / 2 + (x - cx) * scale;
    const py = (y: number) => H / 2 - (y - cy) * scale;
    const xAt = (p: number) => cx + (p - W / 2) / scale;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    // الشبكة
    const step = niceStep(scale);
    ctx.strokeStyle = '#eef0ea'; ctx.lineWidth = 1;
    ctx.fillStyle = '#a8a29e'; ctx.font = '10px Rubik, sans-serif';
    const xMin = xAt(0), xMax = xAt(W);
    for (let gx = Math.ceil(xMin / step) * step; gx <= xMax; gx += step) {
      ctx.beginPath(); ctx.moveTo(px(gx), 0); ctx.lineTo(px(gx), H); ctx.stroke();
      if (Math.abs(gx) > 1e-9) {
        const label = eastern ? toEasternDigits(fmtNum(gx)) : fmtNum(gx);
        ctx.textAlign = 'center';
        ctx.fillText(label, px(gx), Math.min(Math.max(py(0) + 13, 12), H - 4));
      }
    }
    const yMin = cy - H / 2 / scale, yMax = cy + H / 2 / scale;
    for (let gy = Math.ceil(yMin / step) * step; gy <= yMax; gy += step) {
      ctx.beginPath(); ctx.moveTo(0, py(gy)); ctx.lineTo(W, py(gy)); ctx.stroke();
      if (Math.abs(gy) > 1e-9) {
        const label = eastern ? toEasternDigits(fmtNum(gy)) : fmtNum(gy);
        ctx.textAlign = 'left';
        ctx.fillText(label, Math.min(Math.max(px(0) + 5, 4), W - 26), py(gy) + 3);
      }
    }

    // المحاور
    ctx.strokeStyle = '#78716c'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, py(0)); ctx.lineTo(W, py(0)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px(0), 0); ctx.lineTo(px(0), H); ctx.stroke();
    ctx.fillStyle = '#57534e'; ctx.font = 'bold 12px Rubik, sans-serif';
    ctx.fillText(lang === 'ar' ? 'س' : 'x', W - 14, py(0) - 6);
    ctx.fillText(lang === 'ar' ? 'ص' : 'y', px(0) + 6, 14);

    if (!local.ok || !local.compiled) return;

    // المنحنى
    ctx.strokeStyle = '#0d6e63'; ctx.lineWidth = 2.5;
    ctx.beginPath();
    let started = false;
    let prevY: number | null = null;
    for (let p = 0; p <= W; p += 1) {
      const x = xAt(p);
      let y: number | null = null;
      try {
        const v = local.compiled.evaluate({ x });
        if (typeof v === 'number' && isFinite(v)) y = v;
      } catch { /* skip */ }
      if (y === null || (prevY !== null && Math.abs(y - prevY) > (H / scale) * 3)) {
        started = false;
      } else if (!started) {
        ctx.moveTo(p, py(y)); started = true;
      } else {
        ctx.lineTo(p, py(y));
      }
      prevY = y;
    }
    ctx.stroke();

    // النقاط المميزة
    const dot = (x: number, y: number, color: string, label: string) => {
      const sx = px(x), sy = py(y);
      if (sx < -20 || sx > W + 20 || sy < -20 || sy > H + 20) return;
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(sx, sy, 5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = '#44403c'; ctx.font = 'bold 10px Rubik, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(eastern ? toEasternDigits(label) : label, sx, sy - 9);
    };
    local.roots?.forEach((r) => dot(r, 0, '#dc2626', `(${fmtNum(r)}, 0)`));
    if (local.yIntercept !== null && local.yIntercept !== undefined && Math.abs(local.yIntercept) > 1e-9) {
      dot(0, local.yIntercept, '#2563eb', `(0, ${fmtNum(local.yIntercept)})`);
    }
    local.extrema?.forEach((e) => dot(e.x, e.y, '#d97706', `${e.kind === 'max' ? '⤒' : '⤓'} (${fmtNum(e.x)}, ${fmtNum(e.y)})`));
  }, [viewBox, local, eastern, lang]);

  useEffect(() => { drawGraph(); }, [drawGraph]);
  useEffect(() => {
    const onResize = () => drawGraph();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [drawGraph]);

  const zoom = (factor: number) => setViewBox((v) => ({ ...v, scale: Math.min(400, Math.max(5, v.scale * factor)) }));
  const resetView = () => setViewBox({ cx: 0, cy: 0, scale: 40 });

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY, cx: viewBox.cx, cy: viewBox.cy };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = (e.clientX - dragRef.current.x) / viewBox.scale;
    const dy = (e.clientY - dragRef.current.y) / viewBox.scale;
    setViewBox((v) => ({ ...v, cx: dragRef.current!.cx - dx, cy: dragRef.current!.cy + dy }));
  };
  const onWheel = (e: React.WheelEvent) => zoom(e.deltaY < 0 ? 1.15 : 1 / 1.15);

  const exportGraph = () => {
    const c = canvasRef.current;
    if (!c) return;
    c.toBlob((b) => {
      if (!b) return;
      const url = URL.createObjectURL(b);
      const a = document.createElement('a');
      a.href = url; a.download = 'khotwa-graph.png'; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    }, 'image/png');
  };

  const arabicPreview = useMemo(() => (local.ok ? toArabicExpr(local.normalized) : ''), [local]);

  return (
    <ToolPage id="math" wide>
      {/* ==================== القسم أ: كتابة المعادلة ==================== */}
      <div className="card mb-4">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <h3 className="font-bold flex items-center gap-2"><Equal size={17} className="text-teal-700" /> {tr({ ar: 'مساحة كتابة المعادلة', en: 'Equation input' })}</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => setEastern(!eastern)}
              className={`text-xs font-bold rounded-full px-3 py-1.5 border transition-colors ${eastern ? 'bg-teal-800 text-white border-teal-800' : 'bg-white border-stone-300'}`}>
              {tr({ ar: 'أرقام مشرقية ١٢٣', en: 'Eastern digits ١٢٣' })}
            </button>
            <button onClick={() => setKbOpen(!kbOpen)}
              className={`text-xs font-bold rounded-full px-3 py-1.5 border flex items-center gap-1.5 transition-colors ${kbOpen ? 'bg-teal-800 text-white border-teal-800' : 'bg-white border-stone-300'}`}>
              <Keyboard size={13} /> {tr({ ar: 'لوحة الرموز', en: 'Math keyboard' })} {kbOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>
        </div>

        <input ref={inputRef} dir="ltr" className="field !text-lg !py-3 font-mono text-center" value={expr}
          onChange={(e) => setExpr(e.target.value)}
          placeholder={tr({ ar: 'اكتب معادلة أو دالة: ٢س + ٥ = ١١ أو x^2 - 4', en: 'Equation or function: 2x + 5 = 11 or x^2 - 4' })} />

        {/* لوحة الرموز الرياضية */}
        {kbOpen && (
          <div className="mt-3 rounded-2xl border border-stone-200 bg-stone-50 p-3">
            <div className="flex flex-wrap gap-1 mb-2.5">
              {KEY_TABS.map((t) => (
                <button key={t.id} onClick={() => setKbTab(t.id)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${kbTab === t.id ? 'bg-teal-800 text-white' : 'bg-white border border-stone-200 hover:border-teal-500'}`}>
                  {tr(t)}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5" dir="ltr">
              {KEY_TABS.find((t) => t.id === kbTab)!.keys.map((k, i) => (
                <button key={i} onClick={() => insertAtCursor(k.insert)}
                  className="min-w-11 h-10 px-2 rounded-xl bg-white border border-stone-200 font-semibold text-sm hover:border-teal-600 hover:bg-teal-50 active:scale-95 transition-all">
                  {k.label}
                </button>
              ))}
              <button onClick={() => setExpr('')} className="min-w-11 h-10 px-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 font-bold text-xs hover:bg-rose-100">
                {tr({ ar: 'مسح', en: 'Clear' })}
              </button>
            </div>
          </div>
        )}

        {/* المعاينة المنسقة */}
        {local.ok && local.inputTex && (
          <div className="mt-3 rounded-xl bg-gradient-to-l from-teal-50 to-stone-50 border border-teal-100 p-3 text-center">
            <Tex tex={local.inputTex} block eastern={eastern} />
            {lang === 'ar' && <p className="text-[11px] text-stone-400 mt-1" dir="rtl">{eastern ? toEasternDigits(arabicPreview) : arabicPreview}</p>}
          </div>
        )}
        {!local.ok && expr.trim() && local.error !== 'empty' && (
          <p className="mt-2 text-xs text-rose-600">{tr({ ar: 'تعبير غير مفهوم — راجع الصيغة', en: 'Could not parse — check the syntax' })}</p>
        )}

        {/* معرض الأمثلة */}
        <div className="mt-4 pt-3 border-t border-stone-100">
          <p className="text-[11px] font-bold text-stone-400 mb-2">{tr({ ar: 'معرض الأمثلة الجاهزة — انقر للتحميل', en: 'Examples gallery — click to load' })}</p>
          <div className="flex flex-wrap items-center gap-1.5">
            {PRESETS.map((g, gi) => (
              <span key={gi} className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold text-teal-800 bg-teal-50 rounded-full px-2 py-1">{tr(g.cat)}</span>
                {g.items.map((it, i) => (
                  <button key={i} onClick={() => loadPreset(it.expr)}
                    className="text-xs bg-white border border-stone-200 rounded-full px-2.5 py-1 hover:border-teal-600 hover:bg-teal-50 transition-colors">
                    {it.label}
                  </button>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 items-start">
        <div className="space-y-4">
          {/* ==================== القسم ب: تبسيط المعادلة ==================== */}
          <div className="card">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
              <h3 className="font-bold flex items-center gap-2"><Wand2 size={17} className="text-violet-600" /> {tr({ ar: 'تبسيط المعادلة', en: 'Simplification' })}</h3>
              <button className="btn-soft !py-1.5 text-xs" onClick={() => runAi('simplify', setSimplify)} disabled={!local.ok || simplify.loading}>
                {simplify.loading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />} {tr({ ar: 'بسّط المعادلة', en: 'Simplify' })}
              </button>
            </div>
            {local.ok && local.simplifiedTex && (
              <div className="rounded-xl bg-stone-50 p-3 text-center mb-2">
                <p className="text-[10px] font-bold text-stone-400 mb-1">{tr({ ar: 'تبسيط فوري (محلي)', en: 'Instant simplify (local)' })}</p>
                <Tex tex={local.simplifiedTex} eastern={eastern} />
              </div>
            )}
            {simplify.loading && <div className="flex items-center gap-2 text-sm text-violet-600 py-2"><Loader2 size={15} className="animate-spin" /> {tr({ ar: 'جاري توليد الخطوات...', en: 'Generating steps...' })}</div>}
            {simplify.data && <StepsView data={simplify.data} eastern={eastern} />}
            <AiNotice error={simplify.error} />
          </div>

          {/* ==================== القسم ج: الحل التفصيلي ==================== */}
          <div className="card">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
              <h3 className="font-bold flex items-center gap-2"><ListOrdered size={17} className="text-teal-700" /> {tr({ ar: 'الحل التفصيلي والناتج', en: 'Full solution & result' })}</h3>
              <button className="btn !py-1.5 text-xs" onClick={() => runAi('solve', setSolve)} disabled={!local.ok || solve.loading}>
                {solve.loading ? <Loader2 size={13} className="animate-spin" /> : <Target size={13} />} {tr({ ar: 'إيجاد الحل', en: 'Solve' })}
              </button>
            </div>
            {local.ok && local.isEquation && (local.roots?.length ?? 0) > 0 && (
              <div className="rounded-xl bg-stone-50 p-3 mb-2 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold text-stone-400">{tr({ ar: 'جذور فورية (عددياً):', en: 'Instant roots (numeric):' })}</span>
                {local.roots!.map((r, i) => (
                  <span key={i} className="text-sm font-bold text-teal-800 bg-teal-50 rounded-full px-2.5 py-0.5" dir="ltr">
                    {lang === 'ar' ? 'س' : 'x'} = {eastern ? toEasternDigits(fmtNum(r)) : fmtNum(r)}
                  </span>
                ))}
              </div>
            )}
            {solve.loading && <div className="flex items-center gap-2 text-sm text-teal-700 py-2"><Loader2 size={15} className="animate-spin" /> {tr({ ar: 'جاري حل المسألة خطوة بخطوة...', en: 'Solving step by step...' })}</div>}
            {solve.data && <StepsView data={solve.data} eastern={eastern} />}
            {!solve.data && !solve.loading && <p className="text-xs text-stone-400">{tr({ ar: 'انقر «إيجاد الحل» للحصول على شرح تفصيلي بالقواعد لكل خطوة', en: 'Click "Solve" for a rule-by-rule detailed walkthrough' })}</p>}
            <AiNotice error={solve.error} />
          </div>

          {/* ==================== القسم د: التفاضل والتكامل ==================== */}
          <div className="card">
            <h3 className="font-bold flex items-center gap-2 mb-3"><Sigma size={17} className="text-amber-600" /> {tr({ ar: 'التفاضل والتكامل', en: 'Calculus' })}</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {/* المشتقات */}
              <div className="rounded-xl border border-stone-200 p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold flex items-center gap-1.5"><Spline size={14} className="text-teal-700" /> {tr({ ar: 'المشتقات', en: 'Derivatives' })} <span className="text-[10px] text-stone-400" dir="ltr">dy/dx</span></p>
                  <button className="btn-soft !py-1 !px-2.5 text-[11px]" onClick={() => runAi('derivative', setDeriv, { order: 1 })} disabled={!local.ok || deriv.loading}>
                    {deriv.loading ? <Loader2 size={12} className="animate-spin" /> : tr({ ar: 'خطوات', en: 'Steps' })}
                  </button>
                </div>
                {local.ok && local.derivativeTex && (
                  <div className="space-y-1.5 text-center">
                    <div className="bg-stone-50 rounded-lg p-2"><span className="text-[10px] text-stone-400 me-2" dir="ltr">f′(x) =</span><Tex tex={local.derivativeTex} eastern={eastern} /></div>
                    {local.derivative2Tex && <div className="bg-stone-50 rounded-lg p-2"><span className="text-[10px] text-stone-400 me-2" dir="ltr">f″(x) =</span><Tex tex={local.derivative2Tex} eastern={eastern} /></div>}
                  </div>
                )}
              </div>
              {/* التكاملات */}
              <div className="rounded-xl border border-stone-200 p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold flex items-center gap-1.5">∫ {tr({ ar: 'التكاملات', en: 'Integrals' })} <span className="text-[10px] text-stone-400" dir="ltr">f(x)dx</span></p>
                  <button className="btn-soft !py-1 !px-2.5 text-[11px]" onClick={() => runAi('integral', setInteg, { from: intFrom, to: intTo })} disabled={!local.ok || integ.loading}>
                    {integ.loading ? <Loader2 size={12} className="animate-spin" /> : tr({ ar: 'احسب', en: 'Compute' })}
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-xs" dir="ltr">
                  <span className="text-stone-400">{tr({ ar: 'من', en: 'from' })}</span>
                  <input className="field !w-16 !py-1 text-center" placeholder="a" value={intFrom} onChange={(e) => setIntFrom(e.target.value)} />
                  <span className="text-stone-400">{tr({ ar: 'إلى', en: 'to' })}</span>
                  <input className="field !w-16 !py-1 text-center" placeholder="b" value={intTo} onChange={(e) => setIntTo(e.target.value)} />
                  <span className="text-[10px] text-stone-400">{tr({ ar: '(اتركه فارغاً لتكامل غير محدود)', en: '(empty = indefinite)' })}</span>
                </div>
              </div>
            </div>
            {(deriv.loading || integ.loading) && <div className="flex items-center gap-2 text-sm text-amber-600 py-2 mt-2"><Loader2 size={15} className="animate-spin" /> {tr({ ar: 'جاري توليد الخطوات بالقواعد...', en: 'Generating rule-based steps...' })}</div>}
            {deriv.data && <div className="mt-3 pt-3 border-t border-stone-100"><StepsView data={deriv.data} eastern={eastern} /></div>}
            {integ.data && <div className="mt-3 pt-3 border-t border-stone-100"><StepsView data={integ.data} eastern={eastern} /></div>}
            <AiNotice error={deriv.error || integ.error} />
          </div>
        </div>

        {/* ==================== القسم هـ: الرسم البياني التفاعلي ==================== */}
        <div className="card lg:sticky lg:top-20">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <h3 className="font-bold flex items-center gap-2">📈 {tr({ ar: 'الرسم البياني التفاعلي', en: 'Interactive grapher' })}</h3>
            <div className="flex gap-1">
              <button onClick={() => zoom(1.25)} className="btn-soft !p-2" title={tr({ ar: 'تكبير', en: 'Zoom in' })}><ZoomIn size={15} /></button>
              <button onClick={() => zoom(1 / 1.25)} className="btn-soft !p-2" title={tr({ ar: 'تصغير', en: 'Zoom out' })}><ZoomOut size={15} /></button>
              <button onClick={resetView} className="btn-soft !p-2" title={tr({ ar: 'إعادة الضبط', en: 'Reset view' })}><Maximize size={15} /></button>
              <button onClick={exportGraph} className="btn-soft !p-2" title={tr({ ar: 'تنزيل الرسم البياني', en: 'Download graph' })}><Download size={15} /></button>
            </div>
          </div>
          <canvas ref={canvasRef}
            className="w-full h-105 rounded-xl border border-stone-200 touch-none cursor-grab active:cursor-grabbing"
            onPointerDown={onPointerDown} onPointerMove={onPointerMove}
            onPointerUp={() => { dragRef.current = null; }} onWheel={onWheel} />
          <p className="text-[10px] text-stone-400 mt-2 text-center">{tr({ ar: 'اسحب للتحريك · عجلة الفأرة أو الأزرار للتكبير', en: 'Drag to pan · scroll or buttons to zoom' })}</p>

          {/* النقاط المميزة */}
          {local.ok && ((local.roots?.length ?? 0) > 0 || local.yIntercept !== null || (local.extrema?.length ?? 0) > 0) && (
            <div className="mt-3 pt-3 border-t border-stone-100 space-y-1.5 text-xs">
              <p className="font-bold text-stone-500">{tr({ ar: 'النقاط المميزة', en: 'Key points' })}</p>
              <div className="flex flex-wrap gap-1.5">
                {local.roots?.map((r, i) => (
                  <span key={`r${i}`} className="bg-rose-50 text-rose-700 border border-rose-200 rounded-full px-2 py-0.5" dir="ltr">
                    {tr({ ar: 'جذر', en: 'root' })}: ({eastern ? toEasternDigits(fmtNum(r)) : fmtNum(r)}, 0)
                  </span>
                ))}
                {local.yIntercept !== null && local.yIntercept !== undefined && (
                  <span className="bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5" dir="ltr">
                    {tr({ ar: 'تقاطع ص', en: 'y-int' })}: (0, {eastern ? toEasternDigits(fmtNum(local.yIntercept)) : fmtNum(local.yIntercept)})
                  </span>
                )}
                {local.extrema?.map((e, i) => (
                  <span key={`e${i}`} className="bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5" dir="ltr">
                    {e.kind === 'max' ? tr({ ar: 'قيمة عظمى', en: 'max' }) : tr({ ar: 'قيمة صغرى', en: 'min' })}: ({eastern ? toEasternDigits(fmtNum(e.x)) : fmtNum(e.x)}, {eastern ? toEasternDigits(fmtNum(e.y)) : fmtNum(e.y)})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolPage>
  );
}

function fmtNum(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return String(+n.toFixed(4));
}

function niceStep(scale: number): number {
  const target = 60 / scale; // نريد خطاً كل ~60 بكسل
  const pow = Math.pow(10, Math.floor(Math.log10(target)));
  for (const m of [1, 2, 5, 10]) if (m * pow >= target) return m * pow;
  return 10 * pow;
}
