import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildTestPackOutput } from './lib/test-pack-output.mjs';

const testPackRoot = 'tmp/test-packs-preview-check';

buildTestPackOutput({
  outputRoot: join(process.cwd(), testPackRoot),
});

const requiredFiles = [
  'apps/preview/index.html',
  'apps/preview/src/app.js',
  'apps/preview/src/styles.css',
  'packages/product-core/src/index.js',
  'packages/product-core/src/dptiCatalog.js',
  `${testPackRoot}/manifest.json`,
  `${testPackRoot}/packs/seed-v1/tests/dpti.json`,
];

for (const file of requiredFiles) {
  readFileSync(file, 'utf8');
}

const app = readFileSync('apps/preview/src/app.js', 'utf8');
if (!app.includes('/packages/product-core/src/index.js')) {
  throw new Error('preview app must import product-core');
}

const { scoreTraitTest, validateManifest, validateTraitTest } = await import('../packages/product-core/src/index.js');
const manifest = validateManifest(JSON.parse(readFileSync(`${testPackRoot}/manifest.json`, 'utf8')));
const dptiEntry = manifest.tests.find((test) => test.testId === 'dpti');
if (!dptiEntry) {
  throw new Error('DPTI manifest entry is missing');
}
const dptiPayload = JSON.parse(readFileSync(dptiEntry.path.replace(/^\/test-packs\//, `${testPackRoot}/`), 'utf8'));
const dpti = validateTraitTest(dptiPayload.test);
if (!dpti) {
  throw new Error('DPTI content is missing from preview catalog');
}
if (dpti.questions.length !== 16 || dpti.results.length !== 16) {
  throw new Error('DPTI content must contain 16 questions and 16 results');
}

const answers = Object.fromEntries(
  dpti.questions.map((question) => [question.id, question.options[0].code]),
);
const score = scoreTraitTest(dpti, answers);
if (score.result.code !== 'ACLO') {
  throw new Error(`Unexpected DPTI smoke result: ${score.result.code}`);
}

console.log('preview check: ok');
