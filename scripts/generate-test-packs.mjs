import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildStatsKeys, traitTests, validateManifest, validateTraitTest } from '../packages/product-core/src/index.js';
import { buildTestPackOutput } from './lib/test-pack-output.mjs';

const root = process.cwd();
const packId = 'seed-v1';
const generatedAt = new Date().toISOString();
const sourceRoot = join(root, 'content/test-packs');
const publicRoot = join(root, 'public/test-packs');
const sourcePackRoot = join(sourceRoot, 'packs', packId);

const categoryLabels = {
  routine: '일상',
  work: '업무/개발',
};
const categoryDescriptions = {
  routine: '일상 루틴과 휴식 리듬을 가볍게 확인하는 테스트',
  work: '일과 협업 상황에서 드러나는 성향 테스트',
};
const tagLabels = {
  developer: '개발자',
  collaboration: '협업',
  career: '커리어',
  routine: '루틴',
  daily: '일상',
};

rmSync(join(sourceRoot, 'manifest.json'), { force: true });
rmSync(sourcePackRoot, { recursive: true, force: true });
rmSync(publicRoot, { recursive: true, force: true });
mkdirSync(join(sourcePackRoot, 'tests'), { recursive: true });

const testEntries = traitTests.map((test, index) => {
  validateTraitTest(test);
  const tags = inferTags(test);
  const statsKeys = buildStatsKeys(test.id, test.version);
  const entry = {
    testId: test.id,
    version: test.version,
    status: test.status ?? 'published',
    titleKo: test.titleKo,
    summaryKo: test.summaryKo ?? test.descriptionKo ?? defaultSummary(test),
    category: test.category,
    tags,
    locale: 'ko-KR',
    packId,
    path: `/test-packs/packs/${packId}/tests/${test.id}.json`,
    stats: {
      ...statsKeys,
      resultDimension: 'result_code',
      eventDimension: 'test_completed',
    },
    publishedAt: test.publishedAt ?? generatedAt,
    updatedAt: generatedAt,
    questionCount: test.questions.length,
    resultCount: test.results.length,
    estimatedMinutes: test.estimatedMinutes ?? inferEstimatedMinutes(test.questions.length),
    featuredOrder: index + 1,
    popularityScore: test.id === 'dpti' ? 100 : 60,
  };

  const payload = {
    schemaVersion: 1,
    packId,
    test,
  };
  writeJson(join(sourcePackRoot, 'tests', `${test.id}.json`), payload);
  return entry;
});

const categories = [...new Set(testEntries.map((entry) => entry.category))].map((id) => ({
  id,
  labelKo: categoryLabels[id] ?? id,
  descriptionKo: categoryDescriptions[id] ?? '',
}));
const tags = [...new Set(testEntries.flatMap((entry) => entry.tags))].map((id) => ({
  id,
  labelKo: tagLabels[id] ?? id,
}));

const manifest = validateManifest({
  schemaVersion: 1,
  manifestId: 'trait-test-hub-main',
  generatedAt,
  defaultLocale: 'ko-KR',
  contentBasePath: '/test-packs/',
  firebaseHostingPath: '/test-packs/manifest.json',
  retention: {
    mode: 'append',
    keepRecent: 500,
  },
  filters: {
    sortOptions: [
      { id: 'featured', labelKo: '추천' },
      { id: 'newest', labelKo: '최신' },
      { id: 'popular', labelKo: '인기' },
      { id: 'shortest', labelKo: '짧은 테스트' },
    ],
    categories,
    tags,
  },
  packs: [
    {
      packId,
      version: 1,
      titleKo: '초기 테스트팩',
      path: `/test-packs/packs/${packId}/pack.json`,
      testCount: testEntries.length,
      publishedAt: generatedAt,
    },
  ],
  tests: testEntries,
});

const pack = {
  schemaVersion: 1,
  packId,
  version: 1,
  titleKo: '초기 테스트팩',
  generatedAt,
  tests: testEntries.map(({ testId, version, path, stats }) => ({
    testId,
    version,
    path,
    stats,
  })),
};

writeJson(join(sourceRoot, 'manifest.json'), manifest);
writeJson(join(sourcePackRoot, 'pack.json'), pack);

buildTestPackOutput({
  root,
  outputRoot: publicRoot,
  generatedAt,
});

console.log(`Generated ${testEntries.length} test pack entries`);

function inferTags(test) {
  if (test.id === 'dpti') {
    return ['developer', 'collaboration', 'career'];
  }
  if (test.category === 'routine') {
    return ['routine', 'daily'];
  }
  return [test.category];
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
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}
