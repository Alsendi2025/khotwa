import { useState } from 'react';
import { Download, Loader2, RotateCw, Trash2, ChevronLeft, ChevronRight, Minimize2, CheckCircle2 } from 'lucide-react';
import { PDFDocument, degrees } from 'pdf-lib';
import { jsPDF } from 'jspdf';
import ToolPage from '../../components/ToolPage';
import FileDrop from '../../components/FileDrop';
import { loadPdfJs, renderPage } from '../../lib/pdf';
import { useLang } from '../../lib/i18n';
import { validatePdf, fileErrorMessage, downloadBlob, formatSize } from '../../lib/fileUtils';
import type { Progress } from '../../lib/fileUtils';

type PageItem = { idx: number; thumb: string; rotation: number; deleted: boolean };

export default function PageManager() {
  const { tr, lang } = useLang();
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [order, setOrder] = useState<number[]>([]);
  const [progress, setProgress] = useState<Progress>(null);
  const [quality, setQuality] = useState(0.6);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');

  const pick = async (fs: File[]) => {
    const f = fs[0];
    setError(''); setDone(''); setPages([]); setOrder([]);
    try {
      const buf = await validatePdf(f);
      setFile(f);
      const doc = await loadPdfJs(buf);
      const items: PageItem[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        setProgress({ pct: Math.round((i / doc.numPages) * 100), label: tr({ ar: `تحميل معاينة الصفحة ${i}/${doc.numPages}`, en: `Rendering page ${i}/${doc.numPages}` }) });
        const page = await doc.getPage(i);
        const canvas = await renderPage(page, 0.35);
        items.push({ idx: i - 1, thumb: canvas.toDataURL('image/jpeg', 0.7), rotation: 0, deleted: false });
      }
      setPages(items);
      setOrder(items.map((_, i) => i));
    } catch (e) { setError(fileErrorMessage(e, lang)); setFile(null); }
    setProgress(null);
  };

  const moveOrder = (pos: number, d: number) => setOrder((o) => {
    const a = [...o]; const j = pos + d;
    if (j < 0 || j >= a.length) return a;
    [a[pos], a[j]] = [a[j], a[pos]];
    return a;
  });

  const rotate = (i: number) => setPages((ps) => ps.map((p, j) => (j === i ? { ...p, rotation: (p.rotation + 90) % 360 } : p)));
  const toggleDel = (i: number) => setPages((ps) => ps.map((p, j) => (j === i ? { ...p, deleted: !p.deleted } : p)));

  const exportPdf = async () => {
    if (!file) return;
    setError(''); setDone('');
    try {
      setProgress({ pct: 20, label: tr({ ar: 'قراءة الملف...', en: 'Reading file...' }) });
      const src = await PDFDocument.load(await validatePdf(file), { ignoreEncryption: true });
      const out = await PDFDocument.create();
      const keep = order.filter((i) => !pages[i].deleted);
      if (!keep.length) { setError(tr({ ar: 'كل الصفحات محذوفة — أبقِ صفحة واحدة على الأقل', en: 'All pages deleted — keep at least one' })); setProgress(null); return; }
      setProgress({ pct: 55, label: tr({ ar: 'نسخ الصفحات بالترتيب الجديد...', en: 'Copying pages in new order...' }) });
      const copied = await out.copyPages(src, keep.map((i) => pages[i].idx));
      copied.forEach((p, k) => {
        const rot = pages[keep[k]].rotation;
        if (rot) p.setRotation(degrees((p.getRotation().angle + rot) % 360));
        out.addPage(p);
      });
      setProgress({ pct: 90, label: tr({ ar: 'إنشاء الملف...', en: 'Building file...' }) });
      const size = downloadBlob(await out.save(), 'khotwa-organized.pdf', 'application/pdf');
      setDone(tr({ ar: `تم التصدير والتنزيل (${keep.length} صفحة، ${formatSize(size)})`, en: `Exported & downloaded (${keep.length} pages, ${formatSize(size)})` }));
    } catch (e) { setError(fileErrorMessage(e, lang)); }
    setProgress(null);
  };

  const compress = async () => {
    if (!file) return;
    setError(''); setDone('');
    try {
      const originalSize = file.size;
      const doc = await loadPdfJs(await validatePdf(file));
      const pdf = new jsPDF({ unit: 'pt', compress: true });
      let first = true;
      const keep = order.filter((i) => !pages[i].deleted);
      for (let k = 0; k < keep.length; k++) {
        setProgress({ pct: Math.round((k / keep.length) * 90), label: tr({ ar: `ضغط الصفحة ${k + 1}/${keep.length}`, en: `Compressing page ${k + 1}/${keep.length}` }) });
        const page = await doc.getPage(pages[keep[k]].idx + 1);
        const canvas = await renderPage(page, 1.3);
        const img = canvas.toDataURL('image/jpeg', quality);
        const w = canvas.width * 0.55, h = canvas.height * 0.55;
        if (first) { pdf.deletePage(1); first = false; }
        pdf.addPage([w, h], w > h ? 'landscape' : 'portrait');
        pdf.addImage(img, 'JPEG', 0, 0, w, h);
      }
      setProgress({ pct: 95, label: tr({ ar: 'إنشاء الملف المضغوط...', en: 'Building compressed file...' }) });
      const blob = pdf.output('blob');
      downloadBlob(blob, 'khotwa-compressed.pdf', 'application/pdf');
      const saved = Math.max(0, Math.round((1 - blob.size / originalSize) * 100));
      setDone(tr({
        ar: `تم الضغط: ${formatSize(originalSize)} ← ${formatSize(blob.size)} (توفير ${saved}%)`,
        en: `Compressed: ${formatSize(originalSize)} → ${formatSize(blob.size)} (${saved}% saved)`,
      }));
    } catch (e) { setError(fileErrorMessage(e, lang)); }
    setProgress(null);
  };

  return (
    <ToolPage id="pdf-pages" wide>
      {!file && !progress && <FileDrop accept="application/pdf" onFiles={pick} />}

      {progress && (
        <div className="card !py-3 mb-4">
          <div className="flex justify-between text-xs font-semibold text-teal-800 mb-1.5">
            <span>{progress.label}</span><span dir="ltr">{progress.pct}%</span>
          </div>
          <div className="h-2.5 bg-stone-200 rounded-full overflow-hidden">
            <div className="h-full bg-teal-700 rounded-full transition-all duration-200" style={{ width: `${progress.pct}%` }} />
          </div>
        </div>
      )}

      {pages.length > 0 && (
        <>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <button className="btn" onClick={exportPdf} disabled={!!progress}>
              {progress ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} {tr({ ar: 'تصدير الترتيب الجديد', en: 'Export reorganized PDF' })}
            </button>
            <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl px-3 py-1.5">
              <Minimize2 size={15} className="text-amber-600" />
              <select className="text-sm bg-transparent" value={quality} onChange={(e) => setQuality(+e.target.value)}>
                <option value={0.75}>{tr({ ar: 'ضغط خفيف', en: 'Light compression' })}</option>
                <option value={0.6}>{tr({ ar: 'ضغط متوسط', en: 'Medium compression' })}</option>
                <option value={0.4}>{tr({ ar: 'ضغط قوي', en: 'Strong compression' })}</option>
              </select>
              <button className="btn-soft !py-1" onClick={compress} disabled={!!progress}>{tr({ ar: 'ضغط وتنزيل', en: 'Compress & download' })}</button>
            </div>
            {file && <span className="text-xs text-stone-400">{tr({ ar: 'الحجم الأصلي:', en: 'Original:' })} {formatSize(file.size)}</span>}
            <button className="text-sm text-stone-500 hover:text-rose-600 underline" onClick={() => { setFile(null); setPages([]); setDone(''); setError(''); }}>{tr({ ar: 'ملف آخر', en: 'Choose another file' })}</button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {order.map((pi, pos) => {
              const p = pages[pi];
              return (
                <div key={pi} className={`relative rounded-xl border-2 bg-white p-1.5 transition-all ${p.deleted ? 'border-rose-300 opacity-40' : 'border-stone-200'}`}>
                  <img src={p.thumb} alt="" className="w-full rounded-lg transition-transform" style={{ transform: `rotate(${p.rotation}deg)` }} />
                  <p className="text-center text-xs text-stone-400 mt-1">{pos + 1}</p>
                  <div className="absolute top-1.5 inset-x-1.5 flex justify-between">
                    <button onClick={() => moveOrder(pos, lang === 'ar' ? 1 : -1)} className="bg-white/90 rounded-md p-0.5 shadow text-stone-600 hover:text-teal-700"><ChevronLeft size={15} /></button>
                    <button onClick={() => moveOrder(pos, lang === 'ar' ? -1 : 1)} className="bg-white/90 rounded-md p-0.5 shadow text-stone-600 hover:text-teal-700"><ChevronRight size={15} /></button>
                  </div>
                  <div className="absolute bottom-6 inset-x-1.5 flex justify-center gap-1">
                    <button onClick={() => rotate(pi)} className="bg-white/90 rounded-md p-1 shadow text-stone-600 hover:text-teal-700"><RotateCw size={14} /></button>
                    <button onClick={() => toggleDel(pi)} className={`bg-white/90 rounded-md p-1 shadow ${p.deleted ? 'text-teal-700' : 'text-stone-600 hover:text-rose-600'}`}><Trash2 size={14} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      {done && <p className="flex items-center gap-2 text-teal-700 text-sm font-semibold mt-4"><CheckCircle2 size={17} /> {done}</p>}
      {error && <p className="text-rose-600 text-sm mt-3">{error}</p>}
    </ToolPage>
  );
}
