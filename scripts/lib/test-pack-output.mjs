import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import {
  buildStatsKeys,
  validateManifest,
  validateTraitTest,
} from '../../packages/product-core/src/index.js';

export function buildTestPackOutput({
  root = process.cwd(),
  sourceRoot = join(root, 'content/test-packs'),
  outputRoot,
  generatedAt = new Date().toISOString(),
} = {}) {
  if (!outputRoot) {
    throw new Error('outputRoot is required');
  }

  const safeOutputRoot = resolveSafeOutputRoot({ root, sourceRoot, outputRoot });
  const baseManifest = validateManifest(readJson(join(sourceRoot, 'manifest.json')));
  const manifest = cloneJson(baseManifest);
  const sourcePacksRoot = join(sourceRoot, 'packs');
  const outputPacksRoot = join(safeOutputRoot, 'packs');

  rmSync(safeOutputRoot, { recursive: true, force: true });
  mkdirSync(safeOutputRoot, { recursive: true });
  cpSync(sourcePacksRoot, outputPacksRoot, { recursive: true });
  removeRuntimeIgnoredEntryDirs(outputPacksRoot);

  const baseTestIds = new Set(manifest.tests.map((entry) => entry.testId));
  const generatedTestIds = new Set();
  const generatedEntries = readGeneratedEntries(sourceRoot);
  const baseFeaturedOrder = manifest.tests.reduce(
    (max, entry) => Math.max(max, entry.featuredOrder ?? 0),
    0,
  );

  generatedEntries.forEach(({ packId, metadata, payload }, index) => {
    const test = validateTraitTest(payload.test);
    if (baseTestIds.has(test.id)) {
      throw new Error(`testId already exists in base manifest: ${test.id}`);
    }
    if (generatedTestIds.has(test.id)) {
      throw new Error(`duplicate generated entry testId: ${test.id}`);
    }
    generatedTestIds.add(test.id);
    ensureFilterMetadata(manifest, test, metadata);
    manifest.tests.push(
      buildManifestEntry({
        test,
        packId,
        metadata,
        generatedAt,
        featuredOrder: metadata.featuredOrder ?? baseFeaturedOrder + index + 1,
      }),
    );
    upsertPack(manifest, packId, metadata, generatedAt);
  });

  updatePackCounts(manifest);
  manifest.generatedAt = generatedAt;
  validateManifest(manifest);

  writeJson(join(safeOutputRoot, 'manifest.json'), manifest);
  writePackIndexes({ outputRoot: safeOutputRoot, manifest, generatedAt });
  return manifest;
}

export function buildGeneratedEntry({ test, packId, metadata, generatedAt = new Date().toISOString() }) {
  validateTraitTest(test);
  const normalizedMetadata = {
    ...metadata,
    tags: assertTags(metadata.tags, test.id),
    publishedAt: metadata.publishedAt ?? generatedAt,
    updatedAt: metadata.updatedAt ?? generatedAt,
  };

  return {
    schemaVersion: 1,
    packId,
    testId: test.id,
    metadata: normalizedMetadata,
  };
}

export function assertNoExistingTestId({ root = process.cwd(), testId }) {
  const sourceRoot = join(root, 'content/test-packs');
  const manifest = buildTestPackOutput({
    root,
    sourceRoot,
    outputRoot: join(root, 'tmp/test-packs-existing-check'),
  });
  if (manifest.tests.some((entry) => entry.testId === testId)) {
    throw new Error(`testId already exists in manifest: ${testId}`);
  }
}

