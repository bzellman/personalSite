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
  // Allow in-page anchors, root-relative paths, mailto links, and explicit http(s).
  // Reject protocol-relative URLs (//example.com) and other schemes from CMS content.
  if (raw.startsWith('//')) return '#';
  if (raw.startsWith('#') || raw.startsWith('/') || raw.startsWith('mailto:') || /^https?:\/\//i.test(raw)) return raw;
  return '#';
};
const linkAttrs = (href = '') => /^https?:\/\//i.test(safeHref(href)) ? ' target="_blank" rel="noopener"' : '';
const sectionOn = (data, key) => data.sections?.[key]?.enabled !== false;
const cta = (item, variant = '') => item?.href ? `<a class="button ${variant}" href="${attr(safeHref(item.href))}"${linkAttrs(item.href)}>${esc(item.label)} <span aria-hidden="true">↗</span></a>` : '';

function updateMeta(data) {
  document.title = data.meta?.title || data.site?.name || 'Brad Zellman';
  const desc = document.querySelector('meta[name="description"]');
  if (desc && data.meta?.description) desc.content = data.meta.description;
}

function renderShell(data) {
  document.querySelectorAll('[data-bind="site.name"]').forEach(el => el.textContent = data.site.name);
  document.querySelectorAll('[data-bind="site.shortName"]').forEach(el => el.textContent = data.site.shortName || 'BZ');
  document.querySelectorAll('[data-bind="site.email"]').forEach(el => el.textContent = data.site.email);
  document.querySelectorAll('[data-bind-href="mailto:site.email"]').forEach(el => el.href = `mailto:${data.site.email}`);
  nav.innerHTML = (data.site.nav || [])
    .filter(item => item.label && item.href)
    .map(item => `<a href="${attr(safeHref(item.href))}">${esc(item.label)}</a>`)
    .join('');
}

function renderHero(data) {
  if (!sectionOn(data, 'hero')) return '';
  const hero = data.sections.hero;
  return `<section id="home" class="hero">
    <div class="hero-inner">
      <div class="hero-label">00.</div>
      <div class="hero-content">
        <p class="eyebrow">${esc(hero.eyebrow)}</p>
        <h1>${esc(hero.headline)}</h1>
        <div class="hero-copy">
          <div>
            <p class="hero-sub">${esc(hero.subheadline)}</p>
            <p class="hero-body">${esc(hero.body)}</p>
            <div class="hero-actions">${cta(hero.primaryCta)}${cta(hero.secondaryCta, 'secondary')}</div>
          </div>
          <div class="hero-socials" aria-label="Social links">
            ${(data.site.socials || []).map(s => `<a href="${attr(safeHref(s.href))}"${linkAttrs(s.href)}>${esc(s.label)}</a>`).join('')}
          </div>
        </div>
        <div class="stats-row">
          ${(hero.stats || []).map(stat => `<div class="stat"><strong>${esc(stat.value)}</strong><span>${esc(stat.label)}</span></div>`).join('')}
        </div>
      </div>
    </div>
  </section>`;
}

function renderTicker(data) {
  if (!sectionOn(data, 'ticker')) return '';
  const items = data.sections.ticker.items || [];
  return `<section class="ticker" aria-label="Focus areas"><div class="ticker-track">${items.map(item => `<span>${esc(item)}</span>`).join('')}</div></section>`;
}

function renderProjects(data) {
  if (!sectionOn(data, 'projects')) return '';
  const s = data.sections.projects;
  return `<section id="projects" class="section light">
    <div class="section-label">${esc(s.label)}</div>
    <div class="section-body">
      <h2 class="section-title">${esc(s.title)}</h2>
      <p class="section-intro">${esc(s.intro)}</p>
      <div class="project-grid">
        ${(s.items || []).map(p => `<a class="project-card ${p.featured ? 'featured' : ''}" href="${attr(safeHref(p.href || '#'))}"${linkAttrs(p.href || '')}>
          <div class="project-image">${p.image ? `<img src="${attr(p.image)}" alt="" loading="lazy" />` : `<div class="project-placeholder"><span>${esc(p.title)}</span></div>`}</div>
          <div class="project-content">
            <p class="project-kicker">${esc(p.subtitle)}</p>
            <h3 class="project-title">${esc(p.title)}</h3>
            <p class="project-desc">${esc(p.description)}</p>
            <div class="tags">${(p.tags || []).map(t => `<span>${esc(t)}</span>`).join('')}</div>
          </div>
        </a>`).join('')}
      </div>
    </div>
  </section>`;
}


function renderShipped(data) {
  if (!sectionOn(data, 'shipped')) return '';
  const s = data.sections.shipped;
  return `<section id="shipped" class="section white">
    <div class="section-label">${esc(s.label)}</div>
    <div class="section-body">
      <h2 class="section-title">${esc(s.title)}</h2>
      <p class="section-intro">${esc(s.intro)}</p>
      <div class="project-grid shipped-grid">
        ${(s.items || []).map(p => `<a class="project-card compact ${p.featured ? 'featured' : ''}" href="${attr(safeHref(p.href || '#'))}"${linkAttrs(p.href || '')}>
          <div class="project-image">${p.image ? `<img src="${attr(p.image)}" alt="" loading="lazy" />` : `<div class="project-placeholder"><span>${esc(p.title)}</span></div>`}</div>
          <div class="project-content">
            <p class="project-kicker">${esc(p.subtitle)}</p>
            <h3 class="project-title">${esc(p.title)}</h3>
            <p class="project-desc">${esc(p.description)}</p>
            <div class="tags">${(p.tags || []).map(t => `<span>${esc(t)}</span>`).join('')}</div>
          </div>
        </a>`).join('')}
      </div>
    </div>
  </section>`;
}

