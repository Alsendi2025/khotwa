import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { jsPDF } from 'jspdf';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export { pdfjsLib };

export type DownloadEventDetail = { url: string; name: string; size: number; type: string };

/**
 * Creates a real Blob, attempts a programmatic browser download, AND dispatches
 * a `khotwa:download` event so the global DownloadToast can render an explicit
 * "Open / Download" blob-URL link — needed when the app runs inside a preview
 * iframe that blocks automatic downloads.
 */
export function download(data: BlobPart | Uint8Array | Blob, name: string, type = 'application/pdf') {
  const blob = data instanceof Blob ? data : new Blob([data as BlobPart], { type });
  const url = URL.createObjectURL(blob);

  // 1) attempt the normal programmatic download
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch { /* blocked — the toast link below still works */ }

  // 2) notify the global toast with a persistent, user-clickable blob link
  window.dispatchEvent(new CustomEvent<DownloadEventDetail>('khotwa:download', {
    detail: { url, name, size: blob.size, type: blob.type },
  }));

  // Keep the blob URL alive long enough for the user to click the link.
  setTimeout(() => URL.revokeObjectURL(url), 10 * 60 * 1000);
  return url;
}

export async function loadPdfJs(data: ArrayBuffer) {
  return pdfjsLib.getDocument({ data: data.slice(0) }).promise;
}

export async function renderPage(page: any, scale = 1.5): Promise<HTMLCanvasElement> {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d')!;
  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas;
}

export async function extractPdfText(data: ArrayBuffer, maxChars = 16000): Promise<string> {
  const doc = await loadPdfJs(data);
  let text = '';
  for (let i = 1; i <= doc.numPages && text.length < maxChars; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((it: any) => it.str).join(' ') + '\n\n';
  }
  return text.slice(0, maxChars);
}

/** Renders unicode-safe (Arabic-capable) text into a PDF via canvas. */
export async function textToPdf(title: string, body: string, rtl: boolean, filename: string) {
  await (document as any).fonts?.ready;
  const W = 1240, H = 1754, M = 100, LH = 46, FS = 28;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const pages: string[] = [];
  const x = rtl ? W - M : M;
  const bodyFont = `${FS}px Rubik, 'IBM Plex Sans Arabic', sans-serif`;

  const newPage = () => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#141a19';
    (ctx as any).direction = rtl ? 'rtl' : 'ltr';
    ctx.textAlign = rtl ? 'right' : 'left';
    ctx.font = bodyFont;
  };

  newPage();
  let y = M + 20;
  if (title) {
    ctx.font = `bold 42px Rubik, 'IBM Plex Sans Arabic', sans-serif`;
    ctx.fillText(title, x, y);
    y += 40;
    ctx.strokeStyle = '#0d6e63'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(M, y); ctx.lineTo(W - M, y); ctx.stroke();
    y += 50;
    ctx.font = bodyFont;
  }

  const maxW = W - 2 * M;
  const emit = (line: string, bold = false) => {
    if (y > H - M) { pages.push(canvas.toDataURL('image/jpeg', 0.92)); newPage(); y = M; }
    ctx.font = bold ? `bold ${FS + 4}px Rubik, 'IBM Plex Sans Arabic', sans-serif` : bodyFont;
    ctx.fillText(line, x, y);
    y += LH;
  };

  for (const para of body.split('\n')) {
    const bold = para.startsWith('## ');
    const clean = bold ? para.slice(3) : para;
    if (!clean.trim()) { y += LH / 2; continue; }
    const words = clean.split(' ');
    let line = '';
    ctx.font = bold ? `bold ${FS + 4}px Rubik, sans-serif` : bodyFont;
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxW && line) { emit(line, bold); line = w; }
      else line = test;
    }
    if (line) emit(line, bold);
    if (bold) y += 8;
  }
  pages.push(canvas.toDataURL('image/jpeg', 0.92));

  const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
  pages.forEach((p, i) => { if (i > 0) pdf.addPage(); pdf.addImage(p, 'JPEG', 0, 0, 595.28, 841.89); });
  download(pdf.output('blob'), filename);
}