function readGeneratedEntries(sourceRoot) {
  return listEntryFiles(join(sourceRoot, 'packs'))
    .map(({ packId, path }) => {
      const entry = readJson(path);
      if (entry.schemaVersion !== 1) {
        throw new Error(`Unsupported generated entry schemaVersion: ${path}`);
      }
      if (entry.packId && entry.packId !== packId) {
        throw new Error(`Generated entry packId mismatch: ${path}`);
      }
      if (!entry.testId) {
        throw new Error(`Generated entry testId is required: ${path}`);
      }

      const payloadPath = join(sourceRoot, 'packs', packId, 'tests', `${entry.testId}.json`);
      if (!existsSync(payloadPath)) {
        throw new Error(`Missing generated test payload for entry: ${path}`);
      }

      const payload = readJson(payloadPath);
      if (payload.schemaVersion !== 1) {
        throw new Error(`Unsupported payload schemaVersion for ${entry.testId}: ${payload.schemaVersion}`);
      }
      if (payload.packId !== packId) {
        throw new Error(`packId mismatch for ${entry.testId}: ${payload.packId} !== ${packId}`);
      }
      if (payload.test?.id !== entry.testId) {
        throw new Error(`Generated entry and payload testId mismatch: ${entry.testId}`);
      }

      return {
        packId,
        metadata: entry.metadata ?? {},
        payload,
      };
    })
    .sort((left, right) => {
      const byPublishedAt = String(left.metadata.publishedAt ?? '').localeCompare(
        String(right.metadata.publishedAt ?? ''),
      );
      if (byPublishedAt !== 0) {
        return byPublishedAt;
      }
      return left.payload.test.id.localeCompare(right.payload.test.id);
    });
}

function listEntryFiles(packsRoot) {
  const files = [];
  for (const packId of safeReadDir(packsRoot)) {
    const entriesRoot = join(packsRoot, packId, 'entries');
    for (const fileName of safeReadDir(entriesRoot)) {
      if (fileName.endsWith('.json')) {
        files.push({
          packId,
          path: join(entriesRoot, fileName),
        });
      }
    }
  }
  return files.sort((left, right) => left.path.localeCompare(right.path));
}

function buildManifestEntry({ test, packId, metadata, generatedAt, featuredOrder }) {
  const stats = buildStatsKeys(test.id, test.version);
  return {
    testId: test.id,
    version: test.version,
    status: test.status ?? 'published',
    titleKo: test.titleKo,
    summaryKo: metadata.summaryKo ?? test.summaryKo ?? test.descriptionKo ?? defaultSummary(test),
    category: test.category,
    tags: assertTags(metadata.tags, test.id),
    locale: metadata.locale ?? 'ko-KR',
    packId,
    path: `/test-packs/packs/${packId}/tests/${test.id}.json`,
    stats: {
      ...stats,
      resultDimension: 'result_code',
      eventDimension: 'test_completed',
    },
    publishedAt: metadata.publishedAt ?? generatedAt,
    updatedAt: metadata.updatedAt ?? generatedAt,
    questionCount: test.questions.length,
    resultCount: test.results.length,
    estimatedMinutes: metadata.estimatedMinutes ?? inferEstimatedMinutes(test.questions.length),
    featuredOrder,
    popularityScore: metadata.popularityScore ?? 50,
  };
}

function ensureFilterMetadata(manifest, test, metadata) {
  const categories = manifest.filters?.categories;
  const tags = manifest.filters?.tags;
  if (!Array.isArray(categories) || !Array.isArray(tags)) {
    throw new Error('manifest.filters.categories and manifest.filters.tags are required');
  }

  const existingCategory = categories.find((category) => category.id === test.category);
  if (!existingCategory) {
    if (!metadata.categoryLabelKo) {
      throw new Error(`metadata.categoryLabelKo is required for new category: ${test.category}`);
    }
    categories.push({
      id: test.category,
      labelKo: metadata.categoryLabelKo,
      descriptionKo: metadata.categoryDescriptionKo ?? '',
    });
  } else if (metadata.categoryLabelKo && existingCategory.labelKo !== metadata.categoryLabelKo) {
    throw new Error(`category label mismatch for ${test.category}`);
  }

  const knownTags = new Map(tags.map((tag) => [tag.id, tag]));
  for (const tagId of assertTags(metadata.tags, test.id)) {
    const existingTag = knownTags.get(tagId);
    const labelKo = metadata.tagLabelsKo?.[tagId];
    if (existingTag) {
      if (labelKo && existingTag.labelKo !== labelKo) {
        throw new Error(`tag label mismatch for ${tagId}`);
      }
      continue;
    }
    if (!labelKo) {
      throw new Error(`metadata.tagLabelsKo.${tagId} is required for new tag`);
    }
    const tag = {
      id: tagId,
      labelKo,
    };
    tags.push(tag);
    knownTags.set(tagId, tag);
  }
}

