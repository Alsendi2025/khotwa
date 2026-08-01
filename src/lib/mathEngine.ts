/** المحرك الرياضي المحلي + طبقة الذكاء الاصطناعي للخطوات التفصيلية */
import * as math from 'mathjs';
import { normalizeMathInput, splitEquation } from './mathArabic';
import { callAI, parseAiJson } from './ai';

export type LocalResult = {
  ok: boolean;
  error?: string;
  normalized: string;
  isEquation: boolean;
  simplified?: string;
  simplifiedTex?: string;
  inputTex?: string;
  derivative?: string;
  derivativeTex?: string;
  derivative2?: string;
  derivative2Tex?: string;
  roots?: number[];
  yIntercept?: number | null;
  extrema?: { x: number; y: number; kind: 'min' | 'max' }[];
  compiled?: math.EvalFunction;
  exprNode?: math.MathNode;
};

/** التحليل والاشتقاق والتبسيط محلياً عبر mathjs — فوري وبدون إنترنت */
export function analyzeLocal(raw: string): LocalResult {
  const normalized = normalizeMathInput(raw);
  if (!normalized) return { ok: false, error: 'empty', normalized, isEquation: false };

  const eq = splitEquation(normalized);
  // للمعادلات: نحلل f(x) = lhs - rhs لإيجاد الجذور والرسم
  const exprStr = eq ? `(${eq.lhs}) - (${eq.rhs})` : normalized;

  try {
    const node = math.parse(exprStr);
    const inputNode = eq ? math.parse(eq.lhs) : node;

    let simplified = '', simplifiedTex = '';
    try {
      const s = math.simplify(node);
      simplified = s.toString();
      simplifiedTex = s.toTex();
    } catch { simplified = node.toString(); }

    let inputTex = '';
    try {
      inputTex = eq ? `${math.parse(eq.lhs).toTex()} = ${math.parse(eq.rhs).toTex()}` : inputNode.toTex();
    } catch { inputTex = normalized; }

    let derivative = '', derivativeTex = '', derivative2 = '', derivative2Tex = '';
    try {
      const d1 = math.derivative(node, 'x');
      const d1s = math.simplify(d1);
      derivative = d1s.toString();
      derivativeTex = d1s.toTex();
      const d2 = math.derivative(d1, 'x');
      const d2s = math.simplify(d2);
      derivative2 = d2s.toString();
      derivative2Tex = d2s.toTex();
    } catch { /* غير قابل للاشتقاق */ }

    const compiled = node.compile();

    // نقاط مميزة: تقاطع ص، الجذور، القيم القصوى (عددياً)
    let yIntercept: number | null = null;
    try {
      const v = compiled.evaluate({ x: 0 });
      if (typeof v === 'number' && isFinite(v)) yIntercept = v;
    } catch { /* skip */ }

    const roots = findRootsNumeric(compiled);
    const extrema = derivative ? findExtrema(node, derivative) : [];

    return {
      ok: true, normalized, isEquation: !!eq,
      simplified, simplifiedTex, inputTex,
      derivative, derivativeTex, derivative2, derivative2Tex,
      roots, yIntercept, extrema, compiled, exprNode: node,
    };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : String(e), normalized, isEquation: !!eq };
  }
}

/** إيجاد الجذور عددياً بمسح الإشارة + التنصيف في المدى [-50, 50] */
function findRootsNumeric(compiled: math.EvalFunction): number[] {
  const roots: number[] = [];
  const f = (x: number): number | null => {
    try {
      const v = compiled.evaluate({ x });
      return typeof v === 'number' && isFinite(v) ? v : null;
    } catch { return null; }
  };
  const N = 2000, min = -50, max = 50;
  let prevX = min, prevY = f(min);
  for (let i = 1; i <= N; i++) {
    const x = min + ((max - min) * i) / N;
    const y = f(x);
    if (prevY !== null && y !== null) {
      if (prevY === 0) pushRoot(roots, prevX);
      if (prevY * y < 0) {
        // تنصيف
        let a = prevX, b = x, fa = prevY;
        for (let k = 0; k < 60; k++) {
          const m = (a + b) / 2;
          const fm = f(m);
          if (fm === null) break;
          if (fa * fm <= 0) b = m; else { a = m; fa = fm; }
        }
        pushRoot(roots, (a + b) / 2);
      }
    }
    prevX = x; prevY = y;
  }
  return roots.slice(0, 8);
}

