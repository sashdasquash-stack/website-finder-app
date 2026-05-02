const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const USER_AGENT = 'LeadFinder/1.0';
const QUERY_TIMEOUT = 60;

function buildQuery(bbox, category) {
  const { south, west, north, east } = bbox;
  const bboxStr = `${south},${west},${north},${east}`;
  const noWebsite = '[!"website"][!"contact:website"]';

  const clauses = [];
  for (const selector of category.selectors) {
    const tagFilters = Object.entries(selector)
      .map(([k, v]) => `["${k}"="${v}"]`)
      .join('');
    clauses.push(`node${tagFilters}${noWebsite}(${bboxStr});`);
    clauses.push(`way${tagFilters}${noWebsite}(${bboxStr});`);
  }

  return `[out:json][timeout:${QUERY_TIMEOUT}];\n(\n  ${clauses.join('\n  ')}\n);\nout center tags;`;
}

async function runOverpass(query) {
  let res;
  try {
    res = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': USER_AGENT,
      },
      body: `data=${encodeURIComponent(query)}`,
    });
  } catch (err) {
    throw new Error(`Could not reach Overpass API: ${err.message}`);
  }

  if (res.status === 429) {
    throw new Error('Overpass API rate limit reached. Wait a minute and try again.');
  }
  if (res.status === 504 || res.status === 502) {
    throw new Error('Overpass API timed out. Try a smaller area or a more specific category.');
  }
  if (!res.ok) {
    throw new Error(`Overpass API error: ${res.status} ${res.statusText}`);
  }

  let json;
  try {
    json = await res.json();
  } catch (err) {
    throw new Error(`Overpass returned an unparseable response: ${err.message}`);
  }

  return json;
}

async function search(bbox, category) {
  const query = buildQuery(bbox, category);
  const json = await runOverpass(query);
  return json.elements || [];
}

module.exports = { buildQuery, runOverpass, search };

if (require.main === module) {
  const { geocode } = require('./geocode');
  const { getCategory } = require('./categories');

  (async () => {
    const city = process.argv[2] || 'Miami Beach, FL';
    const categoryKey = process.argv[3] || 'hair-salons';

    console.log(`Geocoding "${city}"...`);
    const loc = await geocode(city);
    console.log(`  ${loc.displayName}`);
    console.log(`  bbox: ${JSON.stringify(loc.bbox)}\n`);

    const category = getCategory(categoryKey);
    console.log(`Category: ${category.name} [${category.key}]\n`);

    const query = buildQuery(loc.bbox, category);
    console.log('--- Generated Overpass QL ---');
    console.log(query);
    console.log('--- End query ---\n');

    console.log('Running Overpass query...');
    const t0 = Date.now();
    const elements = await search(loc.bbox, category);
    console.log(`  ${elements.length} elements returned in ${Date.now() - t0}ms\n`);

    const sample = elements.slice(0, 3);
    for (const el of sample) {
      console.log(`  ${el.type}/${el.id}  ${el.tags?.name || '(unnamed)'}`);
      console.log(`    tags: ${JSON.stringify(el.tags)}`);
    }
  })().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
}
