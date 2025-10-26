export default async function handler(req, res) {
  // Basic CORS for cross-domain calls from client
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const { bggThing } = await import('../../bgg.js');
    const { id } = req.query;
    const item = await bggThing(id);
    res.status(200).json({ item: item?.[0] || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch thing' });
  }
}


