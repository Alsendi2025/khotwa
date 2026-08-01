import { useState } from 'react';
import { Layers, Scissors, Download, X, ChevronUp, ChevronDown, FileArchive } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import ToolPage from '../../components/ToolPage';
import FileDrop from '../../components/FileDrop';
import ProgressBar from '../../components/ProgressBar';
import { validatePdf, downloadBlob, downloadZip, fileErrorMessage, formatSize } from '../../lib/fileUtils';
import { useLang } from '../../lib/i18n';

type Item = { file: File; pages: number };

export default function MergeSplit() {
  const { tr, lang } = useLang();
  const [tab, setTab] = useState<'merge' | 'split'>('merge');
  const [items, setItems] = useState<Item[]>([]);
  const [splitItem, setSplitItem] = useState<Item | null>(null);
  const [rangeStr, setRangeStr] = useState('');
  const [progress, setProgress] = useState<{ pct: number; label: string; done?: boolean } | null>(null);
  const [error, setError] = useState('');
  const [okMsg, setOkMsg] = useState('');

  const addFiles = async (fs: File[]) => {
    setError(''); setOkMsg('');
    for (const f of fs) {
      try {
        const buf = await validatePdf(f);
        const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
        setItems((p) => [...p, { file: f, pages: doc.getPageCount() }]);
      } catch (e) { setError(`${f.name}: ${fileErrorMessage(e, lang)}`); }
    }
  };

  const pickSplit = async (fs: File[]) => {
    setError(''); setOkMsg('');
    try {
      const buf = await validatePdf(fs[0]);
      const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
      setSplitItem({ file: fs[0], pages: doc.getPageCount() });
      setRangeStr(`1-${doc.getPageCount()}`);
    } catch (e) { setError(fileErrorMessage(e, lang)); }
  };

  const move = (i: number, d: number) => setItems((a) => {
    const b = [...a]; const j = i + d;
    if (j < 0 || j >= b.length) return b;
    [b[i], b[j]] = [b[j], b[i]];
    return b;
  });

  const merge = async () => {
    setError(''); setOkMsg('');
    try {
      const out = await PDFDocument.create();
      for (let i = 0; i < items.length; i++) {
        setProgress({ pct: (i / items.length) * 90, label: tr({ ar: `دمج: ${items[i].file.name}`, en: `Merging: ${items[i].file.name}` }) });
        const src = await PDFDocument.load(await items[i].file.arrayBuffer(), { ignoreEncryption: true });
        const pages = await out.copyPages(src, src.getPageIndices());
        pages.forEach((p) => out.addPage(p));
        await new Promise((r) => setTimeout(r, 10));
      }
      setProgress({ pct: 95, label: tr({ ar: 'إنشاء الملف النهائي...', en: 'Building final file...' }) });
      const bytes = await out.save();
      const size = downloadBlob(bytes, 'khotwa-merged.pdf', 'application/pdf');
      setProgress({ pct: 100, label: tr({ ar: 'اكتمل الدمج', en: 'Merge complete' }), done: true });
      setOkMsg(tr({ ar: `تم تنزيل الملف (${formatSize(size)}، ${out.getPageCount()} صفحة)`, en: `Downloaded (${formatSize(size)}, ${out.getPageCount()} pages)` }));
      setTimeout(() => setProgress(null), 2500);
    } catch (e) { setError(fileErrorMessage(e, lang)); setProgress(null); }
  };

  const parseRanges = (s: string, max: number): number[] => {
    const set = new Set<number>();
    for (const part of s.split(',')) {
      const m = part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);
      if (!m) continue;
      const a = +m[1], b = m[2] ? +m[2] : a;
      for (let i = Math.min(a, b); i <= Math.max(a, b); i++) if (i >= 1 && i <= max) set.add(i - 1);
    }
    return [...set].sort((x, y) => x - y);
  };

  const extract = async () => {
    if (!splitItem) return;
    setError(''); setOkMsg('');
    try {
      const idx = parseRanges(rangeStr, splitItem.pages);
      if (!idx.length) { setError(tr({ ar: 'نطاق صفحات غير صالح — مثال صحيح: 1-3, 5', en: 'Invalid range — valid example: 1-3, 5' })); return; }
      setProgress({ pct: 20, label: tr({ ar: 'قراءة الملف...', en: 'Reading file...' }) });
      const src = await PDFDocument.load(await splitItem.file.arrayBuffer(), { ignoreEncryption: true });
      setProgress({ pct: 60, label: tr({ ar: `استخراج ${idx.length} صفحة...`, en: `Extracting ${idx.length} pages...` }) });
      const out = await PDFDocument.create();
      const pages = await out.copyPages(src, idx);
      pages.forEach((p) => out.addPage(p));
      const size = downloadBlob(await out.save(), 'khotwa-extract.pdf', 'application/pdf');
      setProgress({ pct: 100, label: tr({ ar: 'اكتمل الاستخراج', en: 'Extraction complete' }), done: true });
      setOkMsg(tr({ ar: `تم تنزيل ${idx.length} صفحة (${formatSize(size)})`, en: `Downloaded ${idx.length} pages (${formatSize(size)})` }));
      setTimeout(() => setProgress(null), 2500);
    } catch (e) { setError(fileErrorMessage(e, lang)); setProgress(null); }
  };

  const splitAllToZip = async () => {
    if (!splitItem) return;
    setError(''); setOkMsg('');
    try {
      const src = await PDFDocument.load(await splitItem.file.arrayBuffer(), { ignoreEncryption: true });
      const files: { name: string; data: Uint8Array }[] = [];
      const n = src.getPageCount();
      for (let i = 0; i < n; i++) {
        setProgress({ pct: (i / n) * 80, label: tr({ ar: `تقسيم الصفحة ${i + 1}/${n}`, en: `Splitting page ${i + 1}/${n}` }) });
        const out = await PDFDocument.create();
        const [p] = await out.copyPages(src, [i]);
        out.addPage(p);
        files.push({ name: `page-${String(i + 1).padStart(3, '0')}.pdf`, data: await out.save() });
        await new Promise((r) => setTimeout(r, 5));
      }
      const size = await downloadZip(files, 'khotwa-split-pages.zip', (pct) =>
        setProgress({ pct: 80 + pct * 0.2, label: tr({ ar: 'ضغط الملفات في ZIP...', en: 'Zipping files...' }) }));
      setProgress({ pct: 100, label: tr({ ar: 'اكتمل التقسيم', en: 'Split complete' }), done: true });
      setOkMsg(tr({ ar: `تم تنزيل ${n} ملفات في أرشيف ZIP واحد (${formatSize(size)})`, en: `Downloaded ${n} files in one ZIP (${formatSize(size)})` }));
      setTimeout(() => setProgress(null), 2500);
    } catch (e) { setError(fileErrorMessage(e, lang)); setProgress(null); }
  };

  const busy = progress !== null && !progress.done;

  return (
    <ToolPage id="pdf-merge">
      <div className="flex gap-2 mb-5">
        <button onClick={() => { setTab('merge'); setError(''); setOkMsg(''); }} className={`px-4 py-2 rounded-xl text-sm font-bold border flex items-center gap-2 ${tab === 'merge' ? 'bg-teal-800 text-white border-teal-800' : 'bg-white border-stone-300'}`}>
          <Layers size={16} /> {tr({ ar: 'دمج ملفات', en: 'Merge' })}
        </button>
        <button onClick={() => { setTab('split'); setError(''); setOkMsg(''); }} className={`px-4 py-2 rounded-xl text-sm font-bold border flex items-center gap-2 ${tab === 'split' ? 'bg-teal-800 text-white border-teal-800' : 'bg-white border-stone-300'}`}>
          <Scissors size={16} /> {tr({ ar: 'تقسيم / استخراج', en: 'Split / Extract' })}
        </button>
      </div>

      {tab === 'merge' ? (
        <div className="space-y-4">
          <FileDrop accept="application/pdf" multiple onFiles={addFiles} />
          {items.length > 0 && (
            <div className="card space-y-2">
              {items.map((it, i) => (
                <div key={i} className="flex items-center gap-2 bg-stone-50 rounded-xl px-3 py-2">
                  <span className="text-xs font-bold text-teal-800 bg-teal-100 rounded-full w-6 h-6 flex items-center justify-center shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate" dir="ltr">{it.file.name}</p>
                    <p className="text-[10px] text-stone-400">{it.pages} {tr({ ar: 'صفحة', en: 'pages' })} · {formatSize(it.file.size)}</p>
                  </div>
                  <button onClick={() => move(i, -1)} className="text-stone-400 hover:text-teal-700"><ChevronUp size={16} /></button>
                  <button onClick={() => move(i, 1)} className="text-stone-400 hover:text-teal-700"><ChevronDown size={16} /></button>
                  <button onClick={() => setItems((a) => a.filter((_, j) => j !== i))} className="text-stone-400 hover:text-rose-600"><X size={16} /></button>
                </div>
              ))}
              {progress && <ProgressBar {...progress} />}
              <button className="btn w-full mt-2" onClick={merge} disabled={busy || items.length < 2}>
                <Download size={16} /> {tr({ ar: `دمج ${items.length} ملفات وتنزيل PDF حقيقي`, en: `Merge ${items.length} files & download` })}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <FileDrop accept="application/pdf" onFiles={pickSplit} />
          {splitItem && (
            <div className="card">
              <p className="text-sm font-semibold mb-1" dir="ltr">{splitItem.file.name}</p>
              <p className="text-xs text-stone-400 mb-3">{splitItem.pages} {tr({ ar: 'صفحة', en: 'pages' })} · {formatSize(splitItem.file.size)}</p>
              <label className="text-sm font-bold text-stone-600">{tr({ ar: 'الصفحات المطلوبة (مثل: 1-3, 5, 8-10)', en: 'Pages to extract (e.g. 1-3, 5, 8-10)' })}</label>
              <input dir="ltr" className="field mt-1 font-mono" value={rangeStr} onChange={(e) => setRangeStr(e.target.value)} />
              {progress && <ProgressBar {...progress} />}
              <div className="flex flex-wrap gap-2 mt-3">
                <button className="btn" onClick={extract} disabled={busy}>
                  <Download size={16} /> {tr({ ar: 'استخراج الصفحات', en: 'Extract pages' })}
                </button>
                <button className="btn-soft" onClick={splitAllToZip} disabled={busy}>
                  <FileArchive size={16} /> {tr({ ar: 'تقسيم كل صفحة ← ZIP واحد', en: 'Split all pages → one ZIP' })}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {error && <p className="text-rose-600 text-sm mt-3 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">{error}</p>}
      {okMsg && <p className="text-teal-700 text-sm mt-3 bg-teal-50 border border-teal-200 rounded-xl px-3 py-2">✓ {okMsg}</p>}
    </ToolPage>
  );
}
