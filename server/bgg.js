import axios from 'axios';
import { parseStringPromise } from 'xml2js';

const BGG_BASE = 'https://boardgamegeek.com/xmlapi2';

function buildQuery(params) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.set(key, String(value));
  });
  return searchParams.toString();
}

export async function bggSearch({ query, type = 'boardgame' }) {
  const qs = buildQuery({ query, type });
  const url = `${BGG_BASE}/search?${qs}`;
  const { data } = await axios.get(url, { timeout: 20000 });
  const parsed = await parseStringPromise(data, { explicitArray: false, mergeAttrs: true });
  const items = parsed.items?.item || [];
  const asArray = Array.isArray(items) ? items : [items];
  return asArray
    .filter(Boolean)
    .map((it) => ({ id: it.id, name: it.name?.value || '', yearpublished: it.yearpublished?.value || null }));
}

export async function bggThing(ids) {
  const idList = Array.isArray(ids) ? ids : [String(ids)];
  const chunks = chunk(idList, 20); // BGG limits to 20 ids per request
  const results = [];
  for (const c of chunks) {
    const batch = await fetchThingBatch(c);
    results.push(...batch);
    await delay(250); // be polite to BGG
  }
  return results;
}

async function fetchThingBatch(idArray) {
  const idParam = idArray.join(',');
  const url = `${BGG_BASE}/thing?id=${idParam}&stats=1`;
  // accept 202 and retry
  const MAX_TRIES = 5;
  for (let attempt = 1; attempt <= MAX_TRIES; attempt++) {
    const res = await axios.get(url, {
      timeout: 20000,
      validateStatus: () => true,
    });
    if (res.status === 202) {
      await delay(750 * attempt);
      continue;
    }
    if (res.status >= 400) {
      throw new Error(`BGG thing error ${res.status}`);
    }
    const parsed = await parseStringPromise(res.data, { explicitArray: false, mergeAttrs: true });
    const items = parsed.items?.item || [];
    const asArray = Array.isArray(items) ? items : [items];
    return asArray.filter(Boolean).map((it) => normalizeThing(it));
  }
  return [];
}

function normalizeThing(it) {
  const names = Array.isArray(it.name) ? it.name : (it.name ? [it.name] : []);
  const primary = names.find((n) => n.type === 'primary') || names[0] || {};
  const mechanics = ensureArray(it.link).filter((l) => l.type === 'boardgamemechanic').map((l) => l.value);
  const categories = ensureArray(it.link).filter((l) => l.type === 'boardgamecategory').map((l) => l.value);
  const families = ensureArray(it.link).filter((l) => l.type === 'boardgamefamily').map((l) => l.value);
  return {
    id: Number(it.id),
    name: primary.value || '',
    yearpublished: numOrNull(it.yearpublished?.value),
    minplayers: numOrNull(it.minplayers?.value),
    maxplayers: numOrNull(it.maxplayers?.value),
    minplaytime: numOrNull(it.minplaytime?.value),
    maxplaytime: numOrNull(it.maxplaytime?.value),
    minage: numOrNull(it.minage?.value),
    thumbnail: it.thumbnail || '',
    image: it.image || '',
    rating: numOrNull(it.statistics?.ratings?.average?.value),
    rank: extractOverallRank(it.statistics?.ratings?.ranks?.rank),
    mechanics,
    categories,
    families,
    description: (it.description || '').replace(/&#10;|\n/g, '\n'),
  };
}

function ensureArray(v) {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function numOrNull(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function extractOverallRank(ranks) {
  const arr = ensureArray(ranks);
  const overall = arr.find((r) => r.name === 'boardgame');
  const val = Number(overall?.value);
  return Number.isFinite(val) ? val : null;
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function filterThings(things, filters) {
  const {
    minPlayers,
    maxPlayers,
    yearFrom,
    yearTo,
    categories,
    mechanics,
    minAge,
    minRating,
  } = filters || {};

  return things.filter((t) => {
    // Ensure requested player count range overlaps the game's supported range
    if (minPlayers) {
      if (t.maxplayers !== null && t.maxplayers < minPlayers) return false;
      if (t.minplayers !== null && t.minplayers > minPlayers) return false;
    }
    if (maxPlayers) {
      // Interpret as a hard cap: only include games whose maximum supported players is <= cap
      if (t.maxplayers === null) return false;
      if (t.maxplayers > maxPlayers) return false;
    }
    if (yearFrom && (t.yearpublished !== null && t.yearpublished < yearFrom)) return false;
    if (yearTo && (t.yearpublished !== null && t.yearpublished > yearTo)) return false;
    if (minAge && (t.minage !== null && t.minage > minAge)) return false;
    if (categories && categories.length > 0 && !categories.every((c) => t.categories.includes(c))) return false;
    if (mechanics && mechanics.length > 0 && !mechanics.every((m) => t.mechanics.includes(m))) return false;
    if (minRating && (t.rating !== null && t.rating < minRating)) return false;
    return true;
  });
}

export async function randomRecommendations({
  query = 'the',
  count = 5,
  filters = {},
}) {
  const searchResults = await bggSearch({ query });
  // sample up to 80 ids to reduce load while keeping variety
  const ids = sample(searchResults.map((s) => s.id), 80);
  if (ids.length === 0) return [];
  const details = await bggThing(ids);
  const filtered = filterThings(details, filters);
  if (filtered.length <= count) return filtered;
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function sample(arr, n) {
  if (arr.length <= n) return arr;
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}


