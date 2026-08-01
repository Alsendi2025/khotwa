import { useEffect, useState } from 'react';
import { CheckCircle2, Download, ExternalLink, X, FileDown } from 'lucide-react';
import { useLang } from '../lib/i18n';
import type { DownloadEventDetail } from '../lib/pdf';

type Item = DownloadEventDetail & { id: number };

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

/**
 * Global toast that appears whenever a tool generates a file.
 * Shows an explicit blob-URL <a download> link so the file can be saved even
 * when the app runs inside a preview iframe that blocks programmatic downloads.
 */
export default function DownloadToast() {
  const { tr } = useLang();
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    let counter = 0;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<DownloadEventDetail>).detail;
      const id = ++counter;
      setItems((prev) => [...prev.slice(-2), { ...detail, id }]);
      // auto-dismiss after 45s (blob URL itself stays valid for 10 min)
      setTimeout(() => setItems((prev) => prev.filter((i) => i.id !== id)), 45000);
    };
    window.addEventListener('khotwa:download', handler);
    return () => window.removeEventListener('khotwa:download', handler);
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:end-4 z-[60] flex flex-col gap-2 sm:w-96">
      {items.map((item) => (
        <div key={item.id} className="bg-white rounded-2xl border-2 border-teal-500 shadow-2xl p-4 animate-[slideUp_0.3s_ease-out]">
          <div className="flex items-start gap-3">
            <span className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-ink">{tr({ ar: 'تم إنشاء الملف بنجاح!', en: 'File generated successfully!' })}</p>
              <p className="text-xs text-stone-500 truncate flex items-center gap-1 mt-0.5" dir="ltr">
                <FileDown size={11} className="shrink-0" /> {item.name} · {formatSize(item.size)}
              </p>
            </div>
            <button onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
              className="text-stone-300 hover:text-rose-500 shrink-0"><X size={16} /></button>
          </div>
          <p className="text-[11px] text-stone-400 mt-2 leading-relaxed">
            {tr({
              ar: 'إن لم يبدأ التنزيل تلقائياً (مثلاً داخل نافذة المعاينة)، استخدم الأزرار أدناه:',
              en: "If the download didn't start automatically (e.g. inside a preview frame), use the buttons below:",
            })}
          </p>
          <div className="flex gap-2 mt-2">
            <a href={item.url} download={item.name}
              className="btn !py-2 text-xs flex-1 justify-center">
              <Download size={14} /> {tr({ ar: 'تنزيل الملف', en: 'Download file' })}
            </a>
            <a href={item.url} target="_blank" rel="noreferrer"
              className="btn-soft !py-2 text-xs flex-1 justify-center">
              <ExternalLink size={14} /> {tr({ ar: 'فتح في تبويب', en: 'Open in tab' })}
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
