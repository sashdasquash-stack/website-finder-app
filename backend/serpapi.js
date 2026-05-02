const SERPAPI_BASE = 'https://serpapi.com/search.json';

class SerpApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

function getApiKey() {
  const key = process.env.SERPAPI_API_KEY;
  if (!key) {
    throw new SerpApiError(
      'SERPAPI_API_KEY is not set. Sign up free at https://serpapi.com (100 searches/month, no credit card), get your key from the dashboard, and add it to .env.',
      500
    );
  }
  return key;
}

async function fetchAll({ lat, lon, query, zoom = 12, maxPages = 3 }) {
  const apiKey = getApiKey();
  const all = [];
  let start = 0;

  for (let page = 0; page < maxPages; page++) {
    const params = new URLSearchParams({
      engine: 'google_maps',
      type: 'search',
      q: query,
      ll: `@${lat},${lon},${zoom}z`,
      api_key: apiKey,
    });
    if (start > 0) params.set('start', String(start));

    let res;
    try {
      res = await fetch(`${SERPAPI_BASE}?${params}`);
    } catch (err) {
      throw new SerpApiError(`Could not reach SerpAPI: ${err.message}`, 0);
    }

    if (res.status === 401) {
      throw new SerpApiError('SerpAPI key invalid or unauthorized. Check SERPAPI_API_KEY in your .env.', 401);
    }
    if (res.status === 429) {
      throw new SerpApiError('SerpAPI rate/quota limit reached. Free tier is 100 searches/month — check your dashboard.', 429);
    }
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new SerpApiError(`SerpAPI error ${res.status}: ${body.slice(0, 200)}`, res.status);
    }

    const data = await res.json();
    if (data.error) {
      throw new SerpApiError(`SerpAPI returned error: ${data.error}`, 500);
    }

    const local = data.local_results || [];
    all.push(...local);

    if (local.length < 20 || !data.serpapi_pagination?.next) break;
    start += local.length;
  }

  return all;
}

function normalizeKey(str) {
  return (str || '').toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
}

function hasWebsite(p) {
  return Boolean(p.website || p.links?.website);
}

function normalize(places, categoryName) {
  const stats = {
    total: places.length,
    dropped_has_website: 0,
    dropped_no_name: 0,
    dropped_unreachable: 0,
    dropped_dupe: 0,
  };
  const seen = new Set();
  const results = [];

  for (const p of places) {
    const name = p.title;
    if (!name) {
      stats.dropped_no_name++;
      continue;
    }
    if (hasWebsite(p)) {
      stats.dropped_has_website++;
      continue;
    }

    const phone = p.phone || null;
    const address = p.address || null;
    if (!phone && !address) {
      stats.dropped_unreachable++;
      continue;
    }

    const dedupeKey = `${normalizeKey(name)}|${normalizeKey(address || '')}`;
    if (seen.has(dedupeKey)) {
      stats.dropped_dupe++;
      continue;
    }
    seen.add(dedupeKey);

    const lat = p.gps_coordinates?.latitude ?? null;
    const lon = p.gps_coordinates?.longitude ?? null;
    const placeId = p.place_id || p.data_id || '';
    const id = `gmaps/${placeId || normalizeKey(name + (address || ''))}`;

    const mapsQuery = encodeURIComponent([name, address].filter(Boolean).join(', '));
    const sourceUrl = p.place_id
      ? `https://www.google.com/maps/place/?q=place_id:${p.place_id}`
      : `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

    results.push({
      id,
      name,
      category: categoryName,
      phone,
      address,
      lat,
      lon,
      rating: p.rating ?? null,
      reviewCount: p.reviews ?? null,
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`,
      sourceUrl,
    });
  }

  return { results, stats };
}

async function searchAndNormalize({ lat, lon }, category) {
  const query = category.serpQuery || category.name.toLowerCase();
  const places = await fetchAll({ lat, lon, query });
  return { places, ...normalize(places, category.name) };
}

module.exports = { fetchAll, normalize, searchAndNormalize, SerpApiError };

if (require.main === module) {
  require('dotenv').config({ quiet: true });
  const { getCategory } = require('./categories');
  const { geocode } = require('./geocode');

  (async () => {
    const city = process.argv[2] || 'Miami Beach, FL';
    const categoryKey = process.argv[3] || 'plumbers';
    const category = getCategory(categoryKey);

    const loc = await geocode(city);
    console.log(`Geocoded ${city} → ${loc.lat}, ${loc.lon}`);

    const { places, results, stats } = await searchAndNormalize(
      { lat: loc.lat, lon: loc.lon },
      category
    );

    console.log(`\nGoogle Maps returned: ${places.length}`);
    console.log('Filter stats:', stats);
    console.log(`\nKept: ${results.length}`);
    for (const r of results.slice(0, 10)) {
      console.log(`\n  ${r.name} ${r.rating ? `(${r.rating}★, ${r.reviewCount} reviews)` : ''}`);
      console.log(`    phone:   ${r.phone || '(none)'}`);
      console.log(`    address: ${r.address || '(none)'}`);
    }
  })().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
}
