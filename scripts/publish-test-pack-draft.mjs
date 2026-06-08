import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { validateTraitTest } from '../packages/product-core/src/index.js';
import {
  assertNoExistingTestId,
  buildGeneratedEntry,
  buildTestPackOutput,
} from './lib/test-pack-output.mjs';

const root = process.cwd();
const draftPath = getArg('--draft');
const sourceRoot = join(root, 'content/test-packs');

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

try {
  assertNoExistingTestId({ root, testId: test.id });
} catch (error) {
  fail(errorMessage(error));
}

if (!Array.isArray(metadata.tags) || metadata.tags.length === 0) {
  fail(`metadata.tags is required for ${test.id}`);
}

const payload = {
  schemaVersion: 1,
  packId,
  test: {
    ...test,
    status: test.status ?? 'published',
  },
};
const entry = buildGeneratedEntry({
  test: payload.test,
  packId,
  metadata,
  generatedAt,
});

writeJson(join(sourceRoot, 'packs', packId, 'tests', `${test.id}.json`), payload);
writeJson(join(sourceRoot, 'packs', packId, 'entries', `${test.id}.json`), entry);

try {
  buildTestPackOutput({
    root,
    outputRoot: join(root, 'tmp/test-packs-publish-check'),
    generatedAt,
  });
} catch (error) {
  fail(errorMessage(error));
}

console.log(`published draft ${test.id}@${test.version} to ${packId}`);

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

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}
