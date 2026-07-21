import type { ManifestEntry } from '../vendor/product-core.js';
import { dayIndexKst, pickDailyEntry, pickRandomEntry } from './testSelection';

function entry(testId: string): ManifestEntry {
  return {
    testId,
    version: 1,
    status: 'published',
    titleKo: testId,
    category: 'test',
    questionCount: 8,
    resultCount: 4,
    estimatedMinutes: '2-3분',
    path: `/test-packs/packs/generated-v1/tests/${testId}.json`,
  };
}

const entries = ['c-test', 'a-test', 'b-test'].map(entry);

describe('testSelection', () => {
  it('오늘의 테스트는 같은 날 결정적이고 자정(KST)에 다음으로 순환한다', () => {
    // 2026-07-21 12:00 KST → 03:00 UTC
    const noonKst = Date.UTC(2026, 6, 21, 3, 0, 0);
    const first = pickDailyEntry(entries, noonKst);
    // 같은 날 다른 시각도 동일해야 한다.
    expect(pickDailyEntry(entries, noonKst + 5 * 60 * 60 * 1000)?.testId).toBe(first?.testId);
    // 하루 뒤에는 안정 정렬 기준 다음 항목으로 넘어간다.
    const nextDay = pickDailyEntry(entries, noonKst + 24 * 60 * 60 * 1000);
    expect(dayIndexKst(noonKst + 24 * 60 * 60 * 1000)).toBe(dayIndexKst(noonKst) + 1);
    expect(nextDay?.testId).not.toBe(first?.testId);
  });

  it('오늘의 테스트는 입력 순서와 무관하게 testId 안정 정렬로 뽑는다', () => {
    const nowMs = Date.UTC(2026, 6, 21, 3, 0, 0);
    const shuffled = ['b-test', 'c-test', 'a-test'].map(entry);
    expect(pickDailyEntry(shuffled, nowMs)?.testId).toBe(pickDailyEntry(entries, nowMs)?.testId);
  });

  it('랜덤은 주입한 rand로 결정적으로 뽑고 경계를 넘지 않는다', () => {
    expect(pickRandomEntry(entries, () => 0)?.testId).toBe('c-test');
    expect(pickRandomEntry(entries, () => 0.999)?.testId).toBe('b-test');
  });

  it('랜덤은 excludeId를 제외하고, 제외 후 비면 전체에서 고른다', () => {
    expect(pickRandomEntry(entries, () => 0, 'c-test')?.testId).toBe('a-test');
    const single = [entry('only')];
    expect(pickRandomEntry(single, () => 0, 'only')?.testId).toBe('only');
  });

  it('빈 목록은 null을 반환한다', () => {
    expect(pickDailyEntry([], 0)).toBeNull();
    expect(pickRandomEntry([], () => 0)).toBeNull();
  });
});
