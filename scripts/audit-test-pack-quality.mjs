import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  buildStatsKeys,
  scoreTraitTest,
  validateManifest,
  validateTraitTest,
} from '../packages/product-core/src/index.js';

const root = process.cwd();
const assetRoot = getArg('--assetRoot') ?? 'content/test-packs';
const maxCombinations = Number(getArg('--maxCombinations') ?? 200_000);
const manifestPath = join(root, assetRoot, 'manifest.json');
const errors = [];
const warnings = [];

let manifest;
try {
  manifest = validateManifest(readJson(manifestPath));
} catch (error) {
  console.error(`failed to read manifest from ${assetRoot}: ${error.message}`);
  process.exit(1);
}

const activeTestIds = new Set();

for (const entry of manifest.tests) {
  if (entry.status !== 'archived') {
    if (activeTestIds.has(entry.testId)) {
      errors.push(`Duplicate active testId: ${entry.testId}`);
    }
    activeTestIds.add(entry.testId);
  }

  const payloadPath = resolvePayloadPath(entry.path);
  if (!existsSync(payloadPath)) {
    errors.push(`Missing test payload: ${entry.path}`);
    continue;
  }

  const payload = readJson(payloadPath);
  if (payload.schemaVersion !== 1) {
    errors.push(`Unsupported payload schemaVersion for ${entry.testId}: ${payload.schemaVersion}`);
    continue;
  }
  if (payload.packId !== entry.packId) {
    errors.push(`packId mismatch for ${entry.testId}: ${payload.packId} !== ${entry.packId}`);
  }

  const test = payload.test;
  try {
    validateTraitTest(test);
  } catch (error) {
    errors.push(error.message);
    continue;
  }

  auditManifestEntry(entry, test);
  auditTextQuality(test);
  auditScoringShape(test);
  auditReachability(test);
  if (requiresAutomationQualityGate(entry)) {
    auditAutomationQualityGate(entry, test);
  }
}

if (warnings.length > 0) {
  console.warn(warnings.map((warning) => `- ${warning}`).join('\n'));
}

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(`audited ${manifest.tests.length} test pack entr${manifest.tests.length === 1 ? 'y' : 'ies'} from ${assetRoot}`);

function auditManifestEntry(entry, test) {
  if (entry.testId !== test.id || entry.version !== test.version) {
    errors.push(`Manifest and payload mismatch: ${entry.testId}@${entry.version}`);
  }
  if (entry.status !== (test.status ?? 'published')) {
    errors.push(`status mismatch for ${entry.testId}: ${entry.status} !== ${test.status ?? 'published'}`);
  }
  if (entry.category !== test.category) {
    errors.push(`category mismatch for ${entry.testId}: ${entry.category} !== ${test.category}`);
  }
  if (entry.questionCount !== test.questions.length) {
    errors.push(`questionCount mismatch for ${entry.testId}: ${entry.questionCount} !== ${test.questions.length}`);
  }
  if (entry.resultCount !== test.results.length) {
    errors.push(`resultCount mismatch for ${entry.testId}: ${entry.resultCount} !== ${test.results.length}`);
  }

  const expectedStats = buildStatsKeys(test.id, test.version);
  if (entry.stats?.aggregateKey !== expectedStats.aggregateKey) {
    errors.push(`aggregateKey mismatch for ${entry.testId}`);
  }
  if (entry.stats?.versionKey !== expectedStats.versionKey) {
    errors.push(`versionKey mismatch for ${entry.testId}`);
  }
  if (!Array.isArray(entry.tags) || entry.tags.length === 0) {
    errors.push(`tags are required for ${entry.testId}`);
  }
}

function auditTextQuality(test) {
  requireText(test.titleKo, `${test.id}.titleKo`, 6);
  const seenQuestionText = new Set();

  for (const question of test.questions) {
    requireText(question.textKo, `${test.id}.${question.id}.textKo`, 8);
    if (seenQuestionText.has(question.textKo)) {
      errors.push(`Duplicate question text in ${test.id}: ${question.textKo}`);
    }
    seenQuestionText.add(question.textKo);

    const optionTexts = new Set();
    const optionCodes = new Set();
    for (const option of question.options) {
      requireText(option.textKo, `${test.id}.${question.id}.${option.code}.textKo`, 4);
      if (optionCodes.has(option.code)) {
        errors.push(`Duplicate option code in ${test.id}.${question.id}: ${option.code}`);
      }
      if (optionTexts.has(option.textKo)) {
        errors.push(`Duplicate option text in ${test.id}.${question.id}: ${option.textKo}`);
      }
      optionCodes.add(option.code);
      optionTexts.add(option.textKo);
    }
  }

  for (const result of test.results) {
    requireText(result.titleKo, `${test.id}.${result.code}.titleKo`, 4);
    requireText(result.summaryKo, `${test.id}.${result.code}.summaryKo`, 12);
  }
}

