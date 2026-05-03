require('dotenv').config({ quiet: true });

const express = require('express');
const path = require('path');
const { listCategories, getCategory, getCategoryGroup } = require('./categories');
const { geocode } = require('./geocode');
const { searchAndNormalize, validateApiKey, SerpApiError } = require('./serpapi');
const { detectState } = require('./states');
const cache = require('./cache');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/api/categories', (req, res) => {
  res.json({ categories: listCategories() });
});

function requireSerpKey(req, res, next) {
  const key = req.headers['x-serpapi-key'];
  if (!key || typeof key !== 'string' || key.length < 10) {
    return res.status(401).json({ error: 'Missing or invalid SerpAPI key.' });
  }
  req.serpApiKey = key;
  next();
}

app.get('/api/validate-key', async (req, res) => {
  const key = req.headers['x-serpapi-key'];
  if (!key) {
    return res.status(400).json({ valid: false, error: 'No key provided.' });
  }
  try {
    const result = await validateApiKey(key);
    if (!result.valid) {
      return res.status(401).json({ valid: false, error: 'Invalid SerpAPI key.' });
    }
    res.json({ valid: true });
  } catch (err) {
    res.status(500).json({ valid: false, error: err.message });
  }
});

async function searchOneCity(apiKey, city, category) {
  const loc = await geocode(city);
  const search = await searchAndNormalize({ apiKey, lat: loc.lat, lon: loc.lon }, category);
  return { displayName: loc.displayName, ...search };
}

async function handleCitySearch(apiKey, city, category, force = false) {
  const cacheKey = cache.buildKey('gmaps', city.trim().toLowerCase(), category.key);
  const cached = force ? null : await cache.get(cacheKey);
  if (cached) {
    return {
      results: cached.data.results,
      stats: cached.data.stats,
      meta: {
        city: cached.data.displayCity || city,
        cache: `cache (${Math.round(cached.ageMs / 1000)}s old)`,
        category: category.name,
        source: 'Google Maps (via SerpAPI)',
      },
    };
  }
  const search = await searchOneCity(apiKey, city, category);
  await cache.set(cacheKey, {
    results: search.results,
    stats: search.stats,
    displayCity: search.displayName,
  });
  return {
    results: search.results,
    stats: search.stats,
    meta: {
      city: search.displayName,
      cache: 'fresh',
      category: category.name,
      source: 'Google Maps (via SerpAPI)',
    },
  };
}

async function handleStateSearch(apiKey, state, category, force = false) {
  const cacheKey = cache.buildKey('gmaps-state', state.abbr, category.key);
  const cached = force ? null : await cache.get(cacheKey);
  if (cached) {
    return {
      results: cached.data.results,
      stats: cached.data.stats,
      meta: {
        city: state.name,
        cache: `cache (${Math.round(cached.ageMs / 1000)}s old)`,
        category: category.name,
        source: 'Google Maps (via SerpAPI)',
        multiCity: true,
        citiesSearched: cached.data.citiesSearched,
      },
    };
  }

  const allResults = [];
  const seen = new Set();
  const totalStats = { total: 0, dropped_has_website: 0, dropped_no_name: 0, dropped_unreachable: 0, dropped_dupe: 0 };
  const citiesSearched = [];

  for (const cityName of state.cities) {
    try {
      const search = await searchOneCity(apiKey, cityName, category);
      for (const r of search.results) {
        if (seen.has(r.id)) {
          totalStats.dropped_dupe++;
          continue;
        }
        seen.add(r.id);
        allResults.push(r);
      }
      totalStats.total += search.stats.total;
      totalStats.dropped_has_website += search.stats.dropped_has_website;
      totalStats.dropped_no_name += search.stats.dropped_no_name;
      totalStats.dropped_unreachable += search.stats.dropped_unreachable;
      citiesSearched.push(cityName.split(',')[0].trim());
    } catch (err) {
      console.error(`State search: failed for ${cityName}: ${err.message}`);
    }
  }

  if (citiesSearched.length === 0) {
    throw new Error(`Could not find any results in ${state.name}.`);
  }

  await cache.set(cacheKey, { results: allResults, stats: totalStats, citiesSearched });

  return {
    results: allResults,
    stats: totalStats,
    meta: {
      city: state.name,
      cache: 'fresh',
      category: category.name,
      source: 'Google Maps (via SerpAPI)',
      multiCity: true,
      citiesSearched,
    },
  };
}

