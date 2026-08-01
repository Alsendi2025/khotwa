/**
 * Client AI helper — talks only to our own /api/ai endpoint.
 * The task hint drives invisible server-side routing between providers.
 * No provider names, models, or keys ever reach the browser.
 */

export type AiTask =
  | 'summarize' | 'parse' | 'flashcards' | 'qa'   // heavy document work
  | 'writing' | 'quiz' | 'tutor' | 'citation' | 'cv'; // natural phrasing work

export class AiError extends Error {
  code: string;
  constructor(code: string, msg: string) { super(msg); this.code = code; }
}

export async function callAI(opts: { system?: string; prompt: string; json?: boolean; task?: AiTask }): Promise<string> {
  let res: Response;
  try {
    res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(opts),
    });
  } catch {
    throw new AiError('network', 'network');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 503) throw new AiError('unconfigured', 'unconfigured');
    if (res.status === 429) throw new AiError('busy', 'busy');
    throw new AiError('unavailable', 'unavailable');
  }
  return data.text as string;
}

export function parseAiJson<T>(text: string): T {
  const cleaned = text.replace(/```json|```/g, '').trim();
  const start = cleaned.indexOf(cleaned.trimStart()[0] === '[' ? '[' : '{');
  const end = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));
  return JSON.parse(cleaned.slice(start, end + 1)) as T;
}
