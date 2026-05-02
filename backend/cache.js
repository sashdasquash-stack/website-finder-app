const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const CACHE_DIR = path.join(__dirname, '..', 'data', 'cache', 'queries');
const TTL_MS = 24 * 60 * 60 * 1000;

function buildKey(...parts) {
  const payload = JSON.stringify(parts);
  return crypto.createHash('sha256').update(payload).digest('hex').slice(0, 16);
}

function cachePath(key) {
  return path.join(CACHE_DIR, `${key}.json`);
}

async function get(key) {
  try {
    const raw = await fs.readFile(cachePath(key), 'utf8');
    const cached = JSON.parse(raw);
    const ageMs = Date.now() - cached.savedAt;
    if (ageMs > TTL_MS) return null;
    return { data: cached.data, savedAt: cached.savedAt, ageMs };
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

async function set(key, data) {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.writeFile(cachePath(key), JSON.stringify({ savedAt: Date.now(), data }));
  return key;
}

module.exports = { buildKey, get, set, TTL_MS };
