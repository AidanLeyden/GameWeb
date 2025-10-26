export default async function handler(req, res) {
  // Basic CORS for cross-domain calls from client
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const { randomRecommendations } = await import('../bgg.js');

    const {
      query,
      count,
      minPlayers,
      maxPlayers,
      yearFrom,
      yearTo,
      minAge,
      categories,
      mechanics,
      minRating,
    } = req.query || {};

    const filters = {
      minPlayers: numOrUndefined(minPlayers),
      maxPlayers: numOrUndefined(maxPlayers),
      yearFrom: numOrUndefined(yearFrom),
      yearTo: numOrUndefined(yearTo),
      minAge: numOrUndefined(minAge),
      categories: toArray(categories),
      mechanics: toArray(mechanics),
      minRating: numOrUndefined(minRating),
    };

    const items = await randomRecommendations({
      query: query || 'the',
      count: numOrDefault(count, 5),
      filters,
    });

    res.status(200).json({ items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
}

function toArray(v) {
  if (v === undefined) return undefined;
  if (Array.isArray(v)) return v;
  if (typeof v === 'string') return v.split(',').map((s) => s.trim()).filter(Boolean);
  return undefined;
}

function numOrUndefined(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function numOrDefault(v, def) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}


