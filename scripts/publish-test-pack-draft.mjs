import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import {
  buildStatsKeys,
  validateManifest,
  validateTraitTest,
} from '../packages/product-core/src/index.js';

const root = process.cwd();
const draftPath = getArg('--draft');
const sourceRoot = join(root, 'content/test-packs');
const publicRoot = join(root, 'public/test-packs');
const manifestPath = join(sourceRoot, 'manifest.json');

if (!draftPath) {
  console.error('usage: pnpm publish:test-pack-draft -- --draft=content/test-packs/drafts/<testId>.json');
  process.exit(1);
}

const draft = readJson(join(root, draftPath));
if (draft.schemaVersion !== 1) {
  fail(`Unsupported draft schemaVersion: ${draft.schemaVersion}`);
}
if (!draft.test) {
  fail('Draft must include a test object');
}

const test = validateTraitTest(draft.test);
const metadata = draft.metadata ?? {};
const packId = getArg('--packId') ?? draft.packId ?? 'generated-v1';
const generatedAt = new Date().toISOString();
const manifest = validateManifest(readJson(manifestPath));

if (manifest.tests.some((entry) => entry.testId === test.id)) {
  fail(`testId already exists in manifest: ${test.id}`);
}
if (!Array.isArray(metadata.tags) || metadata.tags.length === 0) {
  fail(`metadata.tags is required for ${test.id}`);
}

ensureFilterMetadata(manifest, test, metadata);

const payload = {
  schemaVersion: 1,
  packId,
  test: {
    ...test,
    status: test.status ?? 'published',
  },
};
const entry = buildManifestEntry({
  test: payload.test,
  packId,
  metadata,
  generatedAt,
  nextFeaturedOrder: nextFeaturedOrder(manifest.tests),
});

const testPath = join(sourceRoot, 'packs', packId, 'tests', `${test.id}.json`);
writeJson(testPath, payload);

manifest.generatedAt = generatedAt;
manifest.tests.push(entry);
upsertPack(manifest, packId, metadata, generatedAt);
validateManifest(manifest);
writeJson(manifestPath, manifest);
writePackIndex(manifest, packId, metadata, generatedAt);
syncPublicFromSource();

console.log(`published draft ${test.id}@${test.version} to ${packId}`);

function buildManifestEntry({ test, packId, metadata, generatedAt, nextFeaturedOrder }) {
  const stats = buildStatsKeys(test.id, test.version);
  return {
    testId: test.id,
    version: test.version,
    status: test.status ?? 'published',
    titleKo: test.titleKo,
    summaryKo: metadata.summaryKo ?? test.summaryKo ?? test.descriptionKo ?? defaultSummary(test),
    category: test.category,
    tags: [...new Set(metadata.tags)],
    locale: metadata.locale ?? 'ko-KR',
    packId,
    path: `/test-packs/packs/${packId}/tests/${test.id}.json`,
    stats: {
      ...stats,
      resultDimension: 'result_code',
      eventDimension: 'test_completed',
    },
    publishedAt: metadata.publishedAt ?? generatedAt,
    updatedAt: generatedAt,
    questionCount: test.questions.length,
    resultCount: test.results.length,
    estimatedMinutes: metadata.estimatedMinutes ?? inferEstimatedMinutes(test.questions.length),
    featuredOrder: metadata.featuredOrder ?? nextFeaturedOrder,
    popularityScore: metadata.popularityScore ?? 50,
  };
}

function ensureFilterMetadata(manifest, test, metadata) {
  const categories = manifest.filters?.categories;
  const tags = manifest.filters?.tags;
  if (!Array.isArray(categories) || !Array.isArray(tags)) {
    fail('manifest.filters.categories and manifest.filters.tags are required');
  }

  if (!categories.some((category) => category.id === test.category)) {
    if (!metadata.categoryLabelKo) {
      fail(`metadata.categoryLabelKo is required for new category: ${test.category}`);
    }
    categories.push({
      id: test.category,
      labelKo: metadata.categoryLabelKo,
      descriptionKo: metadata.categoryDescriptionKo ?? '',
    });
  }

  const knownTags = new Set(tags.map((tag) => tag.id));
  for (const tagId of metadata.tags) {
    if (knownTags.has(tagId)) {
      continue;
    }
    const labelKo = metadata.tagLabelsKo?.[tagId];
    if (!labelKo) {
      fail(`metadata.tagLabelsKo.${tagId} is required for new tag`);
    }
    tags.push({
      id: tagId,
      labelKo,
    });
    knownTags.add(tagId);
  }
}

function upsertPack(manifest, packId, metadata, generatedAt) {
  const packs = manifest.packs ?? [];
  const packPath = `/test-packs/packs/${packId}/pack.json`;
  const packTests = manifest.tests.filter((entry) => entry.packId === packId);
  const existing = packs.find((pack) => pack.packId === packId);

  if (existing) {
    existing.testCount = packTests.length;
    existing.path = existing.path ?? packPath;
    existing.publishedAt = existing.publishedAt ?? generatedAt;
    return;
  }

  packs.push({
    packId,
    version: metadata.packVersion ?? 1,
    titleKo: metadata.packTitleKo ?? '자동 생성 테스트팩',
    path: packPath,
    testCount: packTests.length,
    publishedAt: generatedAt,
  });
  manifest.packs = packs;
}

function writePackIndex(manifest, packId, metadata, generatedAt) {
  const packMeta = manifest.packs.find((pack) => pack.packId === packId);
  const tests = manifest.tests
    .filter((entry) => entry.packId === packId)
    .map(({ testId, version, path, stats }) => ({
      testId,
      version,
      path,
      stats,
    }));

  writeJson(join(sourceRoot, 'packs', packId, 'pack.json'), {
    schemaVersion: 1,
    packId,
    version: packMeta.version ?? metadata.packVersion ?? 1,
    titleKo: packMeta.titleKo ?? metadata.packTitleKo ?? '자동 생성 테스트팩',
    generatedAt,
    tests,
  });
}

function syncPublicFromSource() {
  rmSync(publicRoot, { recursive: true, force: true });
  mkdirSync(publicRoot, { recursive: true });
  copyFileSync(join(sourceRoot, 'manifest.json'), join(publicRoot, 'manifest.json'));
  cpSync(join(sourceRoot, 'packs'), join(publicRoot, 'packs'), { recursive: true });
}

function nextFeaturedOrder(entries) {
  return entries.reduce((max, entry) => Math.max(max, entry.featuredOrder ?? 0), 0) + 1;
}

function defaultSummary(test) {
  return `${test.questions.length}문항으로 ${test.results.length}개 결과 중 하나를 확인합니다.`;
}

function inferEstimatedMinutes(questionCount) {
  if (questionCount <= 6) {
    return '1-3분';
  }
  if (questionCount <= 16) {
    return '3-5분';
  }
  return '5분+';
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function readJson(path) {
  if (!existsSync(path)) {
    fail(`missing file: ${path}`);
  }
  return JSON.parse(readFileSync(path, 'utf8'));
}

function getArg(name) {
  const prefix = `${name}=`;
  const found = process.argv.find((arg) => arg.startsWith(prefix));
  return found?.slice(prefix.length);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