function renderFeatures(data) {
  if (!sectionOn(data, 'features')) return '';
  const s = data.sections.features;
  return `<section id="features" class="section light">
    <div class="section-label">${esc(s.label)}</div>
    <div class="section-body">
      <h2 class="section-title">${esc(s.title)}</h2>
      <p class="section-intro">${esc(s.intro)}</p>
      <div class="feature-list">
        ${(s.items || []).map(item => `<a class="feature-entry" href="${attr(safeHref(item.href || '#'))}"${linkAttrs(item.href || '')}>
          <div class="feature-entry-copy">
            <h3>${esc(item.title)}</h3>
            <p>${esc(item.dek)}</p>
            <span class="feature-entry-cta">Open the feature <span aria-hidden="true">↗</span></span>
          </div>
          <div class="feature-entry-visual">${item.image ? `<img src="${attr(item.image)}" alt="" loading="lazy" />` : ''}</div>
        </a>`).join('')}
      </div>
    </div>
  </section>`;
}

function renderServices(data) {
  if (!sectionOn(data, 'services')) return '';
  const s = data.sections.services;
  return `<section id="services" class="section white">
    <div class="section-label">${esc(s.label)}</div>
    <div class="section-body">
      <h2 class="section-title">${esc(s.title)}</h2>
      <p class="section-intro">${esc(s.intro)}</p>
      <div class="service-list">
        ${(s.items || []).map((item, i) => `<div class="service-row"><span class="num">${String(i + 1).padStart(2, '0')}.</span><h3>${esc(item.title)}</h3><p>${esc(item.description)}</p></div>`).join('')}
      </div>
    </div>
  </section>`;
}

function renderProcess(data) {
  if (!sectionOn(data, 'process')) return '';
  const s = data.sections.process;
  return `<section id="process" class="section light">
    <div class="section-label">${esc(s.label)}</div>
    <div class="section-body">
      <h2 class="section-title">${esc(s.title)}</h2>
      <p class="section-intro">${esc(s.intro)}</p>
      <div class="process-grid">
        ${(s.items || []).map(item => `<article class="process-card"><div><h3>${esc(item.title)}</h3><p class="subtitle">${esc(item.subtitle)}</p></div><p>${esc(item.description)}</p></article>`).join('')}
      </div>
    </div>
  </section>`;
}

function renderExperience(data) {
  if (!sectionOn(data, 'experience')) return '';
  const s = data.sections.experience;
  return `<section id="experience" class="section dark">
    <div class="section-label">${esc(s.label)}</div>
    <div class="section-body">
      <h2 class="section-title">${esc(s.title)}</h2>
      <p class="section-intro">${esc(s.intro)}</p>
      <div class="timeline">
        ${(s.items || []).map(item => `<article class="timeline-item"><div><span class="period">${esc(item.period)}</span><h3>${esc(item.company)}</h3><p class="role">${esc(item.role)}</p></div><p>${esc(item.summary)}</p></article>`).join('')}
      </div>
    </div>
  </section>`;
}

function renderAbout(data) {
  if (!sectionOn(data, 'about')) return '';
  const s = data.sections.about;
  return `<section id="about" class="section dark">
    <div class="section-label">${esc(s.label)}</div>
    <div class="section-body">
      <p class="eyebrow">${esc(s.title)}</p>
      <div class="about-card">
        <div class="about-photo">${s.image ? `<img src="${attr(s.image)}" alt="Brad Zellman" loading="lazy" />` : `<div class="about-placeholder"><span>BZ</span><small>${esc(data.site.location || '')}</small></div>`}</div>
        <div class="about-copy">
          <div><h3>${esc(s.headline)}</h3><p>${esc(s.body)}</p></div>
          <div><p class="manifesto">${esc(s.manifesto)}</p><p class="education">${esc(s.education)}</p></div>
        </div>
      </div>
    </div>
  </section>`;
}

function renderContact(data) {
  if (!sectionOn(data, 'contact')) return '';
  const s = data.sections.contact;
  return `<section id="contact" class="section dark">
    <div class="section-label">${esc(s.label)}</div>
    <div class="section-body">
      <h2 class="section-title">${esc(s.title)}</h2>
      <div class="contact-panel">
        <p>${esc(s.body)}</p>
        <div class="contact-actions">${cta(s.primaryCta)}${cta(s.secondaryCta, 'secondary')}</div>
      </div>
    </div>
  </section>`;
}

function renderFooter(data) {
  const year = new Date().getFullYear();
  footer.innerHTML = `<div class="footer-inner"><div>© ${year} ${esc(data.site.name)} · ${esc(data.site.location)}</div><div class="footer-links">${(data.site.socials || []).map(s => `<a href="${attr(safeHref(s.href))}"${linkAttrs(s.href)}>${esc(s.label)}</a>`).join('')}</div></div>
`;
}

async function boot() {
  try {
    const response = await fetch('/content/site.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`content fetch failed: ${response.status}`);
    const data = await response.json();
    updateMeta(data);
    renderShell(data);
    root.innerHTML = [renderHero(data), renderTicker(data), renderProjects(data), renderFeatures(data), renderServices(data), renderProcess(data), renderExperience(data), renderAbout(data), renderShipped(data), renderContact(data)].join('');
    renderFooter(data);
  } catch (error) {
    console.error(error);
    root.innerHTML = `<section class="loading-state"><p>Could not load site content. Run <code>npm run build</code> to validate /public/content/site.json.</p></section>`;
  }
}

boot();
