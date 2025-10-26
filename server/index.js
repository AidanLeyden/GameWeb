import express from 'express';
import cors from 'cors';
import { randomRecommendations, bggThing } from './bgg.js';

const app = express();
const PORT = process.env.PORT || 5174;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/recommendations', async (req, res) => {
  try {
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
    } = req.query;

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
    res.json({ items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

app.get('/api/thing/:id', async (req, res) => {
  try {
    const item = await bggThing(req.params.id);
    res.json({ item: item?.[0] || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch thing' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

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


