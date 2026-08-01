import { useCallback, useEffect, useRef, useState } from 'react';
import { Copy, Check, Loader2, Download, ScanLine, Wand2, RotateCcw, ClipboardPaste, ImageIcon, Gauge, X } from 'lucide-react';
import ToolPage from '../../components/ToolPage';
import { download } from '../../lib/pdf';
import { useLang } from '../../lib/i18n';

type Stage = 'idle' | 'preprocess' | 'loading' | 'recognizing' | 'done';

/* ---------------- معالجة مسبقة للصورة لرفع دقة OCR ----------------
   1) تكبير الصور الصغيرة (Tesseract يعمل أفضل عند ≥300dpi تقريباً)
   2) تحويل رمادي + رفع تباين
   3) تحويل ثنائي تكيفي (Otsu) لإزالة الظلال والخلفيات               */
function preprocessImage(img: HTMLImageElement, binarize: boolean): HTMLCanvasElement {
  // تكبير ذكي: الهدف أن يكون البعد الأصغر ~1600px دون تجاوز 3500px
  const minSide = Math.min(img.naturalWidth, img.naturalHeight);
  let scale = minSide < 1600 ? 1600 / minSide : 1;
  if (Math.max(img.naturalWidth, img.naturalHeight) * scale > 3500) {
    scale = 3500 / Math.max(img.naturalWidth, img.naturalHeight);
  }
  const W = Math.round(img.naturalWidth * scale);
  const H = Math.round(img.naturalHeight * scale);

  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, W, H);

  const data = ctx.getImageData(0, 0, W, H);
  const px = data.data;
  const gray = new Uint8Array(W * H);

  // رمادي + تمدد تباين
  let min = 255, max = 0;
  for (let i = 0, j = 0; i < px.length; i += 4, j++) {
    const g = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
    gray[j] = g;
    if (g < min) min = g;
    if (g > max) max = g;
  }
  const range = Math.max(1, max - min);
  for (let j = 0; j < gray.length; j++) gray[j] = ((gray[j] - min) / range) * 255;

  if (binarize) {
    // عتبة Otsu التلقائية
    const hist = new Array(256).fill(0);
    for (let j = 0; j < gray.length; j++) hist[gray[j] | 0]++;
    const total = gray.length;
    let sum = 0;
    for (let t = 0; t < 256; t++) sum += t * hist[t];
    let sumB = 0, wB = 0, maxVar = 0, threshold = 127;
    for (let t = 0; t < 256; t++) {
      wB += hist[t];
      if (wB === 0) continue;
      const wF = total - wB;
      if (wF === 0) break;
      sumB += t * hist[t];
      const mB = sumB / wB, mF = (sum - sumB) / wF;
      const between = wB * wF * (mB - mF) * (mB - mF);
      if (between > maxVar) { maxVar = between; threshold = t; }
    }
    for (let i = 0, j = 0; i < px.length; i += 4, j++) {
      const v = gray[j] > threshold ? 255 : 0;
      px[i] = px[i + 1] = px[i + 2] = v;
      px[i + 3] = 255;
    }
  } else {
    for (let i = 0, j = 0; i < px.length; i += 4, j++) {
      px[i] = px[i + 1] = px[i + 2] = gray[j];
      px[i + 3] = 255;
    }
  }
  ctx.putImageData(data, 0, 0);
  return canvas;
}

/* ---------------- تنظيف النص الناتج من الرموز الدخيلة ----------------
   يبقي: العربية وتشكيلها، اللاتينية، الأرقام (عربية وهندية)، وعلامات الترقيم الشائعة */
function cleanOcrText(raw: string): string {
  const allowed = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z0-9\u0660-\u0669\s.,;:!?؟،؛()\[\]{}"'«»\-–—_/\\%+=*&@#$€£<>|~^°]/;
  let text = [...raw].filter((ch) => allowed.test(ch) || ch === '\n').join('');
  text = text
    .replace(/[ \t]{2,}/g, ' ')          // مسافات متكررة
    .replace(/ ?\n ?/g, '\n')            // مسافات حول أسطر
    .replace(/\n{3,}/g, '\n\n')          // أسطر فارغة متكررة
    .replace(/^[ \t]+|[ \t]+$/gm, '')    // مسافات أطراف الأسطر
    .replace(/([،؛.!?؟])\1{2,}/g, '$1'); // ترقيم مكرر
  return text.trim();
}

