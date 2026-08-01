/** Shared helpers for the client-side PDF & file tools — 100% local processing. */

export type Progress = { pct: number; label: string; done?: boolean } | null;

export class FileError extends Error {
  code: string;
  constructor(code: string) { super(code); this.code = code; }
}

/** Validates that a file is a real PDF by checking the %PDF- magic header. */
export async function validatePdf(file: File): Promise<ArrayBuffer> {
  if (file.size === 0) throw new FileError('empty');
  if (file.size > 100 * 1024 * 1024) throw new FileError('too_large');
  const buf = await file.arrayBuffer();
  const head = new TextDecoder().decode(new Uint8Array(buf.slice(0, 1024)));
  if (!head.includes('%PDF-')) throw new FileError('not_pdf');
  return buf;
}

/** Validates an image file and decodes it to an HTMLImageElement. */
export async function validateImage(file: File): Promise<HTMLImageElement> {
  if (!file.type.startsWith('image/')) throw new FileError('not_image');
  if (file.size > 40 * 1024 * 1024) throw new FileError('too_large');
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = () => rej(new FileError('corrupt_image'));
      img.src = url;
    });
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }
}

export function fileErrorMessage(e: unknown, lang: 'ar' | 'en'): string {
  const code = e instanceof FileError ? e.code : '';
  const messages: Record<string, { ar: string; en: string }> = {
    empty: { ar: 'الملف فارغ', en: 'File is empty' },
    too_large: { ar: 'الملف كبير جداً (الحد 100 ميجا)', en: 'File too large (100MB limit)' },
    not_pdf: { ar: 'الملف ليس PDF صالحاً — تأكد من الامتداد والمحتوى', en: 'Not a valid PDF — check the file' },
    not_image: { ar: 'الملف ليس صورة', en: 'Not an image file' },
    corrupt_image: { ar: 'تعذر قراءة الصورة (قد تكون تالفة)', en: 'Could not decode image (may be corrupt)' },
    encrypted: { ar: 'الملف محمي بكلمة مرور — استخدم أداة فك الحماية أولاً', en: 'File is password-protected — unlock it first' },
  };
  if (messages[code]) return messages[code][lang];
  const msg = e instanceof Error ? e.message : String(e);
  if (/encrypted/i.test(msg)) return messages.encrypted[lang];
  return lang === 'ar' ? `حدث خطأ: ${msg}` : `Error: ${msg}`;
}

/** Triggers a real browser download from a Blob / binary data. Returns byte size. */
export function downloadBlob(data: Blob | Uint8Array | ArrayBuffer | string, name: string, type = 'application/octet-stream'): number {
  const blob = data instanceof Blob ? data : new Blob([data as BlobPart], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  return blob.size;
}

/** Bundles multiple output files into one ZIP and triggers a single download. */
export async function downloadZip(
  files: { name: string; data: Uint8Array | Blob }[],
  zipName: string,
  onProgress?: (pct: number) => void
): Promise<number> {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  files.forEach((f) => zip.file(f.name, f.data));
  const blob = await zip.generateAsync(
    { type: 'blob', compression: 'DEFLATE' },
    (meta) => onProgress?.(Math.round(meta.percent))
  );
  return downloadBlob(blob, zipName, 'application/zip');
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