function pushRoot(roots: number[], r: number) {
  const rounded = Math.abs(r) < 1e-9 ? 0 : +r.toFixed(6);
  if (!roots.some((x) => Math.abs(x - rounded) < 1e-4)) roots.push(rounded);
}

/** القيم القصوى: جذور المشتقة الأولى + اختبار المشتقة الثانية */
function findExtrema(node: math.MathNode, _d1: string): { x: number; y: number; kind: 'min' | 'max' }[] {
  try {
    const d1c = math.derivative(node, 'x').compile();
    const fc = node.compile();
    const critical = findRootsNumeric(d1c);
    const out: { x: number; y: number; kind: 'min' | 'max' }[] = [];
    for (const cx of critical.slice(0, 5)) {
      try {
        const y = fc.evaluate({ x: cx });
        if (typeof y !== 'number' || !isFinite(y)) continue;
        const left = d1c.evaluate({ x: cx - 1e-4 });
        const right = d1c.evaluate({ x: cx + 1e-4 });
        if (typeof left === 'number' && typeof right === 'number') {
          if (left > 0 && right < 0) out.push({ x: +cx.toFixed(4), y: +y.toFixed(4), kind: 'max' });
          else if (left < 0 && right > 0) out.push({ x: +cx.toFixed(4), y: +y.toFixed(4), kind: 'min' });
        }
      } catch { /* skip */ }
    }
    return out;
  } catch { return []; }
}

/* ==================== طبقة الذكاء الاصطناعي: الخطوات التفصيلية ==================== */

export type StepsResponse = {
  title: string;
  steps: { rule: string; expr: string }[];
  result: string;
  resultTex?: string;
  note?: string;
};

const JSON_SPEC = `أرجع JSON فقط بهذه البنية بدون أي نص خارجها:
{"title":"عنوان قصير","steps":[{"rule":"اسم القاعدة أو وصف الخطوة بالعربية","expr":"التعبير الرياضي بصيغة LaTeX"}],"result":"الناتج النهائي نصياً","resultTex":"الناتج بصيغة LaTeX","note":"ملاحظة اختيارية"}`;

export async function aiSteps(kind: 'simplify' | 'solve' | 'derivative' | 'integral', expr: string, opts?: { from?: string; to?: string; order?: 1 | 2 }): Promise<StepsResponse> {
  const prompts: Record<string, string> = {
    simplify: `بسّط التعبير الرياضي التالي خطوة بخطوة مع ذكر القاعدة المستخدمة في كل خطوة (توزيع، تجميع حدود متشابهة، تحليل...):\n${expr}`,
    solve: `حل ${expr.includes('=') ? 'المعادلة' : 'المسألة'} التالية خطوة بخطوة بالتفصيل مع ذكر القاعدة في كل خطوة، وإن كانت معادلة أوجد كل قيم س:\n${expr}`,
    derivative: `أوجد المشتقة ${opts?.order === 2 ? 'الثانية' : 'الأولى'} بالنسبة إلى x للدالة التالية خطوة بخطوة مع ذكر قاعدة الاشتقاق المستخدمة (قاعدة القوة، الضرب، السلسلة...):\n${expr}`,
    integral: opts?.from !== undefined && opts?.to !== undefined && opts.from !== '' && opts.to !== ''
      ? `احسب التكامل المحدود للدالة التالية من ${opts.from} إلى ${opts.to} خطوة بخطوة مع ذكر قاعدة التكامل في كل خطوة:\n${expr}`
      : `أوجد التكامل غير المحدود للدالة التالية خطوة بخطوة مع ذكر قاعدة التكامل المستخدمة، ولا تنسَ ثابت التكامل c:\n${expr}`,
  };

  const raw = await callAI({
    json: true,
    system: `أنت معلم رياضيات خبير يشرح بالعربية الفصحى المبسطة لطلاب الثانوية والجامعة. اكتب كل التعبيرات الرياضية بصيغة LaTeX صحيحة (بدون علامات $). استخدم x للمتغير في LaTeX. ${JSON_SPEC}`,
    prompt: prompts[kind],
  });
  return parseAiJson<StepsResponse>(raw);
}
