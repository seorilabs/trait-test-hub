import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const strict = process.argv.includes('--strict');
const root = process.cwd();
const targets = ['play-store', 'app-store', 'apps-in-toss', 'firebase', 'docs'];
const marker = '확정 필요';
const findings = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
      continue;
    }
    if (!/\.(json|md|rules)$/.test(entry)) {
      continue;
    }
    const body = readFileSync(fullPath, 'utf8');
    body.split('\n').forEach((line, index) => {
      if (line.includes(marker)) {
        findings.push({
          file: relative(root, fullPath),
          line: index + 1,
          text: line.trim(),
        });
      }
    });
  }
}

for (const target of targets) {
  walk(join(root, target));
}

if (findings.length === 0) {
  console.log('release blockers: 0');
  process.exit(0);
}

console.log(`release blockers: ${findings.length}`);
for (const finding of findings) {
  console.log(`- ${finding.file}:${finding.line} ${finding.text}`);
}

if (strict) {
  process.exit(1);
}
