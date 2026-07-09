import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const mustExist = [
  'public/index.html',
  'public/assets/css/site.css',
  'public/assets/js/site.js',
  'public/content/site.json',
  'public/admin/index.html',
  'public/admin/config.yml'
];

for (const file of mustExist) {
  if (!existsSync(join(root, file))) {
    throw new Error(`Missing required file: ${file}`);
  }
}

const content = JSON.parse(readFileSync(join(root, 'public/content/site.json'), 'utf8'));
const requiredSections = ['hero', 'projects', 'shipped', 'services', 'process', 'experience', 'about', 'contact'];
for (const key of requiredSections) {
  if (!content.sections?.[key]) throw new Error(`Missing content section: ${key}`);
}

const imageRefs = [];
for (const sectionName of ['projects', 'shipped']) {
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
console.log(`Build OK: ${requiredSections.length} sections, ${(content.sections.projects.items || []).length} projects, ${imageRefs.length} image refs validated.`);
