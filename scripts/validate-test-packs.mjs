import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { validateManifest, validateTraitTest } from '../packages/product-core/src/index.js';

const root = process.cwd();
const assetRoot = getArg('--assetRoot') ?? 'public/test-packs';
const manifestPath = join(root, assetRoot, 'manifest.json');

const manifest = validateManifest(readJson(manifestPath));
const errors = [];
const testIds = new Set();

for (const entry of manifest.tests) {
  if (testIds.has(entry.testId)) {
    errors.push(`Duplicate active testId: ${entry.testId}`);
  }
  testIds.add(entry.testId);

  const payloadPath = join(root, entry.path.replace(/^\/test-packs\//, `${assetRoot}/`));
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
  try {
    validateTraitTest(payload.test);
  } catch (error) {
    errors.push(error.message);
    continue;
  }
  if (payload.test.id !== entry.testId || payload.test.version !== entry.version) {
    errors.push(`Manifest and payload mismatch: ${entry.testId}@${entry.version}`);
  }
}

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(`validated ${manifest.tests.length} test pack entr${manifest.tests.length === 1 ? 'y' : 'ies'} from ${assetRoot}`);

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function getArg(name) {
  const prefix = `${name}=`;
  const found = process.argv.find((arg) => arg.startsWith(prefix));
  return found?.slice(prefix.length);
}
