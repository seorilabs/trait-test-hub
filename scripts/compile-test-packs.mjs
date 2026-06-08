import { join } from 'node:path';
import { buildTestPackOutput } from './lib/test-pack-output.mjs';

const root = process.cwd();
const output = getArg('--output') ?? 'tmp/test-packs';
const generatedAt = getArg('--generatedAt') ?? new Date().toISOString();

const manifest = buildTestPackOutput({
  root,
  outputRoot: join(root, output),
  generatedAt,
});

console.log(`compiled ${manifest.tests.length} test pack entries to ${output}`);

function getArg(name) {
  const prefix = `${name}=`;
  const found = process.argv.find((arg) => arg.startsWith(prefix));
  return found?.slice(prefix.length);
}
