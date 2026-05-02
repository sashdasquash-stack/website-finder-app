const fs = require('fs').promises;
const path = require('path');

const CACHE_FILE = path.join(__dirname, '..', 'data', 'cache', 'geocode.json');
const PHOTON_URL = 'https://photon.komoot.io/api/';
const USER_AGENT = 'LeadFinder/1.0';
const MIN_REQUEST_INTERVAL_MS = 200;

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

function buildDisplayName(props) {
  const parts = [props.name];
  if (props.city && props.city !== props.name) parts.push(props.city);
  if (props.state) parts.push(props.state);
  if (props.country) parts.push(props.country);
  return parts.filter(Boolean).join(', ');
}

async function geocode(query) {
  const key = normalizeQuery(query);
  if (!key) throw new Error('Empty geocode query');

  const c = await loadCache();
  if (c[key]) return c[key];

  const url = `${PHOTON_URL}?q=${encodeURIComponent(query)}&limit=1`;
  const res = await rateLimitedFetch(url);
  if (!res.ok) {
    throw new Error(`Geocoder error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const features = data.features || [];
  if (features.length === 0) {
    throw new Error(`Could not find "${query}". Try a more specific name (e.g. "Miami Beach, FL, USA").`);
  }

  const f = features[0];
  const [lon, lat] = f.geometry.coordinates;
  const props = f.properties || {};

  const result = {
    query,
    displayName: buildDisplayName(props),
    lat,
    lon,
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
