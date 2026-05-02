function normalize(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getPhone(tags) {
  return tags.phone || tags['contact:phone'] || null;
}

function hasUsableAddress(tags) {
  return !!(tags['addr:street'] && tags['addr:housenumber']);
}

function buildAddress(tags) {
  const parts = [];
  const street = tags['addr:street'];
  const housenumber = tags['addr:housenumber'];
  if (street && housenumber) {
    parts.push(`${housenumber} ${street}`);
  } else if (street) {
    parts.push(street);
  }
  if (tags['addr:city']) parts.push(tags['addr:city']);
  if (tags['addr:state']) parts.push(tags['addr:state']);
  if (tags['addr:postcode']) parts.push(tags['addr:postcode']);
  return parts.length > 0 ? parts.join(', ') : null;
}

function getCoords(element) {
  if (typeof element.lat === 'number' && typeof element.lon === 'number') {
    return { lat: element.lat, lon: element.lon };
  }
  if (element.center) {
    return { lat: element.center.lat, lon: element.center.lon };
  }
  return { lat: null, lon: null };
}

function filterAndNormalize(elements, categoryName) {
  const stats = { total: elements.length, dropped_no_name: 0, dropped_unreachable: 0, dropped_dupe: 0 };
  const seen = new Set();
  const results = [];

  for (const el of elements) {
    const tags = el.tags || {};

    const name = tags.name;
    if (!name) {
      stats.dropped_no_name++;
      continue;
    }

    const phone = getPhone(tags);
    const usableAddress = hasUsableAddress(tags);
    if (!phone && !usableAddress) {
      stats.dropped_unreachable++;
      continue;
    }

    const address = buildAddress(tags);
    const dedupeKey = `${normalize(name)}|${normalize(address || '')}`;
    if (seen.has(dedupeKey)) {
      stats.dropped_dupe++;
      continue;
    }
    seen.add(dedupeKey);

    const { lat, lon } = getCoords(el);
    const id = `${el.type}/${el.id}`;
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
      osmUrl: `https://www.openstreetmap.org/${id}`,
    });
  }

  return { results, stats };
}

module.exports = { filterAndNormalize, normalize };

if (require.main === module) {
  const { geocode } = require('./geocode');
  const { getCategory } = require('./categories');
  const { search } = require('./overpass');

  (async () => {
    const city = process.argv[2] || 'Austin, TX';
    const categoryKey = process.argv[3] || 'tattoo-shops';

    console.log(`Searching: ${categoryKey} in ${city}...`);
    const loc = await geocode(city);
    const category = getCategory(categoryKey);
    const elements = await search(loc.bbox, category);
    console.log(`  Overpass returned ${elements.length} elements\n`);

    const { results, stats } = filterAndNormalize(elements, category.name);

    console.log('Filter stats:');
    console.log(`  total:              ${stats.total}`);
    console.log(`  dropped (no name):  ${stats.dropped_no_name}`);
    console.log(`  dropped (no phone & no address): ${stats.dropped_unreachable}`);
    console.log(`  dropped (duplicate): ${stats.dropped_dupe}`);
    console.log(`  kept:               ${results.length}\n`);

    console.log('Sample (first 5):');
    for (const r of results.slice(0, 5)) {
      console.log(`\n  ${r.name} [${r.id}]`);
      console.log(`    phone:   ${r.phone || '(none)'}`);
      console.log(`    address: ${r.address || '(none)'}`);
      console.log(`    coords:  ${r.lat}, ${r.lon}`);
      console.log(`    verify:  ${r.googleMapsUrl}`);
    }
  })().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
}