async function handleGroupSearch(apiKey, city, group, force) {
  const state = detectState(city);
  const cacheScope = state ? 'gmaps-state-group' : 'gmaps-group';
  const cacheCity = state ? state.abbr : city.trim().toLowerCase();
  const cacheKey = cache.buildKey(cacheScope, cacheCity, group.key);

  if (!force) {
    const cached = await cache.get(cacheKey);
    if (cached) {
      return {
        results: cached.data.results,
        stats: cached.data.stats,
        meta: {
          city: cached.data.displayCity || (state ? state.name : city),
          cache: `cache (${Math.round(cached.ageMs / 1000)}s old)`,
          category: group.name,
          source: 'Google Maps (via SerpAPI)',
          multiCategory: true,
          categoriesSearched: cached.data.categoriesSearched,
          ...(cached.data.citiesSearched ? { multiCity: true, citiesSearched: cached.data.citiesSearched } : {}),
        },
      };
    }
  }

  const allResults = [];
  const seen = new Set();
  const totalStats = { total: 0, dropped_has_website: 0, dropped_no_name: 0, dropped_unreachable: 0, dropped_dupe: 0 };
  const categoriesSearched = [];
  let citiesSearched;
  let displayCity;

  for (const catKey of group.categories) {
    try {
      const category = getCategory(catKey);
      const sub = state
        ? await handleStateSearch(apiKey, state, category, force)
        : await handleCitySearch(apiKey, city, category, force);
      for (const r of sub.results) {
        if (seen.has(r.id)) {
          totalStats.dropped_dupe++;
          continue;
        }
        seen.add(r.id);
        allResults.push(r);
      }
      totalStats.total += sub.stats.total;
      totalStats.dropped_has_website += sub.stats.dropped_has_website;
      totalStats.dropped_no_name += sub.stats.dropped_no_name;
      totalStats.dropped_unreachable += sub.stats.dropped_unreachable;
      categoriesSearched.push(category.name);
      if (sub.meta.citiesSearched) citiesSearched = sub.meta.citiesSearched;
      if (sub.meta.city) displayCity = sub.meta.city;
    } catch (err) {
      console.error(`Group search: failed for ${catKey}: ${err.message}`);
    }
  }

  if (categoriesSearched.length === 0) {
    throw new Error(`Could not find any results for ${group.name} in ${state ? state.name : city}.`);
  }

  await cache.set(cacheKey, { results: allResults, stats: totalStats, categoriesSearched, citiesSearched, displayCity });

  return {
    results: allResults,
    stats: totalStats,
    meta: {
      city: displayCity || (state ? state.name : city),
      cache: 'fresh',
      category: group.name,
      source: 'Google Maps (via SerpAPI)',
      multiCategory: true,
      categoriesSearched,
      ...(citiesSearched ? { multiCity: true, citiesSearched } : {}),
    },
  };
}

app.post('/api/search', requireSerpKey, async (req, res) => {
  try {
    const { city, category: categoryKey, force } = req.body || {};
    if (!city || !categoryKey) {
      return res.status(400).json({ error: 'Both "city" and "category" are required.' });
    }

    let result;
    if (categoryKey.startsWith('group:')) {
      const group = getCategoryGroup(categoryKey.slice(6));
      result = await handleGroupSearch(req.serpApiKey, city, group, Boolean(force));
    } else {
      const category = getCategory(categoryKey);
      const state = detectState(city);
      result = state
        ? await handleStateSearch(req.serpApiKey, state, category, Boolean(force))
        : await handleCitySearch(req.serpApiKey, city, category, Boolean(force));
    }

    res.json(result);
  } catch (err) {
    console.error('Search error:', err.message);
    const status = err instanceof SerpApiError ? (err.status || 500) : 500;
    res.status(status).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Lead Finder running at http://localhost:${PORT}`);
  console.log('Bring-your-own-key mode: every visitor enters their own SerpAPI key.');
});
