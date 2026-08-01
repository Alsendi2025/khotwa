import { useRef, useState } from 'react';
import { Download, Loader2, Stamp, PenTool, Eraser } from 'lucide-react';
import { PDFDocument, degrees } from 'pdf-lib';
import ToolPage from '../../components/ToolPage';
import FileDrop from '../../components/FileDrop';
import ProgressBar from '../../components/ProgressBar';
import { validatePdf, downloadBlob, fileErrorMessage, formatSize } from '../../lib/fileUtils';
import { useLang } from '../../lib/i18n';

export default function Watermark() {
  const { tr, lang } = useLang();
  const [tab, setTab] = useState<'watermark' | 'sign'>('watermark');
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('KHOTWA');
  const [opacity, setOpacity] = useState(0.18);
  const [size, setSize] = useState(60);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ pct: number; label: string; done?: boolean } | null>(null);
  const [error, setError] = useState('');
  const [okMsg, setOkMsg] = useState('');
  const [pos, setPos] = useState<'center' | 'bottom-right'>('center');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  const startDraw = (x: number, y: number) => {
    const ctx = canvasRef.current!.getContext('2d')!;
    drawing.current = true;
    ctx.beginPath(); ctx.moveTo(x, y);
    ctx.strokeStyle = '#1a2f6e'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  };
  const draw = (x: number, y: number) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext('2d')!;
    ctx.lineTo(x, y); ctx.stroke();
  };
  const rel = (e: React.PointerEvent) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 500, y: ((e.clientY - r.top) / r.height) * 200 };
  };

  const apply = async () => {
    if (!file) return;
    if (tab === 'watermark' && !text.trim()) { setError(tr({ ar: 'أدخل نص العلامة المائية', en: 'Enter watermark text' })); return; }
    setBusy(true); setError(''); setOkMsg('');
    try {
      setProgress({ pct: 15, label: tr({ ar: 'قراءة الملف...', en: 'Reading file...' }) });
      const doc = await PDFDocument.load(await validatePdf(file), { ignoreEncryption: true });

      if (tab === 'watermark') {
        // watermark text drawn via canvas image for unicode/Arabic support
        const c = document.createElement('canvas');
        c.width = 1000; c.height = 300;
        const ctx = c.getContext('2d')!;
        ctx.clearRect(0, 0, 1000, 300);
        ctx.font = `bold ${size * 2}px Rubik, sans-serif`;
        ctx.fillStyle = `rgba(120, 120, 140, 1)`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(text, 500, 150);
        const pngData = c.toDataURL('image/png');
        const png = await doc.embedPng(pngData);

        const allPages = doc.getPages();
        let pi = 0;
        for (const page of allPages) {
          setProgress({ pct: 25 + (pi++ / allPages.length) * 60, label: tr({ ar: `إضافة العلامة للصفحة ${pi}/${allPages.length}`, en: `Watermarking page ${pi}/${allPages.length}` }) });
          const { width, height } = page.getSize();
          const w = width * 0.75;
          const h = (w / 1000) * 300;
          if (pos === 'center') {
            page.drawImage(png, { x: width / 2 - w / 2, y: height / 2 - h / 2, width: w, height: h, opacity, rotate: degrees(0) });
          } else {
            const sw = w * 0.4, sh = h * 0.4;
            page.drawImage(png, { x: width - sw - 20, y: 20, width: sw, height: sh, opacity: Math.min(opacity * 2.5, 0.9) });
          }
        }
        setProgress({ pct: 92, label: tr({ ar: 'إنشاء الملف...', en: 'Building file...' }) });
        const outSize = downloadBlob(await doc.save(), 'khotwa-watermarked.pdf', 'application/pdf');
        setProgress({ pct: 100, label: tr({ ar: 'اكتمل', en: 'Done' }), done: true });
        setOkMsg(tr({ ar: `تم تنزيل الملف مع العلامة المائية (${formatSize(outSize)})`, en: `Watermarked file downloaded (${formatSize(outSize)})` }));
      } else {
        const ctx = canvasRef.current!.getContext('2d')!;
        const pixels = ctx.getImageData(0, 0, 500, 200).data;
        let hasInk = false;
        for (let i = 3; i < pixels.length; i += 4) if (pixels[i] > 0) { hasInk = true; break; }
        if (!hasInk) { setError(tr({ ar: 'ارسم توقيعك أولاً في المربع', en: 'Draw your signature first' })); setBusy(false); setProgress(null); return; }
        setProgress({ pct: 50, label: tr({ ar: 'إدراج التوقيع...', en: 'Embedding signature...' }) });
        const sigData = canvasRef.current!.toDataURL('image/png');
        const png = await doc.embedPng(sigData);
        const pages = doc.getPages();
        const last = pages[pages.length - 1];
        const { width } = last.getSize();
        const w = 180, h = 72;
        last.drawImage(png, { x: width - w - 40, y: 50, width: w, height: h });
        setProgress({ pct: 90, label: tr({ ar: 'إنشاء الملف...', en: 'Building file...' }) });
        const outSize = downloadBlob(await doc.save(), 'khotwa-signed.pdf', 'application/pdf');
        setProgress({ pct: 100, label: tr({ ar: 'اكتمل', en: 'Done' }), done: true });
        setOkMsg(tr({ ar: `تم تنزيل الملف الموقّع (${formatSize(outSize)})`, en: `Signed file downloaded (${formatSize(outSize)})` }));
      }
      setTimeout(() => setProgress(null), 2500);
    } catch (e: any) { setError(fileErrorMessage(e, lang)); setProgress(null); }
    setBusy(false);
  };

  return (
    <ToolPage id="pdf-watermark">
      <div className="flex gap-2 mb-5">
        <button onClick={() => setTab('watermark')} className={`px-4 py-2 rounded-xl text-sm font-bold border flex items-center gap-2 ${tab === 'watermark' ? 'bg-teal-800 text-white border-teal-800' : 'bg-white border-stone-300'}`}>
          <Stamp size={16} /> {tr({ ar: 'علامة مائية', en: 'Watermark' })}
        </button>
        <button onClick={() => setTab('sign')} className={`px-4 py-2 rounded-xl text-sm font-bold border flex items-center gap-2 ${tab === 'sign' ? 'bg-teal-800 text-white border-teal-800' : 'bg-white border-stone-300'}`}>
          <PenTool size={16} /> {tr({ ar: 'توقيع', en: 'Signature' })}
        </button>
      </div>

      <div className="space-y-4">
        <FileDrop accept="application/pdf" onFiles={(fs) => { setFile(fs[0]); setError(''); }} />
        {file && (
          <div className="card">
            <p className="text-sm font-semibold mb-4" dir="ltr">{file.name}</p>

            {tab === 'watermark' ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-stone-600">{tr({ ar: 'نص العلامة المائية (يدعم العربية)', en: 'Watermark text (Arabic supported)' })}</label>
                  <input className="field mt-1" value={text} onChange={(e) => setText(e.target.value)} />
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-stone-500">{tr({ ar: `الشفافية: ${Math.round(opacity * 100)}%`, en: `Opacity: ${Math.round(opacity * 100)}%` })}</label>
                    <input type="range" min="0.05" max="0.6" step="0.01" value={opacity} onChange={(e) => setOpacity(+e.target.value)} className="w-full accent-teal-700" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-stone-500">{tr({ ar: `الحجم: ${size}`, en: `Size: ${size}` })}</label>
                    <input type="range" min="20" max="120" value={size} onChange={(e) => setSize(+e.target.value)} className="w-full accent-teal-700" />
                  </div>
                  <select className="field self-end" value={pos} onChange={(e) => setPos(e.target.value as any)}>
                    <option value="center">{tr({ ar: 'منتصف الصفحة', en: 'Center' })}</option>
                    <option value="bottom-right">{tr({ ar: 'أسفل الصفحة', en: 'Bottom corner' })}</option>
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <label className="text-sm font-bold text-stone-600 flex items-center justify-between">
                  {tr({ ar: 'ارسم توقيعك هنا (سيوضع أسفل آخر صفحة)', en: 'Draw your signature (placed on the last page)' })}
                  <button onClick={() => canvasRef.current!.getContext('2d')!.clearRect(0, 0, 500, 200)} className="btn-soft !py-1 !px-2 text-xs"><Eraser size={13} /> {tr({ ar: 'مسح', en: 'Clear' })}</button>
                </label>
                <canvas ref={canvasRef} width={500} height={200}
                  className="w-full max-w-md mt-2 bg-stone-50 border-2 border-dashed border-stone-300 rounded-xl touch-none cursor-crosshair"
                  onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); const p = rel(e); startDraw(p.x, p.y); }}
                  onPointerMove={(e) => { const p = rel(e); draw(p.x, p.y); }}
                  onPointerUp={() => { drawing.current = false; }}
                />
              </div>
            )}

            {progress && <ProgressBar {...progress} />}
            <button className="btn mt-5" onClick={apply} disabled={busy}>
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} {tr({ ar: 'تطبيق وتنزيل', en: 'Apply & download' })}
            </button>
            {error && <p className="text-rose-600 text-sm mt-3 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">{error}</p>}
            {okMsg && <p className="text-teal-700 text-sm mt-3 bg-teal-50 border border-teal-200 rounded-xl px-3 py-2">✓ {okMsg}</p>}
          </div>
        )}
      </div>
    </ToolPage>
  );
}
