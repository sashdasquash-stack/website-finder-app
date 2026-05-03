const els = {
  form: document.getElementById('search-form'),
  city: document.getElementById('city'),
  category: document.getElementById('category'),
  searchBtn: document.getElementById('search-btn'),
  status: document.getElementById('status'),
  resultsSection: document.getElementById('results-section'),
  resultsSummary: document.getElementById('results-summary'),
  resultsMeta: document.getElementById('results-meta'),
  resultsMetaText: document.getElementById('results-meta-text'),
  refreshBtn: document.getElementById('refresh-btn'),
  resultsTable: document.getElementById('results-table'),
  resultsBody: document.querySelector('#results-table tbody'),
  exportBtn: document.getElementById('export-csv'),
  checkAll: document.getElementById('check-all'),
  hideContacted: document.getElementById('hide-contacted'),
  pitchAll: document.getElementById('pitch-all'),
  lock: document.getElementById('lock'),
  lockForm: document.getElementById('lock-form'),
  lockInput: document.getElementById('lock-input'),
  lockError: document.getElementById('lock-error'),
};

const SERP_KEY = 'lead_finder_serpapi_key';
const CONTACTED_KEY = 'lead_finder_contacted';
const OWNER_HASH = '9c6a0aebb2cc42f62ac1c364eef957d42c295ffd2417ec58cc9204d2655c9925';
const PITCH_MESSAGE = "hey! i saw you guys dont have a website! im a pro builder, and im willing to help. reach out to me for more info!";

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function checkOwner() {
  const key = getSerpKey();
  if (!key) {
    document.body.classList.remove('is-owner');
    return;
  }
  try {
    const hash = await sha256(key);
    document.body.classList.toggle('is-owner', hash === OWNER_HASH);
  } catch {
    document.body.classList.remove('is-owner');
  }
}

function getSerpKey() { return localStorage.getItem(SERP_KEY) || ''; }
function setSerpKey(k) { localStorage.setItem(SERP_KEY, k); }
function clearSerpKey() { localStorage.removeItem(SERP_KEY); }

async function authFetch(url, options = {}) {
  const headers = { ...(options.headers || {}), 'x-serpapi-key': getSerpKey() };
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    clearSerpKey();
    showLock('Your SerpAPI key was rejected. Paste it again.');
    throw new Error('Authentication required');
  }
  return res;
}

function showLock(message) {
  els.lock.classList.remove('hidden');
  els.lock.removeAttribute('aria-hidden');
  if (message) {
    els.lockError.textContent = message;
    els.lockError.classList.remove('hidden');
  } else {
    els.lockError.classList.add('hidden');
  }
  setTimeout(() => els.lockInput.focus(), 50);
}

function hideLock() {
  els.lock.classList.add('hidden');
  els.lock.setAttribute('aria-hidden', 'true');
  els.lockError.classList.add('hidden');
  els.lockInput.value = '';
}

async function checkAuthSilently() {
  const stored = getSerpKey();
  if (!stored) {
    showLock();
    return false;
  }
  try {
    const res = await fetch('/api/validate-key', { headers: { 'x-serpapi-key': stored } });
    if (res.status === 401) {
      clearSerpKey();
      showLock('Your saved key is no longer valid. Paste a new one.');
      return false;
    }
    hideLock();
    await checkOwner();
    return true;
  } catch {
    return false;
  }
}

els.lockForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const key = els.lockInput.value.trim();
  if (!key) return;

  els.lockError.classList.add('hidden');
  const submitBtn = els.lockForm.querySelector('button');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Checking…';

  try {
    const res = await fetch('/api/validate-key', { headers: { 'x-serpapi-key': key } });
    if (res.status === 401) {
      showLock("That key isn't valid. Double-check it at serpapi.com/dashboard.");
      return;
    }
    if (!res.ok) {
      showLock(`Could not validate key (HTTP ${res.status}). Try again.`);
      return;
    }
    setSerpKey(key);
    hideLock();
    await checkOwner();
  } catch (err) {
    showLock(`Could not reach the server: ${err.message}`);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Continue';
  }
});

let currentResults = [];
let currentMeta = null;
let currentSort = { col: null, dir: 'asc' };
const contactedSet = new Set();

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

