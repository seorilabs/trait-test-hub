/**
 * 신규 테스트 주제 중복 방지용 목록을 한 번에 출력한다.
 *
 * - 발행/소스 테스트: content/test-packs/packs/*\/tests/*.json
 * - 작성 중 draft:     content/test-packs/drafts/*.json
 * - 열린 PR:           feature/generated-test-* (gh CLI 있으면 best-effort)
 *
 * 자동화(cron) 에이전트는 이 출력에 등장한 testId/제목/주제와 겹치지 않는
 * 새 주제를 골라야 한다. 사소한 변형(예: "공간 정리"가 있는데 "책상 정리")도 중복으로 본다.
 *
 * 사용법: pnpm list:test-topics   또는   node scripts/list-test-topics.mjs --json
 */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const asJson = process.argv.includes('--json');
const packsRoot = join(root, 'content/test-packs/packs');
const draftsRoot = join(root, 'content/test-packs/drafts');

const published = [];
if (existsSync(packsRoot)) {
  for (const packId of readdirSync(packsRoot)) {
    const testsDir = join(packsRoot, packId, 'tests');
    if (!existsSync(testsDir)) continue;
    for (const file of readdirSync(testsDir)) {
      if (!file.endsWith('.json')) continue;
      const data = readJson(join(testsDir, file));
      const test = data?.test ?? data;
      if (test?.id) {
        published.push({ testId: test.id, titleKo: test.titleKo ?? '', packId, category: test.category ?? '' });
      }
    }
  }
}

const drafts = [];
if (existsSync(draftsRoot)) {
  for (const file of readdirSync(draftsRoot)) {
    if (!file.endsWith('.json')) continue;
    const data = readJson(join(draftsRoot, file));
    const test = data?.test;
    if (test?.id) {
      drafts.push({ testId: test.id, titleKo: test.titleKo ?? '', category: test.category ?? '' });
    }
  }
}

const openPrs = listOpenGeneratedPrs();

if (asJson) {
  process.stdout.write(`${JSON.stringify({ published, drafts, openPrs }, null, 2)}\n`);
} else {
  printSection('발행/소스 테스트', published.map((t) => `${t.testId}  —  ${t.titleKo} [${t.category}]`));
  printSection('작성 중 draft', drafts.map((t) => `${t.testId}  —  ${t.titleKo} [${t.category}]`));
  printSection(
    '열린 generated PR',
    openPrs === null
      ? ['(gh CLI 사용 불가 — PR은 수동 확인 필요)']
      : openPrs.map((p) => `#${p.number}  ${p.title}  (${p.headRefName})`),
  );
  const total = published.length + drafts.length;
  console.log(`\n총 기존 주제 ${total}개. 위와 겹치지 않는 새 testId/주제를 골라야 함.`);
}

function listOpenGeneratedPrs() {
  try {
    const out = execSync(
      'gh pr list --state open --search "head:feature/generated-test-" --json number,title,headRefName',
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    );
    return JSON.parse(out);
  } catch {
    return null;
  }
}

function printSection(title, lines) {
  console.log(`\n## ${title} (${lines.length})`);
  for (const line of lines) console.log(`- ${line}`);
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}
