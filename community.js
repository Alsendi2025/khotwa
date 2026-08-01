import supabase from './db-client.js';

async function getUser(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const resource = String(req.query.resource || '');

  try {
    // ---------- PUBLIC READS ----------
    if (req.method === 'GET') {
      if (resource === 'majors') {
        const { data, error } = await supabase.from('majors').select('*').order('id');
        if (error) throw error;
        return res.status(200).json(data);
      }
      if (resource === 'universities') {
        const { data, error } = await supabase.from('universities').select('*').order('rank');
        if (error) throw error;
        return res.status(200).json(data);
      }
      if (resource === 'scholarships') {
        const { data, error } = await supabase.from('scholarships').select('*').order('deadline');
        if (error) throw error;
        return res.status(200).json(data);
      }
      if (resource === 'projects') {
        const { data, error } = await supabase.from('grad_projects').select('*').order('id', { ascending: false });
        if (error) throw error;
        return res.status(200).json(data);
      }
      if (resource === 'notes') {
        const { data, error } = await supabase.from('shared_notes').select('*').order('id', { ascending: false });
        if (error) throw error;
        return res.status(200).json(data);
      }
      if (resource === 'forum') {
        const { data, error } = await supabase.from('forum_threads').select('*').order('id', { ascending: false });
        if (error) throw error;
        return res.status(200).json(data);
      }
      if (resource === 'replies') {
        const { data, error } = await supabase.from('forum_replies').select('*').eq('thread_id', req.query.thread_id).order('id');
        if (error) throw error;
        return res.status(200).json(data);
      }
      if (resource === 'market') {
        const { data, error } = await supabase.from('market_items').select('*').eq('sold', false).order('id', { ascending: false });
        if (error) throw error;
        return res.status(200).json(data);
      }
      if (resource === 'articles') {
        const { data, error } = await supabase.from('guide_articles').select('*').order('id');
        if (error) throw error;
        return res.status(200).json(data);
      }
      return res.status(400).json({ error: 'unknown resource' });
    }

    // ---------- download counter (no auth needed) ----------
    if (req.method === 'PUT' && resource === 'note-download') {
      const { id } = req.body;
      const { data: note } = await supabase.from('shared_notes').select('downloads').eq('id', id).single();
      await supabase.from('shared_notes').update({ downloads: (note?.downloads || 0) + 1 }).eq('id', id);
      return res.status(200).json({ ok: true });
    }

    // ---------- AUTHENTICATED WRITES ----------
    const user = await getUser(req);
    if (!user) return res.status(401).json({ error: 'unauthorized' });
    const authorName = req.body?.author_name || user.email?.split('@')[0] || 'student';

    if (req.method === 'POST') {
      if (resource === 'projects') {
        const { title, field, difficulty, description, steps, tools } = req.body;
        if (!title || !description) return res.status(400).json({ error: 'title & description required' });
        const { data, error } = await supabase.from('grad_projects')
          .insert({ title, field, difficulty, description, steps, tools, author_name: authorName, user_id: user.id })
          .select().single();
        if (error) throw error;
        return res.status(201).json(data);
      }
      if (resource === 'notes') {
        const { title, subject, description, file_url, file_name } = req.body;
        if (!title || !file_url) return res.status(400).json({ error: 'title & file required' });
        const { data, error } = await supabase.from('shared_notes')
          .insert({ title, subject, description, file_url, file_name, uploader_name: authorName, user_id: user.id, downloads: 0 })
          .select().single();
        if (error) throw error;
        return res.status(201).json(data);
      }
      if (resource === 'forum') {
        const { title, body, category } = req.body;
        if (!title || !body) return res.status(400).json({ error: 'title & body required' });
        const { data, error } = await supabase.from('forum_threads')
          .insert({ title, body, category, author_name: authorName, user_id: user.id })
          .select().single();
        if (error) throw error;
        return res.status(201).json(data);
      }
      if (resource === 'replies') {
        const { thread_id, body } = req.body;
        if (!thread_id || !body) return res.status(400).json({ error: 'thread_id & body required' });
        const { data, error } = await supabase.from('forum_replies')
          .insert({ thread_id, body, author_name: authorName, user_id: user.id })
          .select().single();
        if (error) throw error;
        return res.status(201).json(data);
      }
      if (resource === 'market') {
        const { title, description, price, condition, category, contact, image_url } = req.body;
        if (!title || price === undefined) return res.status(400).json({ error: 'title & price required' });
        const { data, error } = await supabase.from('market_items')
          .insert({ title, description, price, condition, category, contact, image_url, seller_name: authorName, user_id: user.id, sold: false })
          .select().single();
        if (error) throw error;
        return res.status(201).json(data);
      }
      return res.status(400).json({ error: 'unknown resource' });
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      const tables = { market: 'market_items', projects: 'grad_projects', notes: 'shared_notes', forum: 'forum_threads' };
      const table = tables[resource];
      if (!table) return res.status(400).json({ error: 'unknown resource' });
      const { error } = await supabase.from(table).delete().eq('id', id).eq('user_id', user.id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('community API error:', err);
    return res.status(500).json({ error: err.message });
  }
}