function upsertPack(manifest, packId, metadata, generatedAt) {
  const packs = manifest.packs ?? [];
  manifest.packs = packs;
  const packPath = `/test-packs/packs/${packId}/pack.json`;
  const existing = packs.find((pack) => pack.packId === packId);

  if (existing) {
    existing.path = existing.path ?? packPath;
    existing.publishedAt = existing.publishedAt ?? metadata.publishedAt ?? generatedAt;
    existing.titleKo = existing.titleKo ?? metadata.packTitleKo ?? '자동 생성 테스트팩';
    existing.version = existing.version ?? metadata.packVersion ?? 1;
    return;
  }

  packs.push({
    packId,
    version: metadata.packVersion ?? 1,
    titleKo: metadata.packTitleKo ?? '자동 생성 테스트팩',
    path: packPath,
    testCount: 0,
    publishedAt: metadata.publishedAt ?? generatedAt,
  });
}

function updatePackCounts(manifest) {
  for (const pack of manifest.packs ?? []) {
    pack.testCount = manifest.tests.filter((entry) => entry.packId === pack.packId).length;
  }
}

function writePackIndexes({ outputRoot, manifest, generatedAt }) {
  for (const pack of manifest.packs ?? []) {
    const tests = manifest.tests
      .filter((entry) => entry.packId === pack.packId)
      .map(({ testId, version, path, stats }) => ({
        testId,
        version,
        path,
        stats,
      }));

    writeJson(join(outputRoot, 'packs', pack.packId, 'pack.json'), {
      schemaVersion: 1,
      packId: pack.packId,
      version: pack.version ?? 1,
      titleKo: pack.titleKo,
      generatedAt,
      tests,
    });
  }
}

function removeRuntimeIgnoredEntryDirs(outputPacksRoot) {
  for (const packId of safeReadDir(outputPacksRoot)) {
    rmSync(join(outputPacksRoot, packId, 'entries'), { recursive: true, force: true });
  }
}

function resolveSafeOutputRoot({ root, sourceRoot, outputRoot }) {
  const rootResolved = resolve(root);
  const sourceResolved = resolve(root, sourceRoot);
  const outputResolved = resolve(root, outputRoot);
  const rootRelative = relative(rootResolved, outputResolved);
  if (
    rootRelative === '' ||
    rootRelative.startsWith('..') ||
    rootRelative.startsWith('/') ||
    rootRelative.startsWith('\\')
  ) {
    throw new Error(`outputRoot must be a subdirectory of repo root: ${outputRoot}`);
  }

  const sourceRelative = relative(sourceResolved, outputResolved);
  if (
    sourceRelative === '' ||
    (!sourceRelative.startsWith('..') && !sourceRelative.startsWith('/') && !sourceRelative.startsWith('\\'))
  ) {
    throw new Error(`outputRoot must not be inside sourceRoot: ${outputRoot}`);
  }

  return outputResolved;
}

function safeReadDir(path) {
  if (!existsSync(path)) {
    return [];
  }
  return readdirSync(path).sort();
}

function assertTags(tags, testId) {
  if (!Array.isArray(tags) || tags.length === 0) {
    throw new Error(`metadata.tags is required for ${testId}`);
  }
  return [...new Set(tags)];
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
    throw new Error(`missing file: ${path}`);
  }
  return JSON.parse(readFileSync(path, 'utf8'));
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}
