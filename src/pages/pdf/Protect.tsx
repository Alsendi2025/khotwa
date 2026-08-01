import { useState } from 'react';
import { Lock, Unlock, Download, Loader2, Eye, EyeOff } from 'lucide-react';
import { PDFDocument } from '@cantoo/pdf-lib';
import ToolPage from '../../components/ToolPage';
import FileDrop from '../../components/FileDrop';
import ProgressBar from '../../components/ProgressBar';
import { validatePdf, downloadBlob, fileErrorMessage, formatSize } from '../../lib/fileUtils';
import { useLang } from '../../lib/i18n';

export default function Protect() {
  const { tr, lang } = useLang();
  const [tab, setTab] = useState<'protect' | 'unlock'>('protect');
  const [file, setFile] = useState<File | null>(null);
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ pct: number; label: string; done?: boolean } | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const pick = async (fs: File[]) => {
    setMsg(null);
    try {
      if (fs[0].size === 0) throw new Error('empty');
      const head = new TextDecoder().decode(new Uint8Array((await fs[0].slice(0, 1024).arrayBuffer())));
      if (!head.includes('%PDF-')) { setMsg({ ok: false, text: fileErrorMessage({ name: 'FileError', message: 'not_pdf', code: 'not_pdf' } as any, lang) }); return; }
      setFile(fs[0]);
    } catch { setMsg({ ok: false, text: tr({ ar: 'تعذر قراءة الملف', en: 'Could not read file' }) }); }
  };

  const run = async () => {
    if (!file) return;
    if (!pw) { setMsg({ ok: false, text: tr({ ar: 'أدخل كلمة المرور', en: 'Enter the password' }) }); return; }
    if (tab === 'protect' && pw.length < 4) { setMsg({ ok: false, text: tr({ ar: 'كلمة المرور 4 أحرف على الأقل', en: 'Password must be 4+ chars' }) }); return; }
    setBusy(true); setMsg(null);
    try {
      setProgress({ pct: 15, label: tr({ ar: 'قراءة الملف...', en: 'Reading file...' }) });
      const buf = await file.arrayBuffer();
      if (tab === 'protect') {
        const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
        setProgress({ pct: 55, label: tr({ ar: 'تشفير الملف بـ AES...', en: 'Encrypting with AES...' }) });
        await doc.encrypt({ userPassword: pw, ownerPassword: pw, permissions: { printing: 'highResolution', copying: true } });
        setProgress({ pct: 85, label: tr({ ar: 'إنشاء الملف...', en: 'Building file...' }) });
        const size = downloadBlob(await doc.save(), 'khotwa-protected.pdf', 'application/pdf');
        setProgress({ pct: 100, label: tr({ ar: 'تمت الحماية', en: 'Protected' }), done: true });
        setMsg({ ok: true, text: tr({ ar: `تم التنزيل (${formatSize(size)}) — احتفظ بكلمة المرور!`, en: `Downloaded (${formatSize(size)}) — keep the password safe!` }) });
      } else {
        setProgress({ pct: 40, label: tr({ ar: 'فك التشفير...', en: 'Decrypting...' }) });
        const doc = await PDFDocument.load(buf, { password: pw } as any);
        const out = await PDFDocument.create();
        setProgress({ pct: 70, label: tr({ ar: 'نسخ الصفحات...', en: 'Copying pages...' }) });
        const pages = await out.copyPages(doc, doc.getPageIndices());
        pages.forEach((p) => out.addPage(p));
        const size = downloadBlob(await out.save(), 'khotwa-unlocked.pdf', 'application/pdf');
        setProgress({ pct: 100, label: tr({ ar: 'تم فك الحماية', en: 'Unlocked' }), done: true });
        setMsg({ ok: true, text: tr({ ar: `تم فك الحماية والتنزيل (${formatSize(size)})`, en: `Unlocked & downloaded (${formatSize(size)})` }) });
      }
      setTimeout(() => setProgress(null), 2500);
    } catch (e: any) {
      setProgress(null);
      setMsg({ ok: false, text: tab === 'unlock' ? tr({ ar: 'كلمة مرور خاطئة أو ملف غير مدعوم', en: 'Wrong password or unsupported file' }) : fileErrorMessage(e, lang) });
    }
    setBusy(false);
  };

  return (
    <ToolPage id="pdf-protect">
      <div className="flex gap-2 mb-5">
        <button onClick={() => { setTab('protect'); setMsg(null); }} className={`px-4 py-2 rounded-xl text-sm font-bold border flex items-center gap-2 ${tab === 'protect' ? 'bg-teal-800 text-white border-teal-800' : 'bg-white border-stone-300'}`}>
          <Lock size={16} /> {tr({ ar: 'إضافة كلمة مرور', en: 'Add password' })}
        </button>
        <button onClick={() => { setTab('unlock'); setMsg(null); }} className={`px-4 py-2 rounded-xl text-sm font-bold border flex items-center gap-2 ${tab === 'unlock' ? 'bg-teal-800 text-white border-teal-800' : 'bg-white border-stone-300'}`}>
          <Unlock size={16} /> {tr({ ar: 'فك الحماية', en: 'Remove password' })}
        </button>
      </div>

      <div className="space-y-4">
        <FileDrop accept="application/pdf" onFiles={pick} />
        {file && (
          <div className="card">
            <p className="text-sm font-semibold mb-3" dir="ltr">{file.name}</p>
            <label className="text-sm font-bold text-stone-600">
              {tab === 'protect' ? tr({ ar: 'كلمة المرور الجديدة', en: 'New password' }) : tr({ ar: 'كلمة مرور الملف', en: 'Current password' })}
            </label>
            <div className="relative mt-1">
              <input type={show ? 'text' : 'password'} className="field pe-10" value={pw} onChange={(e) => setPw(e.target.value)} dir="ltr" />
              <button onClick={() => setShow(!show)} className="absolute end-3 top-1/2 -translate-y-1/2 text-stone-400">{show ? <EyeOff size={17} /> : <Eye size={17} />}</button>
            </div>
            {progress && <ProgressBar {...progress} />}
            <button className="btn mt-4" onClick={run} disabled={busy}>
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              {tab === 'protect' ? tr({ ar: 'حماية وتنزيل', en: 'Protect & download' }) : tr({ ar: 'فك الحماية وتنزيل', en: 'Unlock & download' })}
            </button>
            {msg && <p className={`text-sm mt-3 font-medium ${msg.ok ? 'text-teal-700' : 'text-rose-600'}`}>{msg.text}</p>}
          </div>
        )}
      </div>
    </ToolPage>
  );
}
