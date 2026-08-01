import { useState } from 'react';
import { Download, Image as ImageIcon, FileText, Presentation, FileArchive } from 'lucide-react';
import { jsPDF } from 'jspdf';
import ToolPage from '../../components/ToolPage';
import FileDrop from '../../components/FileDrop';
import ProgressBar from '../../components/ProgressBar';
import { loadPdfJs, renderPage } from '../../lib/pdf';
import { validatePdf, validateImage, downloadZip, downloadBlob, fileErrorMessage, formatSize } from '../../lib/fileUtils';
import { useLang } from '../../lib/i18n';

type Tab = 'img2pdf' | 'pdf2img' | 'ppt2pdf';

export default function Convert() {
  const { tr, lang } = useLang();
  const [tab, setTab] = useState<Tab>('img2pdf');
  const [progress, setProgress] = useState<{ pct: number; label: string; done?: boolean } | null>(null);
  const [error, setError] = useState('');
  const [okMsg, setOkMsg] = useState('');

  const finish = (msg: string) => {
    setProgress({ pct: 100, label: tr({ ar: 'اكتمل التحويل', en: 'Conversion complete' }), done: true });
    setOkMsg(msg);
    setTimeout(() => setProgress(null), 2500);
  };

  /** صور ← PDF حقيقي عبر Canvas + jsPDF */
  const img2pdf = async (fs: File[]) => {
    setError(''); setOkMsg('');
    try {
      const imgs = fs.filter((f) => f.type.startsWith('image/'));
      if (!imgs.length) { setError(tr({ ar: 'لم يتم اختيار أي صورة صالحة', en: 'No valid images selected' })); return; }
      const pdf = new jsPDF({ unit: 'pt', compress: true });
      pdf.deletePage(1);
      for (let i = 0; i < imgs.length; i++) {
        setProgress({ pct: (i / imgs.length) * 90, label: tr({ ar: `معالجة الصورة ${i + 1}/${imgs.length}`, en: `Processing image ${i + 1}/${imgs.length}` }) });
        const im = await validateImage(imgs[i]);
        const canvas = document.createElement('canvas');
        canvas.width = im.naturalWidth; canvas.height = im.naturalHeight;
        canvas.getContext('2d')!.drawImage(im, 0, 0);
        const data = canvas.toDataURL('image/jpeg', 0.9);
        pdf.addPage([im.naturalWidth, im.naturalHeight], im.naturalWidth > im.naturalHeight ? 'landscape' : 'portrait');
        pdf.addImage(data, 'JPEG', 0, 0, im.naturalWidth, im.naturalHeight);
        await new Promise((r) => setTimeout(r, 10));
      }
      setProgress({ pct: 95, label: tr({ ar: 'إنشاء PDF...', en: 'Building PDF...' }) });
      const blob = pdf.output('blob');
      const size = downloadBlob(blob, 'khotwa-images.pdf', 'application/pdf');
      finish(tr({ ar: `تم تحويل ${imgs.length} صورة إلى PDF (${formatSize(size)})`, en: `Converted ${imgs.length} images to PDF (${formatSize(size)})` }));
    } catch (e) { setError(fileErrorMessage(e, lang)); setProgress(null); }
  };

  /** PDF ← صور PNG حقيقية عبر pdf.js + Canvas، تُحزم في ZIP واحد */
  const pdf2img = async (fs: File[]) => {
    setError(''); setOkMsg('');
    try {
      const buf = await validatePdf(fs[0]);
      const doc = await loadPdfJs(buf);
      const files: { name: string; data: Blob }[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        setProgress({ pct: (i / doc.numPages) * 80, label: tr({ ar: `تحويل الصفحة ${i}/${doc.numPages}`, en: `Rendering page ${i}/${doc.numPages}` }) });
        const page = await doc.getPage(i);
        const canvas = await renderPage(page, 2);
        const blob = await new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('render failed'))), 'image/png'));
        files.push({ name: `page-${String(i).padStart(3, '0')}.png`, data: blob });
      }
      if (files.length === 1) {
        const size = downloadBlob(files[0].data, 'khotwa-page-1.png', 'image/png');
        finish(tr({ ar: `تم تنزيل الصورة (${formatSize(size)})`, en: `Downloaded image (${formatSize(size)})` }));
      } else {
        const size = await downloadZip(files, 'khotwa-pdf-images.zip', (pct) =>
          setProgress({ pct: 80 + pct * 0.2, label: tr({ ar: 'ضغط الصور في ZIP...', en: 'Zipping images...' }) }));
        finish(tr({ ar: `تم تنزيل ${files.length} صورة في ZIP واحد (${formatSize(size)})`, en: `Downloaded ${files.length} images in one ZIP (${formatSize(size)})` }));
      }
    } catch (e) { setError(fileErrorMessage(e, lang)); setProgress(null); }
  };

  /** PPTX ← PDF: استخراج نص الشرائح من XML ورسمها على Canvas */
  const ppt2pdf = async (fs: File[]) => {
    setError(''); setOkMsg('');
    try {
      const f = fs[0];
      if (!/\.pptx$/i.test(f.name)) { setError(tr({ ar: 'اختر ملف PPTX (لا يدعم PPT القديم)', en: 'Pick a PPTX file (legacy PPT unsupported)' })); return; }
      setProgress({ pct: 10, label: tr({ ar: 'فك ضغط العرض...', en: 'Unpacking presentation...' }) });
      const JSZip = (await import('jszip')).default;
      const zip = await JSZip.loadAsync(await f.arrayBuffer());
      const slideFiles = Object.keys(zip.files)
        .filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))
        .sort((a, b) => parseInt(a.match(/\d+/g)!.pop()!) - parseInt(b.match(/\d+/g)!.pop()!));
      if (!slideFiles.length) throw new Error(tr({ ar: 'ليس ملف PPTX صالحاً', en: 'Not a valid PPTX file' }));

      const pdf = new jsPDF({ unit: 'pt', format: [720, 405], orientation: 'landscape' });
      const parser = new DOMParser();
      let first = true;
      for (let si = 0; si < slideFiles.length; si++) {
        setProgress({ pct: 10 + (si / slideFiles.length) * 85, label: tr({ ar: `معالجة الشريحة ${si + 1}/${slideFiles.length}`, en: `Slide ${si + 1}/${slideFiles.length}` }) });
        const xml = await zip.files[slideFiles[si]].async('text');
        const dom = parser.parseFromString(xml, 'application/xml');
        const paras: string[] = [];
        dom.querySelectorAll('*').forEach((el) => {
          if (el.localName === 'p') {
            const runs: string[] = [];
            el.querySelectorAll('*').forEach((r) => { if (r.localName === 't') runs.push(r.textContent || ''); });
            const t = runs.join('').trim();
            if (t) paras.push(t);
          }
        });
        const canvas = document.createElement('canvas');
        canvas.width = 1440; canvas.height = 810;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 1440, 810);
        ctx.fillStyle = '#0d4f47'; ctx.fillRect(0, 0, 1440, 8);
        const hasArabic = /[\u0600-\u06FF]/.test(paras.join(''));
        (ctx as any).direction = hasArabic ? 'rtl' : 'ltr';
        ctx.textAlign = hasArabic ? 'right' : 'left';
        const x = hasArabic ? 1360 : 80;
        let y = 120;
        paras.forEach((p, i) => {
          ctx.fillStyle = i === 0 ? '#0d4f47' : '#333333';
          ctx.font = i === 0 ? 'bold 48px Rubik, sans-serif' : '30px Rubik, sans-serif';
          const words = p.split(' ');
          let line = '';
          for (const w of words) {
            const test = line ? line + ' ' + w : w;
            if (ctx.measureText(test).width > 1280 && line) { ctx.fillText(line, x, y); y += i === 0 ? 60 : 44; line = w; }
            else line = test;
          }
          if (line) { ctx.fillText(line, x, y); y += i === 0 ? 80 : 48; }
        });
        if (!first) pdf.addPage([720, 405], 'landscape');
        first = false;
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.9), 'JPEG', 0, 0, 720, 405);
        await new Promise((r) => setTimeout(r, 5));
      }
      const size = downloadBlob(pdf.output('blob'), 'khotwa-slides.pdf', 'application/pdf');
      finish(tr({ ar: `تم تحويل ${slideFiles.length} شريحة إلى PDF (${formatSize(size)})`, en: `Converted ${slideFiles.length} slides to PDF (${formatSize(size)})` }));
    } catch (e) { setError(fileErrorMessage(e, lang)); setProgress(null); }
  };

  const TABS = [
    { id: 'img2pdf' as Tab, icon: ImageIcon, label: { ar: 'صور ← PDF', en: 'Images → PDF' } },
    { id: 'pdf2img' as Tab, icon: FileText, label: { ar: 'PDF ← صور', en: 'PDF → Images' } },
    { id: 'ppt2pdf' as Tab, icon: Presentation, label: { ar: 'PPTX ← PDF', en: 'PPTX → PDF' } },
  ];

  const busy = progress !== null && !progress.done;

  return (
    <ToolPage id="convert">
      <div className="flex flex-wrap gap-2 mb-5">
        {TABS.map((t) => {
          const I = t.icon;
          return (
            <button key={t.id} onClick={() => { setTab(t.id); setError(''); setOkMsg(''); setProgress(null); }}
              className={`px-4 py-2 rounded-xl text-sm font-bold border flex items-center gap-2 ${tab === t.id ? 'bg-teal-800 text-white border-teal-800' : 'bg-white border-stone-300'}`}>
              <I size={16} /> {tr(t.label)}
            </button>
          );
        })}
      </div>

      {!busy && tab === 'img2pdf' && <FileDrop accept="image/*" multiple onFiles={img2pdf} label={tr({ ar: 'اختر صوراً لتحويلها إلى PDF واحد حقيقي', en: 'Pick images → one real PDF file' })} />}
      {!busy && tab === 'pdf2img' && <FileDrop accept="application/pdf" onFiles={pdf2img} label={tr({ ar: 'اختر PDF — كل الصفحات تُنزّل كـ PNG في ZIP واحد', en: 'Pick a PDF — all pages download as PNG in one ZIP' })} />}
      {!busy && tab === 'ppt2pdf' && <FileDrop accept=".pptx" onFiles={ppt2pdf} label={tr({ ar: 'اختر عرض PPTX (يُستخرج نص الشرائح)', en: 'Pick a PPTX (slide text is extracted)' })} />}

      {progress && <div className="card mt-4"><ProgressBar {...progress} /></div>}
      {error && <p className="text-rose-600 text-sm mt-3 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">{error}</p>}
      {okMsg && <p className="text-teal-700 text-sm mt-3 bg-teal-50 border border-teal-200 rounded-xl px-3 py-2">✓ {okMsg}</p>}
      <div className="mt-5 flex items-center gap-2 text-xs text-stone-400"><Download size={14} /> {tr({ ar: 'معالجة 100% محلية في متصفحك — ملفات حقيقية وليست رسائل وهمية', en: '100% local in-browser processing — real files, not mock messages' })} <FileArchive size={14} /></div>
    </ToolPage>
  );
}
