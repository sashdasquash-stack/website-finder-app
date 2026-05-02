const FSQ_BASE = 'https://places-api.foursquare.com';
const FSQ_VERSION = '2025-02-05';
const FIELDS = 'fsq_place_id,name,location,tel,website,categories,latitude,longitude';

class FoursquareError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

function getApiKey() {
  const key = process.env.FOURSQUARE_API_KEY;
  if (!key) {
    throw new FoursquareError(
      'FOURSQUARE_API_KEY is not set. Sign up at https://foursquare.com/developers/home, create a project, generate a Service API Key, then put it in a .env file at the project root.',
      500
    );
  }
  return key;
}

async function fsqRequest(endpoint, params) {
  const apiKey = getApiKey();
  const url = `${FSQ_BASE}${endpoint}?${new URLSearchParams(params)}`;
  let res;
  try {
    res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'X-Places-Api-Version': FSQ_VERSION,
      },
    });
  } catch (err) {
    throw new FoursquareError(`Could not reach Foursquare API: ${err.message}`, 0);
  }

  if (res.status === 401 || res.status === 403) {
    throw new FoursquareError('Foursquare API key invalid or unauthorized. Check FOURSQUARE_API_KEY in your .env file.', res.status);
  }
  if (res.status === 429) {
    throw new FoursquareError('Foursquare API rate limit reached. Wait a moment and try again.', 429);
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new FoursquareError(`Foursquare API error ${res.status}: ${body.slice(0, 200)}`, res.status);
  }

  return res.json();
}

async function searchRaw({ lat, lon, radiusMeters }, category, limit = 50) {
  if (!category.fsqCategoryIds?.length) {
    throw new FoursquareError(`Category "${category.key}" has no Foursquare category IDs configured.`, 500);
  }
  const data = await fsqRequest('/places/search', {
    fsq_category_ids: category.fsqCategoryIds.join(','),
    ll: `${lat},${lon}`,
    radius: String(radiusMeters),
    limit: String(limit),
    fields: FIELDS,
  });
  return data.results || [];
}

function normalizeKey(str) {
  return (str || '').toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
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
    const name = p.name;
    if (!name) {
      stats.dropped_no_name++;
      continue;
    }
    if (p.website) {
      stats.dropped_has_website++;
      continue;
    }

    const phone = p.tel || null;
    const address = p.location?.formatted_address || null;
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

    const lat = p.latitude ?? p.geocodes?.main?.latitude ?? null;
    const lon = p.longitude ?? p.geocodes?.main?.longitude ?? null;
    const id = `fsq/${p.fsq_place_id}`;
    const mapsQuery = encodeURIComponent([name, address].filter(Boolean).join(', '));

    results.push({
      id,
      name,
      category: categoryName,
      phone,
      address,
      lat,
      lon,
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`,
      sourceUrl: `https://foursquare.com/v/${p.fsq_place_id}`,
    });
  }

  return { results, stats };
}

async function searchAndNormalize(centerWithRadius, category) {
  const places = await searchRaw(centerWithRadius, category);
  return { places, ...normalize(places, category.name) };
}

module.exports = { searchRaw, normalize, searchAndNormalize, FoursquareError };

if (require.main === module) {
  require('dotenv').config({ quiet: true });
  const { getCategory } = require('./categories');
  const { geocode } = require('./geocode');

  (async () => {
    const city = process.argv[2] || 'Miami Beach, FL';
    const categoryKey = process.argv[3] || 'plumbers';
    const radiusKm = Number(process.argv[4] || 25);
    const category = getCategory(categoryKey);

    const loc = await geocode(city);
    console.log(`Geocoded ${city} → ${loc.lat}, ${loc.lon}`);
    console.log(`Foursquare search: "${category.fsqQuery}" within ${radiusKm}km`);

    const { places, results, stats } = await searchAndNormalize(
      { lat: loc.lat, lon: loc.lon, radiusMeters: radiusKm * 1000 },
      category
    );
    console.log(`\nRaw places returned: ${places.length}`);
    console.log('Filter stats:', stats);
    console.log(`\nKept: ${results.length}`);
    for (const r of results.slice(0, 8)) {
      console.log(`\n  ${r.name} [${r.id}]`);
      console.log(`    phone:   ${r.phone || '(none)'}`);
      console.log(`    address: ${r.address || '(none)'}`);
    }
  })().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
}
