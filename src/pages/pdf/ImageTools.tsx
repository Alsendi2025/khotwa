import { useEffect, useRef, useState } from 'react';
import { Download, Loader2, ScanLine, UserSquare2 } from 'lucide-react';
import ToolPage from '../../components/ToolPage';
import FileDrop from '../../components/FileDrop';
import { download } from '../../lib/pdf';
import { useLang } from '../../lib/i18n';

type Tab = 'scan' | 'bg';

export default function ImageTools() {
  const { tr } = useLang();
  const [tab, setTab] = useState<Tab>('scan');
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [busy, setBusy] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanStrength, setScanStrength] = useState(60);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [tolerance, setTolerance] = useState(38);

  const pick = async (fs: File[]) => {
    const f = fs[0];
    if (!f.type.startsWith('image/')) return;
    const url = URL.createObjectURL(f);
    const im = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new window.Image(); i.onload = () => res(i); i.onerror = rej; i.src = url;
    });
    setImg(im);
  };

  useEffect(() => {
    if (!img || !canvasRef.current) return;
    setBusy(true);
    const t = setTimeout(() => {
      const maxW = 1400;
      const scale = Math.min(1, maxW / img.naturalWidth);
      const W = Math.round(img.naturalWidth * scale), H = Math.round(img.naturalHeight * scale);
      const c = canvasRef.current!;
      c.width = W; c.height = H;
      const ctx = c.getContext('2d')!;
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(img, 0, 0, W, H);
      const data = ctx.getImageData(0, 0, W, H);
      const px = data.data;

      if (tab === 'scan') {
        // grayscale + adaptive-ish contrast boost = scanner filter
        const k = scanStrength / 100;
        for (let i = 0; i < px.length; i += 4) {
          const g = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
          let v = (g - 128) * (1 + k * 2.2) + 128 + k * 30;
          v = Math.max(0, Math.min(255, v));
          px[i] = px[i + 1] = px[i + 2] = v;
        }
      } else {
        // BG removal: flood-fill-free chroma distance from corner-sampled background color
        const samples: number[][] = [];
        const corners = [[2, 2], [W - 3, 2], [2, H - 3], [W - 3, H - 3], [Math.floor(W / 2), 2]];
        for (const [x, y] of corners) {
          const o = (y * W + x) * 4;
          samples.push([px[o], px[o + 1], px[o + 2]]);
        }
        const target = bgColor === 'transparent' ? null : hexToRgb(bgColor);
        for (let i = 0; i < px.length; i += 4) {
          let isBg = false;
          for (const s of samples) {
            const d = Math.sqrt((px[i] - s[0]) ** 2 + (px[i + 1] - s[1]) ** 2 + (px[i + 2] - s[2]) ** 2);
            if (d < tolerance * 2.2) { isBg = true; break; }
          }
          if (isBg) {
            if (target) { px[i] = target[0]; px[i + 1] = target[1]; px[i + 2] = target[2]; }
            else px[i + 3] = 0;
          }
        }
      }
      ctx.putImageData(data, 0, 0);
      setBusy(false);
    }, 60);
    return () => clearTimeout(t);
  }, [img, tab, scanStrength, bgColor, tolerance]);

  const save = () => {
    canvasRef.current!.toBlob((b) => {
      if (!b) return;
      download(b, tab === 'scan' ? 'khotwa-scanned.png' : 'khotwa-headshot.png', 'image/png');
    }, 'image/png');
  };

  return (
    <ToolPage id="image-tools" wide>
      <div className="flex gap-2 mb-5">
        <button onClick={() => setTab('scan')} className={`px-4 py-2 rounded-xl text-sm font-bold border flex items-center gap-2 ${tab === 'scan' ? 'bg-teal-800 text-white border-teal-800' : 'bg-white border-stone-300'}`}>
          <ScanLine size={16} /> {tr({ ar: 'فلتر الماسح الضوئي', en: 'Scanner filter' })}
        </button>
        <button onClick={() => setTab('bg')} className={`px-4 py-2 rounded-xl text-sm font-bold border flex items-center gap-2 ${tab === 'bg' ? 'bg-teal-800 text-white border-teal-800' : 'bg-white border-stone-300'}`}>
          <UserSquare2 size={16} /> {tr({ ar: 'إزالة خلفية صورة السيرة', en: 'Headshot BG remover' })}
        </button>
      </div>

      {!img && <FileDrop accept="image/*" onFiles={pick} label={tab === 'scan' ? tr({ ar: 'ارفع صورة مستند لتحويلها لمسح ضوئي', en: 'Upload a document photo to scan-ify' }) : tr({ ar: 'ارفع صورة شخصية بخلفية موحدة اللون', en: 'Upload a headshot with a plain background' })} />}

      {img && (
        <div className="grid lg:grid-cols-4 gap-5">
          <div className="card h-fit space-y-4">
            {tab === 'scan' ? (
              <div>
                <label className="text-xs font-bold text-stone-500">{tr({ ar: `قوة الفلتر: ${scanStrength}%`, en: `Filter strength: ${scanStrength}%` })}</label>
                <input type="range" min="0" max="100" value={scanStrength} onChange={(e) => setScanStrength(+e.target.value)} className="w-full accent-teal-700" />
              </div>
            ) : (
              <>
                <div>
                  <label className="text-xs font-bold text-stone-500">{tr({ ar: `حساسية الخلفية: ${tolerance}`, en: `BG sensitivity: ${tolerance}` })}</label>
                  <input type="range" min="5" max="90" value={tolerance} onChange={(e) => setTolerance(+e.target.value)} className="w-full accent-teal-700" />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-500 block mb-1.5">{tr({ ar: 'الخلفية الجديدة', en: 'New background' })}</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['#ffffff', '#e8f0fe', '#f5e9da', '#d9e8e5', 'transparent'].map((c) => (
                      <button key={c} onClick={() => setBgColor(c)}
                        className={`w-9 h-9 rounded-lg border-2 ${bgColor === c ? 'border-teal-700' : 'border-stone-200'}`}
                        style={c === 'transparent' ? { background: 'repeating-conic-gradient(#ddd 0 25%, #fff 0 50%) 0 0/10px 10px' } : { background: c }} />
                    ))}
                    <input type="color" value={bgColor === 'transparent' ? '#ffffff' : bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-9 h-9 rounded-lg border-2 border-stone-200 cursor-pointer" />
                  </div>
                </div>
              </>
            )}
            <button className="btn w-full" onClick={save} disabled={busy}>
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} {tr({ ar: 'تنزيل PNG', en: 'Download PNG' })}
            </button>
            <button className="text-sm text-stone-500 underline w-full" onClick={() => setImg(null)}>{tr({ ar: 'صورة أخرى', en: 'Another image' })}</button>
          </div>
          <div className="lg:col-span-3 card" style={{ background: 'repeating-conic-gradient(#eee 0 25%, #fff 0 50%) 0 0/16px 16px' }}>
            <canvas ref={canvasRef} className="max-w-full h-auto mx-auto rounded-lg" />
          </div>
        </div>
      )}
    </ToolPage>
  );
}

function hexToRgb(hex: string): number[] {
  const m = hex.replace('#', '');
  return [parseInt(m.slice(0, 2), 16), parseInt(m.slice(2, 4), 16), parseInt(m.slice(4, 6), 16)];
}
