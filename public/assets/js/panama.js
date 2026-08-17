const root = document.querySelector('[data-root]');
const nav = document.querySelector('[data-nav]');
const footer = document.querySelector('[data-footer]');

const esc = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const attr = (value = '') => esc(value);
const safeHref = (href = '#') => {
  const raw = String(href || '#').trim();
  if (raw.startsWith('//')) return '#';
  if (raw.startsWith('#') || raw.startsWith('/') || raw.startsWith('mailto:') || /^https?:\/\//i.test(raw)) return raw;
  return '#';
};
const linkAttrs = (href = '') => /^https?:\/\//i.test(safeHref(href)) ? ' target="_blank" rel="noopener"' : '';

const byId = (list = []) => Object.fromEntries(list.map(item => [item.id, item]));

function cites(ids = [], sources) {
  const items = ids.map(id => sources[id]).filter(Boolean);
  if (!items.length) return '';
  return `<p class="cite-row">${items.map(s => s.url
    ? `<a href="${attr(safeHref(s.url))}"${linkAttrs(s.url)}>${esc(s.label)}</a>`
    : esc(s.label)
  ).join(' · ')}</p>`;
}

function renderShell(data) {
  document.querySelectorAll('[data-bind="site.name"]').forEach(el => { el.textContent = data.site.name; });
  document.querySelectorAll('[data-bind="site.shortName"]').forEach(el => { el.textContent = data.site.shortName || 'BZ'; });
  document.querySelectorAll('[data-bind="site.email"]').forEach(el => { el.textContent = data.site.email; });
  document.querySelectorAll('[data-bind-href="mailto:site.email"]').forEach(el => { el.href = `mailto:${data.site.email}`; });
  nav.innerHTML = (data.site.nav || [])
    .filter(item => item.label && item.href)
    .map(item => {
      const href = safeHref(item.href);
      const current = href === '/panama.html' || href === '#features' ? ' aria-current="page"' : '';
      return `<a href="${attr(href)}"${current}>${esc(item.label)}</a>`;
    })
    .join('');
}

function renderFooter(data) {
  const year = new Date().getFullYear();
  footer.innerHTML = `<div class="footer-inner"><div>© ${year} ${esc(data.site.name)} · ${esc(data.site.location)}</div><div class="footer-links">${(data.site.socials || []).map(s => `<a href="${attr(safeHref(s.href))}"${linkAttrs(s.href)}>${esc(s.label)}</a>`).join('')}</div></div>`;
}

function renderRecord(feature, sources) {
  const r = feature.record;
  return `<section class="chapter is-on" id="chapter-record" role="tabpanel" data-chapter="record">
    <p class="chapter-lede">${esc(r.lede)}</p>
    ${(feature.quotes || []).map(q => `<blockquote class="pull"><p>${esc(q.text)}</p>${cites(q.sourceIds, sources)}</blockquote>`).join('')}
    <div class="beat-list">
      ${(r.beats || []).map(b => `<article class="beat"><h2>${esc(b.title)}</h2><p>${esc(b.body)}</p>${cites(b.sourceIds, sources)}</article>`).join('')}
    </div>
    <div class="unknown-list">
      ${(r.unknowns || []).map(u => `<article class="unknown"><h3>${esc(u.title)}</h3><p>${esc(u.body)}</p>${cites(u.sourceIds, sources)}</article>`).join('')}
    </div>
  </section>`;
}

function barWidth(item, max) {
  if (!item.value || !max) return 4;
  return Math.max(4, Math.min(100, (item.value / max) * 100));
}

function rangeStyle(item, max) {
  const low = Math.max(0, (item.rangeLow / max) * 100);
  const high = Math.max(low + 0.4, (item.value / max) * 100);
  return `left:${low}%;width:${high - low}%`;
}

function renderBar(item, max, sources) {
  const kind = item.kind === 'range' ? 'range' : item.kind === 'redacted' ? 'redacted' : item.group;
  const fill = item.kind === 'range'
    ? `<span class="bar-fill range" style="${rangeStyle(item, max)}"></span>`
    : `<span class="bar-fill ${attr(kind)}" style="width:${barWidth(item, max)}%"></span>`;
  return `<button class="bar-row" type="button" data-bar="${attr(item.id)}" aria-expanded="false">
    <span class="bar-label">${esc(item.label)}</span>
    <span class="bar-track" aria-hidden="true">${fill}</span>
    <span class="bar-value">${esc(item.display)}</span>
    <span class="bar-note">${esc(item.note)} ${cites(item.sourceIds, sources)}</span>
  </button>`;
}

const SCALE_VIEWS = {
  scans: {
    label: 'Against other scan programs',
    max: 40000000,
    ids: ['google-books', 'ia-digitized', 'loc-books', 'hathitrust', 'pirated-total', 'panama-vendor', 'panama-court', 'settlement-class', 'books3']
  },
  public: {
    label: 'Against collections that still exist',
    max: 686900000,
    ids: ['us-public-print', 'google-books', 'loc-books', 'ia-digitized', 'hathitrust', 'pirated-total', 'panama-vendor', 'panama-court']
  }
};

function renderScale(feature, sources) {
  const comparators = byId(feature.scale.comparators);
  const view = SCALE_VIEWS.scans;
  const rows = view.ids.map(id => comparators[id]).filter(Boolean);
  return `<section class="chapter" id="chapter-scale" role="tabpanel" data-chapter="scale" hidden>
    <p class="chapter-lede">${esc(feature.scale.intro)}</p>
    <div class="loss-grid">
      ${(feature.scale.losses || []).map(l => `<article class="loss"><h3>${esc(l.title)}</h3><p>${esc(l.body)}</p>${cites(l.sourceIds, sources)}</article>`).join('')}
    </div>
    <div class="scale-toolbar" role="group" aria-label="Comparison set">
      <span>Compare</span>
      ${Object.entries(SCALE_VIEWS).map(([id, v], i) => `<button class="chip" type="button" data-scale-view="${id}" aria-pressed="${i === 0 ? 'true' : 'false'}">${esc(v.label)}</button>`).join('')}
    </div>
    <div class="chart" data-chart>
      ${rows.map(item => renderBar(item, view.max, sources)).join('')}
    </div>
    <p class="chapter-lede">${esc(feature.scale.throughput.intro)}</p>
    <div class="throughput">
      ${feature.scale.throughput.rows.map(row => `<article class="t-row"><div><strong>${esc(row.label)}</strong><span class="num">${esc(row.display)}</span></div><p>${esc(row.detail)}</p>${cites(row.sourceIds, sources)}</article>`).join('')}
    </div>
  </section>`;
}

function renderAlternatives(feature, sources) {
  const a = feature.alternatives;
  const first = a.paths[0];
  return `<section class="chapter" id="chapter-alternatives" role="tabpanel" data-chapter="alternatives" hidden>
    <p class="chapter-lede">${esc(a.intro)}</p>
    <div class="matrix-wrap">
      <table class="matrix">
        <thead>
          <tr>
            <th scope="col" class="stub"></th>
            ${a.paths.map(p => `<th scope="col" data-path="${attr(p.id)}" class="${p.highlight ? 'hl is-on' : ''}"><button class="path-btn" type="button" data-path="${attr(p.id)}">${esc(p.short)}</button></th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${a.criteria.map(c => `<tr>
            <th scope="row" class="stub">${esc(c.label)}</th>
            ${a.paths.map(p => `<td data-path="${attr(p.id)}" class="${p.highlight ? 'hl is-on' : ''}">${esc(p.cells[c.id])}</td>`).join('')}
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <aside class="path-detail" data-path-detail>
      <h3>${esc(first.label)}</h3>
      <p>${esc(Object.values(first.cells).join(' '))}</p>
      ${cites(first.sourceIds, sources)}
    </aside>
  </section>`;
}

function renderSplit(feature, sources) {
  const s = feature.split;
  return `<section class="chapter" id="chapter-split" role="tabpanel" data-chapter="split" hidden>
    <p class="chapter-lede">${esc(s.intro)}</p>
    <div class="split-grid">
      ${s.columns.map(col => `<article class="split-col"><h2>${esc(col.title)}</h2><ol>${col.items.map(item => `<li>${esc(item)}</li>`).join('')}</ol>${cites(col.sourceIds, sources)}</article>`).join('')}
    </div>
    <p class="closing">${esc(s.closing)}</p>
  </section>`;
}

function renderSources(feature) {
  return `<section class="chapter" id="chapter-sources" role="tabpanel" data-chapter="sources" hidden>
    <p class="chapter-lede">Every figure on this page points here. Court documents outrank recaps. Where a total is redacted, the page says so instead of filling the hole.</p>
    <ol class="source-list">
      ${feature.sources.map(s => `<li>${s.url ? `<a href="${attr(safeHref(s.url))}"${linkAttrs(s.url)}>${esc(s.label)}</a>` : `<strong>${esc(s.label)}</strong>`}<p>${esc(s.detail)}</p></li>`).join('')}
    </ol>
  </section>`;
}

function renderFeature(feature) {
  const sources = byId(feature.sources);
  const updated = new Date(feature.updated + 'T00:00:00Z');
  const updatedLabel = Number.isNaN(updated.getTime())
    ? feature.updated
    : updated.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
  return `<article class="feature">
    <header class="feature-hero">
      <h1>${esc(feature.headline)}</h1>
      <p class="feature-dek">${esc(feature.dek)}</p>
      <p class="feature-meta"><span>Brad Zellman</span><span>Updated ${esc(updatedLabel)}</span><span>Bartz v. Anthropic</span></p>
      <p class="honesty">${esc(feature.honesty)}</p>
    </header>
    <nav class="feature-chapters" aria-label="Feature sections">
      <div class="feature-chapters-inner" role="tablist">
        ${feature.chapters.map((ch, i) => `<button type="button" role="tab" id="tab-${attr(ch.id)}" aria-controls="chapter-${attr(ch.id)}" aria-selected="${i === 0 ? 'true' : 'false'}" data-chapter="${attr(ch.id)}">${esc(ch.label)}</button>`).join('')}
      </div>
    </nav>
    <div class="feature-stage" id="feature-stage">
      ${renderRecord(feature, sources)}
      ${renderScale(feature, sources)}
      ${renderAlternatives(feature, sources)}
      ${renderSplit(feature, sources)}
      ${renderSources(feature)}
    </div>
  </article>`;
}

function showChapter(id) {
  const tabs = [...document.querySelectorAll('[role="tab"][data-chapter]')];
  const panels = [...document.querySelectorAll('[data-chapter].chapter')];
  tabs.forEach(tab => {
    const on = tab.dataset.chapter === id;
    tab.setAttribute('aria-selected', on ? 'true' : 'false');
  });
  panels.forEach(panel => {
    const on = panel.dataset.chapter === id;
    panel.classList.toggle('is-on', on);
    panel.hidden = !on;
  });
  if (location.hash.replace('#', '') !== id) {
    history.replaceState(null, '', `#${id}`);
  }
}

function bindChapters(feature) {
  const ids = feature.chapters.map(ch => ch.id);
  document.querySelector('.feature-chapters').addEventListener('click', event => {
    const tab = event.target.closest('[data-chapter]');
    if (!tab) return;
    showChapter(tab.dataset.chapter);
  });
  document.querySelector('.feature-chapters').addEventListener('keydown', event => {
    const tab = event.target.closest('[role="tab"]');
    if (!tab) return;
    const index = ids.indexOf(tab.dataset.chapter);
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      const next = ids[(index + 1) % ids.length];
      document.querySelector(`[role="tab"][data-chapter="${next}"]`).focus();
      showChapter(next);
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      const prev = ids[(index - 1 + ids.length) % ids.length];
      document.querySelector(`[role="tab"][data-chapter="${prev}"]`).focus();
      showChapter(prev);
    }
  });
  const fromHash = location.hash.replace('#', '');
  showChapter(ids.includes(fromHash) ? fromHash : ids[0]);
  window.addEventListener('hashchange', () => {
    const id = location.hash.replace('#', '');
    if (ids.includes(id)) showChapter(id);
  });
}

function bindScale(feature) {
  const sources = byId(feature.sources);
  const comparators = byId(feature.scale.comparators);
  const chart = document.querySelector('[data-chart]');
  const toolbar = document.querySelector('[data-scale-view]')?.parentElement;
  if (!chart || !toolbar) return;

  const paint = (viewId) => {
    const view = SCALE_VIEWS[viewId];
    const rows = view.ids.map(id => comparators[id]).filter(Boolean);
    chart.innerHTML = rows.map(item => renderBar(item, view.max, sources)).join('');
  };

  toolbar.addEventListener('click', event => {
    const chip = event.target.closest('[data-scale-view]');
    if (!chip) return;
    toolbar.querySelectorAll('[data-scale-view]').forEach(btn => btn.setAttribute('aria-pressed', btn === chip ? 'true' : 'false'));
    paint(chip.dataset.scaleView);
  });

  chart.addEventListener('click', event => {
    const row = event.target.closest('.bar-row');
    if (!row) return;
    const open = row.classList.contains('is-on');
    chart.querySelectorAll('.bar-row').forEach(el => {
      el.classList.remove('is-on');
      el.setAttribute('aria-expanded', 'false');
    });
    if (!open) {
      row.classList.add('is-on');
      row.setAttribute('aria-expanded', 'true');
    }
  });
}

function bindAlternatives(feature) {
  const sources = byId(feature.sources);
  const paths = byId(feature.alternatives.paths);
  const table = document.querySelector('.matrix');
  const detail = document.querySelector('[data-path-detail]');
  if (!table || !detail) return;

  const select = (id) => {
    const path = paths[id];
    if (!path) return;
    table.querySelectorAll('[data-path]').forEach(el => el.classList.toggle('is-on', el.dataset.path === id));
    detail.innerHTML = `<h3>${esc(path.label)}</h3><p>${esc(Object.values(path.cells).join(' '))}</p>${cites(path.sourceIds, sources)}`;
  };

  table.addEventListener('click', event => {
    const btn = event.target.closest('[data-path]');
    if (!btn) return;
    select(btn.dataset.path);
  });
}

function updateMeta(feature) {
  document.title = feature.meta?.title || feature.headline;
  const desc = document.querySelector('meta[name="description"]');
  if (desc && feature.meta?.description) desc.content = feature.meta.description;
}

async function boot() {
  try {
    const [siteRes, featureRes] = await Promise.all([
      fetch('/content/site.json', { cache: 'no-store' }),
      fetch('/content/panama.json', { cache: 'no-store' })
    ]);
    if (!siteRes.ok) throw new Error(`site fetch failed: ${siteRes.status}`);
    if (!featureRes.ok) throw new Error(`feature fetch failed: ${featureRes.status}`);
    const site = await siteRes.json();
    const feature = await featureRes.json();
    updateMeta(feature);
    renderShell(site);
    renderFooter(site);
    root.innerHTML = renderFeature(feature);
    bindChapters(feature);
    bindScale(feature);
    bindAlternatives(feature);
  } catch (error) {
    console.error(error);
    root.innerHTML = `<section class="loading-state"><p>Could not load this feature. Confirm <code>/content/panama.json</code> is available.</p></section>`;
  }
}

boot();