export default function Ocr() {
  const { tr, lang } = useLang();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [ocrLang, setOcrLang] = useState('ara+eng');
  const [enhance, setEnhance] = useState(true);
  const [binarize, setBinarize] = useState(true);
  const [stage, setStage] = useState<Stage>('idle');
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState('');
  const [confidence, setConfidence] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<any>(null);

  // تنظيف الموارد عند مغادرة الصفحة
  useEffect(() => () => {
    workerRef.current?.terminate?.();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pick = useCallback((f: File | undefined | null) => {
    setError(''); setText(''); setConfidence(null); setStage('idle');
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      setError(tr({ ar: 'الملف المحدد ليس صورة — الرجاء اختيار صورة (PNG, JPG, WEBP...)', en: 'Selected file is not an image — pick PNG, JPG, WEBP...' }));
      return;
    }
    if (f.size > 25 * 1024 * 1024) {
      setError(tr({ ar: 'حجم الصورة كبير جداً (الحد 25 ميجا)', en: 'Image too large (25MB limit)' }));
      return;
    }
    setFile(f);
    setPreviewUrl((old) => { if (old) URL.revokeObjectURL(old); return URL.createObjectURL(f); });
  }, [tr]);

  // دعم اللصق المباشر Ctrl+V
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const item = [...(e.clipboardData?.items || [])].find((i) => i.type.startsWith('image/'));
      if (item) { e.preventDefault(); pick(item.getAsFile()); }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [pick]);

  const run = async () => {
    if (!file || stage === 'recognizing' || stage === 'loading') return;
    setError(''); setText(''); setConfidence(null); setProgress(0);
    try {
      // 1) فك ترميز الصورة
      setStage('preprocess');
      const img = await new Promise<HTMLImageElement>((res, rej) => {
        const i = new Image();
        i.onload = () => res(i);
        i.onerror = () => rej(new Error(tr({ ar: 'تعذر قراءة الصورة — قد تكون تالفة', en: 'Could not decode image — it may be corrupt' })));
        i.src = previewUrl!;
      });

      // 2) المعالجة المسبقة (اختيارية)
      const source: HTMLCanvasElement | File = enhance ? preprocessImage(img, binarize) : file;

      // 3) تحميل نموذج اللغة
      setStage('loading');
      const Tesseract = await import('tesseract.js');
      const worker = await Tesseract.createWorker(ocrLang, 1, {
        logger: (m: any) => {
          if (m.status === 'loading language traineddata' || m.status === 'initializing api') {
            setProgress(Math.round((m.progress || 0) * 100));
          }
          if (m.status === 'recognizing text') {
            setStage('recognizing');
            setProgress(Math.round(m.progress * 100));
          }
        },
      });
      workerRef.current = worker;

      // إعدادات دقة أعلى
      await worker.setParameters({
        preserve_interword_spaces: '1',
        tessedit_pageseg_mode: '3' as any, // تحليل تلقائي كامل للصفحة
      });

      // 4) التعرف
      setStage('recognizing');
      const { data } = await worker.recognize(source as any);

      // 5) تصفية الكلمات منخفضة الثقة جداً (مصدر الرموز الدخيلة) ثم التنظيف
      let result = data.text || '';
      const words: any[] = (data as any).words || [];
      if (words.length > 3) {
        const lines: Record<number, string[]> = {};
        for (const w of words) {
          if ((w.confidence ?? 100) < 35 && (w.text || '').length <= 2) continue; // رموز عشوائية
          const key = w.line?.baseline?.y0 ?? w.bbox?.y0 ?? 0;
          (lines[key] ||= []).push(w.text);
        }
        const rebuilt = Object.keys(lines).sort((a, b) => +a - +b).map((k) => lines[+k].join(' ')).join('\n');
        if (rebuilt.replace(/\s/g, '').length >= result.replace(/\s/g, '').length * 0.5) result = rebuilt;
      }
      result = cleanOcrText(result);

      if (!result) {
        setError(tr({ ar: 'لم يُعثر على نص واضح — جرّب صورة أوضح أو فعّل التحسين التلقائي', en: 'No clear text found — try a sharper image or enable auto-enhance' }));
      } else {
        setText(result);
        setConfidence(Math.round(data.confidence ?? 0));
      }
      setStage('done');
      await worker.terminate();
      workerRef.current = null;
    } catch (e: any) {
      setError(e?.message || tr({ ar: 'فشل الاستخراج — أعد المحاولة', en: 'Extraction failed — try again' }));
      setStage('idle');
      workerRef.current?.terminate?.();
      workerRef.current = null;
    }
  };

  const reset = () => {
    setFile(null); setText(''); setError(''); setConfidence(null); setStage('idle');
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const busy = stage === 'preprocess' || stage === 'loading' || stage === 'recognizing';
  const stageLabel =
    stage === 'preprocess' ? tr({ ar: 'تحسين الصورة...', en: 'Enhancing image...' }) :
    stage === 'loading' ? tr({ ar: 'تحميل نموذج اللغة (أول مرة فقط)...', en: 'Loading language model (first run only)...' }) :
    stage === 'recognizing' ? tr({ ar: 'جارٍ التعرف على النص...', en: 'Recognizing text...' }) : '';

  const confColor = (c: number) => (c >= 80 ? 'text-teal-700 bg-teal-50 border-teal-200' : c >= 60 ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-rose-700 bg-rose-50 border-rose-200');

  return (
    <ToolPage id="ocr" wide>
      <div className="grid lg:grid-cols-2 gap-5">
        {/* ---------- جهة الرفع والإعدادات ---------- */}
        <div className="space-y-4">
          {!file ? (
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }}
              className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all ${drag ? 'border-teal-600 bg-teal-50' : 'border-stone-300 bg-white hover:border-teal-500 hover:bg-teal-50/40'}`}
            >
              <ScanLine className="mx-auto text-teal-700 mb-3" size={38} />
              <p className="font-bold text-ink">{tr({ ar: 'اسحب صورة هنا أو انقر للاختيار', en: 'Drop an image here or click to browse' })}</p>
              <p className="text-xs text-stone-400 mt-2 flex items-center justify-center gap-1">
                <ClipboardPaste size={13} /> {tr({ ar: 'أو الصق صورة مباشرة (Ctrl+V)', en: 'Or paste directly (Ctrl+V)' })}
              </p>
              <p className="text-[11px] text-stone-400 mt-1">{tr({ ar: 'PNG · JPG · WEBP — تتم المعالجة محلياً في متصفحك بالكامل', en: 'PNG · JPG · WEBP — processed 100% locally in your browser' })}</p>
              <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }} />
            </div>
          ) : (
            <div className="card !p-3 relative">
              <button onClick={reset} className="absolute top-2 end-2 z-10 bg-white/90 rounded-full p-1.5 shadow text-stone-500 hover:text-rose-600"><X size={16} /></button>
              <img src={previewUrl!} alt={tr({ ar: 'معاينة الصورة المرفوعة', en: 'Uploaded image preview' })} className="rounded-xl max-h-80 mx-auto object-contain" />
              <p className="text-[11px] text-stone-400 text-center mt-2 flex items-center justify-center gap-1" dir="ltr">
                <ImageIcon size={12} /> {file.name} · {(file.size / 1024).toFixed(0)} KB
              </p>
            </div>
          )}

          {/* الإعدادات */}
          <div className="card space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-stone-600 block mb-1">{tr({ ar: 'لغة النص في الصورة', en: 'Text language' })}</label>
                <select className="field" value={ocrLang} onChange={(e) => setOcrLang(e.target.value)} disabled={busy}>
                  <option value="ara+eng">{tr({ ar: 'عربي + إنجليزي', en: 'Arabic + English' })}</option>
                  <option value="ara">{tr({ ar: 'عربي فقط (أدق للنصوص العربية)', en: 'Arabic only (best for Arabic)' })}</option>
                  <option value="eng">{tr({ ar: 'إنجليزي فقط', en: 'English only' })}</option>
                </select>
              </div>
              <div className="flex flex-col justify-end gap-1.5">
                <label className="flex items-center gap-2 text-xs font-semibold text-stone-600 cursor-pointer">
                  <input type="checkbox" checked={enhance} onChange={(e) => setEnhance(e.target.checked)} disabled={busy} className="accent-teal-700 w-4 h-4" />
                  <Wand2 size={13} className="text-teal-700" /> {tr({ ar: 'تحسين تلقائي للصورة (موصى به)', en: 'Auto-enhance image (recommended)' })}
                </label>
                <label className={`flex items-center gap-2 text-xs font-semibold cursor-pointer ${enhance ? 'text-stone-600' : 'text-stone-300'}`}>
                  <input type="checkbox" checked={binarize} onChange={(e) => setBinarize(e.target.checked)} disabled={busy || !enhance} className="accent-teal-700 w-4 h-4" />
                  {tr({ ar: 'إزالة الظلال والخلفية (للمستندات)', en: 'Remove shadows & background (documents)' })}
                </label>
              </div>
            </div>

            <button className="btn w-full" onClick={run} disabled={!file || busy}>
              {busy ? <Loader2 size={16} className="animate-spin" /> : <ScanLine size={16} />}
              {busy ? `${stageLabel} ${stage !== 'preprocess' ? progress + '%' : ''}` : tr({ ar: 'استخراج النص', en: 'Extract text' })}
            </button>

            {busy && (
              <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-300 ${stage === 'loading' ? 'bg-amber-500' : 'bg-teal-600'}`} style={{ width: `${stage === 'preprocess' ? 8 : progress}%` }} />
              </div>
            )}
            {error && <p className="text-rose-600 text-sm bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">{error}</p>}
          </div>
        </div>

        {/* ---------- جهة النتيجة ---------- */}
        <div className="card flex flex-col">
          <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
            <h3 className="font-bold flex items-center gap-2">
              {tr({ ar: 'النص المستخرج', en: 'Extracted text' })}
              {confidence !== null && (
                <span className={`text-[11px] font-bold border rounded-full px-2 py-0.5 flex items-center gap-1 ${confColor(confidence)}`}>
                  <Gauge size={11} /> {tr({ ar: `الدقة ${confidence}%`, en: `${confidence}% confidence` })}
                </span>
              )}
            </h3>
            <div className="flex gap-1.5">
              <button disabled={!text} onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                className="btn-soft !py-1 !px-2.5" title={tr({ ar: 'نسخ', en: 'Copy' })}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
              <button disabled={!text} onClick={() => download(text, 'khotwa-ocr.txt', 'text/plain;charset=utf-8')}
                className="btn-soft !py-1 !px-2.5" title={tr({ ar: 'تنزيل TXT', en: 'Download TXT' })}>
                <Download size={14} />
              </button>
              <button disabled={!text && !file} onClick={reset} className="btn-soft !py-1 !px-2.5" title={tr({ ar: 'البدء من جديد', en: 'Start over' })}>
                <RotateCcw size={14} />
              </button>
            </div>
          </div>

          <textarea
            className="flex-1 min-h-80 w-full rounded-xl border border-stone-200 p-3.5 text-sm leading-loose resize-none"
            dir={lang === 'ar' ? 'rtl' : 'auto'}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={busy ? stageLabel : tr({ ar: 'سيظهر النص هنا بعد الاستخراج — يمكنك تعديله مباشرة...', en: 'Text appears here after extraction — edit freely...' })}
          />
          {text && (
            <p className="text-[11px] text-stone-400 mt-2">
              {tr({ ar: `${text.length} حرف · ${text.split(/\s+/).filter(Boolean).length} كلمة · ${text.split('\n').length} سطر`, en: `${text.length} chars · ${text.split(/\s+/).filter(Boolean).length} words · ${text.split('\n').length} lines` })}
            </p>
          )}
          <div className="mt-3 pt-3 border-t border-stone-100 text-[11px] text-stone-400 leading-relaxed">
            💡 {tr({
              ar: 'نصائح للدقة العالية: صورة واضحة بإضاءة جيدة، نص أفقي غير مائل، وفعّل «إزالة الظلال» للمستندات الممسوحة. تصفية تلقائية تزيل الرموز العشوائية منخفضة الثقة.',
              en: 'Accuracy tips: sharp well-lit image, horizontal non-skewed text, enable "remove shadows" for scanned documents. Low-confidence garbage symbols are filtered automatically.',
            })}
          </div>
        </div>
      </div>
    </ToolPage>
  );
}
