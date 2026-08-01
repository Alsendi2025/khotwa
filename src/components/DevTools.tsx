import { useState } from 'react';
import { Wrench, Download, Eye, Copy, Check, X, FileCode2, Database, FileText, Link2 } from 'lucide-react';
import { useLang } from '../lib/i18n';

type DevFile = { path: string; label_ar: string; label_en: string; download: string; icon: typeof FileCode2 };

const FILES: DevFile[] = [
  { path: '/dev/env.example.txt', label_ar: 'ملف البيئة .env.example', label_en: '.env.example', download: '.env.example', icon: FileCode2 },
  { path: '/dev/schema.sql', label_ar: 'مخطط قاعدة البيانات schema.sql', label_en: 'database/schema.sql', download: 'schema.sql', icon: Database },
  { path: '/dev/HOW_TO_EXPORT.txt', label_ar: 'دليل التصدير HOW_TO_EXPORT.txt', label_en: 'database/HOW_TO_EXPORT.txt', download: 'HOW_TO_EXPORT.txt', icon: FileText },
];

export default function DevTools() {
  const { tr } = useLang();
  const [viewer, setViewer] = useState<{ title: string; content: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const deployUrl = window.location.origin;

  const fetchFile = async (path: string): Promise<string> => {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.text();
  };

  const view = async (f: DevFile) => {
    setError('');
    try {
      setViewer({ title: f.download, content: await fetchFile(f.path) });
    } catch {
      setError(tr({ ar: `تعذر تحميل ${f.download}`, en: `Failed to load ${f.download}` }));
    }
  };

  const download = async (f: DevFile) => {
    setError('');
    try {
      const text = await fetchFile(f.path);
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = f.download;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch {
      setError(tr({ ar: `تعذر تنزيل ${f.download}`, en: `Failed to download ${f.download}` }));
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(deployUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section className="max-w-6xl mx-auto px-4 pb-12">
      <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/60 p-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center"><Wrench size={16} /></span>
          <h2 className="font-display font-bold text-amber-900">{tr({ ar: 'أدوات المطور (مؤقت — للمعاينة فقط)', en: 'Dev Tools (temporary — preview only)' })}</h2>
        </div>
        <p className="text-xs text-amber-800/70 mb-4">{tr({ ar: 'ملفات التصدير والإعداد — يُزال هذا القسم قبل الإطلاق النهائي', en: 'Export & setup files — this section is removed before final launch' })}</p>

        {/* ملفات التنزيل والمعاينة */}
        <div className="grid sm:grid-cols-3 gap-2.5">
          {FILES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.path} className="bg-white rounded-xl border border-amber-200 p-3">
                <p className="text-xs font-bold flex items-center gap-1.5 text-stone-700 mb-2.5">
                  <Icon size={14} className="text-amber-600 shrink-0" />
                  <span className="truncate" dir="ltr">{tr({ ar: f.label_ar, en: f.label_en })}</span>
                </p>
                <div className="flex gap-1.5">
                  <button onClick={() => view(f)} className="flex-1 flex items-center justify-center gap-1 text-[11px] font-bold rounded-lg border border-stone-300 py-1.5 hover:bg-stone-50">
                    <Eye size={12} /> {tr({ ar: 'عرض', en: 'View' })}
                  </button>
                  <button onClick={() => download(f)} className="flex-1 flex items-center justify-center gap-1 text-[11px] font-bold rounded-lg bg-teal-800 text-white py-1.5 hover:bg-teal-700">
                    <Download size={12} /> {tr({ ar: 'تنزيل', en: 'Download' })}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* رابط النشر المباشر */}
        <div className="mt-3 bg-white rounded-xl border border-amber-200 p-3">
          <p className="text-xs font-bold flex items-center gap-1.5 text-stone-700 mb-2">
            <Link2 size={14} className="text-amber-600" /> {tr({ ar: 'رابط النشر المباشر (Vercel)', en: 'Direct deployment URL (Vercel)' })}
          </p>
          <div className="flex gap-1.5 items-center">
            <code dir="ltr" className="flex-1 text-xs bg-stone-900 text-emerald-300 rounded-lg px-3 py-2 overflow-x-auto whitespace-nowrap select-all">{deployUrl}</code>
            <button onClick={copyUrl} className="flex items-center gap-1 text-[11px] font-bold rounded-lg bg-teal-800 text-white px-3 py-2 hover:bg-teal-700 shrink-0">
              {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? tr({ ar: 'تم النسخ', en: 'Copied' }) : tr({ ar: 'نسخ', en: 'Copy' })}
            </button>
          </div>
        </div>

        {error && <p className="text-rose-600 text-xs mt-2 font-semibold">{error}</p>}
      </div>

      {/* عارض الملفات */}
      {viewer && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setViewer(null)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 bg-stone-800 text-white">
              <p className="text-sm font-mono font-bold" dir="ltr">{viewer.title}</p>
              <div className="flex items-center gap-2">
                <button onClick={() => { navigator.clipboard.writeText(viewer.content); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                  className="flex items-center gap-1 text-xs hover:text-emerald-300">
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                </button>
                <button onClick={() => setViewer(null)} className="hover:text-rose-400"><X size={18} /></button>
              </div>
            </div>
            <pre dir="ltr" className="flex-1 overflow-auto p-4 text-xs leading-relaxed bg-stone-900 text-emerald-200 font-mono whitespace-pre-wrap">{viewer.content}</pre>
          </div>
        </div>
      )}
    </section>
  );
}
