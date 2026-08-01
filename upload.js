import supabase from './db-client.js';

export const config = { api: { bodyParser: { sizeLimit: '4.5mb' } } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'unauthorized' });
    const { data: userData, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !userData?.user) return res.status(401).json({ error: 'unauthorized' });

    const { fileName, fileBase64, contentType, folder } = req.body;
    if (!fileName || !fileBase64) return res.status(400).json({ error: 'fileName & fileBase64 required' });

    const buffer = Buffer.from(fileBase64, 'base64');
    if (buffer.length > 4 * 1024 * 1024) return res.status(400).json({ error: 'file too large (max 4MB)' });

    const safe = fileName.replace(/[^\w.\-\u0600-\u06FF]/g, '_');
    const path = `${folder === 'market' ? 'market' : 'notes'}/${Date.now()}-${safe}`;
    const { error } = await supabase.storage.from('khotwa-files').upload(path, buffer, { contentType: contentType || 'application/octet-stream', upsert: true });
    if (error) throw error;

    const { data: urlData } = supabase.storage.from('khotwa-files').getPublicUrl(path);
    return res.status(200).json({ url: urlData.publicUrl });
  } catch (err) {
    console.error('upload error:', err);
    return res.status(500).json({ error: err.message });
  }
}