function auditScoringShape(test) {
  const axisIds = new Set();
  for (const axis of test.axes) {
    if (axisIds.has(axis.id)) {
      errors.push(`Duplicate axis id in ${test.id}: ${axis.id}`);
    }
    axisIds.add(axis.id);
    requireText(axis.labelKo, `${test.id}.${axis.id}.labelKo`, 2);
  }

  const touchedAxes = new Set();
  for (const question of test.questions) {
    for (const option of question.options) {
      for (const [axisId, value] of Object.entries(option.scores ?? {})) {
        if (!axisIds.has(axisId)) {
          errors.push(`Unknown axis in option score for ${test.id}.${question.id}: ${axisId}`);
        }
        if (!Number.isFinite(value)) {
          errors.push(`Non-numeric score for ${test.id}.${question.id}.${option.code}: ${axisId}`);
        }
        if (value !== 0) {
          touchedAxes.add(axisId);
        }
      }
    }
  }

  if (test.scoring?.type === 'axis-letter-majority') {
    auditAxisLetterMajority(test, axisIds);
    return;
  }

  for (const axisId of axisIds) {
    if (!touchedAxes.has(axisId)) {
      errors.push(`Axis is never affected by option scores in ${test.id}: ${axisId}`);
    }
  }

  for (const result of test.results) {
    for (const axisId of axisIds) {
      if (!Number.isFinite(result.vector?.[axisId])) {
        errors.push(`Missing result vector value for ${test.id}.${result.code}: ${axisId}`);
      }
    }
  }
}

function auditAxisLetterMajority(test, axisIds) {
  const questionsByAxis = new Map(test.axes.map((axis) => [axis.id, []]));
  const questionsById = new Map(test.questions.map((question) => [question.id, question]));

  for (const axis of test.axes) {
    if (!Array.isArray(axis.letters) || axis.letters.length !== 2) {
      errors.push(`axis-letter-majority requires exactly two letters for ${test.id}.${axis.id}`);
    }
    const tieBreaker = questionsById.get(axis.tieBreakerQuestionId);
    if (!tieBreaker) {
      errors.push(`Missing tieBreakerQuestionId for ${test.id}.${axis.id}: ${axis.tieBreakerQuestionId}`);
    } else if (tieBreaker.axis !== axis.id) {
      errors.push(`Tie breaker axis mismatch for ${test.id}.${axis.id}: ${axis.tieBreakerQuestionId}`);
    }
  }

  for (const question of test.questions) {
    if (!axisIds.has(question.axis)) {
      errors.push(`Unknown question axis in ${test.id}.${question.id}: ${question.axis}`);
      continue;
    }
    questionsByAxis.get(question.axis).push(question);
    const axis = test.axes.find((candidate) => candidate.id === question.axis);
    const letters = new Set(axis.letters);
    for (const option of question.options) {
      if (!letters.has(option.code)) {
        errors.push(`Option code must match axis letter in ${test.id}.${question.id}: ${option.code}`);
      }
    }
  }

  for (const [axisId, questions] of questionsByAxis.entries()) {
    if (questions.length === 0) {
      errors.push(`No question for axis in ${test.id}: ${axisId}`);
    }
  }

  const resultCodes = new Set(test.results.map((result) => result.code));
  for (const code of buildAxisLetterCodes(test.axes)) {
    if (!resultCodes.has(code)) {
      errors.push(`Missing axis-letter result in ${test.id}: ${code}`);
    }
  }
}

function auditReachability(test) {
  const combinationCount = test.questions.reduce((total, question) => total * question.options.length, 1);
  if (combinationCount > maxCombinations) {
    warnings.push(`Skipped reachability audit for ${test.id}: ${combinationCount} combinations exceed ${maxCombinations}`);
    return;
  }

  const counts = Object.fromEntries(test.results.map((result) => [result.code, 0]));
  const answers = {};

  walkAnswers(test, 0, answers, () => {
    let score;
    try {
      score = scoreTraitTest(test, answers);
    } catch (error) {
      errors.push(`Scoring failed for ${test.id}: ${error.message}`);
      return;
    }
    if (!(score.result.code in counts)) {
      errors.push(`Scoring returned unknown result for ${test.id}: ${score.result.code}`);
      return;
    }
    counts[score.result.code] += 1;
  });

  for (const [code, count] of Object.entries(counts)) {
    if (count === 0) {
      errors.push(`Unreachable result in ${test.id}: ${code}`);
    }
  }
}

