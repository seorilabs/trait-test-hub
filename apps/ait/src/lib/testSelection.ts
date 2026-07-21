import type { ManifestEntry } from '../vendor/product-core.js';

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 86_400_000;

// 한국 시간(KST) 기준 하루 단위 인덱스. 같은 날에는 모두 같은 "오늘의 테스트"를 봅니다.
export function dayIndexKst(nowMs: number): number {
  return Math.floor((nowMs + KST_OFFSET_MS) / DAY_MS);
}

// testId로 안정 정렬한 뒤 날짜 인덱스로 골라, 하루 동안 결정적이고 매일 순환합니다.
export function pickDailyEntry(entries: ManifestEntry[], nowMs: number = Date.now()): ManifestEntry | null {
  if (entries.length === 0) {
    return null;
  }
  const ordered = [...entries].sort((a, b) => (a.testId < b.testId ? -1 : a.testId > b.testId ? 1 : 0));
  return ordered[dayIndexKst(nowMs) % ordered.length] ?? null;
}

// 랜덤 1개. excludeId가 있으면 제외하되, 제외 후 후보가 없으면 전체에서 고릅니다.
export function pickRandomEntry(
  entries: ManifestEntry[],
  rand: () => number = Math.random,
  excludeId?: string,
): ManifestEntry | null {
  const pool = excludeId ? entries.filter((entry) => entry.testId !== excludeId) : entries;
  const source = pool.length > 0 ? pool : entries;
  if (source.length === 0) {
    return null;
  }
  const index = Math.min(source.length - 1, Math.max(0, Math.floor(rand() * source.length)));
  return source[index] ?? null;
}
