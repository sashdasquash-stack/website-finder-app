require('dotenv').config({ quiet: true });

const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { listCategories, getCategory } = require('./categories');
const { geocode } = require('./geocode');
const { searchAndNormalize, SerpApiError } = require('./serpapi');
const cache = require('./cache');

const CONTACTED_FILE = path.join(__dirname, '..', 'data', 'contacted.json');
let contactedCache = null;

async function loadContacted() {
  try {
    const raw = await fs.readFile(CONTACTED_FILE, 'utf8');
    return new Set(JSON.parse(raw));
  } catch (err) {
    if (err.code === 'ENOENT') return new Set();
    throw err;
  }
}

async function getContacted() {
  if (!contactedCache) contactedCache = await loadContacted();
  return contactedCache;
}

async function saveContacted(set) {
  await fs.mkdir(path.dirname(CONTACTED_FILE), { recursive: true });
  await fs.writeFile(CONTACTED_FILE, JSON.stringify([...set]));
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

const ACCESS_PASSWORD = process.env.LEAD_FINDER_PASSWORD;

function requireAccess(req, res, next) {
  if (!ACCESS_PASSWORD) return next();
  const provided = req.headers['x-access-password'];
  if (provided !== ACCESS_PASSWORD) {
    return res.status(401).json({ error: 'Invalid or missing access password.' });
  }
  next();
}

app.get('/api/auth', requireAccess, (req, res) => {
  res.json({ ok: true });
});

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    apiKeyConfigured: Boolean(process.env.SERPAPI_API_KEY),
  });
});

app.get('/api/categories', (req, res) => {
  res.json({ categories: listCategories() });
});

app.get('/api/contacted', requireAccess, async (req, res) => {
  const set = await getContacted();
  res.json({ ids: [...set] });
});

app.post('/api/contacted', requireAccess, async (req, res) => {
  const { id, contacted } = req.body || {};
  if (typeof id !== 'string' || !id || typeof contacted !== 'boolean') {
    return res.status(400).json({ error: 'Body must be { id: string, contacted: bool }.' });
  }
  const set = await getContacted();
  if (contacted) set.add(id);
  else set.delete(id);
  await saveContacted(set);
  res.json({ ok: true });
});

app.post('/api/search', requireAccess, async (req, res) => {
  try {
    const { city, category: categoryKey } = req.body || {};
    if (!city || !categoryKey) {
      return res.status(400).json({ error: 'Both "city" and "category" are required.' });
    }

    const category = getCategory(categoryKey);
    const cacheKey = cache.buildKey('gmaps', city.trim().toLowerCase(), categoryKey);

    let results, stats, cacheStatus, displayCity;
    const cached = await cache.get(cacheKey);
    if (cached) {
      ({ results, stats, displayCity } = cached.data);
      cacheStatus = `cache (${Math.round(cached.ageMs / 1000)}s old)`;
    } else {
      const loc = await geocode(city);
      displayCity = loc.displayName;
      const search = await searchAndNormalize(
        { lat: loc.lat, lon: loc.lon },
        category
      );
      results = search.results;
      stats = search.stats;
      await cache.set(cacheKey, { results, stats, displayCity });
      cacheStatus = 'fresh';
    }

    res.json({
      results,
      stats,
      meta: {
        city: displayCity || city,
        cache: cacheStatus,
        category: category.name,
        source: 'Google Maps (via SerpAPI)',
      },
    });
  } catch (err) {
    console.error('Search error:', err.message);
    const status = err instanceof SerpApiError ? (err.status || 500) : 500;
    res.status(status).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Lead Finder running at http://localhost:${PORT}`);
  if (!process.env.SERPAPI_API_KEY) {
    console.warn('\n⚠  SERPAPI_API_KEY is not set.');
    console.warn('   Searches will fail until you add a key to .env (see .env.example).\n');
  }
});