function auditAutomationQualityGate(entry, test) {
  if (test.questions.length < 10) {
    errors.push(`Generated tests must have at least 10 questions: ${test.id} has ${test.questions.length}`);
  }
  if (test.results.length < 4) {
    errors.push(`Generated tests must have at least 4 results: ${test.id} has ${test.results.length}`);
  }

  for (const question of test.questions) {
    if (question.options.length < 3) {
      errors.push(`Generated test questions must have at least 3 options: ${test.id}.${question.id}`);
    }
  }

  for (const result of test.results) {
    auditDetailedResult(entry, test, result);
  }
}

function auditDetailedResult(entry, test, result) {
  requireText(result.summaryKo, `${test.id}.${result.code}.summaryKo`, 24);
  requireText(result.descriptionKo, `${test.id}.${result.code}.descriptionKo`, 70);
  requireText(result.collaborationKo, `${test.id}.${result.code}.collaborationKo`, 50);
  requireText(result.shareIntroKo, `${test.id}.${result.code}.shareIntroKo`, 18);
  requireTextList(result.strengthsKo, `${test.id}.${result.code}.strengthsKo`, 3, 12);
  requireTextList(result.watchoutsKo, `${test.id}.${result.code}.watchoutsKo`, 2, 16);
  requireResultImage(entry, result.imagePath, `${test.id}.${result.code}.imagePath`);
  requireResultImage(entry, result.shareImagePath, `${test.id}.${result.code}.shareImagePath`);
}

function requireTextList(value, label, minItems, minLength) {
  if (!Array.isArray(value) || value.length < minItems) {
    errors.push(`Text list must have at least ${minItems} items: ${label}`);
    return;
  }
  value.forEach((item, index) => requireText(item, `${label}[${index}]`, minLength));
}

function requireResultImage(entry, runtimePath, label) {
  if (typeof runtimePath !== 'string' || runtimePath.trim() === '') {
    errors.push(`Result image path is required: ${label}`);
    return;
  }
  if (!/\.(png|jpe?g|webp)$/i.test(runtimePath)) {
    errors.push(`Result image must be PNG, JPG, JPEG, or WebP: ${label}`);
  }
  if (!runtimePath.startsWith(`/test-packs/packs/${entry.packId}/assets/`)) {
    errors.push(`Generated result images must live under /test-packs/packs/${entry.packId}/assets/: ${label}`);
    return;
  }

  const localPath = join(root, runtimePath.replace(/^\/test-packs\//, `${assetRoot}/`));
  if (!existsSync(localPath)) {
    errors.push(`Missing result image asset: ${label} -> ${runtimePath}`);
    return;
  }

  const bytes = readFileSync(localPath);
  if (bytes.length < 2048) {
    errors.push(`Result image asset is too small: ${label} -> ${runtimePath}`);
    return;
  }
  if (!hasKnownImageSignature(bytes)) {
    errors.push(`Result image asset is not a valid PNG, JPG, JPEG, or WebP file: ${label} -> ${runtimePath}`);
  }
}

function requiresAutomationQualityGate(entry) {
  return String(entry.packId ?? '').startsWith('generated-');
}

function hasKnownImageSignature(bytes) {
  if (bytes.length < 12) {
    return false;
  }
  const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isWebp =
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50;
  return isPng || isJpeg || isWebp;
}

function walkAnswers(test, index, answers, visit) {
  if (index === test.questions.length) {
    visit();
    return;
  }
  const question = test.questions[index];
  for (const option of question.options) {
    answers[question.id] = option.code;
    walkAnswers(test, index + 1, answers, visit);
  }
  delete answers[question.id];
}

function buildAxisLetterCodes(axes, index = 0, prefix = '') {
  if (index === axes.length) {
    return [prefix];
  }
  return axes[index].letters.flatMap((letter) => buildAxisLetterCodes(axes, index + 1, `${prefix}${letter}`));
}

function requireText(value, label, minLength) {
  if (typeof value !== 'string' || value.trim().length < minLength) {
    errors.push(`Text is too short or missing: ${label}`);
    return;
  }
  if (/\b(todo|placeholder|lorem)\b/i.test(value) || /임시/.test(value)) {
    errors.push(`Placeholder text is not allowed: ${label}`);
  }
}

function resolvePayloadPath(path) {
  return join(root, path.replace(/^\/test-packs\//, `${assetRoot}/`));
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function getArg(name) {
  const prefix = `${name}=`;
  const found = process.argv.find((arg) => arg.startsWith(prefix));
  return found?.slice(prefix.length);
}