function escapeAttr(str) {
  return String(str ?? '').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

async function loadCategories() {
  const res = await fetch('/api/categories');
  if (!res.ok) throw new Error('Could not load categories');
  const { categories } = await res.json();
  els.category.innerHTML =
    '<option value="">Select a category…</option>' +
    categories
      .map(c => `<option value="${escapeAttr(c.key)}">${escapeHtml(c.name)}</option>`)
      .join('');
}

function setStatus(type, message) {
  if (!type) {
    els.status.className = 'status hidden';
    els.status.innerHTML = '';
    return;
  }
  els.status.className = `status ${type}`;
  if (type === 'loading') {
    els.status.innerHTML = `<div class="spinner" aria-hidden="true"></div><span>${escapeHtml(message)}</span>`;
  } else {
    els.status.textContent = message;
  }
}

function renderRow(r) {
  const phoneCell = r.phone
    ? `<a href="tel:${escapeAttr(r.phone.replace(/\s+/g, ''))}">${escapeHtml(r.phone)}</a>`
    : '<span class="muted">—</span>';
  const addressCell = r.address
    ? `<a href="${escapeAttr(r.googleMapsUrl)}" target="_blank" rel="noopener">${escapeHtml(r.address)}</a>`
    : '<span class="muted">—</span>';
  const ratingCell = r.rating != null
    ? `<span class="rating">${r.rating.toFixed(1)} <span class="star">★</span> <span class="muted">(${r.reviewCount ?? 0})</span></span>`
    : '<span class="muted">—</span>';
  const isContacted = contactedSet.has(r.id);
  const checked = isContacted ? ' checked' : '';
  const trClass = isContacted ? ' class="contacted"' : '';
  return `
    <tr data-id="${escapeAttr(r.id)}"${trClass}>
      <td class="col-check"><input type="checkbox" class="contacted-checkbox" aria-label="Mark contacted"${checked}></td>
      <td><a class="name-cell" href="${escapeAttr(r.sourceUrl)}" target="_blank" rel="noopener">${escapeHtml(r.name)}</a></td>
      <td class="col-rating">${ratingCell}</td>
      <td>${phoneCell}</td>
      <td>${addressCell}</td>
      <td class="col-verify"><a class="verify-btn" href="${escapeAttr(r.googleMapsUrl)}" target="_blank" rel="noopener">Verify ↗</a></td>
    </tr>
  `;
}

function renderResults(results) {
  if (results.length === 0) {
    els.resultsBody.innerHTML =
      '<tr class="empty-row"><td colspan="6">No leads found here. Try a different city or category — OSM coverage varies by region.</td></tr>';
    return;
  }
  els.resultsBody.innerHTML = results.map(renderRow).join('');
}

function renderSummary(meta, results, stats) {
  const count = results.length;
  const contactedCount = results.filter(r => contactedSet.has(r.id)).length;
  const contactedNote = contactedCount > 0 ? ` · ${contactedCount} contacted` : '';
  els.resultsSummary.textContent = `${count.toLocaleString()} ${count === 1 ? 'lead' : 'leads'}${contactedNote} · ${meta.category}`;
  const dropped = stats.total - results.length;
  const droppedNote = dropped > 0 ? ` · ${dropped} dropped (had website / unreachable / dupe)` : '';
  const radiusNote = meta.radiusKm ? ` · ${meta.radiusKm}km radius` : '';
  const cityScope = meta.multiCity && meta.citiesSearched
    ? `${meta.city} · ${meta.citiesSearched.length} cities (${meta.citiesSearched.join(', ')})`
    : meta.city;
  els.resultsMetaText.textContent = `${cityScope}${radiusNote} · ${meta.cache}${droppedNote}`;
}

function applySort(col) {
  if (currentSort.col === col) {
    currentSort.dir = currentSort.dir === 'asc' ? 'desc' : 'asc';
  } else {
    currentSort = { col, dir: 'asc' };
  }
  const sorted = [...currentResults].sort((a, b) => {
    const av = (a[col] || '').toString().toLowerCase();
    const bv = (b[col] || '').toString().toLowerCase();
    if (av === bv) return 0;
    return av < bv ? -1 : 1;
  });
  if (currentSort.dir === 'desc') sorted.reverse();

  document.querySelectorAll('th[data-sort]').forEach(th => {
    th.classList.remove('sorted-asc', 'sorted-desc');
    if (th.dataset.sort === col) th.classList.add(`sorted-${currentSort.dir}`);
  });

  renderResults(sorted);
}

async function performSearch(city, categoryKey, { force = false } = {}) {
  setStatus('loading', `${force ? 'Refreshing' : 'Searching for leads in'} ${city}…`);
  els.searchBtn.disabled = true;
  if (els.refreshBtn) els.refreshBtn.disabled = true;
  if (!force) els.resultsSection.classList.add('hidden');

  try {
    const res = await authFetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city, category: categoryKey, force }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Search failed (HTTP ${res.status})`);

    currentResults = data.results;
    currentMeta = data.meta;
    lastStats = data.stats;
    currentSort = { col: null, dir: 'asc' };
    document.querySelectorAll('th[data-sort]').forEach(th => {
      th.classList.remove('sorted-asc', 'sorted-desc');
    });

    renderSummary(data.meta, data.results, data.stats);
    renderResults(data.results);
    setStatus(null);
    els.resultsSection.classList.remove('hidden');
  } catch (err) {
    setStatus('error', err.message);
  } finally {
    els.searchBtn.disabled = false;
    if (els.refreshBtn) els.refreshBtn.disabled = false;
  }
}

function exportCSV() {
  if (currentResults.length === 0) return;
  const headers = ['Name', 'Category', 'Rating', 'Reviews', 'Phone', 'Address', 'Latitude', 'Longitude', 'Google Maps', 'Source'];
  const rows = currentResults.map(r => [
    r.name, r.category, r.rating ?? '', r.reviewCount ?? '',
    r.phone || '', r.address || '',
    r.lat ?? '', r.lon ?? '', r.googleMapsUrl, r.sourceUrl,
  ]);
  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const cityPart = (currentMeta?.city || 'leads').split(',')[0].toLowerCase().replace(/\s+/g, '-');
  const catPart = (currentMeta?.category || 'all').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  a.href = url;
  a.download = `leads-${cityPart}-${catPart}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

document.querySelectorAll('th[data-sort]').forEach(th => {
  th.addEventListener('click', () => applySort(th.dataset.sort));
});

function loadContactedFromStorage() {
  contactedSet.clear();
  try {
    const ids = JSON.parse(localStorage.getItem(CONTACTED_KEY) || '[]');
    for (const id of ids) contactedSet.add(id);
  } catch {
    // ignore corrupted storage
  }
}

function saveContactedToStorage() {
  localStorage.setItem(CONTACTED_KEY, JSON.stringify([...contactedSet]));
}

function toggleContacted(id, contacted) {
  if (contacted) contactedSet.add(id);
  else contactedSet.delete(id);
  saveContactedToStorage();
  if (currentMeta) {
    renderSummary(currentMeta, currentResults, lastStats);
  }
  return true;
}

let lastStats = { total: 0 };

els.resultsBody.addEventListener('change', async (e) => {
  const cb = e.target.closest('.contacted-checkbox');
  if (!cb) return;
  const tr = cb.closest('tr');
  const id = tr?.dataset.id;
  if (!id) return;
  const ok = await toggleContacted(id, cb.checked);
  if (ok) tr.classList.toggle('contacted', cb.checked);
  else cb.checked = !cb.checked;
});

els.checkAll.addEventListener('change', async () => {
  const checks = [...document.querySelectorAll('.contacted-checkbox')];
  const target = els.checkAll.checked;
  for (const cb of checks) {
    if (cb.checked === target) continue;
    cb.checked = target;
    const tr = cb.closest('tr');
    const id = tr?.dataset.id;
    if (!id) continue;
    await toggleContacted(id, target);
    tr.classList.toggle('contacted', target);
  }
});

els.hideContacted.addEventListener('change', () => {
  els.resultsTable.classList.toggle('hide-contacted', els.hideContacted.checked);
});

els.form.addEventListener('submit', e => {
  e.preventDefault();
  const city = els.city.value.trim();
  const categoryKey = els.category.value;
  if (!city || !categoryKey) return;
  performSearch(city, categoryKey);
});

els.exportBtn.addEventListener('click', exportCSV);

els.refreshBtn?.addEventListener('click', () => {
  if (!currentMeta) return;
  const city = els.city.value.trim() || currentMeta.city;
  const categoryKey = els.category.value;
  const cost = currentMeta.multiCity ? currentMeta.citiesSearched?.length || 5 : 1;
  if (!confirm(`Force a fresh search? This costs ${cost} SerpAPI credit${cost === 1 ? '' : 's'}.`)) return;
  performSearch(city, categoryKey, { force: true });
});

function pitchAll() {
  if (!document.body.classList.contains('is-owner')) return;
  const pool = els.hideContacted.checked
    ? currentResults.filter(r => !contactedSet.has(r.id))
    : currentResults;
  const phones = pool
    .filter(r => r.phone)
    .map(r => r.phone.replace(/[^\d+]/g, ''))
    .filter(Boolean);

  if (phones.length === 0) {
    setStatus('error', 'No phone numbers in the current results to text.');
    return;
  }

  const ok = confirm(
    `Open your phone's SMS app with ${phones.length} recipient${phones.length === 1 ? '' : 's'} pre-loaded?\n\n` +
    `You'll still need to tap Send. Note: cold-pitch SMS to businesses can run afoul of TCPA — proceed at your own risk.`
  );
  if (!ok) return;

  const recipients = phones.join(',');
  const body = encodeURIComponent(PITCH_MESSAGE);
  const smsUrl = `sms:${recipients}?&body=${body}`;
  window.location.href = smsUrl;
}

els.pitchAll?.addEventListener('click', pitchAll);

loadContactedFromStorage();
(async () => {
  await checkAuthSilently();
  await loadCategories().catch(err => setStatus('error', err.message));
})();
