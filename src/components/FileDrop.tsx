import { useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { useLang } from '../lib/i18n';

export default function FileDrop({ accept, multiple, onFiles, label }: {
  accept: string; multiple?: boolean; onFiles: (files: File[]) => void; label?: string;
}) {
  const { tr } = useLang();
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  return (
    <div
      onClick={() => ref.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); onFiles(Array.from(e.dataTransfer.files)); }}
      className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${drag ? 'border-teal-600 bg-teal-50' : 'border-stone-300 bg-white hover:border-teal-500 hover:bg-teal-50/40'}`}
    >
      <UploadCloud className="mx-auto text-teal-700 mb-2" size={34} />
      <p className="font-medium text-ink">{label || tr({ ar: 'اسحب الملفات هنا أو انقر للاختيار', en: 'Drag files here or click to browse' })}</p>
      <p className="text-xs text-stone-400 mt-1">{tr({ ar: 'تتم المعالجة محلياً في متصفحك — لا يُرفع أي ملف للخادم', en: 'Processed locally in your browser — nothing is uploaded' })}</p>
      <input ref={ref} type="file" accept={accept} multiple={multiple} hidden
        onChange={(e) => { if (e.target.files?.length) onFiles(Array.from(e.target.files)); e.target.value = ''; }} />
    </div>
  );
}
