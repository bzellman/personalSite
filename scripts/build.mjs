import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const mustExist = [
  'public/index.html',
  'public/panama.html',
  'public/assets/css/site.css',
  'public/assets/css/panama.css',
  'public/assets/js/site.js',
  'public/assets/js/panama.js',
  'public/content/site.json',
  'public/content/panama.json',
  'public/admin/index.html',
  'public/admin/config.yml'
];

for (const file of mustExist) {
  if (!existsSync(join(root, file))) {
    throw new Error(`Missing required file: ${file}`);
  }
}

const content = JSON.parse(readFileSync(join(root, 'public/content/site.json'), 'utf8'));
const requiredSections = ['hero', 'projects', 'features', 'shipped', 'services', 'process', 'experience', 'about', 'contact'];
for (const key of requiredSections) {
  if (!content.sections?.[key]) throw new Error(`Missing content section: ${key}`);
}

const imageRefs = [];
for (const sectionName of ['projects', 'shipped', 'features']) {
  for (const project of content.sections[sectionName].items || []) {
    if (!project.title) throw new Error(`${sectionName} item is missing a title`);
    if (project.image && project.image.startsWith('/')) imageRefs.push(project.image.slice(1));
  }
}
if (content.sections.about.image?.startsWith('/')) imageRefs.push(content.sections.about.image.slice(1));
if (content.meta.image?.startsWith('/')) imageRefs.push(content.meta.image.slice(1));
for (const ref of imageRefs) {
  if (!existsSync(join(root, 'public', ref))) {
    throw new Error(`Missing referenced asset: /${ref}`);
  }
}

const html = readFileSync(join(root, 'public/index.html'), 'utf8');
for (const needle of ['/assets/css/site.css', '/assets/js/site.js', '/content/site.json']) {
  if (!html.includes(needle) && needle !== '/content/site.json') throw new Error(`index.html does not reference ${needle}`);
}

const panamaHtml = readFileSync(join(root, 'public/panama.html'), 'utf8');
for (const needle of ['/assets/css/site.css', '/assets/css/panama.css', '/assets/js/panama.js']) {
  if (!panamaHtml.includes(needle)) throw new Error(`panama.html does not reference ${needle}`);
}

const panama = JSON.parse(readFileSync(join(root, 'public/content/panama.json'), 'utf8'));
if (!panama.headline || !Array.isArray(panama.sources) || !panama.sources.length) {
  throw new Error('panama.json is missing headline or sources');
}
const sourceIds = new Set(panama.sources.map(s => s.id));
if (sourceIds.size !== panama.sources.length) throw new Error('panama.json has duplicate source ids');
for (const source of panama.sources) {
  if (!source.label || !source.detail) throw new Error(`source ${source.id || '(missing id)'} is incomplete`);
}
const dangling = [];
const collectIds = (node) => {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    node.forEach(collectIds);
    return;
  }
  if (Array.isArray(node.sourceIds)) {
    for (const id of node.sourceIds) {
      if (!sourceIds.has(id)) dangling.push(id);
    }
  }
  Object.values(node).forEach(collectIds);
};
collectIds(panama);
if (dangling.length) throw new Error(`panama.json cites unknown sources: ${[...new Set(dangling)].join(', ')}`);
if (!(panama.scale?.comparators || []).length) throw new Error('panama.json is missing scale comparators');
if (!(panama.alternatives?.paths || []).length) throw new Error('panama.json is missing alternative paths');

console.log(`Build OK: ${requiredSections.length} sections, ${(content.sections.projects.items || []).length} projects, ${panama.sources.length} Panama sources, ${imageRefs.length} image refs validated.`);
