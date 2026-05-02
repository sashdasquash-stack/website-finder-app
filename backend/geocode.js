const fs = require('fs').promises;
const path = require('path');

const CACHE_FILE = path.join(__dirname, '..', 'data', 'cache', 'geocode.json');
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'LeadFinder/1.0';
const MIN_REQUEST_INTERVAL_MS = 1000;

let cache = null;
let lastRequestTime = 0;
let requestQueue = Promise.resolve();

async function loadCache() {
  if (cache !== null) return cache;
  try {
    const data = await fs.readFile(CACHE_FILE, 'utf8');
    cache = JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      cache = {};
    } else {
      throw err;
    }
  }
  return cache;
}

async function saveCache() {
  await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
}

function normalizeQuery(query) {
  return query.trim().toLowerCase().replace(/\s+/g, ' ');
}

async function rateLimitedFetch(url) {
  const task = requestQueue.then(async () => {
    const elapsed = Date.now() - lastRequestTime;
    if (elapsed < MIN_REQUEST_INTERVAL_MS) {
      await new Promise(r => setTimeout(r, MIN_REQUEST_INTERVAL_MS - elapsed));
    }
    lastRequestTime = Date.now();
    return fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  });
  requestQueue = task.catch(() => {});
  return task;
}

async function geocode(query) {
  const key = normalizeQuery(query);
  if (!key) throw new Error('Empty geocode query');

  const c = await loadCache();
  if (c[key]) return c[key];

  const url = `${NOMINATIM_URL}?q=${encodeURIComponent(query)}&format=json&limit=1`;
  const res = await rateLimitedFetch(url);
  if (!res.ok) {
    throw new Error(`Nominatim error: ${res.status} ${res.statusText}`);
  }

  const results = await res.json();
  if (!Array.isArray(results) || results.length === 0) {
    throw new Error(`Could not find "${query}". Try a more specific name (e.g. "Miami Beach, FL, USA").`);
  }

  const r = results[0];
  const [south, north, west, east] = r.boundingbox.map(Number);
  const result = {
    query,
    displayName: r.display_name,
    bbox: { south, north, west, east },
    lat: Number(r.lat),
    lon: Number(r.lon),
  };

  c[key] = result;
  await saveCache();
  return result;
}

module.exports = { geocode };

if (require.main === module) {
  (async () => {
    const queries = process.argv.slice(2);
    if (queries.length === 0) queries.push('Miami Beach, FL');
    for (const q of queries) {
      try {
        const t0 = Date.now();
        const result = await geocode(q);
        const elapsed = Date.now() - t0;
        console.log(`\n[${elapsed}ms] ${q}`);
        console.log(JSON.stringify(result, null, 2));
      } catch (err) {
        console.error(`Error for "${q}":`, err.message);
      }
    }
  })();
}
