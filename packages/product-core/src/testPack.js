export const TEST_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function buildStatsKeys(testId, version) {
  return {
    aggregateKey: testId,
    versionKey: `${testId}@${version}`,
  };
}

export function validateManifest(manifest) {
  if (!manifest || typeof manifest !== 'object') {
    throw new Error('Manifest must be an object');
  }
  if (manifest.schemaVersion !== 1) {
    throw new Error(`Unsupported manifest schemaVersion: ${manifest.schemaVersion}`);
  }
  if (!Array.isArray(manifest.tests)) {
    throw new Error('Manifest tests must be an array');
  }

  const seen = new Set();
  for (const entry of manifest.tests) {
    validateManifestEntry(entry);
    const key = `${entry.testId}@${entry.version}`;
    if (seen.has(key)) {
      throw new Error(`Duplicate manifest test entry: ${key}`);
    }
    seen.add(key);
  }

  return manifest;
}

export function validateManifestEntry(entry) {
  if (!entry || typeof entry !== 'object') {
    throw new Error('Manifest entry must be an object');
  }
  assertTestId(entry.testId);
  if (!Number.isInteger(entry.version) || entry.version < 1) {
    throw new Error(`Invalid version for ${entry.testId}: ${entry.version}`);
  }
  if (!entry.path || typeof entry.path !== 'string') {
    throw new Error(`Manifest entry path is required for ${entry.testId}`);
  }
  if (!entry.titleKo || typeof entry.titleKo !== 'string') {
    throw new Error(`Manifest entry titleKo is required for ${entry.testId}`);
  }
  if (!entry.category || typeof entry.category !== 'string') {
    throw new Error(`Manifest entry category is required for ${entry.testId}`);
  }
  if (!Array.isArray(entry.tags)) {
    throw new Error(`Manifest entry tags must be an array for ${entry.testId}`);
  }
}

export function validateTraitTest(test) {
  if (!test || typeof test !== 'object') {
    throw new Error('Trait test must be an object');
  }
  assertTestId(test.id);
  if (!Number.isInteger(test.version) || test.version < 1) {
    throw new Error(`Invalid test version for ${test.id}: ${test.version}`);
  }
  if (!Array.isArray(test.axes) || test.axes.length === 0) {
    throw new Error(`Test axes are required for ${test.id}`);
  }
  if (!Array.isArray(test.questions) || test.questions.length === 0) {
    throw new Error(`Test questions are required for ${test.id}`);
  }
  if (!Array.isArray(test.results) || test.results.length === 0) {
    throw new Error(`Test results are required for ${test.id}`);
  }

  const questionIds = new Set();
  for (const question of test.questions) {
    if (!question.id || questionIds.has(question.id)) {
      throw new Error(`Duplicate or missing question id in ${test.id}: ${question.id}`);
    }
    questionIds.add(question.id);
    if (!Array.isArray(question.options) || question.options.length < 2) {
      throw new Error(`Question must have at least 2 options in ${test.id}: ${question.id}`);
    }
  }

  const resultCodes = new Set();
  for (const result of test.results) {
    if (!result.code || resultCodes.has(result.code)) {
      throw new Error(`Duplicate or missing result code in ${test.id}: ${result.code}`);
    }
    resultCodes.add(result.code);
  }

  return test;
}

export function filterManifestEntries(entries, filters = {}) {
  const search = normalize(filters.search);
  const category = filters.category ?? 'all';
  const tag = filters.tag ?? 'all';

  return entries.filter((entry) => {
    if (entry.status !== 'published') {
      return false;
    }
    if (category !== 'all' && entry.category !== category) {
      return false;
    }
    if (tag !== 'all' && !entry.tags.includes(tag)) {
      return false;
    }
    if (!search) {
      return true;
    }

    return normalize([entry.titleKo, entry.summaryKo, entry.category, ...entry.tags].join(' ')).includes(search);
  });
}

export function sortManifestEntries(entries, sort = 'featured') {
  const sortable = [...entries];
  if (sort === 'newest') {
    return sortable.sort((left, right) => stringCompareDesc(left.publishedAt, right.publishedAt));
  }
  if (sort === 'popular') {
    return sortable.sort((left, right) => (right.popularityScore ?? 0) - (left.popularityScore ?? 0));
  }
  if (sort === 'shortest') {
    return sortable.sort((left, right) => (left.questionCount ?? 0) - (right.questionCount ?? 0));
  }
  return sortable.sort((left, right) => (left.featuredOrder ?? 9999) - (right.featuredOrder ?? 9999));
}

export function assertTestId(testId) {
  if (!TEST_ID_PATTERN.test(testId ?? '')) {
    throw new Error(`Invalid testId: ${testId}`);
  }
}

function normalize(value) {
  return String(value ?? '').trim().toLocaleLowerCase('ko-KR');
}

function stringCompareDesc(left, right) {
  return String(right ?? '').localeCompare(String(left ?? ''));
}
