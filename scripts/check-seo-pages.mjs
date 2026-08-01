import { existsSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { buildSeoPages } from './build-seo-pages.mjs';
import { buildTestPackOutput } from './lib/test-pack-output.mjs';

const outputRoot = join(process.cwd(), 'tmp/pages-seo-check');
rmSync(outputRoot, { recursive: true, force: true });
const manifest = buildTestPackOutput({ outputRoot: join(outputRoot, 'test-packs') });
buildSeoPages({ outputRoot, manifest });

const published = manifest.tests.filter((entry) => entry.status === 'published');
if (published.length === 0) {
  throw new Error('At least one published test is required for SEO pages');
}
if (!existsSync(join(outputRoot, 'robots.txt')) || !existsSync(join(outputRoot, 'sitemap.xml'))) {
  throw new Error('robots.txt and sitemap.xml are required');
}
const sitemap = readFileSync(join(outputRoot, 'sitemap.xml'), 'utf8');
for (const entry of published) {
  const pagePath = join(outputRoot, 'tests', entry.testId, 'index.html');
  if (!existsSync(pagePath)) {
    throw new Error(`SEO landing page is missing: ${entry.testId}`);
  }
  const page = readFileSync(pagePath, 'utf8');
  if (!page.includes(`/?test=${entry.testId}`) || !page.includes('rel="canonical"')) {
    throw new Error(`SEO landing metadata or CTA is missing: ${entry.testId}`);
  }
  if (!sitemap.includes(`/tests/${entry.testId}/`)) {
    throw new Error(`SEO landing is missing from sitemap: ${entry.testId}`);
  }
}

console.log(`seo pages check: ok (${published.length} test pages)`);
