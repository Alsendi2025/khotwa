/**
 * Silent dual-AI engine — invisible task routing + automatic failover.
 * Keys are read server-side only (never exposed to the browser bundle):
 *   GEMINI_API_KEY / GEMINIAPIKEY  — Google Gemini
 *   GROK_API_KEY   / GROKAPIKEY    — xAI Grok
 *   GROQ_API_KEY   / GROQAPIKEY    — optional extra fallback (Llama)
 *
 * Task routing (hidden from the UI):
 *   Gemini first : summarize, parse, flashcards, qa   (heavy document work)
 *   Grok first   : writing, quiz, tutor, citation, cv (natural Arabic phrasing)
 * If the preferred provider is missing/fails/rate-limited, the other one
 * silently takes over. The client never sees provider names or tech errors.
 */

let stamps = [];
let cachedGeminiModels = null;

const GEMINI_FIRST = new Set(['summarize', 'parse', 'flashcards', 'qa']);

function getKeys() {
  return {
    gemini: (process.env.GEMINI_API_KEY || process.env.GEMINIAPIKEY || '').trim(),
    grok: (process.env.GROK_API_KEY || process.env.GROKAPIKEY || '').trim(),
    groq: (process.env.GROQ_API_KEY || process.env.GROQAPIKEY || '').trim(),
  };
}

async function discoverGeminiModels(key) {
  if (cachedGeminiModels) return cachedGeminiModels;
  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?pageSize=200&key=${encodeURIComponent(key)}`
    );
    const data = await r.json();
    if (!r.ok || !Array.isArray(data.models)) return null;
    const usable = data.models
      .filter((m) => (m.supportedGenerationMethods || []).includes('generateContent'))
      .map((m) => m.name.replace(/^models\//, ''))
      .filter((n) => !/(embedding|tts|image|audio|vision|thinking|exp)/i.test(n));
    const flash = usable.filter((n) => /flash/i.test(n) && !/lite/i.test(n));
    const lite = usable.filter((n) => /flash/i.test(n) && /lite/i.test(n));
    const rest = usable.filter((n) => !/flash/i.test(n));
    const byVer = (a, b) => {
      const va = parseFloat((a.match(/(\d+(?:\.\d+)?)/) || [0, 0])[1]);
      const vb = parseFloat((b.match(/(\d+(?:\.\d+)?)/) || [0, 0])[1]);
      return vb - va;
    };
    cachedGeminiModels = [...flash.sort(byVer), ...lite.sort(byVer), ...rest.sort(byVer)].slice(0, 4);
    return cachedGeminiModels;
  } catch {
    return null;
  }
}

async function callGemini(key, { system, prompt, json }) {
  let models = await discoverGeminiModels(key);
  if (!models || !models.length) models = ['gemini-flash-latest', 'gemini-2.5-flash', 'gemini-2.0-flash'];
  let lastErr = 'gemini unavailable';
  for (const model of models) {
    try {
      const body = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.6, maxOutputTokens: 4096 },
      };
      if (system) body.systemInstruction = { parts: [{ text: system }] };
      if (json) body.generationConfig.responseMimeType = 'application/json';
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
      );
      const data = await r.json().catch(() => ({}));
      const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
      if (r.ok && text) return { ok: true, text };
      lastErr = data?.error?.message || `HTTP ${r.status}`;
      // invalid key → stop trying other gemini models
      if ((r.status === 400 || r.status === 403) && /API key|permission/i.test(lastErr)) break;
    } catch (e) {
      lastErr = e.message;
    }
  }
  return { ok: false, error: lastErr };
}

async function callOpenAICompatible(url, key, model, { system, prompt, json }) {
  try {
    const messages = [];
    if (system) messages.push({ role: 'system', content: system });
    messages.push({ role: 'user', content: prompt });
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.6,
        max_tokens: 4096,
        ...(json ? { response_format: { type: 'json_object' } } : {}),
      }),
    });
    const data = await r.json().catch(() => ({}));
    const text = data?.choices?.[0]?.message?.content || '';
    if (r.ok && text) return { ok: true, text };
    return { ok: false, error: data?.error?.message || data?.error || `HTTP ${r.status}` };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

const callGrok = (key, req) =>
  callOpenAICompatible('https://api.x.ai/v1/chat/completions', key, 'grok-3-mini', req);
const callGroq = (key, req) =>
  callOpenAICompatible('https://api.groq.com/openai/v1/chat/completions', key, 'llama-3.1-8b-instant', req);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // rate limit: 15 req/min per instance
  const now = Date.now();
  stamps = stamps.filter((t) => now - t < 60000);
  if (stamps.length >= 15) return res.status(429).json({ error: 'busy' });
  stamps.push(now);

  const { system, prompt, json, task } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'prompt required' });

  const keys = getKeys();
  if (!keys.gemini && !keys.grok && !keys.groq) {
    return res.status(503).json({ error: 'unconfigured' });
  }

  const request = { system, prompt, json };

  // ---- invisible task routing: build the silent failover chain ----
  const geminiFirst = GEMINI_FIRST.has(String(task || '').toLowerCase());
  const chain = [];
  const gemini = keys.gemini ? () => callGemini(keys.gemini, request) : null;
  const grok = keys.grok ? () => callGrok(keys.grok, request) : null;
  const groq = keys.groq ? () => callGroq(keys.groq, request) : null;

  if (geminiFirst) {
    if (gemini) chain.push(gemini);
    if (grok) chain.push(grok);
  } else {
    if (grok) chain.push(grok);
    if (gemini) chain.push(gemini);
  }
  if (groq) chain.push(groq);

  // ---- silent failover: try each provider until one succeeds ----
  for (const call of chain) {
    const result = await call();
    if (result.ok) return res.status(200).json({ text: result.text });
    console.error('AI provider failed (silent failover):', result.error);
  }

  // all failed → single generic error (no technical/provider details leak to UI)
  return res.status(502).json({ error: 'unavailable' });
}
