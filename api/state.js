export default async function handler(req, res) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;

  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json'
  };

  if (req.method === 'GET') {
    try {
      const id = req.query.id || 1;
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/app_state?id=eq.${id}&select=data`,
        { headers }
      );
      const rows = await response.json();
      const data = rows && rows[0] ? rows[0].data : null;
      return res.status(200).json({ data });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { id, data } = req.body;
      const response = await fetch(`${SUPABASE_URL}/rest/v1/app_state?on_conflict=id`, {
        method: 'POST',
        headers: { ...headers, Prefer: 'resolution=merge-duplicates' },
        body: JSON.stringify({ id: id || 1, data })
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText);
      }
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
